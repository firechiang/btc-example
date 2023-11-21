import {it} from 'mocha';
import {ECPairAPI, ECPairFactory, ECPairInterface, TinySecp256k1Interface} from 'ecpair';
import {crypto, initEccLib, networks, payments, script} from 'bitcoinjs-lib';
import my_keys from "../utils/my_keys";

const tinysecp: TinySecp256k1Interface = require('tiny-secp256k1');
initEccLib(tinysecp as any);
const ECKeyFacetory: ECPairAPI = ECPairFactory(tinysecp);

const keyPair: ECPairInterface = ECKeyFacetory.fromPrivateKey(my_keys.key1);
const network = networks.testnet;

enum AddrType {
    p2pkh,
    p2wpkh,
    p2tr
}
export const buildRedeemScript = (pubkey: Buffer) => {
    const redeemAsm = buildRedeemAsm(pubkey);
    return script.fromASM(redeemAsm);
}

export const buildRedeemAsm = (pubkey: Buffer) => {
    return `${pubkey.toString('hex')} OP_CHECKSIG`;
}

const createScript = (addrType: string,pubkey: Buffer) => {
    if(addrType === AddrType[AddrType.p2pkh]) {
        const pubkeyHex = crypto.hash160(pubkey).toString('hex');
        const scriptAsm = `OP_DUP OP_HASH160 ${pubkeyHex} OP_EQUALVERIFY OP_CHECKSIG`;
        return scriptAsm;
    }
    if(addrType === AddrType[AddrType.p2wpkh]) {
        const pubkeyHex = crypto.hash160(pubkey).toString('hex');
        const scriptAsm = `OP_0 ${pubkeyHex}`;
        return scriptAsm;
    }
    if(addrType === AddrType[AddrType.p2tr]) {
        const pubkeyHex = pubkey.toString('hex');
        const scriptAsm = `OP_1 ${pubkeyHex}`;
        return scriptAsm;
    }
    throw new Error(`未实现${addrType}类型地址公钥接收脚本!`);
}

export default {
    createScript,
    AddrType,
    buildRedeemAsm,
    buildRedeemScript,
}

it("createScript",() => {
    // 0014eaa3c0ed5f91080f4129ed20f483aff2d3997878
    const payment: payments.Payment = payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network
    });
    console.info(payment.name);
    console.info(AddrType[AddrType.p2wpkh]);
    console.info(payment.address);
    console.info(payment.output.toString('hex'));
    const hex = crypto.hash160(payment.pubkey).toString('hex');
    const scriptAsm = createScript(payment.name,payment.pubkey);
    console.info(script.fromASM(scriptAsm).toString('hex'));
});