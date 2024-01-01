/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-param */

import { Interval, ParseTree, Token, TokenStream } from "antlr4ng";

import { ICompiledST, IFormalArgument, RegionType } from "./common.js";

import { BytecodeDisassembler } from "./BytecodeDisassembler.js";
import { STGroup } from "../STGroup.js";
import { GroupParser } from "./generated/GroupParser.js";
import { Compiler } from "./Compiler.js";
import { Misc } from "../misc/Misc.js";

/**
 * The result of compiling an {@link ST}.  Contains all the bytecode instructions,
 *  string table, bytecode address to source code map, and other bookkeeping
 *  info.  It's the implementation of an ST you might say.  All instances
 *  of the same template share a single implementation ({@link ST#impl} field).
 */
export class CompiledST implements ICompiledST {
    public name?: string;

    /**
     * Every template knows where it is relative to the group that loaded it.
     * The prefix is the relative path from the root. {@code "/prefix/name"} is
     * the fully qualified name of this template. All calls to
     * {@link STGroup#getInstanceOf} calls must use fully qualified names. A
     * {@code "/"} is added to the front if you don't specify one. Template
     * references within template code, however, uses relative names, unless of
     * course the name starts with {@code "/"}.
     * <p>
     * This has nothing to do with the outer filesystem path to the group dir or
     * group file.</p>
     * <p>
     * We set this as we load/compile the template.</p>
     * <p>
     * Always ends with {@code "/"}.</p>
     */
    public prefix = "/";

    /**
     * The original, immutable pattern (not really used again after
     *  initial "compilation"). Useful for debugging.  Even for
     *  sub templates, this is entire overall template.
     */
    public template: string;

    /** The token that begins template definition; could be {@code <@r>} of region. */
    public templateDefStartToken?: Token;

    /** Overall token stream for template (debug only). */
    public tokens?: TokenStream;

    /** How do we interpret syntax of template? (debug only) */
    public ast?: ParseTree;

    public formalArguments = new Map<string, IFormalArgument>();

    public hasFormalArgs = false;

    public numberOfArgsWithDefaultValues = 0;

    /**
     * The group that physically defines this {@link ST} definition. We use it
     * to initiate interpretation via {@link ST#toString}. From there, it
     * becomes field {@link Interpreter#group} and is fixed until rendering
     * completes.
     */
    public nativeGroup = STGroup.defaultGroup;

    /**
     * Does this template come from a {@code <@region>...<@end>} embedded in
     *  another template?
     */
    public isRegion = false;

    /**
     * If someone refs {@code <@r()>} in template t, an implicit
     *
     * <p>
     * {@code @t.r() ::= ""}</p>
     * <p>
     * is defined, but you can overwrite this def by defining your own. We need
     * to prevent more than one manual def though. Between this var and
     * {@link #isRegion} we can determine these cases.</p>
     */
    public regionDefType: RegionType = RegionType.IMPLICIT;

    public isAnonSubtemplate = false; // {...}

    public readonly strings: string[] = [];     // string operands of instructions
    public codeSize: number = 0;
    public readonly sourceMap: Interval[] = []; // maps IP to range in template pattern

    public instructions: Int8Array;    // byte-addressable code memory.

    /** A list of all regions and sub templates. */
    private implicitlyDefinedTemplates: CompiledST[] = [];

    public constructor() {
        this.instructions = new Int8Array(Compiler.TEMPLATE_INITIAL_CODE_SIZE);
        this.sourceMap = new Array<Interval>(Compiler.TEMPLATE_INITIAL_CODE_SIZE);
        this.template = "";
    }

    /**
     * Cloning the {@link CompiledST} for an {@link ST} instance allows
     * {@link ST#add} to be called safely during interpretation for templates
     * that do not contain formal arguments.
     *
     * @returns A copy of the current {@link CompiledST} instance. The copy is a
     * shallow copy, with the exception of the {@link #formalArguments} field
     * which is also cloned.
     *
     * @throws CloneNotSupportedException If the current instance cannot be
     * cloned.
     */
    public clone(): CompiledST {
        const clone = new CompiledST();
        clone.name = this.name;
        clone.prefix = this.prefix;
        clone.template = this.template;
        clone.templateDefStartToken = this.templateDefStartToken;
        clone.tokens = this.tokens;
        clone.ast = this.ast;
        clone.formalArguments = new Map([...this.formalArguments]);
        clone.hasFormalArgs = this.hasFormalArgs;
        clone.numberOfArgsWithDefaultValues = this.numberOfArgsWithDefaultValues;
        clone.implicitlyDefinedTemplates = [...this.implicitlyDefinedTemplates];
        clone.nativeGroup = this.nativeGroup;
        clone.isRegion = this.isRegion;
        clone.regionDefType = this.regionDefType;
        clone.isAnonSubtemplate = this.isAnonSubtemplate;
        clone.strings.push(...this.strings);
        clone.codeSize = this.codeSize;
        clone.sourceMap.push(...this.sourceMap);
        clone.instructions = new Int8Array(this.instructions);

        return clone;
    }

    public addImplicitlyDefinedTemplate(sub: CompiledST): void {
        sub.prefix = this.prefix;
        if (sub.name!.charAt(0) !== "/") {
            sub.name = sub.prefix + sub.name;
        }

        this.implicitlyDefinedTemplates.push(sub);
    }

    public defineArgDefaultValueTemplates(group: STGroup): void {
        if (!this.formalArguments) {
            return;
        }

        for (const [, fa] of this.formalArguments) {
            if (fa.defaultValueToken) {
                this.numberOfArgsWithDefaultValues++;
                switch (fa.defaultValueToken?.type) {
                    case GroupParser.ANONYMOUS_TEMPLATE: {
                        const argSTname = fa.name + "_default_value";
                        const c2 = new Compiler(group);
                        const defArgTemplate = Misc.strip(fa.defaultValueToken?.text, 1);
                        fa.compiledDefaultValue = c2.compile({
                            srcName: group.getFileName(),
                            name: argSTname,
                            template: defArgTemplate,
                            templateToken: fa.defaultValueToken,
                        });

                        if (fa.compiledDefaultValue) {
                            fa.compiledDefaultValue.name = argSTname;
                            fa.compiledDefaultValue.defineImplicitlyDefinedTemplates(group);
                        }

                        break;
                    }

                    case GroupParser.STRING: {
                        fa.defaultValue = Misc.strip(fa.defaultValueToken?.text, 1);

                        break;
                    }

                    case GroupParser.LBRACK: {
                        fa.defaultValue = [];

                        break;
                    }

                    case GroupParser.TRUE:
                    case GroupParser.FALSE: {
                        fa.defaultValue = fa.defaultValueToken?.type === GroupParser.TRUE;

                        break;
                    }

                    default: {
                        throw new Error("Unexpected default value token type.");
                    }

                }
            }
        }
    }

    public defineFormalArgs(args?: IFormalArgument[]): void {
        this.hasFormalArgs = true; // even if no args; it's formally defined
        this.formalArguments = new Map();
        if (args) {
            for (const a of args) {
                this.addArg(a);
            }
        }
    }

    /**
     * Used by {@link ST#add} to add args one by one without turning on full formal args definition signal.
     */
    public addArg(a: IFormalArgument): void {
        if (this.formalArguments.has(a.name)) {
            throw new Error(`Formal argument ${a.name} already exists.`);
        }

        a.index = this.formalArguments.size;
        this.formalArguments.set(a.name, a);
    }

    public defineImplicitlyDefinedTemplates(group: STGroup): void {
        for (const sub of this.implicitlyDefinedTemplates) {
            group.rawDefineTemplate(sub.name!, sub, sub.templateDefStartToken);
            sub.defineImplicitlyDefinedTemplates(group);
        }
    }

    public getTemplateSource(): string {
        const r = this.getTemplateRange();

        return this.template.substring(r.start, r.stop + 1);
    }

    public getTemplateRange(): Interval {
        if (this.isAnonSubtemplate) {
            let start = Number.MAX_VALUE;
            let stop = Number.MIN_VALUE;
            for (const interval of this.sourceMap) {
                if (interval === null) {
                    continue;
                }

                start = Math.min(start, interval.start);
                stop = Math.max(stop, interval.stop);
            }

            if (start <= stop + 1) {
                return new Interval(start, stop);
            }
        }

        return new Interval(0, this.template.length - 1);
    }

    public instrs(): string {
        const dis = new BytecodeDisassembler(this);

        return dis.instrs();
    }

    public dump(): void {
        const dis = new BytecodeDisassembler(this);
        console.log(this.name + ":");
        console.log(dis.disassemble());
        console.log("Strings:");
        console.log(dis.strings());
        console.log("Bytecode to template map:");
        console.log(dis.sourceMap());
    }

    public disassembled(): string {
        const dis = new BytecodeDisassembler(this);

        let result = dis.disassemble() + "\n";
        result += "Strings:\n";
        result += dis.strings() + "\n";
        result += "Bytecode to template map:\n";
        result += dis.sourceMap() + "\n";

        return result;
    }
}
