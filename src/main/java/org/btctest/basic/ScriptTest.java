package org.btctest.basic;

import org.bitcoinj.script.Script;
import org.bitcoinj.script.ScriptBuilder;
import org.bitcoinj.script.ScriptChunk;
import org.bitcoinj.script.ScriptOpCodes;

import java.nio.charset.StandardCharsets;

public class ScriptTest {

    public static void main(String[] args) {
        Script script = helloworedScript();
        System.out.println(script);
    }


    public static Script helloworedScript() {
        ScriptBuilder sb = new ScriptBuilder();
        sb.opFalse()
                .op(ScriptOpCodes.OP_IF)
                .addChunk(new ScriptChunk(ScriptOpCodes.OP_PUSHDATA4,"ord".getBytes(StandardCharsets.UTF_8)))
                .number(1)
                .addChunk(new ScriptChunk(ScriptOpCodes.OP_PUSHDATA4,"text/plain;charset=utf-8".getBytes(StandardCharsets.UTF_8)))
                .number(0)
                .addChunk(new ScriptChunk(ScriptOpCodes.OP_PUSHDATA4,"Hello, world!".getBytes(StandardCharsets.UTF_8)))
                .op(ScriptOpCodes.OP_ENDIF);
        return sb.build();
    }



}
