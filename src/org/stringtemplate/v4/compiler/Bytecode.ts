/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

export class Bytecode {
    public static readonly OPERAND_SIZE_IN_BYTES = 2;

    public static Instruction = class Instruction {
        public name: string; // E.g., "load_str", "new"
        public type: Bytecode.OperandType[] = [];
        public operandCount = 0;

        public constructor(name: string, a?: Bytecode.OperandType, b?: Bytecode.OperandType) {
            this.name = name;
            if (!a) {
                this.type[0] = Bytecode.OperandType.NONE;
                this.type[1] = Bytecode.OperandType.NONE;
            } else if (!b) {
                this.type[0] = a;
                this.type[1] = Bytecode.OperandType.NONE;
                this.operandCount = 1;
            } else {
                this.type[0] = a;
                this.type[1] = b;
                this.operandCount = 2;
            }
        }
    };

    // don't use enum for efficiency; don't want CompiledST.instrs to
    // be an array of objects (Bytecode[]). We want it to be byte[].

    // INSTRUCTION BYTE CODES
    public static readonly INSTR_LOAD_STR = 1;
    public static readonly INSTR_LOAD_ATTR = 2;
    public static readonly INSTR_LOAD_LOCAL = 3; // load stuff like it, i, i0
    public static readonly INSTR_LOAD_PROP = 4;
    public static readonly INSTR_LOAD_PROP_IND = 5;
    public static readonly INSTR_STORE_OPTION = 6;
    public static readonly INSTR_STORE_ARG = 7;
    public static readonly INSTR_NEW = 8;  // create new template instance
    public static readonly INSTR_NEW_IND = 9;  // create new instance using value on stack
    public static readonly INSTR_NEW_BOX_ARGS = 10; // create new instance using args in Map on stack
    public static readonly INSTR_SUPER_NEW = 11;  // create new instance using value on stack
    public static readonly INSTR_SUPER_NEW_BOX_ARGS = 12; // create new instance using args in Map on stack
    public static readonly INSTR_WRITE = 13;
    public static readonly INSTR_WRITE_OPT = 14;
    public static readonly INSTR_MAP = 15;  // <a:b()>, <a:b():c()>, <a:{...}>
    public static readonly INSTR_ROT_MAP = 16;  // <a:b(),c()>
    public static readonly INSTR_ZIP_MAP = 17;  // <names,phones:{n,p | ...}>
    public static readonly INSTR_BR = 18;
    public static readonly INSTR_BRF = 19;
    public static readonly INSTR_OPTIONS = 20;  // push options map
    public static readonly INSTR_ARGS = 21;  // push args map
    public static readonly INSTR_PASSTHRU = 22;

    public static readonly INSTR_LIST = 24;
    public static readonly INSTR_ADD = 25;
    public static readonly INSTR_TOSTR = 26;

    // Predefined functions
    public static readonly INSTR_FIRST = 27;
    public static readonly INSTR_LAST = 28;
    public static readonly INSTR_REST = 29;
    public static readonly INSTR_TRUNC = 30;
    public static readonly INSTR_STRIP = 31;
    public static readonly INSTR_TRIM = 32;
    public static readonly INSTR_LENGTH = 33;
    public static readonly INSTR_STRLEN = 34;
    public static readonly INSTR_REVERSE = 35;

    public static readonly INSTR_NOT = 36;
    public static readonly INSTR_OR = 37;
    public static readonly INSTR_AND = 38;

    public static readonly INSTR_INDENT = 39;
    public static readonly INSTR_DEDENT = 40;
    public static readonly INSTR_NEWLINE = 41;

    public static readonly INSTR_NOOP = 42; // do nothing
    public static readonly INSTR_POP = 43;
    public static readonly INSTR_NULL = 44; // push null value
    public static readonly INSTR_TRUE = 45; // push true value
    public static readonly INSTR_FALSE = 46;

    // combined instructions

    public static readonly INSTR_WRITE_STR = 47; // load_str n, write
    public static readonly INSTR_WRITE_LOCAL = 48; // TODO load_local n, write

    public static readonly MAX_BYTECODE = 48;
}

export namespace Bytecode {
    export enum OperandType {
        NONE,
        STRING,
        ADDR,
        INT,
    };

    /** Used for assembly/disassembly; describes instruction set */
    export const instructions = [
        null, // <INVALID>
        new Bytecode.Instruction("load_str", Bytecode.OperandType.STRING), // index is the opcode
        new Bytecode.Instruction("load_attr", Bytecode.OperandType.STRING),
        new Bytecode.Instruction("load_local", Bytecode.OperandType.INT),
        new Bytecode.Instruction("load_prop", Bytecode.OperandType.STRING),
        new Bytecode.Instruction("load_prop_ind"),
        new Bytecode.Instruction("store_option", Bytecode.OperandType.INT),
        new Bytecode.Instruction("store_arg", Bytecode.OperandType.STRING),
        new Bytecode.Instruction("new", Bytecode.OperandType.STRING, Bytecode.OperandType.INT),
        new Bytecode.Instruction("new_ind", Bytecode.OperandType.INT),
        new Bytecode.Instruction("new_box_args", Bytecode.OperandType.STRING),
        new Bytecode.Instruction("super_new", Bytecode.OperandType.STRING, Bytecode.OperandType.INT),
        new Bytecode.Instruction("super_new_box_args", Bytecode.OperandType.STRING),
        new Bytecode.Instruction("write"),
        new Bytecode.Instruction("write_opt"),
        new Bytecode.Instruction("map"),
        new Bytecode.Instruction("rot_map", Bytecode.OperandType.INT),
        new Bytecode.Instruction("zip_map", Bytecode.OperandType.INT),
        new Bytecode.Instruction("br", Bytecode.OperandType.ADDR),
        new Bytecode.Instruction("brf", Bytecode.OperandType.ADDR),
        new Bytecode.Instruction("options"),
        new Bytecode.Instruction("args"),
        new Bytecode.Instruction("passthru", Bytecode.OperandType.STRING),
        null, //new Instruction("passthru_ind", OperandType.INT),
        new Bytecode.Instruction("list"),
        new Bytecode.Instruction("add"),
        new Bytecode.Instruction("tostr"),
        new Bytecode.Instruction("first"),
        new Bytecode.Instruction("last"),
        new Bytecode.Instruction("rest"),
        new Bytecode.Instruction("trunc"),
        new Bytecode.Instruction("strip"),
        new Bytecode.Instruction("trim"),
        new Bytecode.Instruction("length"),
        new Bytecode.Instruction("strlen"),
        new Bytecode.Instruction("reverse"),
        new Bytecode.Instruction("not"),
        new Bytecode.Instruction("or"),
        new Bytecode.Instruction("and"),
        new Bytecode.Instruction("indent", Bytecode.OperandType.STRING),
        new Bytecode.Instruction("dedent"),
        new Bytecode.Instruction("newline"),
        new Bytecode.Instruction("noop"),
        new Bytecode.Instruction("pop"),
        new Bytecode.Instruction("null"),
        new Bytecode.Instruction("true"),
        new Bytecode.Instruction("false"),
        new Bytecode.Instruction("write_str", Bytecode.OperandType.STRING),
        new Bytecode.Instruction("write_local", Bytecode.OperandType.INT),
    ];
}
