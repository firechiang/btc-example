import {it} from 'mocha';
import {
    P2PKHAddress,
    PrivateKey,
    PublicKey,
    Script,
    SigHash,
    Transaction,
    TxIn,
    TxOut,
} from "bsv-wasm";P2PKHAddress
import my_keys from "../utils/my_keys";
import strings from '../utils/strings';
import {buildInscription,MetaData} from "../scription/01build_inscription";

import {initEccLib, networks, payments,crypto} from "bitcoinjs-lib";
import {toXOnly} from 'bitcoinjs-lib/src/psbt/bip371';
import {ECPairInterface, ECPairFactory, TinySecp256k1Interface, ECPairAPI} from "ecpair";


const tinysecp: TinySecp256k1Interface = require('tiny-secp256k1');
initEccLib(tinysecp as any);
const ECKeyFacetory: ECPairAPI = ECPairFactory(tinysecp);

function test1() {
    const privateKey = PrivateKey.from_bytes(my_keys.key1);
    const publicKey = PublicKey.from_private_key(privateKey);
    const p2PKHAddress = P2PKHAddress.from_pubkey(publicKey);
    console.info(p2PKHAddress.get_locking_script().to_asm_string());

    const keyPair: ECPairInterface = ECKeyFacetory.fromPrivateKey(my_keys.key1);
    const network = networks.testnet;
    const payment: payments.Payment = payments.p2pkh({
        pubkey: keyPair.publicKey,
        network
    });
    // eaa3c0ed5f91080f4129ed20f483aff2d3997878
    // eaa3c0ed5f91080f4129ed20f483aff2d3997878
    console.info(crypto.hash160(payment.pubkey).toString('hex'));
    console.info(payment.output.toString('hex'));
}

/**
 * js-1sat-ord 测试代码
 */
it("测试",() => {
    test1();
});
