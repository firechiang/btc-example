import {it} from 'mocha';
import {ECPairFactory, ECPairInterface, TinySecp256k1Interface, ECPairAPI} from 'ecpair';
import {initEccLib, networks, crypto, payments, Signer, Psbt} from 'bitcoinjs-lib';
import my_keys from "../utils/my_keys";
import {getUnspentUtxos, postTx,UnspentUtxo} from '../utils/bitcoin_client';

const tinysecp: TinySecp256k1Interface = require('tiny-secp256k1');
initEccLib(tinysecp as any);
const ECKeyFacetory: ECPairAPI = ECPairFactory(tinysecp);

const network = networks.testnet;

/**
 * SegWit转账示列
 * @param amount
 * @param to
 */
export const postTranscation = async (amount: number,to: string) => {
    const fee = 330;
    const keyPair: ECPairInterface = ECKeyFacetory.fromPrivateKey(my_keys.key6);
    // 获取taproot地址和转出脚本
    const payment = payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network
    });
    const psbt = new Psbt({network});
    // 未花费金额列表
    const unspentUtxos: UnspentUtxo[] = await getUnspentUtxos(payment.address);
    // 总余额
    const totalAmount = unspentUtxos.map(utxo=>utxo.value).reduce((a,b) => a + b);
    // 剩余数量
    const remainder = totalAmount - amount - fee;
    // 添加输入
    unspentUtxos.forEach((utxo) => {
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: { value: utxo.value, script: payment.output },
        });
    });
    // 添加转账输出
    psbt.addOutput({
        address: to,
        value: amount
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

it('postTranscation', async () => {
    await postTranscation(10,"tb1qpzp2jkvp6r84nm46h0mtjtt2cvztmrdtp4lu54");
}).timeout(10000);
