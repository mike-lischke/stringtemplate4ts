/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-returns, jsdoc/require-param, jsdoc/no-undefined-types */

import { STWriter } from "./STWriter.js";
import { STGroup } from "./STGroup.js";
import { STErrorListener } from "./STErrorListener.js";
import { Interpreter } from "./Interpreter.js";
import { InstanceScope } from "./InstanceScope.js";
import { AutoIndentWriter } from "./AutoIndentWriter.js";
import { FormalArgument } from "./compiler/FormalArgument.js";
import { Aggregate } from "./misc/Aggregate.js";
import { ErrorManager } from "./misc/ErrorManager.js";
import { defaultLocale } from "./support/helpers.js";
import { StringWriter } from "./support/StringWriter.js";
import { ICompiledST, IST, ISTGroup } from "./compiler/common.js";
import { Factories } from "./compiler/factories.js";

/**
 * An instance of the StringTemplate. It consists primarily of
 *  a {@link ST#impl reference} to its implementation (shared among all
 *  instances) and a hash table of {@link ST#locals attributes}.  Because
 *  of dynamic scoping, we also need a reference to any enclosing instance. For
 *  example, in a deeply nested template for an HTML page body, we could still
 *  reference the title attribute defined in the outermost page template.
 * <p>
 *  To use templates, you create one (usually via {@link STGroup}) and then inject
 *  attributes using {@link #add}. To render its attacks, use {@link ST#render()}.</p>
 * <p>
 *  TODO: {@link ST#locals} is not actually a hash table like the documentation
 *  says.</p>
 */
export class ST implements IST {
    public static readonly VERSION = "4.3.4ng";

    public static readonly UNKNOWN_NAME = "anonymous";
    public static readonly EMPTY_ATTR = {};

    /**
     * When there are no formal args for template t and you map t across
     *  some values, t implicitly gets arg "it".  E.g., "<b>$it$</b>"
     */
    public static readonly IMPLICIT_ARG_NAME = "it";

    /** The implementation for this template among all instances of same template . */
    public impl?: ICompiledST;

    /**
     * Created as instance of which group? We need this to initialize interpreter
     *  via render.  So, we create st and then it needs to know which
     *  group created it for sake of polymorphism:
     *
     *  <pre>
     *  st = skin1.getInstanceOf("searchBox");
     *  result = st.render(); // knows skin1 created it
     *  </pre>
     *
     *  Say we have a group {@code g1} with template {@code t} that imports
     *  templates {@code t} and {@code u} from another group {@code g2}.
     *  {@code g1.getInstanceOf("u")} finds {@code u} in {@code g2} but remembers
     *  that {@code g1} created it.  If {@code u} includes {@code t}, it should
     *  create {@code g1.t} not {@code g2.t}.
     *
     *  <pre>
     *   g1 = {t(), u()}
     *   |
     *   v
     *   g2 = {t()}
     *  </pre>
     */
    public groupThatCreatedThisInstance!: ISTGroup;

    /**
     * Safe to simultaneously write via {@link #add}, which is synchronized.
     *  Reading during exec is, however, NOT synchronized.  So, not thread safe
     *  to add attributes while it is being evaluated.  Initialized to
     *  {@link #EMPTY_ATTR} to distinguish {@code null} from empty.
     */
    public locals?: unknown[];

    /** Used by group creation routine, not by users */
    public constructor();
    /**
     * Used to make templates inline in code for simple things like SQL or log records.
     *  No formal arguments are set and there is no enclosing instance.
     */
    public constructor(template: string);
    /**
     * Clone a prototype template.
     *  Copy all fields minus {@link #debugState}; don't delegate to {@link #ST()},
     *  which creates {@link ConstructionEvent}.
     */
    public constructor(proto: IST);
    public constructor(group: STGroup, template: string);
    /**
     * Create ST using non-default delimiters; each one of these will live
     *  in it's own group since you're overriding a default; don't want to
     *  alter {@link STGroup#defaultGroup}.
     */
    public constructor(template: string, delimiterStartChar: string, delimiterStopChar: string);
    public constructor(...args: unknown[]) {
        if (args.length === 1 && args[0] instanceof ST) {
            const [proto] = args as [ST];

            // Because add() can fake a formal arg def, make sure to clone impl
            // entire impl so formalArguments list is cloned as well. Don't want
            // further derivations altering previous arg defs. See
            // testRedefOfKeyInCloneAfterAddingAttribute().
            this.impl = proto.impl?.clone();

            if (proto.locals) {
                this.locals = [...proto.locals];
            } else {
                if (this.impl && (this.impl.formalArguments?.size ?? 0) > 0) {
                    this.locals = new Array<Object>(this.impl.formalArguments?.size ?? 0);
                    this.locals.fill(ST.EMPTY_ATTR);
                }
            }

            this.groupThatCreatedThisInstance = proto.groupThatCreatedThisInstance;

            return;
        }

        let group;
        let template;
        if (args.length === 0) {
            return;
        }

        if (args.length === 1) {
            [template] = args as [string];
            group = STGroup.defaultGroup;
        } else if (args.length === 3) {
            const [theTemplate, delimiterStartChar, delimiterStopChar] = args as [string, string, string];
            group = new STGroup(delimiterStartChar, delimiterStopChar);
            template = theTemplate;
        } else {
            [group, template] = args as [STGroup, string];
        }

        this.groupThatCreatedThisInstance = group;
        this.impl = this.groupThatCreatedThisInstance.compile({ srcName: group.getFileName(), template })!;
        this.impl.hasFormalArgs = false;
        this.impl.name = ST.UNKNOWN_NAME;
        this.impl.defineImplicitlyDefinedTemplates(this.groupThatCreatedThisInstance);
    }

    /**
     * <pre>
     * ST.format("&lt;%1&gt;:&lt;%2&gt;", n, p);
     * </pre>
     */
    public static format(template: string, ...attributes: unknown[]): string;
    public static format(lineWidth: number, template: string, ...attributes: unknown[]): string;
    public static format(...args: unknown[]): string {
        let lineWidth;
        let template;
        let attributes;

        if (typeof args[0] === "string") {
            [template, ...attributes] = args as [string, ...unknown[]];
            lineWidth = STWriter.NO_WRAP;
        } else {
            [lineWidth, template, ...attributes] = args as [number, string, ...unknown[]];
        }

        const st = new ST(template.replaceAll(/%([0-9]+)/g, "arg$1"));
        let i = 1;
        for (const a of attributes) {
            st.add("arg" + i, a);
            i++;
        }

        return st.render(lineWidth);
    }

    protected static convertToAttributeList(currentValue: unknown): unknown[] {
        if (Array.isArray(currentValue)) {
            return currentValue;
        } else {
            return [currentValue];
        }
    }

    /**
     * Inject an attribute (name/value pair). If there is already an attribute
     *  with that name, this method turns the attribute into an
     *  {@link AttributeList} with both the previous and the new attribute as
     *  elements. This method will never alter a {@link List} that you inject.
     *  If you send in a {@link List} and then inject a single value element,
     *  {@code add} copies original list and adds the new value. The
     *  attribute name cannot be null or contain '.'.
     *  <p>
     *  Return {@code this} so we can chain:</p>
     *  <p>
     *  {@code t.add("x", 1).add("y", "hi")}</p>
     */
    public add(name: string, value: unknown): ST {
        if (name.indexOf(".") >= 0) {
            throw new Error("cannot have '.' in attribute names");
        }

        let arg;
        if (this.impl?.hasFormalArgs) {
            arg = this.impl.formalArguments?.get(name);

            if (!arg) {
                throw new Error("no such attribute: " + name);
            }
        } else {
            // define and make room in locals (a hack to make new ST("simple template") work.)
            arg = this.impl?.formalArguments?.get(name);

            if (!arg) { // not defined
                arg = new FormalArgument(name);
                this.impl!.addArg(arg);
                if (!this.locals) {
                    this.locals = [];
                } else {
                    this.locals = this.locals.slice(0, Math.min(this.locals.length,
                        this.impl!.formalArguments?.size ?? 0));
                }
                this.locals[arg.index] = ST.EMPTY_ATTR;
            }
        }

        const currentValue = this.locals![arg.index];
        if (currentValue === ST.EMPTY_ATTR) { // new attribute
            this.locals![arg.index] = value;

            return this;
        }

        // attribute will be multi-valued for sure now
        // convert current attribute to list if not already
        // copy-on-write semantics; copy a list injected by user to add new value
        const multi = ST.convertToAttributeList(currentValue);
        this.locals![arg.index] = multi; // replace with list

        // now, add incoming value to multi-valued attribute
        if (Array.isArray(value)) {
            // flatten incoming list into existing list
            multi.push(...(value as unknown[]));
        } else {
            multi.push(value);
        }

        return this;
    }

    /**
     * Split {@code aggrName.{propName1,propName2}} into list
     *  {@code [propName1, propName2]} and the {@code aggrName}. Spaces are
     *  allowed around {@code ','}.
     */
    public addAggr(aggregateSpec: string, ...values: unknown[]): ST {
        const dot = aggregateSpec.indexOf(".{");
        if (values === null || values.length === 0) {
            throw new Error("missing values for aggregate attribute format: " + aggregateSpec);
        }

        const finalCurly = aggregateSpec.indexOf("}");
        if (dot < 0 || finalCurly < 0) {
            throw new Error("invalid aggregate attribute format: " +
                aggregateSpec);
        }

        const aggregateName = aggregateSpec.substring(0, dot);
        let propString = aggregateSpec.substring(dot + 2, aggregateSpec.length - 1);
        propString = propString.trim();
        const propNames = propString.split(",");
        if (propNames.length === 0) {
            throw new Error("invalid aggregate attribute format: " + aggregateSpec);
        }

        if (values.length !== propNames.length) {
            throw new Error("number of properties and values mismatch for aggregate attribute format: " +
                aggregateSpec);
        }

        let i = 0;
        const aggregate = new Aggregate();
        for (const p of propNames) {
            const v = values[i++];
            aggregate.properties.set(p.trim(), v);
        }

        this.add(aggregateName, aggregate); // now add as usual

        return this;
    }

    /**
     * Remove an attribute value entirely (can't remove attribute definitions).
     */
    public remove(name: string): void {
        if (!this.impl?.formalArguments) {
            if (this.impl?.hasFormalArgs) {
                throw new Error("no such attribute: " + name);
            }

            return;
        }

        const arg = this.impl.formalArguments.get(name);
        if (!arg) {
            throw new Error("no such attribute: " + name);
        }

        this.locals![arg.index] = ST.EMPTY_ATTR; // reset value
    }

    /**
     * Find an attribute in this template only.
     */
    public getAttribute(name: string): unknown {
        let localArg;
        if (this.impl?.formalArguments) {
            localArg = this.impl.formalArguments.get(name);
        }

        if (localArg) {
            let o = this.locals![localArg.index];
            if (o === ST.EMPTY_ATTR) {
                o = undefined;
            }

            return o;
        }

        return undefined;
    }

    public getAttributes(): Map<string, unknown> | undefined {
        if (!this.impl?.formalArguments) {
            return undefined;
        }

        const attributes = new Map<string, unknown>();
        for (const a of this.impl.formalArguments.values()) {
            let o = this.locals![a.index];
            if (o === ST.EMPTY_ATTR) {
                o = undefined;
            }

            attributes.set(a.name, o);
        }

        return attributes;
    }

    public getName(): string {
        return this.impl?.name ?? "";
    }

    public isAnonSubtemplate(): boolean {
        return this.impl?.isAnonSubtemplate ?? false;
    }

    public write(out: STWriter): number;
    public write(out: STWriter, locale: Intl.Locale): number;
    public write(out: STWriter, listener: STErrorListener): number;
    public write(out: STWriter, locale: Intl.Locale, listener: STErrorListener): number;
    public write(...args: unknown[]): number {
        switch (args.length) {
            case 1: {
                const [out] = args as [STWriter];

                const interp = new Interpreter(this.groupThatCreatedThisInstance, this.impl!.nativeGroup.errMgr);
                const scope = new InstanceScope(undefined, this);

                return interp.exec(out, scope);
            }

            case 2: {
                if (args[1] instanceof Intl.Locale) {
                    const [out, locale] = args as [STWriter, Intl.Locale];

                    const interp = new Interpreter(this.groupThatCreatedThisInstance, locale,
                        this.impl!.nativeGroup.errMgr);
                    const scope = new InstanceScope(undefined, this);

                    return interp.exec(out, scope);
                } else {
                    const [out, listener] = args as [STWriter, STErrorListener];

                    const interp = new Interpreter(this.groupThatCreatedThisInstance, new ErrorManager(listener));
                    const scope = new InstanceScope(undefined, this);

                    return interp.exec(out, scope);
                }
            }

            case 3: {
                const [out, locale, listener] = args as [STWriter, Intl.Locale, STErrorListener];

                const interp = new Interpreter(this.groupThatCreatedThisInstance, locale, new ErrorManager(listener));
                const scope = new InstanceScope(undefined, this);

                return interp.exec(out, scope);
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }
    }

    public render(lineWidth?: number): string;
    public render(locale: Intl.Locale, lineWidth?: number): string;
    public render(...args: unknown[]): string {
        let locale;
        let lineWidth;
        switch (args.length) {
            case 0: {
                locale = defaultLocale();
                lineWidth = STWriter.NO_WRAP;

                break;
            }

            case 1: {
                if (args[0] instanceof Intl.Locale) {
                    [locale] = args as [Intl.Locale];
                    lineWidth = STWriter.NO_WRAP;
                } else {
                    locale = defaultLocale();
                    [lineWidth] = args as [number];
                }

                break;
            }

            case 2: {
                [locale, lineWidth] = args as [Intl.Locale, number];

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }

        const out = new StringWriter();
        const wr = new AutoIndentWriter(out);
        wr.setLineWidth(lineWidth);
        this.write(wr, locale);

        return out.toString();
    }

    // TESTING SUPPORT

    public toString(): string {
        if (!this.impl) {
            return "bad-template()";
        }

        let name = this.impl.name + "()";
        if (this.impl.isRegion) {
            name = "@" + STGroup.getUnMangledTemplateName(name);
        }

        return name;
    }

    /**
     * Set {@code locals} attribute value when you only know the name, not the
     *  index. This is ultimately invoked by calling {@code ST#add} from
     *  outside so toss an exception to notify them.
     */
    public rawSetAttribute(name: string, value: unknown): void {
        if (!this.impl?.formalArguments) {
            throw new Error("no such attribute: " + name);
        }

        const arg = this.impl.formalArguments.get(name);
        if (!arg) {
            throw new Error("no such attribute: " + name);
        }

        this.locals![arg.index] = value;
    }

    static {
        // Register string template factories for use by other modules.

        Factories.createStringTemplate = ((group: ISTGroup, impl?: ICompiledST): IST => {
            const st = new ST();
            st.impl = impl;
            st.groupThatCreatedThisInstance = group;
            if (impl?.formalArguments) {
                st.locals = new Array<Object>(impl.formalArguments.size);
                st.locals.fill(ST.EMPTY_ATTR);
            }

            return st;
        });

        Factories.cloneStringTemplate = ((prototype?: IST): IST => {
            if (prototype) {
                return new ST(prototype);
            }

            return new ST();
        });
    }
}
