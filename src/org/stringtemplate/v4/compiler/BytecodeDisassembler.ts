/*
 * [The "BSD license"]
 *  Copyright (c) 2011 Terence Parr
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



import { java, JavaObject, type int } from "jree";
import { STLexer } from "./STLexer.js";
import { CompiledST } from "./CompiledST.js";
import { Bytecode } from "./Bytecode.js";
import { Interval } from "../misc/Interval.js";
import { Misc } from "../misc/Misc.js";

type String = java.lang.String;
const String = java.lang.String;
type StringBuilder = java.lang.StringBuilder;
const StringBuilder = java.lang.StringBuilder;
type IllegalArgumentException = java.lang.IllegalArgumentException;
const IllegalArgumentException = java.lang.IllegalArgumentException;
type List<E> = java.util.List<E>;
type ArrayList<E> = java.util.ArrayList<E>;
const ArrayList = java.util.ArrayList;



export  class BytecodeDisassembler extends JavaObject {
    protected  code: CompiledST;

    public  constructor(code: CompiledST) { super();
this.code = code; }

    public static  getShort(memory: Int8Array, index: int):  int {
        let  b1 = memory[index]&0xFF; // mask off sign-extended bits
        let  b2 = memory[index+1]&0xFF;
        let  word = b1<<(8*1) | b2;
        return word;
    }

    public  instrs():  String {
        let  buf = new  StringBuilder();
        let  ip=0;
        while (ip<this.code.codeSize) {
            if ( ip>0 ) {
 buf.append(", ");
}

            let  opcode = this.code.instrs[ip];
            let  I = Bytecode.instructions[opcode];
            buf.append(I.name);
            ip++;
            for (let  opnd=0; opnd<I.nopnds; opnd++) {
                buf.append(' ');
                buf.append(BytecodeDisassembler.getShort(this.code.instrs, ip));
                ip += Bytecode.OPND_SIZE_IN_BYTES;
            }
        }
        return buf.toString();
    }

    public  disassemble():  String {
        let  buf = new  StringBuilder();
        let  i=0;
        while (i<this.code.codeSize) {
            i = this.disassembleInstruction(buf, i);
            buf.append('\n');
        }
        return buf.toString();
    }

    public  disassembleInstruction(buf: StringBuilder, ip: int):  int {
        let  opcode = this.code.instrs[ip];
        if ( ip>=this.code.codeSize ) {
            throw new  IllegalArgumentException("ip out of range: "+ip);
        }
        let  I =
            Bytecode.instructions[opcode];
        if ( I===null ) {
            throw new  IllegalArgumentException("no such instruction "+opcode+
                " at address "+ip);
        }
        let  instrName = I.name;
        buf.append( String.format("%04d:\t%-14s", ip, instrName) );
        ip++;
        if ( I.nopnds ===0 ) {
            buf.append("  ");
            return ip;
        }
        let  operands = new  ArrayList<String>();
        for (let  i=0; i<I.nopnds; i++) {
            let  opnd = BytecodeDisassembler.getShort(this.code.instrs, ip);
            ip += Bytecode.OPND_SIZE_IN_BYTES;
            switch ( I.type[i] ) {
                case STLexer.STRING :{
                    operands.add(this.showConstPoolOperand(opnd));
                    break;
}

                case Bytecode.OperandType.ADDR :
                case Bytecode.OperandType.INT :{
                    operands.add(String.valueOf(opnd));
                    break;
}

                default:{
                    operands.add(String.valueOf(opnd));
                    break;
}

            }
        }
        for (let  i = 0; i < operands.size(); i++) {
            let  s = operands.get(i);
            if ( i>0 ) {
 buf.append(", ");
}

            buf.append( s );
        }
        return ip;
    }

    public  strings():  String {
        let  buf = new  StringBuilder();
        let  addr = 0;
        if ( this.code.strings!==null ) {
            for (let o of this.code.strings) {
                if ( o instanceof String ) {
                    let  s = o as String;
                    s = Misc.replaceEscapes(s);
                    buf.append( String.format("%04d: \"%s\"\n", addr, s) );
                }
                else {
                    buf.append( String.format("%04d: %s\n", addr, o) );
                }
                addr++;
            }
        }
        return buf.toString();
    }

    public  sourceMap():  String {
        let  buf = new  StringBuilder();
        let  addr = 0;
        for (let I of this.code.sourceMap) {
            if ( I!==null ) {
                let  chunk = this.code.template.substring(I.a,I.b+1);
                buf.append( String.format("%04d: %s\t\"%s\"\n", addr, I, chunk) );
            }
            addr++;
        }
        return buf.toString();
    }

    private  showConstPoolOperand(poolIndex: int):  String {
        let  buf = new  StringBuilder();
        buf.append("#");
        buf.append(poolIndex);
        let  s = "<bad string index>";
        if ( poolIndex<this.code.strings.length ) {
            if ( this.code.strings[poolIndex]===null ) {
 s = "null";
}

            else {
                s = this.code.strings[poolIndex];
                if (this.code.strings[poolIndex] !== null) {
                    s = Misc.replaceEscapes(s);
                    s='"'+s+'"';
                }
            }
        }
        buf.append(":");
        buf.append(s);
        return buf.toString();
    }
}
