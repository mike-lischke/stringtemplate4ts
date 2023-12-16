/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-returns, jsdoc/require-param-description, jsdoc/require-param */

import { STWriter } from "./STWriter.js";
import { STGroup } from "./STGroup.js";
import { ST } from "./ST.js";
import { InstanceScope } from "./InstanceScope.js";
import { AutoIndentWriter } from "./AutoIndentWriter.js";
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

    /**
     * Dump bytecode instructions as they are executed. This field is mostly for
     * StringTemplate development.
     */
    public static trace = false;

    /** When {@code true}, track events inside templates and in {@link #events}. */
    public debug = false;

    /** Operand stack, grows upwards. */
    protected operands = new Array<Object>(Interpreter.DEFAULT_OPERAND_STACK_SIZE);

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
    protected group: STGroup;

    /** For renderers, we have to pass in the locale. */
    protected locale: Intl.Locale;

    protected errMgr: ErrorManager;

    /** If {@link #trace} is {@code true}, track trace here. */
    // TODO: track the pieces not a string and track what it contributes to output
    protected executeTrace: string[];

    /**
     * Track everything happening in interpreter across all templates if
     * {@link #debug}. The last event in this field is the
     * {@link EvalTemplateEvent} for the root template.
     */
    protected events: InterpEvent[];

    public constructor(group: STGroup, debug: boolean);
    public constructor(group: STGroup, locale: Intl.Locale, debug: boolean);
    public constructor(group: STGroup, errMgr: ErrorManager, debug: boolean);
    public constructor(group: STGroup, locale: Intl.Locale, errMgr: ErrorManager, debug: boolean);
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
                    [this.group, this.locale, this.debug] = args as [STGroup, Intl.Locale, boolean];
                    this.errMgr = this.group.errMgr;
                } else {
                    [this.group, this.errMgr, this.debug] = args as [STGroup, ErrorManager, boolean];
                    this.locale = new Intl.Locale("en-US");
                }

                break;
            }

            case 4: {
                [this.group, this.locale, this.errMgr, this.debug] =
                    args as [STGroup, Intl.Locale, ErrorManager, boolean];

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }

        if (this.debug) {
            this.events = new Array<InterpEvent>();
            this.executeTrace = new Array<string>();
        }
    }

    /**
     * If an instance of <i>x</i> is enclosed in a <i>y</i> which is in a
     * <i>z</i>, return a {@code String} of these instance names in order from
     * topmost to lowest; here that would be {@code [z y x]}.
     * @param scope
     */
    public static getEnclosingInstanceStackString(scope: InstanceScope): string {
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

    public static getEnclosingInstanceStack(scope: InstanceScope, topDown: boolean): ST[] {
        const stack: ST[] = [];
        let p = scope;
        while (p !== null) {
            if (topDown) {
                stack.unshift(p.st);
            } else {
                stack.push(p.st);
            }

            p = p.parent;
        }

        return stack;
    }

    public static getScopeStack(scope: InstanceScope, topDown: boolean): InstanceScope[] {
        const stack: InstanceScope[] = [];
        let p = scope;
        while (p !== null) {
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
        let p = scope;
        while (p !== null) {
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

        return b1 << (8 * 1) | b2;
    }

    /**
     * Execute template {@code self} and return how many characters it wrote to {@code out}.
     *
     * @returns the number of characters written to {@code out}
     */
    public exec(out: STWriter, scope: InstanceScope): number {
        const self = scope.st;
        if (Interpreter.trace) {
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
     * @param scope
     * @param v
     */
    public first(scope: InstanceScope, v: unknown): unknown {
        if (!v) {
            return null;
        }

        const it = this.convertAnythingIteratableToIterator(scope, v);
        if (it) {
            const [r] = it;

            return r;
        }

        return v;
    }

    /**
     * Return the last attribute if multi-valued, or the attribute itself if
     * single-valued. Unless it's a {@link List} or array, this is pretty slow
     * as it iterates until the last element.
     * <p>
     * This method is used for rendering expressions of the form
     * {@code <names:last()>}.</p>
     * @param scope
     * @param v
     */
    public last(scope: InstanceScope, v: unknown): unknown {
        if (!v) {
            return null;
        }

        if (Array.isArray(v)) {
            return v[v.length - 1];
        }

        const it = this.convertAnythingIteratableToIterator(scope, v);
        if (!it) {
            return v;
        }

        // Return the last value from the iterator.
        let r = null;
        for (const e of it) {
            r = e;
        }

        return r;
    }

    /**
     * Return everything but the first attribute if multi-valued, or
     * {@code null} if single-valued.
     * @param scope
     * @param v
     */
    public rest(scope: InstanceScope, v: unknown): unknown {
        if (!v) {
            return null;
        }

        if (Array.isArray(v)) {
            if (v.length <= 1) {
                return null;
            }

            return v.slice(1);
        }

        const it = this.convertAnythingIteratableToIterator(scope, v);
        if (!it) {
            return null;
        }

        const a = new Array<unknown>();
        const [first] = it;
        if (!first) {
            // if not even one value return null
            return null;
        }

        for (const o of it) {
            a.push(o);
        }

        return a;
    }

    /**
     * Return all but the last element. <code>trunc(<i>x</i>)==null</code> if <code><i>x</i></code> is single-valued.
     * @param scope
     * @param v
     */
    public trunc(scope: InstanceScope, v: unknown): unknown {
        if (!v) {
            return null;
        }

        let a;
        if (!Array.isArray(v)) {
            const it = this.convertAnythingIteratableToIterator(scope, v);
            if (!it) {
                return null;
            }

            a = Array.from(it);
        } else {
            a = v;
        }

        if (a.length <= 1) {
            return null;
        }

        return a.slice(0, a.length - 1);
    }

    /**
     * Return a new list without {@code null} values.
     * @param scope
     * @param v
     */
    public strip(scope: InstanceScope, v: unknown): unknown {
        if (!v) {
            return null;
        }

        const it = this.convertAnythingIteratableToIterator(scope, v);
        if (!it) {
            return v; // strip(x)==x when x single-valued attribute
        }

        const a = Array.from(it);

        return a.filter((e) => { return e !== null; });
    }

    /**
     * Return a list with the same elements as {@code v} but in reverse order.
     * <p>
     * Note that {@code null} values are <i>not</i> stripped out; use
     * {@code reverse(strip(v))} to do that.</p>
     * @param scope
     * @param v
     */
    public reverse(scope: InstanceScope, v: unknown): unknown {
        if (!v) {
            return null;
        }

        if (Array.isArray(v)) {
            return v.reverse();
        }

        const it = this.convertAnythingIteratableToIterator(scope, v);
        if (!it) {
            return v; // reverse(x)==x when x single-valued attribute
        }

        return Array.from(it).reverse();
    }

    /**
     * Return the length of a multi-valued attribute or 1 if it is a single
     * attribute. If {@code v} is {@code null} return 0.
     * <p>
     * The implementation treats several common collections and arrays as
     * special cases for speed.</p>
     * @param v
     */
    public length(v: unknown): number {
        if (!v) {
            return 0;
        }

        if (v instanceof Map) {
            return v.size;
        } else {
            let a;
            if (!Array.isArray(v)) {
                const it = this.convertAnythingIteratableToIterator(null, v);
                if (!it) {
                    return 1; // length(x)==1 when x single-valued attribute
                }

                a = Array.from(it);
            } else {
                a = v;
            }

            return a.length;
        }

    }

    public convertAnythingIteratableToIterator(_scope: InstanceScope | null,
        o: unknown): IterableIterator<unknown> | null {
        const iter = null;
        if (!o) {
            return null;
        }

        if (typeof o !== "object") {
            return null;
        }

        // Is the object itself iterable?
        if (Symbol.iterator in o) {
            return (o as IterableIterator<unknown>)[Symbol.iterator]();
        }

        // Does the object implement the Iterator interface?
        if ("next" in o && "return" in o) {
            // Note: we ignore scope.st.groupThatCreatedThisInstance.iterateAcrossValues here.
            const iterableIterator = {
                [Symbol.iterator]() {
                    return this;
                },
                next: () => {
                    return (o as Iterator<unknown>).next();
                },
            };

            return iterableIterator;
        }

        return null;
    }

    public convertAnythingToIterator(scope: InstanceScope, o: Object): java.util.Iterator<unknown> {
        o = this.convertAnythingIteratableToIterator(scope, o);
        if (o instanceof java.util.Iterator) {
            return o as java.util.Iterator<unknown>;
        }

        const singleton = new ST.AttributeList(1);
        singleton.add(o);

        return singleton.iterator();
    }

    /**
     * Find an attribute via dynamic scoping up enclosing scope chain. Only look
     * for a dictionary definition if the attribute is not found, so attributes
     * sent in to a template override dictionary names.
     * <p>
     * Return {@link ST#EMPTY_ATTR} if found definition but no value.</p>
     */
    public getAttribute(scope: InstanceScope, name: string): Object {
        let current = scope;
        while (current !== null) {
            const p = current.st;
            let localArg = null;
            if (p.impl.formalArguments !== null) {
                localArg = p.impl.formalArguments.get(name);
            }

            if (localArg !== null) {
                const o = p.locals[localArg.index];

                return o;
            }
            current = current.parent; // look up enclosing scope chain
        }
        // got to root scope and no definition, try dictionaries in group and up
        const self = scope.st;
        const g = self.impl.nativeGroup;
        const o = this.getDictionary(g, name);
        if (o !== null) {
            return o;
        }

        // not found, report unknown attr
        throw new STNoSuchAttributeException(name, scope);
    }

    public getDictionary(g: STGroup, name: string): Object {
        if (g.isDictionary(name)) {
            return g.rawGetDictionary(name);
        }
        if (g.imports !== null) {
            for (const sup of g.imports) {
                const o = this.getDictionary(sup, name);
                if (o !== null) {
                    return o;
                }

            }
        }

        return null;
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
        if (invokedST.impl.formalArguments === null ||
            invokedST.impl.numberOfArgsWithDefaultValues === 0) {
            return;
        }
        for (const arg of invokedST.impl.formalArguments.values()) {
            // if no value for attribute and default arg, inject default arg into self
            if (invokedST.locals[arg.index] !== ST.EMPTY_ATTR || arg.defaultValueToken === null) {
                continue;
            }
            //System.out.println("setting def arg "+arg.name+" to "+arg.defaultValueToken);
            if (arg.defaultValueToken.getType() === GroupParser.ANONYMOUS_TEMPLATE) {
                let code = arg.compiledDefaultValue;
                if (code === null) {
                    code = new CompiledST();
                }
                const defaultArgST = this.group.createStringTemplateInternally(code);
                defaultArgST.groupThatCreatedThisInstance = this.group;
                // If default arg is template with single expression
                // wrapped in parens, x={<(...)>}, then eval to string
                // rather than setting x to the template for later
                // eval.
                const defArgTemplate = arg.defaultValueToken.getText();
                if (defArgTemplate.startsWith("{" + this.group.delimiterStartChar + "(") &&
                    defArgTemplate.endsWith(")" + this.group.delimiterStopChar + "}")) {

                    invokedST.rawSetAttribute(arg.name, this.toString(out, new InstanceScope(scope, invokedST), defaultArgST));
                }
                else {
                    invokedST.rawSetAttribute(arg.name, defaultArgST);
                }
            }
            else {
                invokedST.rawSetAttribute(arg.name, arg.defaultValue);
            }
        }
    }

    public getEvents(): InterpEvent[] { return this.events; }

    public getExecutionTrace(): string[] { return this.executeTrace; }

    protected _exec(out: STWriter, scope: InstanceScope): int {
        const self = scope.st;
        const start = out.index(); // track char we're about to write
        let prevOpcode = 0;
        let n = 0; // how many char we write out
        let nargs: int;
        let nameIndex: int;
        let addr: int;
        let name: string;
        let o: Object;
        let left: Object;
        let right: Object;
        let st: ST;
        let options: Object[];
        const code = self.impl.instrs;        // which code block are we executing
        let ip = 0;
        while (ip < self.impl.codeSize) {
            if (Interpreter.trace || this.debug) {
                Interpreter.trace(scope, ip);
            }

            const opcode = code[ip];
            //count[opcode]++;
            scope.ip = ip;
            ip++; //jump to next instruction or first byte of operand
            switch (opcode) {
                case Bytecode.INSTR_LOAD_STR: {
                    // just testing...
                    this.load_str(self, ip);
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
                            o = null;
                        }

                    } catch (nsae) {
                        if (nsae instanceof STNoSuchAttributeException) {
                            this.errMgr.runTimeError(this, scope, ErrorType.NO_SUCH_ATTRIBUTE, name);
                            o = null;
                        } else {
                            throw nsae;
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
                        o = null;
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
                    nargs = Interpreter.getShort(code, ip);
                    ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                    // look up in original hierarchy not enclosing template (variable group)
                    // see TestSubtemplates.testEvalSTFromAnotherGroup()
                    st = self.groupThatCreatedThisInstance.getEmbeddedInstanceOf(this, scope, name);
                    // get n args and store into st's attr list
                    this.storeArgs(scope, nargs, st);
                    this.sp -= nargs;
                    this.operands[++this.sp] = st;
                    break;
                }

                case Bytecode.INSTR_NEW_IND: {
                    nargs = Interpreter.getShort(code, ip);
                    ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                    name = String(this.operands[this.sp - nargs]);
                    st = self.groupThatCreatedThisInstance.getEmbeddedInstanceOf(this, scope, name);
                    this.storeArgs(scope, nargs, st);
                    this.sp -= nargs;
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
                    nargs = Interpreter.getShort(code, ip);
                    ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                    this.super_new(scope, name, nargs);
                    break;
                }

                case Bytecode.INSTR_SUPER_NEW_BOX_ARGS: {
                    nameIndex = Interpreter.getShort(code, ip);
                    ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                    name = self.impl.strings[nameIndex];
                    attrs = this.operands[this.sp--] as Map<string, Object>;
                    this.super_new(scope, name, attrs);
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
                    attrs = this.operands[this.sp] as Map<string, Object>;
                    attrs.put(name, o); // leave attrs on stack
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
                    const nmaps = Interpreter.getShort(code, ip);
                    ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                    const templates = new Array<ST>();
                    for (let i = nmaps - 1; i >= 0; i--) {
                        templates.add(this.operands[this.sp - i] as ST);
                    }

                    this.sp -= nmaps;
                    o = this.operands[this.sp--];
                    if (o !== null) {
                        this.rot_map(scope, o, templates);
                    }

                    break;
                }

                case Bytecode.INSTR_ZIP_MAP: {
                    st = this.operands[this.sp--] as ST;
                    nmaps = Interpreter.getShort(code, ip);
                    ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                    const exprs = new Array<Object>();
                    for (let i = nmaps - 1; i >= 0; i--) {
                        exprs.add(this.operands[this.sp - i]);
                    }

                    this.sp -= nmaps;
                    this.operands[++this.sp] = this.zip_map(scope, exprs, st);
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
                    // jump
                    break;
                }

                case Bytecode.INSTR_OPTIONS: {
                    this.operands[++this.sp] = new Array<Object>(java.lang.Compiler.NUM_OPTIONS);
                    break;
                }

                case Bytecode.INSTR_ARGS: {
                    this.operands[++this.sp] = new Map<string, Object>();
                    break;
                }

                case Bytecode.INSTR_PASSTHRU: {
                    nameIndex = Interpreter.getShort(code, ip);
                    ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                    name = self.impl.strings[nameIndex];
                    attrs = this.operands[this.sp] as Map<string, Object>;
                    this.passthru(scope, name, attrs);
                    break;
                }

                case Bytecode.INSTR_LIST: {
                    this.operands[++this.sp] = new Array<Object>();
                    break;
                }

                case Bytecode.INSTR_ADD: {
                    o = this.operands[this.sp--];             // pop value
                    const list = this.operands[this.sp] as Object[]; // don't pop list
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
                    if (o.getClass() === string.class) {
                        this.operands[++this.sp] = (String(o)).trim();
                    }
                    else {
                        this.errMgr.runTimeError(this, scope, ErrorType.EXPECTING_STRING, "trim", o.getClass().getName());
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
                    if (o.getClass() === string.class) {
                        this.operands[++this.sp] = (String(o)).length();
                    }
                    else {
                        this.errMgr.runTimeError(this, scope, ErrorType.EXPECTING_STRING, "strlen", o.getClass().getName());
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
                            out.write(Misc.newline);
                        }
                        this.charsWrittenOnLine = 0;
                    } catch (ioe) {
                        if (ioe instanceof java.io.IOException) {
                            this.errMgr.IOError(self, ErrorType.WRITE_IO_ERROR, ioe);
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
                    strIndex = Interpreter.getShort(code, ip);
                    ip += Bytecode.OPERAND_SIZE_IN_BYTES;
                    o = self.impl.strings[strIndex];
                    n1 = this.writeObjectNoOptions(out, scope, o);
                    n += n1;
                    this.charsWrittenOnLine += n1;
                    break;
                }

                // TODO: generate this optimization
                //              case Bytecode.INSTR_WRITE_LOCAL:
                //                  valueIndex = getShort(code, ip);
                //                  ip += Bytecode.OPND_SIZE_IN_BYTES;
                //                  o = self.locals[valueIndex];
                //                  if ( o==ST.EMPTY_ATTR ) o = null;
                //                  n1 = writeObjectNoOptions(out, self, o);
                //                  n += n1;
                //                  nwline += n1;
                //                  break;
                default: {
                    this.errMgr.internalError(self, "invalid bytecode @ " + (ip - 1) + ": " + opcode, null);
                    self.impl.dump();
                }

            }
            prevOpcode = opcode;
        }
        if (this.debug) {
            const stop = out.index() - 1;
            const e = new EvalTemplateEvent(scope, start, stop);
            this.trackDebugEvent(scope, e);
        }

        return n;
    }

    protected load_str(self: ST, ip: int): void {
        const strIndex = Interpreter.getShort(self.impl.instrs, ip);
        ip += Bytecode.OPERAND_SIZE_IN_BYTES;
        this.operands[++this.sp] = self.impl.strings[strIndex];
    };

    // TODO: refactor to remove dup'd code
    protected super_new(scope: InstanceScope, name: string, nargs: int): void;

    protected super_new(scope: InstanceScope, name: string, attrs: Map<string, Object>): void;
    protected super_new(...args: unknown[]): void {
        switch (args.length) {
            case 3: {
                const [scope, name, nargs] = args as [InstanceScope, string, int];

                const self = scope.st;
                let st = null;
                const imported = self.impl.nativeGroup.lookupImportedTemplate(name);
                if (imported === null) {
                    this.errMgr.runTimeError(this, scope, ErrorType.NO_IMPORTED_TEMPLATE,
                        name);
                    st = self.groupThatCreatedThisInstance.createStringTemplateInternally(new CompiledST());
                }
                else {
                    st = imported.nativeGroup.getEmbeddedInstanceOf(this, scope, name);
                    st.groupThatCreatedThisInstance = this.group;
                }
                // get n args and store into st's attr list
                this.storeArgs(scope, nargs, st);
                this.sp -= nargs;
                this.operands[++this.sp] = st;

                break;
            }

            case 3: {
                const [scope, name, attrs] = args as [InstanceScope, string, Map<string, Object>];

                const self = scope.st;
                let st = null;
                const imported = self.impl.nativeGroup.lookupImportedTemplate(name);
                if (imported === null) {
                    this.errMgr.runTimeError(this, scope, ErrorType.NO_IMPORTED_TEMPLATE,
                        name);
                    st = self.groupThatCreatedThisInstance.createStringTemplateInternally(new CompiledST());
                }
                else {
                    st = imported.nativeGroup.createStringTemplateInternally(imported);
                    st.groupThatCreatedThisInstance = this.group;
                }

                // get n args and store into st's attr list
                this.storeArgs(scope, attrs, st);
                this.operands[++this.sp] = st;

                break;
            }

            default: {
                throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
            }
        }
    }

    protected passthru(scope: InstanceScope, templateName: string, attrs: Map<string, Object>): void {
        const c = this.group.lookupTemplate(templateName);
        if (c === null) {
            return;
        }
        // will get error later
        if (c.formalArguments === null) {
            return;
        }

        for (const arg of c.formalArguments.values()) {
            // if not already set by user, set to value from outer scope
            if (!attrs.containsKey(arg.name)) {
                //System.out.println("arg "+arg.name+" missing");
                try {
                    const o = this.getAttribute(scope, arg.name);
                    // If the attribute exists but there is no value and
                    // the formal argument has no default value, make it null.
                    if (o === ST.EMPTY_ATTR && arg.defaultValueToken === null) {
                        attrs.put(arg.name, null);
                    }
                    // Else, the attribute has an existing value, set arg.
                    else {
                        if (o !== ST.EMPTY_ATTR) {
                            attrs.put(arg.name, o);
                        }
                    }

                } catch (nsae) {
                    if (nsae instanceof STNoSuchAttributeException) {
                        // if no such attribute exists for arg.name, set parameter
                        // if no default value
                        if (arg.defaultValueToken === null) {
                            this.errMgr.runTimeError(this, scope, ErrorType.NO_SUCH_ATTRIBUTE_PASS_THROUGH, arg.name);
                            attrs.put(arg.name, null);
                        }
                    } else {
                        throw nsae;
                    }
                }
            }
        }
    }

    protected storeArgs(scope: InstanceScope, attrs: Map<string, Object>, st: ST): void;

    protected storeArgs(scope: InstanceScope, nargs: int, st: ST): void;
    protected storeArgs(...args: unknown[]): void {
        switch (args.length) {
            case 3: {
                const [scope, attrs, st] = args as [InstanceScope, Map<string, Object>, ST];

                let noSuchAttributeReported = false;
                if (attrs !== null) {
                    for (const argument of attrs.entrySet()) {
                        if (!st.impl.hasFormalArgs) {
                            if (st.impl.formalArguments === null || !st.impl.formalArguments.containsKey(argument.getKey())) {
                                try {
                                    // we clone the CompiledST to prevent modifying the original
                                    // formalArguments map during interpretation.
                                    st.impl = st.impl.clone();
                                    st.add(argument.getKey(), argument.getValue());
                                } catch (ex) {
                                    if (ex instanceof java.lang.CloneNotSupportedException) {
                                        noSuchAttributeReported = true;
                                        this.errMgr.runTimeError(this, scope,
                                            ErrorType.NO_SUCH_ATTRIBUTE,
                                            argument.getKey());
                                    } else {
                                        throw ex;
                                    }
                                }
                            }
                            else {
                                st.rawSetAttribute(argument.getKey(), argument.getValue());
                            }
                        }
                        else {
                            // don't let it throw an exception in rawSetAttribute
                            if (st.impl.formalArguments === null || !st.impl.formalArguments.containsKey(argument.getKey())) {
                                noSuchAttributeReported = true;
                                this.errMgr.runTimeError(this, scope,
                                    ErrorType.NO_SUCH_ATTRIBUTE,
                                    argument.getKey());
                                continue;
                            }

                            st.rawSetAttribute(argument.getKey(), argument.getValue());
                        }
                    }
                }

                if (st.impl.hasFormalArgs) {
                    let argumentCountMismatch = false;
                    let formalArguments = st.impl.formalArguments;
                    if (formalArguments === null) {
                        formalArguments = java.util.Collections.emptyMap();
                    }

                    // first make sure that all non-default arguments are specified
                    // ignore this check if a NO_SUCH_ATTRIBUTE error already occurred
                    if (!noSuchAttributeReported) {
                        for (const formalArgument of formalArguments.entrySet()) {
                            if (formalArgument.getValue().defaultValueToken !== null || formalArgument.getValue().defaultValue !== null) {
                                // this argument has a default value, so it doesn't need to appear in attrs
                                continue;
                            }

                            if (attrs === null || !attrs.containsKey(formalArgument.getKey())) {
                                argumentCountMismatch = true;
                                break;
                            }
                        }
                    }

                    // next make sure there aren't too many arguments. note that the names
                    // of arguments are checked below as they are applied to the template
                    // instance, so there's no need to do that here.
                    if (attrs !== null && attrs.size() > formalArguments.size()) {
                        argumentCountMismatch = true;
                    }

                    if (argumentCountMismatch) {
                        const nargs = attrs !== null ? attrs.size() : 0;
                        const nformalArgs = formalArguments.size();
                        this.errMgr.runTimeError(this, scope,
                            ErrorType.ARGUMENT_COUNT_MISMATCH,
                            nargs,
                            st.impl.name,
                            nformalArgs);
                    }
                }

                break;
            }

            case 3: {
                const [scope, nargs, st] = args as [InstanceScope, int, ST];

                if (nargs > 0 && !st.impl.hasFormalArgs && st.impl.formalArguments === null) {
                    st.add(ST.IMPLICIT_ARG_NAME, null); // pretend we have "it" arg
                }

                let nformalArgs = 0;
                if (st.impl.formalArguments !== null) {
                    nformalArgs = st.impl.formalArguments.size();
                }

                const firstArg = this.sp - (nargs - 1);
                const numToStore = java.lang.Math.min(nargs, nformalArgs);
                if (st.impl.isAnonSubtemplate) {
                    nformalArgs -= Interpreter.predefinedAnonSubtemplateAttributes.size();
                }

                if (nargs < (nformalArgs - st.impl.numberOfArgsWithDefaultValues) ||
                    nargs > nformalArgs) {
                    this.errMgr.runTimeError(this, scope,
                        ErrorType.ARGUMENT_COUNT_MISMATCH,
                        nargs,
                        st.impl.name,
                        nformalArgs);
                }

                if (st.impl.formalArguments === null) {
                    return;
                }

                const argNames = st.impl.formalArguments.keySet().iterator();
                for (let i = 0; i < numToStore; i++) {
                    const o = this.operands[firstArg + i];    // value to store
                    const argName = argNames.next();
                    st.rawSetAttribute(argName, o);
                }

                break;
            }

            default: {
                throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
            }
        }
    }

    protected indent(out: STWriter, scope: InstanceScope, strIndex: int): void {
        const indent = scope.st.impl.strings[strIndex];
        if (this.debug) {
            const start = out.index(); // track char we're about to write
            const e = new IndentEvent(scope,
                start, start + indent.length() - 1,
                this.getExprStartChar(scope),
                this.getExprStopChar(scope));
            this.trackDebugEvent(scope, e);
        }
        out.pushIndentation(indent);
    }

    /**
     * Write out an expression result that doesn't use expression options.
     *  E.g., {@code <name>}
     * @param out
     * @param scope
     * @param o
     */
    protected writeObjectNoOptions(out: STWriter, scope: InstanceScope, o: Object): int {
        const start = out.index(); // track char we're about to write
        const n = this.writeObject(out, scope, o, null);
        if (this.debug) {
            const e = new EvalExprEvent(scope,
                start, out.index() - 1,
                this.getExprStartChar(scope),
                this.getExprStopChar(scope));
            this.trackDebugEvent(scope, e);
        }

        return n;
    }

    /**
     * Write out an expression result that uses expression options.
     *  E.g., {@code <names; separator=", ">}
     * @param out
     * @param scope
     * @param o
     * @param options
     */
    protected writeObjectWithOptions(out: STWriter, scope: InstanceScope, o: Object,
        options: Object[]): int {
        const start = out.index(); // track char we're about to write
        // precompute all option values (render all the way to strings)
        let optionStrings = null;
        if (options !== null) {
            optionStrings = new Array<string>(options.length);
            for (let i = 0; i < java.lang.Compiler.NUM_OPTIONS; i++) {
                optionStrings[i] = this.toString(out, scope, options[i]);
            }
        }
        if (options !== null && options[Interpreter.Option.ANCHOR.ordinal()] !== null) {
            out.pushAnchorPoint();
        }

        const n = this.writeObject(out, scope, o, optionStrings);

        if (options !== null && options[Interpreter.Option.ANCHOR.ordinal()] !== null) {
            out.popAnchorPoint();
        }
        if (this.debug) {
            const e = new EvalExprEvent(scope,
                start, out.index() - 1,
                this.getExprStartChar(scope),
                this.getExprStopChar(scope));
            this.trackDebugEvent(scope, e);
        }

        return n;
    }

    /**
     * Generic method to emit text for an object. It differentiates
     *  between templates, iterable objects, and plain old Java objects (POJOs)
     * @param out
     * @param scope
     * @param o
     * @param options
     */
    protected writeObject(out: STWriter, scope: InstanceScope, o: Object, options: string[]): int {
        let n = 0;
        if (o === null) {
            if (options !== null && options[Interpreter.Option.NULL.ordinal()] !== null) {
                o = options[Interpreter.Option.NULL.ordinal()];
            }
            else {
                return 0;
            }

        }
        if (o instanceof ST) {
            scope = new InstanceScope(scope, o);
            if (options !== null && options[Interpreter.Option.WRAP.ordinal()] !== null) {
                // if we have a wrap string, then inform writer it
                // might need to wrap
                try {
                    out.writeWrap(options[Interpreter.Option.WRAP.ordinal()]);
                } catch (ioe) {
                    if (ioe instanceof java.io.IOException) {
                        this.errMgr.IOError(scope.st, ErrorType.WRITE_IO_ERROR, ioe);
                    } else {
                        throw ioe;
                    }
                }
            }
            n = this.exec(out, scope);
        }
        else {
            o = this.convertAnythingIteratableToIterator(scope, o); // normalize
            try {
                if (o instanceof java.util.Iterator) {
                    n = this.writeIterator(out, scope, o, options);
                }

                else {
                    n = this.writePOJO(out, scope, o, options);
                }

            } catch (ioe) {
                if (ioe instanceof java.io.IOException) {
                    this.errMgr.IOError(scope.st, ErrorType.WRITE_IO_ERROR, ioe, o);
                } else {
                    throw ioe;
                }
            }
        }

        return n;
    }

    protected writeIterator(out: STWriter, scope: InstanceScope, o: Object, options: string[]): int {
        if (o === null) {
            return 0;
        }

        let n = 0;
        const it = o as java.util.Iterator<unknown>;
        let separator = null;
        if (options !== null) {
            separator = options[Interpreter.Option.SEPARATOR.ordinal()];
        }

        let seenAValue = false;
        while (it.hasNext()) {
            const iterValue = it.next();
            // Emit separator if we're beyond first value
            const needSeparator = seenAValue &&
                separator !== null &&            // we have a separator and
                (iterValue !== null ||           // either we have a value
                    options[Interpreter.Option.NULL.ordinal()] !== null); // or no value but null option
            if (needSeparator) {
                n += out.writeSeparator(separator);
            }

            const nw = this.writeObject(out, scope, iterValue, options);
            if (nw > 0) {
                seenAValue = true;
            }

            n += nw;
        }

        return n;
    }

    protected writePOJO(out: STWriter, scope: InstanceScope, o: Object, options: string[]): int {
        let formatString = null;
        if (options !== null) {
            formatString = options[Interpreter.Option.FORMAT.ordinal()];
        }

        const v = this.renderObject(scope, formatString, o, o.getClass());
        let n: int;
        if (options !== null && options[Interpreter.Option.WRAP.ordinal()] !== null) {
            n = out.write(v, options[Interpreter.Option.WRAP.ordinal()]);
        }
        else {
            n = out.write(v);
        }

        return n;
    }

    protected getExprStartChar(scope: InstanceScope): int {
        const templateLocation = scope.st.impl.sourceMap[scope.ip];
        if (templateLocation !== null) {
            return templateLocation.a;
        }

        return -1;
    }

    protected getExprStopChar(scope: InstanceScope): int {
        const templateLocation = scope.st.impl.sourceMap[scope.ip];
        if (templateLocation !== null) {
            return templateLocation.b;
        }

        return -1;
    }

    protected map(scope: InstanceScope, attr: Object, /* final */  st: ST): void {
        this.rot_map(scope, attr, java.util.Collections.singletonList(st));
    };

    /**
     * Renders expressions of the form {@code <names:a()>} or
     * {@code <names:a(),b()>}.
     * @param scope
     * @param attr
     * @param prototypes
     */
    protected rot_map(scope: InstanceScope, attr: Object, prototypes: ST[]): void {
        if (attr === null) {
            this.operands[++this.sp] = null;

            return;
        }
        attr = this.convertAnythingIteratableToIterator(scope, attr);
        if (attr instanceof java.util.Iterator) {
            const mapped = this.rot_map_iterator(scope, attr as java.util.Iterator, prototypes);
            this.operands[++this.sp] = mapped;
        }
        else { // if only single value, just apply first template to sole value
            const proto = prototypes.get(0);
            const st = this.group.createStringTemplateInternally(proto);
            if (st !== null) {
                this.setFirstArgument(scope, st, attr);
                if (st.impl.isAnonSubtemplate) {
                    st.rawSetAttribute("i0", 0);
                    st.rawSetAttribute("i", 1);
                }
                this.operands[++this.sp] = st;
            }
            else {
                this.operands[++this.sp] = null;
            }
        }
    }

    protected rot_map_iterator(scope: InstanceScope, attr: java.util.Iterator<unknown>, prototypes: ST[]): ST[] {
        const mapped = new Array<ST>();
        const iter = attr;
        let i0 = 0;
        let i = 1;
        let ti = 0;
        while (iter.hasNext()) {
            const iterValue = iter.next();
            if (iterValue === null) { mapped.add(null); continue; }
            const templateIndex = ti % prototypes.size(); // rotate through
            ti++;
            const proto = prototypes.get(templateIndex);
            const st = this.group.createStringTemplateInternally(proto);
            this.setFirstArgument(scope, st, iterValue);
            if (st.impl.isAnonSubtemplate) {
                st.rawSetAttribute("i0", i0);
                st.rawSetAttribute("i", i);
            }
            mapped.add(st);
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
    protected zip_map(scope: InstanceScope, exprs: Object[], prototype: ST): ST.AttributeList {
        if (exprs === null || prototype === null || exprs.size() === 0) {
            return null; // do not apply if missing templates or empty values
        }
        // make everything iterable
        for (let i = 0; i < exprs.size(); i++) {
            const attr = exprs.get(i);
            if (attr !== null) {
                exprs.set(i, this.convertAnythingToIterator(scope, attr));
            }

        }

        // ensure arguments line up
        let numExprs = exprs.size();
        const code = prototype.impl;
        const formalArguments = code.formalArguments;
        if (!code.hasFormalArgs || formalArguments === null) {
            this.errMgr.runTimeError(this, scope, ErrorType.MISSING_FORMAL_ARGUMENTS);

            return null;
        }

        // todo: track formal args not names for efficient filling of locals
        let formalArgumentNames = formalArguments.keySet().toArray(new Array<string>(formalArguments.size()));
        let nformalArgs = formalArgumentNames.length;
        if (prototype.isAnonSubtemplate()) {
            nformalArgs -= Interpreter.predefinedAnonSubtemplateAttributes.size();
        }

        if (nformalArgs !== numExprs) {
            this.errMgr.runTimeError(this, scope,
                ErrorType.MAP_ARGUMENT_COUNT_MISMATCH,
                numExprs,
                nformalArgs);
            // TODO just fill first n
            // truncate arg list to match smaller size
            const shorterSize = java.lang.Math.min(formalArgumentNames.length, numExprs);
            numExprs = shorterSize;
            const newFormalArgumentNames = new Array<string>(shorterSize);
            java.lang.System.arraycopy(formalArgumentNames, 0,
                newFormalArgumentNames, 0,
                shorterSize);
            formalArgumentNames = newFormalArgumentNames;
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
                const it = exprs.get(a) as java.util.Iterator<unknown>;
                if (it !== null && it.hasNext()) {
                    const argName = formalArgumentNames[a];
                    const iteratedValue = it.next();
                    embedded.rawSetAttribute(argName, iteratedValue);
                }
                else {
                    numEmpty++;
                }
            }
            if (numEmpty === numExprs) {
                break;
            }

            results.add(embedded);
            i++;
        }

        return results;
    }

    protected setFirstArgument(scope: InstanceScope, st: ST, attr: Object): void {
        if (!st.impl.hasFormalArgs) {
            if (st.impl.formalArguments === null) {
                st.add(ST.IMPLICIT_ARG_NAME, attr);

                return;
            }
            // else fall thru to set locals[0]
        }
        if (st.impl.formalArguments === null) {
            this.errMgr.runTimeError(this, scope,
                ErrorType.ARGUMENT_COUNT_MISMATCH,
                1,
                st.impl.name,
                0);

            return;
        }
        st.locals[0] = attr;
    }

    protected addToList(scope: InstanceScope, list: Object[], o: Object): void {
        o = this.convertAnythingIteratableToIterator(scope, o);
        if (o instanceof java.util.Iterator) {
            // copy of elements into our temp list
            const it = o as java.util.Iterator<unknown>;
            while (it.hasNext()) { list.add(it.next()); }
        }
        else {
            list.add(o);
        }
    }

    protected override  toString(out: STWriter, scope: InstanceScope, value: Object): string {
        if (value !== null) {
            if (value.getClass() === string.class) {
                return String(value);
            }

            // if not string already, must evaluate it
            const sw = new java.io.StringWriter();
            let stw: STWriter;
            try {
                const writerClass = out.getClass();
                const ctor = writerClass.getConstructor(java.io.Writer.class);
                stw = ctor.newInstance(sw);
            } catch (e) {
                if (e instanceof Error) {
                    stw = new AutoIndentWriter(sw);
                    this.errMgr.runTimeError(this, scope, ErrorType.WRITER_CTOR_ISSUE, out.getClass().getSimpleName());
                } else {
                    throw e;
                }
            }

            if (this.debug && !scope.earlyEval) {
                scope = new InstanceScope(scope, scope.st);
                scope.earlyEval = true;
            }

            this.writeObjectNoOptions(stw, scope, value);

            return sw.toString();
        }

        return null;
    }

    protected testAttributeTrue(a: Object): boolean {
        if (a === null) {
            return false;
        }

        if (a instanceof java.lang.Boolean) {
            return a as java.lang.Boolean;
        }

        if (a instanceof java.util.Collection) {
            return (a as java.util.Collection<unknown>).size() > 0;
        }

        if (a instanceof Map) {
            return (a as Map<unknown, unknown>).size() > 0;
        }

        if (a instanceof java.lang.Iterable) {
            return (a as java.lang.Iterable<unknown>).iterator().hasNext();
        }
        if (a instanceof java.util.Iterator) {
            return (a as java.util.Iterator<unknown>).hasNext();
        }

        return true; // any other non-null object, return true--it's present
    }

    protected getObjectProperty(out: STWriter, scope: InstanceScope, o: Object, property: Object): Object {
        if (o === null) {
            this.errMgr.runTimeError(this, scope, ErrorType.NO_SUCH_PROPERTY,
                "null." + property);

            return null;
        }

        try {
            const self = scope.st;
            const adap = self.groupThatCreatedThisInstance.getModelAdaptor(o.getClass());

            return adap.getProperty(this, self, o, property, this.toString(out, scope, property));
        } catch (e) {
            if (e instanceof STNoSuchPropertyException) {
                this.errMgr.runTimeError(this, scope, ErrorType.NO_SUCH_PROPERTY,
                    e, o.getClass().getName() + "." + property);
            } else {
                throw e;
            }
        }

        return null;
    }

    protected trace(scope: InstanceScope, ip: int): void {
        const self = scope.st;
        const tr = new java.lang.StringBuilder();
        const dis = new BytecodeDisassembler(self.impl);
        const buf = new java.lang.StringBuilder();
        dis.disassembleInstruction(buf, ip);
        let name = self.impl.name + ":";
        if (Misc.referenceEquals(self.impl.name, ST.UNKNOWN_NAME)) {
            name = "";
        }

        tr.append(string.format("%-40s", name + buf));
        tr.append("\tstack=[");
        for (let i = 0; i <= this.sp; i++) {
            const o = this.operands[i];
            this.printForTrace(tr, scope, o);
        }
        tr.append(" ], calls=");
        tr.append(Interpreter.getEnclosingInstanceStackString(scope));
        tr.append(", sp=" + this.sp + ", nw=" + this.charsWrittenOnLine);
        const s = tr.toString();
        if (this.debug) {
            this.executeTrace.add(s);
        }

        if (Interpreter.trace) {
            java.lang.System.out.println(s);
        }

    }

    protected printForTrace(tr: java.lang.StringBuilder, scope: InstanceScope, o: Object): void {
        if (o instanceof ST) {
            if ((o).impl === null) {
                tr.append("bad-template()");
            }

            else {
                tr.append(" " + (o).impl.name + "()");
            }

            return;
        }
        o = this.convertAnythingIteratableToIterator(scope, o);
        if (o instanceof java.util.Iterator) {
            const it = o as java.util.Iterator<unknown>;
            tr.append(" [");
            while (it.hasNext()) {
                const iterValue = it.next();
                this.printForTrace(tr, scope, iterValue);
            }
            tr.append(" ]");
        }
        else {
            tr.append(" " + o);
        }
    }

    /**
     * For every event, we track in overall {@link #events} list and in
     * {@code self}'s {@link InstanceScope#events} list so that each template
     * has a list of events used to create it. If {@code e} is an
     * {@link EvalTemplateEvent}, store in parent's
     * {@link InstanceScope#childEvalTemplateEvents} list for {@link STViz} tree
     * view.
     * @param scope
     * @param e
     */
    protected trackDebugEvent(scope: InstanceScope, e: InterpEvent): void {
        //      System.out.println(e);
        this.events.add(e);
        scope.events.add(e);
        if (e instanceof EvalTemplateEvent) {
            const parent = scope.parent;
            if (parent !== null) {
                // System.out.println("add eval "+e.self.getName()+" to children of "+parent.getName());
                scope.parent.childEvalTemplateEvents.add(e);
            }
        }
    }

    private renderObject<T>(scope: InstanceScope, formatString: string, o: Object, attributeType: java.lang.Class<T>): string {
        // ask the native group defining the surrounding template for the renderer
        const r = scope.st.impl.nativeGroup.getAttributeRenderer(attributeType);
        if (r !== null) {
            return r.toString(attributeType.cast(o), formatString, this.locale);
        } else {
            return o.toString();
        }
    }
}

export namespace Interpreter {
    export enum Option {
        ANCHOR = 0,
        FORMAT = 1,
        NULL = 2,
        SEPARATOR = 3,
        WRAP = 4
    };

}
