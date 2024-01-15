/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Bytecode } from "./Bytecode.js";
import { Misc } from "../misc/Misc.js";
import { printf } from "fast-printf";
import { ICompiledST } from "./common.js";

export class BytecodeDisassembler {
    protected code: ICompiledST;

    public constructor(code: ICompiledST) {
        this.code = code;
    }

    public static getShort(memory: Int8Array, index: number): number {
        const b1 = memory[index] & 0xFF; // mask off sign-extended bits
        const b2 = memory[index + 1] & 0xFF;
        const word = (b1 << 8) | b2;

        return word;
    }

    public instrs(): string {
        let buf = "";
        let ip = 0;
        while (ip < this.code.codeSize) {
            if (ip > 0) {
                buf += ", ";
            }

            const opcode = this.code.instructions[ip];
            const instruction = Bytecode.instructions[opcode];
            if (instruction) {
                buf += instruction.name;
                ip++;
                for (let operand = 0; operand < instruction.operandCount; operand++) {
                    buf += " ";
                    buf += BytecodeDisassembler.getShort(this.code.instructions, ip);
                    ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                }
            }
        }

        return buf;
    }

    public disassemble(): string {
        let buf = "";
        let i = 0;
        while (i < this.code.codeSize) {
            i = this.disassembleInstruction({ buf, ip: i });
            buf += "\n";
        }

        return buf;
    }

    public disassembleInstruction(values: { buf: string, ip: number; }): number {
        const opcode = this.code.instructions[values.ip];
        if (values.ip >= this.code.codeSize) {
            throw new Error("ip out of range: " + values.ip);
        }

        const instruction = Bytecode.instructions[opcode];
        if (!instruction) {
            throw new Error("no such instruction " + opcode + " at address " + values.ip);
        }

        const instrName = instruction.name;
        values.buf += printf("%04d:\t%-14s", values.ip, instrName);
        values.ip++;
        if (instruction.operandCount === 0) {
            values.buf += "  ";

            return values.ip;
        }

        const operands: string[] = [];
        for (let i = 0; i < instruction.operandCount; i++) {
            const operand = BytecodeDisassembler.getShort(this.code.instructions, values.ip);
            values.ip += Bytecode.OPERAND_SIZE_IN_BYTES;
            switch (instruction.type[i]) {
                case Bytecode.OperandType.STRING: {
                    operands.push(this.showConstPoolOperand(operand));
                    break;
                }

                case Bytecode.OperandType.ADDR:
                case Bytecode.OperandType.INT: {
                    operands.push(operand.toString());
                    break;
                }

                default: {
                    operands.push(operand.toString());
                    break;
                }

            }
        }

        for (let i = 0; i < operands.length; i++) {
            const s = operands[i];
            if (i > 0) {
                values.buf += ", ";
            }

            values.buf += s;
        }

        return values.ip;
    }

    public strings(): string {
        let buf = "";
        let addr = 0;
        for (const o of this.code.strings) {
            if (typeof o === "string") {
                const s = Misc.replaceEscapes(o);
                buf += printf("%04d: \"%s\"\n", addr, s);
            } else {
                buf += printf("%04d: %s\n", addr, o);
            }
            addr++;
        }

        return buf;
    }

    public sourceMap(): string {
        let buf = "";
        let addr = 0;
        for (const interval of this.code.sourceMap) {
            if (interval) {
                const chunk = this.code.template.substring(interval.start, interval.stop + 1);
                buf += printf("%04d: %s\t\"%s\"\n", addr, interval, chunk);
            }
            addr++;
        }

        return buf.toString();
    }

    private showConstPoolOperand(poolIndex: number): string {
        let buf = "#" + poolIndex;
        let s = "<bad string index>";
        if (poolIndex < this.code.strings.length) {
            if (this.code.strings[poolIndex] == null) {
                s = "null";
            } else {
                s = this.code.strings[poolIndex];
                if (s !== null) {
                    s = Misc.replaceEscapes(s);
                    s = '"' + s + '"';
                }
            }
        }

        buf += ":";
        buf += s;

        return buf;
    }
}
