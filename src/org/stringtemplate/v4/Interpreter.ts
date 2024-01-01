/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-returns, jsdoc/require-param-description, jsdoc/require-param */
/* eslint-disable jsdoc/no-undefined-types */

import { STWriter } from "./STWriter.js";
import { STGroup } from "./STGroup.js";
import { ST } from "./ST.js";
import { InstanceScope } from "./InstanceScope.js";
import { CompiledST } from "./compiler/CompiledST.js";
import { BytecodeDisassembler } from "./compiler/BytecodeDisassembler.js";
import { Bytecode } from "./compiler/Bytecode.js";
import { InterpEvent } from "./debug/InterpEvent.js";
import { IndentEvent } from "./debug/IndentEvent.js";
import { EvalTemplateEvent } from "./debug/EvalTemplateEvent.js";
import { EvalExprEvent } from "./debug/EvalExprEvent.js";
import { STNoSuchPropertyException } from "./misc/STNoSuchPropertyException.js";
import { STNoSuchAttributeException } from "./misc/STNoSuchAttributeException.js";
import { Misc } from "./misc/Misc.js";
import { ErrorType } from "./misc/ErrorType.js";

import { ErrorManager } from "./misc/ErrorManager.js";
import { GroupParser } from "./compiler/generated/GroupParser.js";
import { Constructor } from "./reflection/IMember.js";
import { constructorFromUnknown, isIterator } from "./support/helpers.js";
import { printf } from "fast-printf";
import { StringWriter } from "./support/StringWriter.js";
import { IErrorManager, IInstanceScope, IST, ISTGroup } from "./compiler/common.js";

export enum InterpreterOption {
    ANCHOR = 0,
    FORMAT = 1,
    NULL = 2,
    SEPARATOR = 3,
    WRAP = 4
};

/**
 * This class knows how to execute template byte codes relative to a particular
 * {@link STGroup}. To execute the byte codes, we need an output stream and a
 * reference to an {@link ST} instance. That instance's {@link ST#impl} field
 * points at a {@link CompiledST}, which contains all of the byte codes and
 * other information relevant to execution.
 * <p>
 * This interpreter is a stack-based bytecode interpreter. All operands go onto
 * an operand stack.</p>
 * <p>
 * If {@link #debug} set, we track interpreter events. For now, I am only
 * tracking instance creation events. These are used by {@link STViz} to pair up
 * output chunks with the template expressions that generate them.</p>
 * <p>
 * We create a new interpreter for each invocation of
 * {@link ST#render}, {@link ST#inspect}, or {@link ST#getEvents}.</p>
 */
export class Interpreter {
    public static readonly DEFAULT_OPERAND_STACK_SIZE = 100;

    public static readonly predefinedAnonSubtemplateAttributes = new Set<string>([
        "i", "i0",
    ]);

    public static readonly supportedOptions = new Map<string, InterpreterOption>([
        ["anchor", InterpreterOption.ANCHOR],
        ["format", InterpreterOption.FORMAT],
        ["null", InterpreterOption.NULL],
        ["separator", InterpreterOption.SEPARATOR],
        ["wrap", InterpreterOption.WRAP],
    ]);

    /**
     * Dump bytecode instructions as they are executed. This field is mostly for
     * StringTemplate development.
     */
    public static trace = false;

    /** When {@code true}, track events inside templates and in {@link #events}. */
    public debug = false;

    /** Operand stack, grows upwards. */
    protected operands = new Array<unknown>(Interpreter.DEFAULT_OPERAND_STACK_SIZE);

    /** Stack pointer register. */
    protected sp = -1;

    /** The number of characters written on this template line so far. */
    protected charsWrittenOnLine = 0;

    /**
     * Render template with respect to this group.
     *
     *  @see ST#groupThatCreatedThisInstance
     *  @see CompiledST#nativeGroup
     */
    protected group: ISTGroup;

    /** For renderers, we have to pass in the locale. */
    protected locale: Intl.Locale;

    protected errMgr: IErrorManager;

    /** If {@link #trace} is {@code true}, track trace here. */
    // TODO: track the pieces not a string and track what it contributes to output
    protected executeTrace: string[] = [];

    /**
     * Track everything happening in interpreter across all templates if
     * {@link #debug}. The last event in this field is the
     * {@link EvalTemplateEvent} for the root template.
     */
    protected events: InterpEvent[] = [];

    public constructor(group: ISTGroup, debug: boolean);
    public constructor(group: ISTGroup, locale: Intl.Locale, debug: boolean);
    public constructor(group: ISTGroup, errMgr: IErrorManager, debug: boolean);
    public constructor(group: ISTGroup, locale: Intl.Locale, errMgr: IErrorManager, debug: boolean);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 2: {
                [this.group, this.debug] = args as [STGroup, boolean];
                this.locale = new Intl.Locale("en-US");
                this.errMgr = this.group.errMgr;

                break;
            }

            case 3: {
                if (args[1] instanceof Intl.Locale) {
                    [this.group, this.locale, this.debug] = args as [ISTGroup, Intl.Locale, boolean];
                    this.errMgr = this.group.errMgr;
                } else {
                    [this.group, this.errMgr, this.debug] = args as [ISTGroup, ErrorManager, boolean];
                    this.locale = new Intl.Locale("en-US");
                }

                break;
            }

            case 4: {
                [this.group, this.locale, this.errMgr, this.debug] =
                    args as [ISTGroup, Intl.Locale, ErrorManager, boolean];

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }
    }

    /**
     * If an instance of <i>x</i> is enclosed in a <i>y</i> which is in a
     * <i>z</i>, return a {@code String} of these instance names in order from
     * topmost to lowest; here that would be {@code [z y x]}.
     * @param scope
     */
    public static getEnclosingInstanceStackString(scope?: InstanceScope): string {
        const templates = Interpreter.getEnclosingInstanceStack(scope, true);
        let buf = "";
        let i = 0;
        for (const st of templates) {
            if (i > 0) {
                buf += " ";
            }

            buf += st.getName();
            i++;
        }

        return buf.toString();
    }

    public static getEnclosingInstanceStack(scope: InstanceScope | undefined, topDown: boolean): ST[] {
        const stack: ST[] = [];
        let p = scope;
        while (p) {
            if (topDown) {
                stack.unshift(p.st!);
            } else {
                stack.push(p.st!);
            }

            p = p.parent;
        }

        return stack;
    }

    public static getScopeStack(scope: InstanceScope, topDown: boolean): InstanceScope[] {
        const stack: InstanceScope[] = [];
        let p: InstanceScope | undefined = scope;
        while (p) {
            if (topDown) {
                stack.unshift(p);
            } else {
                stack.push(p);
            }

            p = p.parent;
        }

        return stack;
    }

    public static getEvalTemplateEventStack(scope: InstanceScope, topDown: boolean): EvalTemplateEvent[] {
        const stack: EvalTemplateEvent[] = [];
        let p: InstanceScope | undefined = scope;
        while (p) {
            const evalEvent = p.events[p.events.length - 1] as EvalTemplateEvent;
            if (topDown) {
                stack.unshift(evalEvent);
            } else {
                stack.push(evalEvent);
            }

            p = p.parent;
        }

        return stack;
    }

    public static getShort(memory: Int8Array, index: number): number {
        const b1 = memory[index] & 0xFF; // mask off sign-extended bits
        const b2 = memory[index + 1] & 0xFF;

        return (b1 << 8) | b2;
    }

    /**
     * Execute template {@code self} and return how many characters it wrote to {@code out}.
     *
     * @returns the number of characters written to {@code out}
     */
    public exec(out: STWriter, scope: InstanceScope): number {
        const self = scope.st;
        if (Interpreter.trace && self) {
            console.log("exec(" + self.getName() + ")");
        }

        try {
            this.setDefaultArguments(out, scope);

            return this._exec(out, scope);
        } catch (e) {
            if (e instanceof Error) {
                this.errMgr.runTimeError(this, scope, ErrorType.INTERNAL_ERROR, "internal error: " + e.stack);

                return 0;
            } else {
                throw e;
            }
        }
    }

    /**
     * Return the first attribute if multi-valued, or the attribute itself if single-valued.
     * <p>
     * This method is used for rendering expressions of the form
     * {@code <names:first()>}.</p>
     */
    public first(scope: InstanceScope, v: unknown): unknown {
        if (!v) {
            return null;
        }

        v = this.convertAnythingIteratableToIterator(scope, v);
        if (isIterator(v)) {
            const [r] = v;

            return r;
        }

        return v;
    }

    /**
     * Return the last attribute if multi-valued, or the attribute itself if
     * single-valued. Unless it's a `List` or array, this is pretty slow
     * as it iterates until the last element.
     * <p>
     * This method is used for rendering expressions of the form
     * {@code <names:last()>}.</p>
     */
    public last(scope: InstanceScope, v: unknown): unknown {
        if (v == null) {
            return v;
        }

        if (Array.isArray(v)) {
            return v[v.length - 1];
        }

        v = this.convertAnythingIteratableToIterator(scope, v);
        if (!isIterator(v)) {
            return v;
        }

        // Return the last value from the iterator.
        let r;
        for (const e of v) {
            r = e;
        }

        return r;
    }

    /**
     * Return everything but the first attribute if multi-valued, or
     * {@code null} if single-valued.
     */
    public rest(scope: InstanceScope, v: unknown): unknown {
        if (v == null) {
            return v;
        }

        if (Array.isArray(v)) {
            if (v.length <= 1) {
                return undefined;
            }

            return v.slice(1);
        }

        v = this.convertAnythingIteratableToIterator(scope, v);
        if (!isIterator(v)) {
            return v;
        }

        const a = new Array<unknown>();
        const [first] = v;
        if (first == null) {
            // if not even one value return null
            return undefined;
        }

        for (const o of v) {
            a.push(o);
        }

        return a;
    }

    /**
     * Return all but the last element. <code>trunc(<i>x</i>)==null</code> if <code><i>x</i></code> is single-valued.
     */
    public trunc(scope: InstanceScope, v: unknown): unknown {
        if (v == null) {
            return v;
        }

        let a;
        if (!Array.isArray(v)) {
            v = this.convertAnythingIteratableToIterator(scope, v);
            if (!isIterator(v)) {
                return v;
            }

            a = Array.from(v);
        } else {
            a = v;
        }

        if (a.length <= 1) {
            return undefined;
        }

        return a.slice(0, a.length - 1);
    }

    /**
     * Return a new list without {@code null} values.
     */
    public strip(scope: InstanceScope, v: unknown): unknown {
        if (v == null) {
            return v;
        }

        v = this.convertAnythingIteratableToIterator(scope, v);
        if (!isIterator(v)) {
            return v; // strip(x)==x when x single-valued attribute
        }

        const a = Array.from(v);

        return a.filter((e) => {
            return e != null;
        });
    }

    /**
     * Return a list with the same elements as {@code v} but in reverse order.
     * <p>
     * Note that {@code null} values are <i>not</i> stripped out; use
     * {@code reverse(strip(v))} to do that.</p>
     */
    public reverse(scope: InstanceScope, v: unknown): unknown {
        if (v == null) {
            return v;
        }

        if (Array.isArray(v)) {
            return v.reverse();
        }

        v = this.convertAnythingIteratableToIterator(scope, v);
        if (!isIterator(v)) {
            return v; // reverse(x)==x when x single-valued attribute
        }

        return Array.from(v).reverse();
    }

    /**
     * Return the length of a multi-valued attribute or 1 if it is a single
     * attribute. If {@code v} is {@code null} return 0.
     * <p>
     * The implementation treats several common collections and arrays as
     * special cases for speed.</p>
     */
    public length(v: unknown): number {
        if (v == null) {
            return 0;
        }

        if (v instanceof Map) {
            return v.size;
        } else {
            let a;
            if (!Array.isArray(v)) {
                v = this.convertAnythingIteratableToIterator(null, v);
                if (!isIterator(v)) {
                    return 1; // length(x)==1 when x single-valued attribute
                }

                a = Array.from(v);
            } else {
                a = v;
            }

            return a.length;
        }

    }

    public convertAnythingIteratableToIterator(_scope: InstanceScope | null, o: unknown): unknown {
        if (o == null) {
            return o;
        }

        if (typeof o !== "object") {
            return o;
        }

        // Is the object itself iterable?
        if (Symbol.iterator in o) {
            return (o as IterableIterator<unknown>)[Symbol.iterator]();
        }

        // Does the object implement the Iterator interface?
        if (isIterator(o)) {
            // Note: we ignore scope.st.groupThatCreatedThisInstance.iterateAcrossValues here.
            const iterableIterator = {
                [Symbol.iterator]() {
                    return this;
                },
                next: () => {
                    return (o).next();
                },
            };

            return iterableIterator;
        }

        return o;
    }

    public convertAnythingToIterator(scope: InstanceScope, o: unknown): Iterator<unknown> {
        o = this.convertAnythingIteratableToIterator(scope, o);
        if (isIterator(o)) {
            return o;
        }

        const singleton = new ST.AttributeList(1);
        singleton.push(o);

        return singleton[Symbol.iterator]();
    }

    /**
     * Find an attribute via dynamic scoping up enclosing scope chain. Only look
     * for a dictionary definition if the attribute is not found, so attributes
     * sent in to a template override dictionary names.
     * <p>
     * Return {@link ST#EMPTY_ATTR} if found definition but no value.</p>
     */
    public getAttribute(scope: InstanceScope, name: string): unknown {
        let current: InstanceScope | undefined = scope;
        while (current) {
            const p = current.st;
            let localArg;
            if (p?.impl?.formalArguments) {
                localArg = p.impl.formalArguments.get(name);
            }

            if (localArg) {
                return p?.locals?.[localArg.index];
            }
            current = current.parent; // look up enclosing scope chain
        }

        // got to root scope and no definition, try dictionaries in group and up
        const self = scope.st;
        const g = self?.impl?.nativeGroup;
        if (g) {
            const o = this.getDictionary(g, name);
            if (o) {
                return o;
            }
        }

        // not found, report unknown attr
        throw new STNoSuchAttributeException(name, scope);
    }

    public getDictionary(g: ISTGroup, name: string): unknown {
        if (g.isDictionary(name)) {
            return g.rawGetDictionary(name);
        }

        for (const sup of g.imports) {
            const o = this.getDictionary(sup, name);
            if (o !== null) {
                return o;
            }

        }

        return undefined;
    }

    /**
     * Set any default argument values that were not set by the invoking
     * template or by {@link ST#add} directly. Note that the default values may
     * be templates.
     * <p>
     * The evaluation context is the {@code invokedST} template itself so
     * template default arguments can see other arguments.</p>
     * @param out
     * @param scope
     */
    public setDefaultArguments(out: STWriter, scope: InstanceScope): void {
        const invokedST = scope.st;
        if (!invokedST?.locals || !invokedST?.impl?.formalArguments
            || invokedST.impl.numberOfArgsWithDefaultValues === 0) {
            return;
        }

        for (const arg of invokedST.impl.formalArguments.values()) {
            // if no value for attribute and default arg, inject default arg into self
            if (invokedST.locals[arg.index] !== ST.EMPTY_ATTR || arg.defaultValueToken === null) {
                continue;
            }

            if (arg.defaultValueToken?.type === GroupParser.ANONYMOUS_TEMPLATE) {
                let code = arg.compiledDefaultValue;
                if (!code) {
                    code = new CompiledST();
                }

                const defaultArgST = this.group.createStringTemplateInternally(code);
                defaultArgST.groupThatCreatedThisInstance = this.group;

                // If default arg is template with single expression
                // wrapped in parens, x={<(...)>}, then eval to string
                // rather than setting x to the template for later
                // eval.
                const defArgTemplate = arg.defaultValueToken.text;
                if (defArgTemplate?.startsWith("{" + this.group.delimiterStartChar + "(") &&
                    defArgTemplate.endsWith(")" + this.group.delimiterStopChar + "}")) {

                    invokedST.rawSetAttribute(arg.name, this.toString(out, new InstanceScope(scope, invokedST),
                        defaultArgST));
                } else {
                    invokedST.rawSetAttribute(arg.name, defaultArgST);
                }
            } else {
                invokedST.rawSetAttribute(arg.name, arg.defaultValue);
            }
        }
    }

    public getEvents(): InterpEvent[] {
        return this.events;
    }

    public getExecutionTrace(): string[] {
        return this.executeTrace;
    }

    protected _exec(out: STWriter, scope: InstanceScope): number {
        const start = out.index(); // track char we're about to write
        const self = scope.st;
        const code = self?.impl?.instructions;        // which code block are we executing
        let n = 0; // how many char we write out

        if (self?.impl && self.locals && code) {
            let prevOpcode = 0;
            let argsCount: number;
            let nameIndex: number;
            let addr: number;
            let name: string;
            let left: unknown;
            let right: unknown;
            let st: IST;
            let options: unknown[];
            let ip = 0;

            let o: unknown;

            while (ip < self.impl.codeSize) {
                if (Interpreter.trace || this.debug) {
                    this.writeTrace(scope, ip);
                }

                const opcode = code[ip];

                scope.ip = ip;
                ip++; //jump to next instruction or first byte of operand
                switch (opcode) {
                    case Bytecode.INSTR_LOAD_STR: {
                        // just testing...
                        this.loadStr(self, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;

                        break;
                    }

                    case Bytecode.INSTR_LOAD_ATTR: {
                        nameIndex = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        name = self.impl.strings[nameIndex];
                        try {
                            o = this.getAttribute(scope, name);
                            if (o === ST.EMPTY_ATTR) {
                                o = undefined;
                            }
                        } catch (e) {
                            if (e instanceof STNoSuchAttributeException) {
                                this.errMgr.runTimeError(this, scope, ErrorType.NO_SUCH_ATTRIBUTE, name);
                                o = undefined;
                            } else {
                                throw e;
                            }
                        }

                        this.operands[++this.sp] = o;

                        break;
                    }

                    case Bytecode.INSTR_LOAD_LOCAL: {
                        const valueIndex = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        o = self.locals[valueIndex];
                        if (o === ST.EMPTY_ATTR) {
                            o = undefined;
                        }

                        this.operands[++this.sp] = o;

                        break;
                    }

                    case Bytecode.INSTR_LOAD_PROP: {
                        nameIndex = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        o = this.operands[this.sp--];
                        name = self.impl.strings[nameIndex];
                        this.operands[++this.sp] = this.getObjectProperty(out, scope, o, name);

                        break;
                    }

                    case Bytecode.INSTR_LOAD_PROP_IND: {
                        const propName = this.operands[this.sp--];
                        o = this.operands[this.sp];
                        this.operands[this.sp] = this.getObjectProperty(out, scope, o, propName);

                        break;
                    }

                    case Bytecode.INSTR_NEW: {
                        nameIndex = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        name = self.impl.strings[nameIndex];
                        argsCount = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;

                        // look up in original hierarchy not enclosing template (variable group)
                        // see TestSubtemplates.testEvalSTFromAnotherGroup()
                        st = self.groupThatCreatedThisInstance.getEmbeddedInstanceOf(this, scope, name);

                        // get n args and store into st's attr list
                        this.storeArgs(scope, argsCount, st);
                        this.sp -= argsCount;
                        this.operands[++this.sp] = st;

                        break;
                    }

                    case Bytecode.INSTR_NEW_IND: {
                        argsCount = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        name = String(this.operands[this.sp - argsCount]);
                        st = self.groupThatCreatedThisInstance.getEmbeddedInstanceOf(this, scope, name);
                        this.storeArgs(scope, argsCount, st);
                        this.sp -= argsCount;
                        this.sp--; // pop template name
                        this.operands[++this.sp] = st;

                        break;
                    }

                    case Bytecode.INSTR_NEW_BOX_ARGS: {
                        nameIndex = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        name = self.impl.strings[nameIndex];
                        const attrs = this.operands[this.sp--] as Map<string, Object>;

                        // look up in original hierarchy not enclosing template (variable group)
                        // see TestSubtemplates.testEvalSTFromAnotherGroup()
                        st = self.groupThatCreatedThisInstance.getEmbeddedInstanceOf(this, scope, name);

                        // get n args and store into st's attr list
                        this.storeArgs(scope, attrs, st);
                        this.operands[++this.sp] = st;

                        break;
                    }

                    case Bytecode.INSTR_SUPER_NEW: {
                        nameIndex = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        name = self.impl.strings[nameIndex];
                        argsCount = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        this.superNew(scope, name, argsCount);

                        break;
                    }

                    case Bytecode.INSTR_SUPER_NEW_BOX_ARGS: {
                        nameIndex = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        name = self.impl.strings[nameIndex];
                        const attrs = this.operands[this.sp--] as Map<string, Object>;
                        this.superNew(scope, name, attrs);

                        break;
                    }

                    case Bytecode.INSTR_STORE_OPTION: {
                        const optionIndex = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        o = this.operands[this.sp--];    // value to store
                        options = this.operands[this.sp] as Object[]; // get options
                        options[optionIndex] = o; // store value into options on stack

                        break;
                    }

                    case Bytecode.INSTR_STORE_ARG: {
                        nameIndex = Interpreter.getShort(code, ip);
                        name = self.impl.strings[nameIndex];
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        o = this.operands[this.sp--];
                        const attrs = this.operands[this.sp] as Map<string, unknown>;
                        attrs.set(name, o); // leave attrs on stack

                        break;
                    }

                    case Bytecode.INSTR_WRITE: {
                        o = this.operands[this.sp--];
                        const n1 = this.writeObjectNoOptions(out, scope, o);
                        n += n1;
                        this.charsWrittenOnLine += n1;

                        break;
                    }

                    case Bytecode.INSTR_WRITE_OPT: {
                        options = this.operands[this.sp--] as Object[]; // get options
                        o = this.operands[this.sp--];                 // get option to write
                        const n2 = this.writeObjectWithOptions(out, scope, o, options);
                        n += n2;
                        this.charsWrittenOnLine += n2;

                        break;
                    }

                    case Bytecode.INSTR_MAP: {
                        st = this.operands[this.sp--] as ST; // get prototype off stack
                        o = this.operands[this.sp--];      // get object to map prototype across
                        this.map(scope, o, st);

                        break;
                    }

                    case Bytecode.INSTR_ROT_MAP: {
                        const mapCount = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        const templates = new Array<ST>();
                        for (let i = mapCount - 1; i >= 0; i--) {
                            templates.push(this.operands[this.sp - i] as ST);
                        }

                        this.sp -= mapCount;
                        o = this.operands[this.sp--];
                        if (o !== null) {
                            this.rotMap(scope, o, templates);
                        }

                        break;
                    }

                    case Bytecode.INSTR_ZIP_MAP: {
                        st = this.operands[this.sp--] as ST;
                        const mapCount = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        const exprs = new Array<unknown>();
                        for (let i = mapCount - 1; i >= 0; i--) {
                            exprs.push(this.operands[this.sp - i]);
                        }

                        this.sp -= mapCount;
                        this.operands[++this.sp] = this.zipMap(scope, exprs, st);

                        break;
                    }

                    case Bytecode.INSTR_BR: {
                        ip = Interpreter.getShort(code, ip);

                        break;
                    }

                    case Bytecode.INSTR_BRF: {
                        addr = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        o = this.operands[this.sp--]; // <if(expr)>...<endif>
                        if (!this.testAttributeTrue(o)) {
                            ip = addr;
                        }

                        break;
                    }

                    case Bytecode.INSTR_OPTIONS: {
                        const options = new Array<unknown>(Interpreter.supportedOptions.size);
                        options.fill(null);
                        this.operands[++this.sp] = options;

                        break;
                    }

                    case Bytecode.INSTR_ARGS: {
                        this.operands[++this.sp] = new Map<string, unknown>();

                        break;
                    }

                    case Bytecode.INSTR_PASSTHRU: {
                        nameIndex = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        name = self.impl.strings[nameIndex];
                        const attrs = this.operands[this.sp] as Map<string, unknown>;
                        this.passthru(scope, name, attrs);

                        break;
                    }

                    case Bytecode.INSTR_LIST: {
                        this.operands[++this.sp] = [];

                        break;
                    }

                    case Bytecode.INSTR_ADD: {
                        o = this.operands[this.sp--];             // pop value
                        const list = this.operands[this.sp] as unknown[]; // don't pop list
                        this.addToList(scope, list, o);

                        break;
                    }

                    case Bytecode.INSTR_TOSTR: {
                        // replace with string value; early eval
                        this.operands[this.sp] = this.toString(out, scope, this.operands[this.sp]);

                        break;
                    }

                    case Bytecode.INSTR_FIRST: {
                        this.operands[this.sp] = this.first(scope, this.operands[this.sp]);

                        break;
                    }

                    case Bytecode.INSTR_LAST: {
                        this.operands[this.sp] = this.last(scope, this.operands[this.sp]);

                        break;
                    }

                    case Bytecode.INSTR_REST: {
                        this.operands[this.sp] = this.rest(scope, this.operands[this.sp]);

                        break;
                    }

                    case Bytecode.INSTR_TRUNC: {
                        this.operands[this.sp] = this.trunc(scope, this.operands[this.sp]);

                        break;
                    }

                    case Bytecode.INSTR_STRIP: {
                        this.operands[this.sp] = this.strip(scope, this.operands[this.sp]);

                        break;
                    }

                    case Bytecode.INSTR_TRIM: {
                        o = this.operands[this.sp--];
                        if (typeof o === "string") {
                            this.operands[++this.sp] = o.trim();
                        } else {
                            this.errMgr.runTimeError(this, scope, ErrorType.EXPECTING_STRING, "trim", String(o));
                            this.operands[++this.sp] = o;
                        }

                        break;
                    }

                    case Bytecode.INSTR_LENGTH: {
                        this.operands[this.sp] = this.length(this.operands[this.sp]);

                        break;
                    }

                    case Bytecode.INSTR_STRLEN: {
                        o = this.operands[this.sp--];
                        if (typeof o === "string") {
                            this.operands[++this.sp] = o.length;
                        } else {
                            this.errMgr.runTimeError(this, scope, ErrorType.EXPECTING_STRING, "strlen", String(o));
                            this.operands[++this.sp] = 0;
                        }

                        break;
                    }

                    case Bytecode.INSTR_REVERSE: {
                        this.operands[this.sp] = this.reverse(scope, this.operands[this.sp]);

                        break;
                    }

                    case Bytecode.INSTR_NOT: {
                        this.operands[this.sp] = !this.testAttributeTrue(this.operands[this.sp]);

                        break;
                    }

                    case Bytecode.INSTR_OR: {
                        right = this.operands[this.sp--];
                        left = this.operands[this.sp--];
                        this.operands[++this.sp] = this.testAttributeTrue(left) || this.testAttributeTrue(right);

                        break;
                    }

                    case Bytecode.INSTR_AND: {
                        right = this.operands[this.sp--];
                        left = this.operands[this.sp--];
                        this.operands[++this.sp] = this.testAttributeTrue(left) && this.testAttributeTrue(right);

                        break;
                    }

                    case Bytecode.INSTR_INDENT: {
                        const strIndex = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        this.indent(out, scope, strIndex);

                        break;
                    }

                    case Bytecode.INSTR_DEDENT: {
                        out.popIndentation();
                        break;
                    }

                    case Bytecode.INSTR_NEWLINE: {
                        try {
                            if ((prevOpcode === 0 && !self.isAnonSubtemplate() && !self.impl.isRegion) ||
                                prevOpcode === Bytecode.INSTR_NEWLINE ||
                                prevOpcode === Bytecode.INSTR_INDENT ||
                                this.charsWrittenOnLine > 0) {
                                out.write(Misc.newLine);
                            }
                            this.charsWrittenOnLine = 0;
                        } catch (ioe) {
                            if (ioe instanceof Error) {
                                this.errMgr.iOError(self, ErrorType.WRITE_IO_ERROR, ioe);
                            } else {
                                throw ioe;
                            }
                        }
                        break;
                    }

                    case Bytecode.INSTR_NOOP: {
                        break;
                    }

                    case Bytecode.INSTR_POP: {
                        this.sp--; // throw away top of stack
                        break;
                    }

                    case Bytecode.INSTR_NULL: {
                        this.operands[++this.sp] = null;
                        break;
                    }

                    case Bytecode.INSTR_TRUE: {
                        this.operands[++this.sp] = true;
                        break;
                    }

                    case Bytecode.INSTR_FALSE: {
                        this.operands[++this.sp] = false;
                        break;
                    }

                    case Bytecode.INSTR_WRITE_STR: {
                        const strIndex = Interpreter.getShort(code, ip);
                        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                        o = self.impl.strings[strIndex];
                        const n1 = this.writeObjectNoOptions(out, scope, o);
                        n += n1;
                        this.charsWrittenOnLine += n1;
                        break;
                    }

                    default: {
                        this.errMgr.internalError(self, "invalid bytecode @ " + (ip - 1) + ": " + opcode);
                        self.impl.dump();
                    }

                }
                prevOpcode = opcode;
            }
        }

        if (this.debug) {
            const stop = out.index() - 1;
            const e = new EvalTemplateEvent(scope, start, stop);
            this.trackDebugEvent(scope, e);
        }

        return n;
    }

    protected loadStr(self: ST, ip: number): void {
        const strIndex = Interpreter.getShort(self.impl!.instructions, ip);
        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
        this.operands[++this.sp] = self.impl!.strings[strIndex];
    };

    protected superNew(scope: InstanceScope, name: string, argCountOrAttributes: number | Map<string, unknown>): void {
        if (typeof argCountOrAttributes === "number") {
            const self = scope.st;
            let st;
            const imported = self?.impl?.nativeGroup.lookupImportedTemplate(name);
            if (!imported) {
                this.errMgr.runTimeError(this, scope, ErrorType.NO_IMPORTED_TEMPLATE, name);
                st = self?.groupThatCreatedThisInstance.createStringTemplateInternally(new CompiledST());
            } else {
                st = imported.nativeGroup.getEmbeddedInstanceOf(this, scope, name);
                st.groupThatCreatedThisInstance = this.group;
            }

            // get n args and store into st's attr list
            this.storeArgs(scope, argCountOrAttributes, st);
            this.sp -= argCountOrAttributes;
            this.operands[++this.sp] = st;
        } else {
            const self = scope.st;
            let st;
            const imported = self?.impl?.nativeGroup.lookupImportedTemplate(name);
            if (!imported) {
                this.errMgr.runTimeError(this, scope, ErrorType.NO_IMPORTED_TEMPLATE, name);
                st = self?.groupThatCreatedThisInstance.createStringTemplateInternally(new CompiledST());
            } else {
                st = imported.nativeGroup.createStringTemplateInternally(imported);
                st.groupThatCreatedThisInstance = this.group;
            }

            // get n args and store into st's attr list
            this.storeArgs(scope, argCountOrAttributes, st);
            this.operands[++this.sp] = st;
        }
    }

    protected passthru(scope: InstanceScope, templateName: string, attrs: Map<string, unknown>): void {
        const c = this.group.lookupTemplate(templateName);
        if (!c) {
            return;
        }

        // will get error later
        if (!c.formalArguments) {
            return;
        }

        for (const arg of c.formalArguments.values()) {
            // if not already set by user, set to value from outer scope
            if (!attrs.has(arg.name)) {
                try {
                    const o = this.getAttribute(scope, arg.name);

                    // If the attribute exists but there is no value and
                    // the formal argument has no default value, make it null.
                    if (o === ST.EMPTY_ATTR && !arg.defaultValueToken) {
                        attrs.set(arg.name, undefined);
                    } else {
                        // Else, the attribute has an existing value, set arg.
                        if (o !== ST.EMPTY_ATTR) {
                            attrs.set(arg.name, o);
                        }
                    }
                } catch (e) {
                    if (e instanceof STNoSuchAttributeException) {
                        // if no such attribute exists for arg.name, set parameter
                        // if no default value
                        if (!arg.defaultValueToken) {
                            this.errMgr.runTimeError(this, scope, ErrorType.NO_SUCH_ATTRIBUTE_PASS_THROUGH, arg.name);
                            attrs.set(arg.name, undefined);
                        }
                    } else {
                        throw e;
                    }
                }
            }
        }
    }

    protected storeArgs(scope: IInstanceScope, attrs: Map<string, unknown>, st?: IST): void;
    protected storeArgs(scope: IInstanceScope, argCount: number, st?: IST): void;
    protected storeArgs(...args: unknown[]): void {
        if (args[1] instanceof Map) {
            const [scope, attrs, st] = args as [IInstanceScope, Map<string, unknown>, IST | undefined];

            let noSuchAttributeReported = false;
            if (attrs && st) {
                for (const [key, value] of attrs.entries()) {
                    if (!st.impl?.hasFormalArgs) {
                        if (!st.impl?.formalArguments || !st.impl?.formalArguments.has(key)) {
                            try {
                                // we clone the CompiledST to prevent modifying the original
                                // formalArguments map during interpretation.
                                st.impl = st.impl!.clone();
                                st.add(key, value);
                            } catch (ex) {
                                if (ex instanceof Error) {
                                    noSuchAttributeReported = true;
                                    this.errMgr.runTimeError(this, scope, ErrorType.NO_SUCH_ATTRIBUTE, key);
                                } else {
                                    throw ex;
                                }
                            }
                        } else {
                            st.rawSetAttribute(key, value);
                        }
                    } else {
                        // don't let it throw an exception in rawSetAttribute
                        if (!st.impl.formalArguments || !st.impl.formalArguments.has(key)) {
                            noSuchAttributeReported = true;
                            this.errMgr.runTimeError(this, scope, ErrorType.NO_SUCH_ATTRIBUTE, key);
                            continue;
                        }

                        st.rawSetAttribute(key, value);
                    }
                }
            }

            if (st?.impl?.hasFormalArgs) {
                let argumentCountMismatch = false;
                let formalArguments = st.impl.formalArguments;
                if (!formalArguments) {
                    formalArguments = new Map();
                }

                // first make sure that all non-default arguments are specified
                // ignore this check if a NO_SUCH_ATTRIBUTE error already occurred
                if (!noSuchAttributeReported) {
                    for (const [argumentKey, argumentValue] of formalArguments.entries()) {
                        if (argumentValue.defaultValueToken || argumentValue.defaultValue) {
                            // this argument has a default value, so it doesn't need to appear in attrs
                            continue;
                        }

                        if (!attrs || !attrs.has(argumentKey)) {
                            argumentCountMismatch = true;
                            break;
                        }
                    }
                }

                // next make sure there aren't too many arguments. note that the names
                // of arguments are checked below as they are applied to the template
                // instance, so there's no need to do that here.
                if (attrs.size > formalArguments.size) {
                    argumentCountMismatch = true;
                }

                if (argumentCountMismatch) {
                    const argCount = attrs?.size ?? 0;
                    const formalArgCount = formalArguments.size;
                    this.errMgr.runTimeError(this, scope, ErrorType.ARGUMENT_COUNT_MISMATCH, argCount,
                        st.impl.name, formalArgCount);
                }
            }
        } else {
            const [scope, argCount, st] = args as [IInstanceScope, number, ST | undefined];

            if (argCount > 0 && !st?.impl?.hasFormalArgs && !st?.impl?.formalArguments) {
                st?.add(ST.IMPLICIT_ARG_NAME, null); // pretend we have "it" arg
            }

            let formalArgCount = 0;
            if (st?.impl?.formalArguments) {
                formalArgCount = st.impl.formalArguments.size;
            }

            const firstArg = this.sp - (argCount - 1);
            const numToStore = Math.min(argCount, formalArgCount);
            if (st?.impl?.isAnonSubtemplate) {
                formalArgCount -= Interpreter.predefinedAnonSubtemplateAttributes.size;
            }

            if (argCount < (formalArgCount - (st?.impl?.numberOfArgsWithDefaultValues ?? 0)) ||
                argCount > formalArgCount) {
                this.errMgr.runTimeError(this, scope, ErrorType.ARGUMENT_COUNT_MISMATCH, argCount, st?.impl?.name,
                    formalArgCount);
            }

            if (!st?.impl?.formalArguments) {
                return;
            }

            const argNames = st.impl.formalArguments.keys();
            for (let i = 0; i < numToStore; i++) {
                const o = this.operands[firstArg + i]; // value to store
                const argName = argNames.next().value as string;
                st.rawSetAttribute(argName, o);
            }
        }
    }

    protected indent(out: STWriter, scope: InstanceScope, strIndex: number): void {
        const indent = scope.st?.impl?.strings[strIndex] ?? "";
        if (this.debug) {
            const start = out.index(); // track char we're about to write
            const e = new IndentEvent(scope, start, start + indent.length - 1, this.getExprStartChar(scope),
                this.getExprStopChar(scope));
            this.trackDebugEvent(scope, e);
        }
        out.pushIndentation(indent);
    }

    /**
     * Write out an expression result that doesn't use expression options.
     *  E.g., {@code <name>}
     */
    protected writeObjectNoOptions(out: STWriter, scope: InstanceScope, o: unknown): number {
        const start = out.index(); // track char we're about to write
        const n = this.writeObject(out, scope, o);
        if (this.debug) {
            const e = new EvalExprEvent(scope, start, out.index() - 1, this.getExprStartChar(scope),
                this.getExprStopChar(scope));
            this.trackDebugEvent(scope, e);
        }

        return n;
    }

    /**
     * Write out an expression result that uses expression options.
     *  E.g., {@code <names; separator=", ">}
     */
    protected writeObjectWithOptions(out: STWriter, scope: InstanceScope, o: unknown,
        options: unknown[]): number {
        const start = out.index(); // track char we're about to write

        // pre compute all option values (render all the way to strings)
        let optionStrings;
        if (options) {
            optionStrings = new Array<string>(options.length);
            for (let i = 0; i < Interpreter.supportedOptions.size; i++) {
                optionStrings[i] = this.toString(out, scope, options[i]);
            }
        }

        if (options && options[InterpreterOption.ANCHOR]) {
            out.pushAnchorPoint();
        }

        const n = this.writeObject(out, scope, o, optionStrings);

        if (options !== null && options[InterpreterOption.ANCHOR]) {
            out.popAnchorPoint();
        }

        if (this.debug) {
            const e = new EvalExprEvent(scope, start, out.index() - 1, this.getExprStartChar(scope),
                this.getExprStopChar(scope));
            this.trackDebugEvent(scope, e);
        }

        return n;
    }

    /**
     * Generic method to emit text for an object. It differentiates
     *  between templates, iterable objects, and plain old Java objects (POJOs)
     */
    protected writeObject(out: STWriter, scope: InstanceScope, o: unknown, options?: string[]): number {
        let n = 0;
        if (o == null) {
            if (options && options[InterpreterOption.NULL]) {
                o = options[InterpreterOption.NULL];
            } else {
                return 0;
            }

        }

        if (o instanceof ST) {
            scope = new InstanceScope(scope, o);
            if (options && options[InterpreterOption.WRAP]) {
                // if we have a wrap string, then inform writer it
                // might need to wrap
                try {
                    out.writeWrap(options[InterpreterOption.WRAP]);
                } catch (ioe) {
                    if (ioe instanceof Error) {
                        this.errMgr.iOError(scope.st, ErrorType.WRITE_IO_ERROR, ioe);
                    } else {
                        throw ioe;
                    }
                }
            }
            n = this.exec(out, scope);
        } else {
            o = this.convertAnythingIteratableToIterator(scope, o); // normalize
            try {
                if (isIterator(o)) {
                    n = this.writeIterator(out, scope, o, options);
                } else {
                    n = this.writePOJO(out, scope, o, options);
                }
            } catch (ioe) {
                if (ioe instanceof Error) {
                    this.errMgr.iOError(scope.st, ErrorType.WRITE_IO_ERROR, ioe, o);
                } else {
                    throw ioe;
                }
            }
        }

        return n;
    }

    protected writeIterator(out: STWriter, scope: InstanceScope, it?: Iterator<unknown>, options?: string[]): number {
        if (!it) {
            return 0;
        }

        let n = 0;
        let separator;
        if (options) {
            separator = options[InterpreterOption.SEPARATOR];
        }

        let seenAValue = false;
        while (true) {
            const iterValue = it.next();
            if (iterValue.done) {
                break;
            }

            // Emit separator if we're beyond first value
            const needSeparator = seenAValue &&
                separator &&            // we have a separator and
                (iterValue ||           // either we have a value
                    options![InterpreterOption.NULL]); // or no value but null option
            if (needSeparator) {
                n += out.writeSeparator(separator ?? "");
            }

            const nw = this.writeObject(out, scope, iterValue.value, options);
            if (nw > 0) {
                seenAValue = true;
            }

            n += nw;
        }

        return n;
    }

    protected writePOJO(out: STWriter, scope: InstanceScope, o: unknown, options?: string[]): number {
        let formatString = "";
        if (options) {
            formatString = options[InterpreterOption.FORMAT];
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const v = this.renderObject(scope, formatString, o, constructorFromUnknown(o)!);
        let n: number;
        if (options && options[InterpreterOption.WRAP]) {
            n = out.write(v, options[InterpreterOption.WRAP]);
        } else {
            n = out.write(v);
        }

        return n;
    }

    protected getExprStartChar(scope: InstanceScope): number {
        const templateLocation = scope.st?.impl?.sourceMap[scope.ip];
        if (templateLocation) {
            return templateLocation.start;
        }

        return -1;
    }

    protected getExprStopChar(scope: InstanceScope): number {
        const templateLocation = scope.st?.impl?.sourceMap[scope.ip];
        if (templateLocation) {
            return templateLocation.stop;
        }

        return -1;
    }

    protected map(scope: InstanceScope, attr: unknown, st: IST): void {
        this.rotMap(scope, attr, [st]);
    };

    /**
     * Renders expressions of the form {@code <names:a()>} or
     * {@code <names:a(),b()>}.
     * @param scope
     * @param attr
     * @param prototypes
     */
    protected rotMap(scope: InstanceScope, attr: unknown, prototypes: IST[]): void {
        if (!attr) {
            this.operands[++this.sp] = undefined;

            return;
        }

        attr = this.convertAnythingIteratableToIterator(scope, attr);
        if (isIterator(attr)) {
            const mapped = this.rotateMapIterator(scope, attr, prototypes);
            this.operands[++this.sp] = mapped;
        } else { // if only single value, just apply first template to sole value
            const proto = prototypes[0];
            const st = this.group.createStringTemplateInternally(proto);
            if (st) {
                this.setFirstArgument(scope, st, attr);
                if (st.impl?.isAnonSubtemplate) {
                    st.rawSetAttribute("i0", 0);
                    st.rawSetAttribute("i", 1);
                }
                this.operands[++this.sp] = st;
            } else {
                this.operands[++this.sp] = null;
            }
        }
    }

    protected rotateMapIterator(scope: InstanceScope, attr: Iterator<unknown>,
        prototypes: IST[]): Array<IST | undefined> {
        const mapped = new Array<IST | undefined>();
        const iter = attr;
        let i0 = 0;
        let i = 1;
        let ti = 0;

        while (true) {
            const iterValue = iter.next();
            if (iterValue.done) {
                break;
            }

            if (!iterValue) {
                mapped.push(undefined);
                continue;
            }

            const templateIndex = ti % prototypes.length; // rotate through
            ti++;
            const proto = prototypes[templateIndex];
            const st = this.group.createStringTemplateInternally(proto);
            this.setFirstArgument(scope, st, iterValue.value);
            if (st.impl?.isAnonSubtemplate) {
                st.rawSetAttribute("i0", i0);
                st.rawSetAttribute("i", i);
            }
            mapped.push(st);
            i0++;
            i++;
        }

        return mapped;
    }

    /**
     * Renders expressions of the form {@code <names,phones:{n,p | ...}>} or
     * {@code <a,b:t()>}.
     * @param scope
     * @param exprs
     * @param prototype
     */
    // todo: i, i0 not set unless mentioned? map:{k,v | ..}?
    protected zipMap(scope: InstanceScope, exprs: unknown[], prototype: IST): ST.AttributeList | undefined {
        if (!exprs || !prototype || exprs.length === 0) {
            return undefined; // do not apply if missing templates or empty values
        }

        // make everything iterable
        for (let i = 0; i < exprs.length; i++) {
            const attr = exprs[i];
            if (attr !== null) {
                exprs[i] = this.convertAnythingToIterator(scope, attr);
            }
        }

        // ensure arguments line up
        let numExprs = exprs.length;
        const code = prototype.impl;
        const formalArguments = code?.formalArguments;
        if (!code?.hasFormalArgs || !formalArguments) {
            this.errMgr.runTimeError(this, scope, ErrorType.MISSING_FORMAL_ARGUMENTS);

            return undefined;
        }

        // todo: track formal args not names for efficient filling of locals
        let formalArgumentNames = [...formalArguments.keys()];
        let formalArgCount = formalArgumentNames.length;
        if (prototype.isAnonSubtemplate()) {
            formalArgCount -= Interpreter.predefinedAnonSubtemplateAttributes.size;
        }

        if (formalArgCount !== numExprs) {
            this.errMgr.runTimeError(this, scope, ErrorType.MAP_ARGUMENT_COUNT_MISMATCH, numExprs, formalArgCount);

            // TODO just fill first n
            // truncate arg list to match smaller size
            const shorterSize = Math.min(formalArgumentNames.length, numExprs);
            numExprs = shorterSize;
            formalArgumentNames = formalArgumentNames.slice(0, shorterSize);
        }

        // keep walking while at least one attribute has values

        const results = new ST.AttributeList();
        let i = 0; // iteration number from 0
        while (true) {
            // get a value for each attribute in list; put into ST instance
            let numEmpty = 0;
            const embedded = this.group.createStringTemplateInternally(prototype);
            embedded.rawSetAttribute("i0", i);
            embedded.rawSetAttribute("i", i + 1);
            for (let a = 0; a < numExprs; a++) {
                const it = exprs[a] as Iterator<unknown>;
                if (it) {
                    const iteratedValue = [it];
                    if (iteratedValue) {
                        const argName = formalArgumentNames[a];
                        embedded.rawSetAttribute(argName, iteratedValue);
                    }
                } else {
                    numEmpty++;
                }
            }

            if (numEmpty === numExprs) {
                break;
            }

            results.push(embedded);
            i++;
        }

        return results;
    }

    protected setFirstArgument(scope: InstanceScope, st: IST, attr: unknown): void {
        if (!st.impl?.hasFormalArgs) {
            if (!st.impl?.formalArguments) {
                st.add(ST.IMPLICIT_ARG_NAME, attr);

                return;
            }
            // else fall thru to set locals[0]
        }

        if (!st.impl.formalArguments) {
            this.errMgr.runTimeError(this, scope, ErrorType.ARGUMENT_COUNT_MISMATCH, 1, st.impl.name, 0);

            return;
        }

        st.locals![0] = attr;
    }

    protected addToList(scope: InstanceScope, list: unknown[], o: unknown): void {
        o = this.convertAnythingIteratableToIterator(scope, o);
        if (isIterator(o)) {
            // copy of elements into our temp list
            while (true) {
                const iterValue = o.next();
                if (iterValue.done) {
                    break;
                }

                list.push(iterValue.value);
            }
        } else {
            list.push(o);
        }
    }

    protected toString(out: STWriter, scope: InstanceScope, value: unknown): string {
        if (value != null) {
            if (typeof value === "string") {
                return value;
            }

            // if not string already, must evaluate it
            const sw = new StringWriter();
            const prototype = Object.getPrototypeOf(out) as Constructor<STWriter>;
            const stw = Reflect.construct(prototype, [sw]);

            if (this.debug && !scope.earlyEval) {
                scope = new InstanceScope(scope, scope.st);
                scope.earlyEval = true;
            }

            this.writeObjectNoOptions(stw, scope, value);

            return sw.toString();
        }

        return "";
    }

    protected testAttributeTrue(a: unknown): boolean {
        if (a == null) {
            return false;
        }

        if (Array.isArray(a)) {
            return a.length > 0;
        }

        if (a instanceof Map) {
            return a.size > 0;
        }

        if (isIterator(a)) {
            const value = a.next();

            return !value.done;
        }

        return true; // any other non-null object, return true--it's present
    }

    protected getObjectProperty(out: STWriter, scope: InstanceScope, o: unknown, property: unknown): unknown {
        if (!o) {
            this.errMgr.runTimeError(this, scope, ErrorType.NO_SUCH_PROPERTY, "undefined." + property);

            return undefined;
        }

        if (typeof o !== "object") {
            this.errMgr.runTimeError(this, scope, ErrorType.NO_SUCH_PROPERTY, typeof o + "." + property);

            return undefined;
        }

        try {
            const self = scope.st!;
            const adapter = self.groupThatCreatedThisInstance.getModelAdaptor(o.constructor as Constructor<unknown>);

            return adapter.getProperty(this, self, o, property, this.toString(out, scope, property));
        } catch (e) {
            if (e instanceof STNoSuchPropertyException) {
                this.errMgr.runTimeError(this, scope, ErrorType.NO_SUCH_PROPERTY, e, o.constructor.name + "." +
                    property);
            } else {
                throw e;
            }
        }

        return undefined;
    }

    protected writeTrace(scope: InstanceScope, ip: number): void {
        const self = scope.st;

        if (!self?.impl) {
            return;
        }

        let tr = "";
        const dis = new BytecodeDisassembler(self.impl);
        const buf = "";
        dis.disassembleInstruction({ buf, ip });
        let name = self.impl.name + ":";
        if (Misc.referenceEquals(self.impl.name, ST.UNKNOWN_NAME)) {
            name = "";
        }

        tr += printf("%-40s", name + buf);
        tr += "\tstack=[";
        for (let i = 0; i <= this.sp; i++) {
            const o = this.operands[i];
            tr = this.printForTrace(tr, scope, o);
        }

        tr += " ], calls=";
        tr += Interpreter.getEnclosingInstanceStackString(scope);
        tr += ", sp=" + this.sp + ", nw=" + this.charsWrittenOnLine;
        const s = tr.toString();
        if (this.debug) {
            this.executeTrace.push(s);
        }

        if (Interpreter.trace) {
            console.log(s);
        }
    }

    protected printForTrace(tr: string, scope: InstanceScope, o: unknown): string {
        if (o instanceof ST) {
            if (!o.impl) {
                tr += "bad-template()";
            } else {
                tr += " " + (o).impl.name + "()";
            }

            return tr;
        }

        o = this.convertAnythingIteratableToIterator(scope, o);
        if (isIterator(o)) {
            tr += " [";
            while (true) {
                const iterValue = o.next();
                if (iterValue.done) {
                    break;
                }
                this.printForTrace(tr, scope, iterValue);
            }
            tr += " ]";
        } else {
            tr += " " + o;
        }

        return tr;
    }

    /**
     * For every event, we track in overall {@link #events} list and in
     * {@code self}'s {@link InstanceScope#events} list so that each template
     * has a list of events used to create it. If {@code e} is an
     * {@link EvalTemplateEvent}, store in parent's
     * {@link InstanceScope#childEvalTemplateEvents} list for {@link STViz} tree
     * view.
     */
    protected trackDebugEvent(scope: InstanceScope, e: InterpEvent): void {
        this.events.push(e);
        scope.events.push(e);
        if (e instanceof EvalTemplateEvent) {
            const parent = scope.parent;
            if (parent) {
                scope.parent.childEvalTemplateEvents.push(e);
            }
        }
    }

    private renderObject<T>(scope: InstanceScope, formatString: string, o: T, attributeType: Constructor<T>): string {
        // ask the native group defining the surrounding template for the renderer
        const r = scope.st?.impl?.nativeGroup.getAttributeRenderer(attributeType);
        if (r) {
            return r.toString(o, formatString, this.locale);
        } else {
            return String(o);
        }
    }
}
