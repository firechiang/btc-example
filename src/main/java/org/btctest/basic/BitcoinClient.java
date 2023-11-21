package org.btctest.basic;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.InetSocketAddress;
import java.net.ProxySelector;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class BitcoinClient {
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public BitcoinClient() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        ProxySelector proxy = ProxySelector.of(new InetSocketAddress("127.0.0.1", 58591));
        Duration timeout = Duration.ofSeconds(3);
        this.httpClient = HttpClient.newBuilder().proxy(proxy).connectTimeout(timeout).build();
    }

    /**
     * 获取预计Gas费
     * @return
     */
    public EstimateFee getEstimateFee() {
        URI uri = URI.create("https://mempool.space/testnet/api/v1/fees/recommended");
        return this.send(uri,HttpMethod.GET,null,EstimateFee.class);
    }

    /**
     * 获取地址已确认但未发费的余额列表
     * @param address
     * @return
     */
    public List<UnspentUtxo> getUnusedUtxos(String address) {
        URI uri = URI.create("https://mempool.space/testnet/api/address/"+address+"/utxo");
        UnspentUtxo[] res = this.send(uri, HttpMethod.GET, null, UnspentUtxo[].class);
        return Arrays.stream(res).filter(utxo -> utxo.getStatus().getConfirmed()).collect(Collectors.toList());
    }

    /**
     * 提交交易
     * @param data
     * @return
     */
    public String postTx(String data) {
        URI uri = URI.create("https://mempool.space/testnet/api/tx");
        return this.send(uri,HttpMethod.POST,data,String.class);
    }

    /**
     * 发起POST请求
     * @param apiUrl     请求地址
     * @param httpMethod 请求方法
     * @param postParam  请求函数
     * @param resClazz   返回值类型
     * @return
     */
    private <T> T send(URI apiUrl,HttpMethod httpMethod,Object postParam,Class<T> resClazz) {
        if(Objects.nonNull(postParam) && !CharSequence.class.isAssignableFrom(postParam.getClass())) {
            try {
                postParam = objectMapper.writeValueAsString(postParam);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }
        if(Objects.isNull(postParam)) {
            postParam = "";
        }
        var httpRequestBuild = HttpRequest.newBuilder().uri(apiUrl).timeout(Duration.ofSeconds(5));
        if(HttpMethod.POST == httpMethod) {
            httpRequestBuild.POST(HttpRequest.BodyPublishers.ofString(postParam.toString()));
        }
        if(HttpMethod.GET == httpMethod) {
            httpRequestBuild.GET();
        }
        httpRequestBuild.header("User-Agent","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36");
        HttpRequest httpRequest = httpRequestBuild.build();
        HttpResponse<String> httpResponse = null;
        try {
            httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        String body = httpResponse.body();
        if(httpResponse.statusCode() != 200) {

        }
        if(CharSequence.class.isAssignableFrom(resClazz)) {
            return (T)body;
        }
        try {
            T resObject = objectMapper.readValue(body,resClazz);
            return resObject;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private enum HttpMethod {
        GET,
        POST
    }
}
