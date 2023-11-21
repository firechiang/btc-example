package org.btctest.basic;

import org.bitcoinj.base.*;
import org.bitcoinj.core.NetworkParameters;
import org.bitcoinj.params.BitcoinNetworkParams;
import org.bitcoinj.script.Script;
import org.bitcoinj.script.ScriptBuilder;
import org.bitcoinj.script.ScriptPattern;

import java.security.NoSuchAlgorithmException;


public class WalletExample {



    public static void main(String[] args) throws NoSuchAlgorithmException {
        System.out.println(pubKeyHashAddress());
        Script redeemScript = ScriptBuilder.createP2WPKHOutputScript(Utils.Key1);
        System.out.println(redeemScript);
    }


    public static void taprootAddress() {
        BitcoinNetwork network = BitcoinNetwork.MAINNET;
        BitcoinNetworkParams networkParams = BitcoinNetworkParams.of(network);
    }



    /**
     * Pay-to-PubKeyHash (P2PKH) 传统地址创建(注意：这个地址以1开头，使用私钥就可以转账)
     * 地址: n2ucak5GRQAp3bDTxUqCax57GBQBidiApD
     */
    public static String pubKeyHashAddress() throws NoSuchAlgorithmException {
        Network network = BitcoinNetwork.TESTNET;
        Address address = Utils.Key1.toAddress(ScriptType.P2WPKH, network);
        return address.toString();
    }

    public void aaa() {
        Network network = BitcoinNetwork.TESTNET;
        NetworkParameters params = NetworkParameters.of(network);


        // 2NBZK7orCmCGDTNd3d2BcrgVyrzJuUTRrRY
        Script redeemScript = ScriptBuilder.createP2WPKHOutputScript(Utils.Key1);
        Script p2SHOutputScript = ScriptBuilder.createP2SHOutputScript(redeemScript);
        byte[] scriptHash = ScriptPattern.extractHashFromP2SH(p2SHOutputScript);

        LegacyAddress legacyAddress = LegacyAddress.fromScriptHash(params, scriptHash);
        System.out.println(legacyAddress.toBase58());
    }
}
