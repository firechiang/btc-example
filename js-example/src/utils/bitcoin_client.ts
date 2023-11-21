import axios, {AxiosResponse} from "axios";
import {it} from 'mocha';

const HttpClient = new axios.Axios({
    baseURL: 'https://mempool.space/testnet/api',
});

export interface UnspentUtxo {
    txid: string;
    vout: number;
    value: number;
    status: {
        confirmed: boolean;
        block_height: number;
        block_hash: string;
        block_time: number;
    };
}

/**
 * 获取地址已确认但未发费的余额列表
 * @param address
 */
export const getUnspentUtxos = async (address: string) => {
    try {
        const uri = `/address/${address}/utxo`;
        const response: AxiosResponse<String> = await HttpClient.get(uri);
        const data: UnspentUtxo[] = response.data ? JSON.parse(response.data.toString()) : undefined;
        return data;
    } catch (error) {
        Promise.reject(error);
    }
}

/**
 * 提交交易
 * @param data
 */
export const postTx = async (data: string) => {
    try {
        const response: AxiosResponse<string> = await HttpClient.post('/tx', data);
        return response.data;
    } catch (error) {
        Promise.reject(error);
    }
}

it('getUnspentUtxos', async () => {
    const unspentUtxos = await getUnspentUtxos("tb1qa23upm2ljyyq7sffa5s0fqa07tfej7rcdna2yv");
    console.info(unspentUtxos);
}).timeout(100000);




