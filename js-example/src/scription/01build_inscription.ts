import {Payment} from 'bitcoinjs-lib/src/payments';
import {it} from 'mocha';
import strings from '../utils/strings';
import scripts from '../utils/scripts';
import {crypto, initEccLib, networks, payments, script} from "bitcoinjs-lib";
import {ECPairAPI, ECPairFactory, ECPairInterface, TinySecp256k1Interface} from "ecpair";
import my_keys from "../utils/my_keys";
const tinysecp: TinySecp256k1Interface = require('tiny-secp256k1');
initEccLib(tinysecp as any);
const ECKeyFacetory: ECPairAPI = ECPairFactory(tinysecp);

const MAP_PREFIX = "1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5";

export interface MetaData {
    app: string;
    type: string;

    [prop: string]: string | string[];
};

/**
 * 铭文内容
 */
export interface Inscription {
    contentType: string;
    dataB64: string;
};

/**
 * 创建铭文脚本
 */
export const buildInscription = (toPayment: Payment,inscription?: Inscription, metaData?: MetaData) => {
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
    const toPubkeyScriptAsm = scripts.createScript(toPayment.name,toPayment.pubkey);
    // 在单个输出中创建序数输出和铭文
    let inscriptionAsm = `${toPubkeyScriptAsm}${ordAsm ? " " + ordAsm : ""}`;

    if (metaData && metaData?.app && metaData?.type) {
        const mapPrefixHex = strings.toHex(MAP_PREFIX);
        const mapCmdValue = strings.toHex("SET");
        inscriptionAsm = `${inscriptionAsm} OP_RETURN ${mapPrefixHex} ${mapCmdValue}`;

        for (const [key, value] of Object.entries(metaData)) {
            if (key !== "cmd") {
                inscriptionAsm = `${inscriptionAsm} ${strings.toHex(key)} ${strings.toHex(value as string)}`;
            }
        }
    }
    console.info(inscriptionAsm);
    return script.fromASM(inscriptionAsm);
}


it('buildInscription', () => {
    const keyPair: ECPairInterface = ECKeyFacetory.fromPrivateKey(my_keys.key1);
    const network = networks.testnet;
    const contentType = 'text/plain;charset=utf-8';
    const base64Data = Buffer.from("{\"p\":\"brc-20\",\"op\":\"deploy\",\"tick\":\"rtui\",\"max\":\"21000000\",\"lim\":\"1\"}").toString('base64');
    const payment: payments.Payment = payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network
    });
    // 铭文内容
    const inscription: Inscription = {
        dataB64: base64Data,
        contentType: contentType
    }
    buildInscription(payment,inscription);
});