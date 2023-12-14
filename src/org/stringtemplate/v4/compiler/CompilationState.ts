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




import { JavaObject, type int, java, type short, type byte, S } from "jree";
import { StringTable } from "./StringTable.js";
import { FormalArgument } from "./FormalArgument.js";
import { CompiledST } from "./CompiledST.js";
import { BytecodeDisassembler } from "./BytecodeDisassembler.js";
import { Bytecode } from "./Bytecode.js";
import { Interpreter } from "../Interpreter.js";
import { Misc } from "../misc/Misc.js";
import { Interval } from "../misc/Interval.js";
import { ErrorType } from "../misc/ErrorType.js";



/** Temporary data used during construction and functions that fill it / use it.
 *  Result is {@link #impl} {@link CompiledST} object.
 */
export class CompilationState {
    /** The compiled code implementation to fill in. */
    protected impl = new CompiledST();

    /** Track unique strings; copy into {@link CompiledST#strings} after compilation. */
    protected stringtable = new StringTable();

    /**
     * Track instruction location within
     * {@code impl.}{@link CompiledST#instrs instrs} array; this is next address
     * to write to. Byte-addressable memory.
     */
    protected ip = 0;

    protected tokens: TokenStream;

    protected errMgr: java.util.logging.ErrorManager;

    public constructor(errMgr: java.util.logging.ErrorManager, name: string, tokens: TokenStream) {
        super();
        this.errMgr = errMgr;
        this.tokens = tokens;
        this.impl.name = name;
        this.impl.prefix = Misc.getPrefix(name);
    }

    /** Write value at index into a byte array highest to lowest byte,
     *  left to right.
     */
    public static writeShort(memory: Int8Array, index: int, value: short): void {
        memory[index + 0] = ((value >> (8 * 1)) & 0xFF) as byte;
        memory[index + 1] = (value & 0xFF) as byte;
    }

    public defineString(s: string): int { return this.stringtable.add(s); }

    public refAttr(templateToken: Token, id: CommonTree): void {
        let name = id.getText();
        if (this.impl.formalArguments !== null && this.impl.formalArguments.get(name) !== null) {
            let arg = this.impl.formalArguments.get(name);
            let index = arg.index;
            this.emit1(id, Bytecode.INSTR_LOAD_LOCAL, index);
        }
        else {
            if (Interpreter.predefinedAnonSubtemplateAttributes.contains(name)) {
                this.errMgr.compileTimeError(ErrorType.REF_TO_IMPLICIT_ATTRIBUTE_OUT_OF_SCOPE,
                    templateToken, id.token);
                this.emit(id, Bytecode.INSTR_NULL);
            }
            else {
                this.emit1(id, Bytecode.INSTR_LOAD_ATTR, name);
            }
        }
    }

    public setOption(id: CommonTree): void {
        let O = java.lang.Compiler.supportedOptions.get(id.getText());
        this.emit1(id, Bytecode.INSTR_STORE_OPTION, O.ordinal());
    }

    public func(templateToken: Token, id: CommonTree): void {
        let funcBytecode = java.lang.Compiler.funcs.get(id.getText());
        if (funcBytecode === null) {
            this.errMgr.compileTimeError(ErrorType.NO_SUCH_FUNCTION, templateToken, id.token);
            this.emit(id, Bytecode.INSTR_POP);
        }
        else {
            this.emit(id, funcBytecode);
        }
    }

    public emit(opcode: short): void;

    public emit(opAST: CommonTree, opcode: short): void;
    public emit(...args: unknown[]): void {
        switch (args.length) {
            case 1: {
                const [opcode] = args as [short];

                this.emit(null, opcode);

                break;
            }

            case 2: {
                const [opAST, opcode] = args as [CommonTree, short];


                this.ensureCapacity(1);
                if (opAST !== null) {
                    let i = opAST.getTokenStartIndex();
                    let j = opAST.getTokenStopIndex();
                    let p = (this.tokens.get(i) as CommonToken).getStartIndex();
                    let q = (this.tokens.get(j) as CommonToken).getStopIndex();
                    if (!(p < 0 || q < 0)) {
                        this.impl.sourceMap[this.ip] = new Interval(p, q);
                    }

                }
                this.impl.instrs[this.ip++] = opcode as byte;


                break;
            }

            default: {
                throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
            }
        }
    }


    public emit1(opAST: CommonTree, opcode: short, arg: int): void;

    public emit1(opAST: CommonTree, opcode: short, s: string): void;
    public emit1(...args: unknown[]): void {
        switch (args.length) {
            case 3: {
                const [opAST, opcode, arg] = args as [CommonTree, short, int];


                this.emit(opAST, opcode);
                this.ensureCapacity(Bytecode.OPND_SIZE_IN_BYTES);
                CompilationState.writeShort(this.impl.instrs, this.ip, arg as short);
                this.ip += Bytecode.OPND_SIZE_IN_BYTES;


                break;
            }

            case 3: {
                const [opAST, opcode, s] = args as [CommonTree, short, string];


                let i = this.defineString(s);
                this.emit1(opAST, opcode, i);


                break;
            }

            default: {
                throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
            }
        }
    }


    public emit2(opAST: CommonTree, opcode: short, arg: int, arg2: int): void;

    public emit2(opAST: CommonTree, opcode: short, s: string, arg2: int): void;
    public emit2(...args: unknown[]): void {
        switch (args.length) {
            case 4: {
                const [opAST, opcode, arg, arg2] = args as [CommonTree, short, int, int];


                this.emit(opAST, opcode);
                this.ensureCapacity(Bytecode.OPND_SIZE_IN_BYTES * 2);
                CompilationState.writeShort(this.impl.instrs, this.ip, arg as short);
                this.ip += Bytecode.OPND_SIZE_IN_BYTES;
                CompilationState.writeShort(this.impl.instrs, this.ip, arg2 as short);
                this.ip += Bytecode.OPND_SIZE_IN_BYTES;


                break;
            }

            case 4: {
                const [opAST, opcode, s, arg2] = args as [CommonTree, short, string, int];


                let i = this.defineString(s);
                this.emit2(opAST, opcode, i, arg2);


                break;
            }

            default: {
                throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
            }
        }
    }


    public insert(addr: int, opcode: short, s: string): void {
        //System.out.println("before insert of "+opcode+"("+s+"):"+ Arrays.toString(impl.instrs));
        this.ensureCapacity(1 + Bytecode.OPND_SIZE_IN_BYTES);
        let instrSize = 1 + Bytecode.OPND_SIZE_IN_BYTES;
        java.lang.System.arraycopy(this.impl.instrs, addr,
            this.impl.instrs, addr + instrSize,
            this.ip - addr); // make room for opcode, opnd
        let save = this.ip;
        this.ip = addr;
        this.emit1(null, opcode, s);
        this.ip = save + instrSize;
        //System.out.println("after  insert of "+opcode+"("+s+"):"+ Arrays.toString(impl.instrs));
        // adjust addresses for BR and BRF
        let a = addr + instrSize;
        while (a < this.ip) {
            let op = this.impl.instrs[a];
            let I = Bytecode.instructions[op];
            if (op === Bytecode.INSTR_BR || op === Bytecode.INSTR_BRF) {
                let opnd = BytecodeDisassembler.getShort(this.impl.instrs, a + 1);
                CompilationState.writeShort(this.impl.instrs, a + 1, (opnd + instrSize) as short);
            }
            a += I.nopnds * Bytecode.OPND_SIZE_IN_BYTES + 1;
        }
        //System.out.println("after  insert of "+opcode+"("+s+"):"+ Arrays.toString(impl.instrs));
    }

    public write(addr: int, value: short): void {
        CompilationState.writeShort(this.impl.instrs, addr, value);
    }

    public indent(indent: CommonTree): void {
        this.emit1(indent, Bytecode.INSTR_INDENT, indent.getText());
    }

    protected ensureCapacity(n: int): void {
        if ((this.ip + n) >= this.impl.instrs.length) { // ensure room for full instruction
            let c = new Int8Array(this.impl.instrs.length * 2);
            java.lang.System.arraycopy(this.impl.instrs, 0, c, 0, this.impl.instrs.length);
            this.impl.instrs = c;
            let sm = new Array<Interval>(this.impl.sourceMap.length * 2);
            java.lang.System.arraycopy(this.impl.sourceMap, 0, sm, 0, this.impl.sourceMap.length);
            this.impl.sourceMap = sm;
        }
    }
}
