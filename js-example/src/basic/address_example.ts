import {it} from 'mocha';
import {ECPairFactory, ECPairInterface,TinySecp256k1Interface,ECPairAPI} from 'ecpair';
import {initEccLib,networks,crypto,payments,Signer} from 'bitcoinjs-lib';
import {toXOnly} from 'bitcoinjs-lib/src/psbt/bip371';
import my_keys from "../utils/my_keys";

const tinysecp: TinySecp256k1Interface = require('tiny-secp256k1');
initEccLib(tinysecp as any);
const ECKeyFacetory: ECPairAPI = ECPairFactory(tinysecp);

const keyPair: ECPairInterface = ECKeyFacetory.fromPrivateKey(my_keys.key1);
const network = networks.testnet;


/**
 * 创建密钥对
 */
export const createKeyPair = () => {
    const keyPair = ECKeyFacetory.makeRandom();
    return keyPair;
}

/**
 * 创建Taproot地址
 * @param keyPair
 */
export const createTaprootAddress = () => {
    // 调整公钥（注意：taproot地址必须使用32位公钥）
    const publicKey = toXOnly(keyPair.publicKey);
    const {address} = payments.p2tr({
        internalPubkey: publicKey,
        network
    });
    console.info(address);
    return address;
}

/**
 * 创建简单地址
 * @param keyPair
 */
export const createBasicAddress = () => {
    const payment: payments.Payment = payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network
    });
    console.info(payment.name);
    console.info(payment.address);
    return payment.address;
}

/**
 * 测试用例
 */
it('createTaprootAddress', () => {
    createTaprootAddress();
});
