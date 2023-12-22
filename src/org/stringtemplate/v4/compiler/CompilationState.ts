/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-param */

import { CommonToken, Token } from "antlr4ng";

import { StringTable } from "./StringTable.js";
import { CompiledST } from "./CompiledST.js";
import { BytecodeDisassembler } from "./BytecodeDisassembler.js";
import { Bytecode } from "./Bytecode.js";
import { Interpreter } from "../Interpreter.js";
import { Misc } from "../misc/Misc.js";
import { Interval } from "../misc/Interval.js";
import { ErrorType } from "../misc/ErrorType.js";
import { ErrorManager } from "../misc/ErrorManager.js";
import { CommonTree } from "../support/CommonTree.js";
import { Compiler } from "./Compiler.js";
import { TokenStreamV3 } from "../support/TokenStreamV3.js";

/**
 * Temporary data used during construction and functions that fill it / use it.
 *  Result is {@link #impl} {@link CompiledST} object.
 */
export class CompilationState {
    /**
     * Track instruction location within
     * {@code impl.}{@link CompiledST##instructions instrs} array; this is next address
     * to write to. Byte-addressable memory.
     */
    public ip = 0;

    /** The compiled code implementation to fill in. */
    public impl = new CompiledST();

    /** Track unique strings; copy into {@link CompiledST#strings} after compilation. */
    public stringTable = new StringTable();

    protected tokens: TokenStreamV3;
    protected errMgr: ErrorManager;

    public constructor(errMgr: ErrorManager, name: string, tokens: TokenStreamV3) {
        this.errMgr = errMgr;
        this.tokens = tokens;
        this.impl.name = name;
        this.impl.prefix = Misc.getPrefix(name);
    }

    /**
     * Write value at index into a byte array highest to lowest byte,
     *  left to right.
     */
    public static writeShort(memory: Int8Array, index: number, value: number): void {
        memory[index + 0] = ((value >> (8 * 1)) & 0xFF);
        memory[index + 1] = (value & 0xFF);
    }

    public defineString(s: string): number {
        return this.stringTable.add(s);
    }

    public refAttr(templateToken: Token, id: CommonTree | null): void {
        const name = id?.getText() ?? "";
        if (this.impl.formalArguments?.has(name)) {
            const arg = this.impl.formalArguments.get(name)!;
            const index = arg.index;
            this.emit1(id, Bytecode.INSTR_LOAD_LOCAL, index);
        } else {
            if (Interpreter.predefinedAnonSubtemplateAttributes.has(name)) {
                this.errMgr.compileTimeError(ErrorType.REF_TO_IMPLICIT_ATTRIBUTE_OUT_OF_SCOPE,
                    templateToken, id?.token);
                this.emit(id, Bytecode.INSTR_NULL);
            } else {
                this.emit1(id, Bytecode.INSTR_LOAD_ATTR, name);
            }
        }
    }

    public setOption(id: CommonTree): void {
        const option = Compiler.supportedOptions.get(id.getText())!;
        this.emit1(id, Bytecode.INSTR_STORE_OPTION, option);
    }

    public func(templateToken: Token, id: CommonTree | null): void {
        const funcBytecode = Compiler.funcs.get(id?.getText() ?? "");
        if (funcBytecode == null) {
            this.errMgr.compileTimeError(ErrorType.NO_SUCH_FUNCTION, templateToken, id?.token);
            this.emit(id, Bytecode.INSTR_POP);
        } else {
            this.emit(id, funcBytecode);
        }
    }

    public emit(opcode: number): void;
    public emit(opAST: CommonTree | null, opcode: number): void;
    public emit(...args: unknown[]): void {
        switch (args.length) {
            case 1: {
                const [opcode] = args as [number];

                this.emit(null, opcode);

                break;
            }

            case 2: {
                const [opAST, opcode] = args as [CommonTree, number];

                this.ensureCapacity(1);
                if (opAST !== null) {
                    const i = opAST.getTokenStartIndex();
                    const j = opAST.getTokenStopIndex();
                    const p = (this.tokens.get(i) as CommonToken).start;
                    const q = (this.tokens.get(j) as CommonToken).stop;
                    if (!(p < 0 || q < 0)) {
                        this.impl.sourceMap[this.ip] = new Interval(p, q);
                    }

                }
                this.impl.instructions[this.ip++] = opcode;

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }
    }

    public emit1(opAST: CommonTree | null, opcode: number, arg: number | string): void {
        this.emit(opAST, opcode);

        let index;
        if (typeof arg === "string") {
            index = this.defineString(arg);
        } else {
            index = arg;
        }

        this.ensureCapacity(Bytecode.OPERAND_SIZE_IN_BYTES);
        CompilationState.writeShort(this.impl.instructions, this.ip, index);
        this.ip += Bytecode.OPERAND_SIZE_IN_BYTES;
    }

    public emit2(opAST: CommonTree | null, opcode: number, arg: number | string, arg2: number): void {
        let index;
        if (typeof arg === "string") {
            index = this.defineString(arg);
        } else {
            index = arg;
        }

        this.emit(opAST, opcode);
        this.ensureCapacity(Bytecode.OPERAND_SIZE_IN_BYTES * 2);
        CompilationState.writeShort(this.impl.instructions, this.ip, index);
        this.ip += Bytecode.OPERAND_SIZE_IN_BYTES;
        CompilationState.writeShort(this.impl.instructions, this.ip, arg2);
        this.ip += Bytecode.OPERAND_SIZE_IN_BYTES;
    }

    public insert(addr: number, opcode: number, s: string): void {
        this.ensureCapacity(1 + Bytecode.OPERAND_SIZE_IN_BYTES);
        const instrSize = 1 + Bytecode.OPERAND_SIZE_IN_BYTES;
        this.impl.instructions.copyWithin(addr + instrSize, addr, this.ip); // make room for opcode, operand

        const save = this.ip;
        this.ip = addr;
        this.emit1(null, opcode, s);
        this.ip = save + instrSize;

        // adjust addresses for BR and BRF
        let a = addr + instrSize;
        while (a < this.ip) {
            const op = this.impl.instructions[a];
            const instruction = Bytecode.instructions[op]!;
            if (op === Bytecode.INSTR_BR || op === Bytecode.INSTR_BRF) {
                const operand = BytecodeDisassembler.getShort(this.impl.instructions, a + 1);
                CompilationState.writeShort(this.impl.instructions, a + 1, operand + instrSize);
            }
            a += instruction.operandCount * Bytecode.OPERAND_SIZE_IN_BYTES + 1;
        }
    }

    public write(addr: number, value: number): void {
        CompilationState.writeShort(this.impl.instructions, addr, value);
    }

    public indent(indent: CommonTree | null): void {
        this.emit1(indent, Bytecode.INSTR_INDENT, indent?.getText() ?? "");
    }

    protected ensureCapacity(n: number): void {
        if ((this.ip + n) >= this.impl.instructions.length) { // ensure room for full instruction
            const c = new Int8Array(this.impl.instructions.length * 2);
            c.set(this.impl.instructions);
            c.fill(0, this.impl.instructions.length);
            this.impl.instructions = c;

            // No need to copy sourceMap, since it's a standard array and grows as we go.
        }
    }
}
