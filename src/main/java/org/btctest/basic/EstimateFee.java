package org.btctest.basic;

import lombok.Data;

@Data
public class EstimateFee {
    // 最快费用
    private Long fastestFee;
    // 半小时费用
    private Long halfHourFee;
    // 一小时费用
    private Long hourFee;
    // 推荐费
    private Long economyFee;
    // 最低费用
    private Long minimumFee;
}
