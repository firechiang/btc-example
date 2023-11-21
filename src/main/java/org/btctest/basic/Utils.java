package org.btctest.basic;

import org.bitcoinj.crypto.ECKey;

import java.math.BigInteger;
import java.security.SecureRandom;

public class Utils {

    // tb1qa23upm2ljyyq7sffa5s0fqa07tfej7rcdna2yv
    public static final ECKey Key1 = ECKey.fromPrivate(new BigInteger("19374218836997807877471997298731046205715912890829485639873150788530228643948"));
    // tb1qpzp2jkvp6r84nm46h0mtjtt2cvztmrdtp4lu54
    public static final ECKey Key2 = ECKey.fromPrivate(new BigInteger("50620605661553683090360857878478918388172067077467564480842651879199529688652"));
    // tb1qhrjxu7a34xen435rj5lcajsdzhqc82c4meu4a5
    public static final ECKey Key3 = ECKey.fromPrivate(new BigInteger("102081018296252448116361128214482210158088297547024957741147794664189154144944"));
    // tb1qf623rt7wunwjlllhrcv382hnazt80uppvv6rux
    public static final ECKey Key4 = ECKey.fromPrivate(new BigInteger("34948366390098931288555963683778859769472220587730418938616674863703788812862"));
    // tb1qwzzer9j0efhwndcft29grnm38wrda6l6u8khym
    public static final ECKey Key5 = ECKey.fromPrivate(new BigInteger("31641851901912192898060270761953844525405312170504459585245081380778276610604"));

    public static void main(String[] args) {
        System.out.println(Key1.getPublicKeyAsHex());
    }

    /**
     * 创建密钥
     * @return
     */
    public static ECKey createECKey() {
        try {
            SecureRandom secureRandom = SecureRandom.getInstanceStrong();
            return new ECKey(secureRandom);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
