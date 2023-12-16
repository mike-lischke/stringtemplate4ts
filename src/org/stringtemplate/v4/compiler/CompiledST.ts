/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Token, TokenStream } from "antlr4ng";

import { FormalArgument } from "./FormalArgument.js";
import { BytecodeDisassembler } from "./BytecodeDisassembler.js";
import { STGroup } from "../STGroup.js";
import { ST } from "../ST.js";
import { Misc } from "../misc/Misc.js";
import { Interval } from "../misc/Interval.js";
import { GroupParser } from "./generated/GroupParser.js";

/**
 * The result of compiling an {@link ST}.  Contains all the bytecode instructions,
 *  string table, bytecode address to source code map, and other bookkeeping
 *  info.  It's the implementation of an ST you might say.  All instances
 *  of the same template share a single implementation ({@link ST#impl} field).
 */
export class CompiledST {
    public name: string;

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
    public templateDefStartToken: Token;

    /** Overall token stream for template (debug only). */
    public tokens: TokenStream;

    /** How do we interpret syntax of template? (debug only) */
    public ast: CommonTree;

    public formalArguments: Map<string, FormalArgument>;

    public hasFormalArgs: boolean;

    public numberOfArgsWithDefaultValues: number;

    /** A list of all regions and sub templates. */
    public implicitlyDefinedTemplates: CompiledST[];

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
    public isRegion: boolean;

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
    public regionDefType: ST.RegionType;

    public isAnonSubtemplate: boolean; // {...}

    public strings: string[];     // string operands of instructions
    public instrs: Int8Array;        // byte-addressable code memory.
    public codeSize: number;
    public sourceMap: Interval[]; // maps IP to range in template pattern

    public constructor() {
        super();
        this.instrs = new Int8Array(java.lang.Compiler.TEMPLATE_INITIAL_CODE_SIZE);
        this.sourceMap = new Array<Interval>(java.lang.Compiler.TEMPLATE_INITIAL_CODE_SIZE);
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
    public override  clone(): CompiledST {
        const clone = super.clone() as CompiledST;
        if (this.formalArguments !== null) {
            this.formalArguments = java.util.Collections.synchronizedMap(new java.util.LinkedHashMap<string, FormalArgument>(this.formalArguments));
        }

        return clone;
    }

    public addImplicitlyDefinedTemplate(sub: CompiledST): void {
        sub.prefix = this.prefix;
        if (sub.name.charAt(0) !== "/") {
            sub.name = sub.prefix + sub.name;
        }

        if (this.implicitlyDefinedTemplates === null) {
            this.implicitlyDefinedTemplates = new Array<CompiledST>();
        }
        this.implicitlyDefinedTemplates.add(sub);
    }

    public defineArgDefaultValueTemplates(group: STGroup): void {
        if (this.formalArguments === null) {
            return;
        }

        for (const a of this.formalArguments.keySet()) {
            const fa = this.formalArguments.get(a);
            if (fa.defaultValueToken !== null) {
                this.numberOfArgsWithDefaultValues++;
                switch (fa.defaultValueToken.getType()) {
                    case GroupParser.ANONYMOUS_TEMPLATE: {
                        const argSTname = fa.name + "_default_value";
                        const c2 = new java.lang.Compiler(group);
                        const defArgTemplate =
                            Misc.strip(fa.defaultValueToken.getText(), 1);
                        fa.compiledDefaultValue =
                            c2.compile(group.getFileName(), argSTname, null,
                                defArgTemplate, fa.defaultValueToken);
                        fa.compiledDefaultValue.name = argSTname;
                        fa.compiledDefaultValue.defineImplicitlyDefinedTemplates(group);
                        break;
                    }

                    case GroupParser.STRING: {
                        fa.defaultValue = Misc.strip(fa.defaultValueToken.getText(), 1);
                        break;
                    }

                    case GroupParser.LBRACK: {
                        fa.defaultValue = java.util.Collections.emptyList();
                        break;
                    }

                    case GroupParser.TRUE:
                    case GroupParser.FALSE: {
                        fa.defaultValue = fa.defaultValueToken.getType() === GroupParser.TRUE;
                        break;
                    }

                    default: {
                        throw new java.lang.UnsupportedOperationException("Unexpected default value token type.");
                    }

                }
            }
        }
    }

    public defineFormalArgs(args: java.util.List<FormalArgument>): void {
        this.hasFormalArgs = true; // even if no args; it's formally defined
        if (args === null) {
            this.formalArguments = null;
        }

        else {
            for (const a of args) {
                this.addArg(a);
            }

        }

    }

    /**
     * Used by {@link ST#add} to add args one by one without turning on full formal args definition signal.
     * @param a
     */
    public addArg(a: FormalArgument): void {
        if (this.formalArguments === null) {
            this.formalArguments = java.util.Collections.synchronizedMap(new java.util.LinkedHashMap<string, FormalArgument>());
        }
        else {
            if (this.formalArguments.containsKey(a.name)) {
                throw new java.lang.IllegalArgumentException(string.format("Formal argument %s already exists.", a.name));
            }
        }

        a.index = this.formalArguments.size();
        this.formalArguments.put(a.name, a);
    }

    public defineImplicitlyDefinedTemplates(group: STGroup): void {
        if (this.implicitlyDefinedTemplates !== null) {
            for (const sub of this.implicitlyDefinedTemplates) {
                group.rawDefineTemplate(sub.name, sub, sub.templateDefStartToken);
                sub.defineImplicitlyDefinedTemplates(group);
            }
        }
    }

    public getTemplateSource(): string {
        const r = this.getTemplateRange();

        return this.template.substring(r.a, r.b + 1);
    }

    public getTemplateRange(): Interval {
        if (this.isAnonSubtemplate) {
            let start = number.MAX_VALUE;
            let stop = number.MIN_VALUE;
            for (const interval of this.sourceMap) {
                if (interval === null) {
                    continue;
                }

                start = java.lang.Math.min(start, interval.a);
                stop = java.lang.Math.max(stop, interval.b);
            }

            if (start <= stop + 1) {
                return new Interval(start, stop);
            }
        }

        return new Interval(0, this.template.length() - 1);
    }

    public instrs(): string {
        const dis = new BytecodeDisassembler(this);

        return dis.instrs();
    }

    public dump(): void {
        const dis = new BytecodeDisassembler(this);
        java.lang.System.out.println(this.name + ":");
        java.lang.System.out.println(dis.disassemble());
        java.lang.System.out.println("Strings:");
        java.lang.System.out.println(dis.strings());
        java.lang.System.out.println("Bytecode to template map:");
        java.lang.System.out.println(dis.sourceMap());
    }

    public disasm(): string {
        const dis = new BytecodeDisassembler(this);
        const sw = new java.io.StringWriter();
        const pw = new java.io.PrintWriter(sw);
        pw.println(dis.disassemble());
        pw.println("Strings:");
        pw.println(dis.strings());
        pw.println("Bytecode to template map:");
        pw.println(dis.sourceMap());
        pw.close();

        return sw.toString();
    }
}
