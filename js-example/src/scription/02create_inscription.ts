import {it} from 'mocha';
import strings from '../utils/strings';
import {crypto, initEccLib, networks, payments, Psbt, script} from "bitcoinjs-lib";
import {ECPairAPI, ECPairFactory, TinySecp256k1Interface} from "ecpair";
import my_keys from "../utils/my_keys";
import {getUnspentUtxos, postTx, UnspentUtxo} from '../utils/bitcoin_client';
import {Inscription} from "./01build_inscription";
import {toXOnly} from "bitcoinjs-lib/src/psbt/bip371";
import {LEAF_VERSION_TAPSCRIPT} from 'bitcoinjs-lib/src/payments/bip341';
import {Taptree} from 'bitcoinjs-lib/src/types';

const tinysecp: TinySecp256k1Interface = require('tiny-secp256k1');
initEccLib(tinysecp as any);
const ECKeyFacetory: ECPairAPI = ECPairFactory(tinysecp);


export const hashLockScript = (pubkey: Buffer) => {
    const secret_bytes = Buffer.from('SECRET');
    const hash = crypto.hash160(secret_bytes);
    console.info(`hashLockScript = ${hash.toString('hex')}`);
    // Construct script to pay to hash_lock_keypair if the correct preimage/secret is provided
    const hash_script_asm = `OP_HASH160 ${hash.toString('hex')} OP_EQUALVERIFY ${pubkey.toString('hex')} OP_CHECKSIG`;
    return script.fromASM(hash_script_asm);
}
/**
 * 铭文数据脚本
 * @param pubkey
 * @param inscription
 */
export const buildInscriptionsss = (pubkey: Buffer, inscription?: Inscription) => {
    let ordAsm = undefined;
    if (inscription && inscription.contentType && inscription.dataB64) {
        const ordHex = strings.toHex('ord');
        const dataBuffer = Buffer.from(inscription.dataB64, 'base64');
        const dataHex = dataBuffer.toString('hex');
        const contentTypeHex = strings.toHex(inscription.contentType);
        // 构建元数据脚本
        ordAsm = `OP_0 OP_IF ${ordHex} OP_1 ${contentTypeHex} OP_0 ${dataHex} OP_ENDIF`;
    }
    // 构建to地址解锁脚本
    const toPubkeyScriptAsm = `${pubkey.toString('hex')} OP_CHECKSIG`;
    // 在单个输出中创建序数输出和铭文
    let inscriptionAsm = `${toPubkeyScriptAsm}${ordAsm ? " " + ordAsm : ""}`;
    return script.fromASM(inscriptionAsm);
}
/**
 * 测试创建铭文并推送上链
 * 铭文创建具体流程：
 * 1,创建铭文数据脚本
 * 2,使用铭数据脚本生成Taproot地址（注意：铭文数据脚本被修改Taproot地址也会随之改变）
 * 3,给使用铭数据脚本生成的Taproot地址打钱（用作Gas）
 * 4,推送铭文数据脚本上链
 */
const createInscription = async () => {
    var keyPair = ECKeyFacetory.fromPrivateKey(my_keys.key1);
    const network = networks.testnet;
    // 调整公钥（注意：taproot地址必须使用32位公钥）
    const publicKey = toXOnly(keyPair.publicKey);
    const contentType = 'text/plain;charset=utf-8';
    const base64Data = Buffer.from("{\"p\":\"brc-20\",\"op\":\"deploy\",\"tick\":\"rtui\",\"max\":\"21000000\",\"lim\":\"1\"}").toString('base64');
    // 创建铭文内容
    const inscription: Inscription = {
        dataB64: base64Data,
        contentType: contentType
    }
    // 构建铭文数据脚本(注意：铭文内容包含在reveal交易输入中)
    const inscription_script = buildInscriptionsss(publicKey, inscription);
    const hash_lock_script = hashLockScript(publicKey);
    const scriptTree: Taptree = [
        {
            output: hash_lock_script
        },
        {
            output: inscription_script
        }
    ];
    const inscription_redeem = {
        output: inscription_script,
        redeemVersion: LEAF_VERSION_TAPSCRIPT
    }
    const payment = payments.p2tr({
        internalPubkey: publicKey,
        scriptTree,
        redeem: inscription_redeem,
        network
    });
    console.info(payment.address);
    const psbt = new Psbt({network});
    const fee = 220;
    // 未花费金额列表
    const unspentUtxos: UnspentUtxo[] = await getUnspentUtxos(payment.address);
    // 添加输入(注意：这个是假设第一个未发费上只有钱没有铭文等其它东西)
    let utxo = null;
    for(let i=0;i<unspentUtxos.length;i++) {
        utxo = unspentUtxos[i];
        if(utxo.value > fee) {
            break;
        }
    }
    // 总余额
    //const totalAmount = unspentUtxos.map(utxo => utxo.value).reduce((a, b) => a + b);
    const totalAmount = utxo.value;
    // 剩余数量
    const remainder = totalAmount - 1 - fee;
    psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
            value: utxo.value,
            // 输入携带铭文脚本数据
            script: payment.output,
        },
        tapLeafScript: [
            {
                leafVersion: inscription_redeem.redeemVersion,
                script: inscription_redeem.output,
                controlBlock: payment.witness![payment.witness!.length - 1] // extract control block from witness data
            }
        ]
    });
    // 添加铭文输出(注意：铭文是铭刻在其第一个输出的第一个聪（Satoshi）上)
    psbt.addOutput({
        address: payment.address,
        value: 1
    });
    // 添加余额输出
    psbt.addOutput({
        address: payment.address,
        value: remainder
    });
    // 签名
    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    const txId = await postTx(tx.toHex());
    console.info(tx.toHex());
    console.info(txId);
}

it("createInscription", async () => {
    await createInscription();
}).timeout(10000);