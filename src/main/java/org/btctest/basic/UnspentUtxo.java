package org.btctest.basic;

import lombok.Data;

@Data
public class UnspentUtxo {

    private String txid;

    private Long vout;

    private Long value;

    private Status status;

    @Data
    public static class Status {

        private Boolean confirmed;

        private Integer block_height;

        private String block_hash;

        private Long block_time;
    }
}
