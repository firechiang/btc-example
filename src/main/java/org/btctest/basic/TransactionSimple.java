package org.btctest.basic;

import org.bitcoinj.base.*;
import org.bitcoinj.core.NetworkParameters;
import org.bitcoinj.core.Transaction;
import org.bitcoinj.core.TransactionOutPoint;
import org.bitcoinj.crypto.ECKey;
import org.bitcoinj.script.Script;
import org.bitcoinj.script.ScriptBuilder;
import org.bouncycastle.util.encoders.Hex;

import java.util.List;

public class TransactionSimple {
    private BitcoinClient bitcoinClient = new BitcoinClient();

    public static void main(String[] args) {
        TransactionSimple ts = new TransactionSimple();
        String signData = ts.sign(Utils.Key1, Utils.Key2, 1000);
        System.out.println(signData);
    }

    public String sign(ECKey from, ECKey to, long amount) {
        //EstimateFee estimateFee = bitcoinClient.getEstimateFee();
        Long fee = 1000l;

        ScriptType scriptType = ScriptType.P2WPKH;
        Network network = BitcoinNetwork.TESTNET;
        NetworkParameters params = NetworkParameters.of(network);
        // 发起地址
        Address fromAddr = from.toAddress(scriptType, network);
        // 接收地址
        Address receiveAddress = to.toAddress(scriptType, network);
        // 已确认但未发费的余额列表
        List<UnspentUtxo> unspentUtxos = bitcoinClient.getUnusedUtxos(fromAddr.toString());
        // 总余额
        long totalAmount = unspentUtxos.stream().mapToLong(UnspentUtxo::getValue).sum();
        // 剩余数量
        long remainder = totalAmount - amount - fee;
        if (remainder < 0) {
            throw new RuntimeException("余额:" + totalAmount + ",转出数量:" + amount + ",手续费:" + fee + ",剩余数量:" + remainder + "不足");
        }
        // 构建交易
        Transaction tx = new Transaction(params);
        // 添加转账输出
        tx.addOutput(Coin.valueOf(amount), receiveAddress);
        // 添加余额输出
        if (remainder > 0) {
            tx.addOutput(Coin.valueOf(remainder), fromAddr);
        }
        // 添加输入签名
        for (UnspentUtxo unUtxo : unspentUtxos) {
            TransactionOutPoint outPoint = new TransactionOutPoint(params, unUtxo.getVout(), Sha256Hash.wrap(unUtxo.getTxid()));
            // 正常地址余额的解锁脚本就是用地址公钥生成的脚本
            Script scriptPubKey = ScriptBuilder.createP2WPKHOutputScript(from);
            tx.addSignedInput(outPoint, scriptPubKey, Coin.valueOf(unUtxo.getValue()),from, Transaction.SigHash.ALL, true);
        }
//        Context context = new Context(params);
//        tx.getConfidence().setSource(TransactionConfidence.Source.NETWORK);
        tx.setPurpose(Transaction.Purpose.USER_PAYMENT);
        String signData = Hex.toHexString(tx.bitcoinSerialize());
        return bitcoinClient.postTx(signData);
    }
}
