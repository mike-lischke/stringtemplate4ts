/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Token } from "antlr4ng";

import { TokenStreamV3 } from "../support/TokenStreamV3.js";
import { CommonTree } from "../support/CommonTree.js";
import { Interval } from "../misc/Interval.js";
import { Constructor } from "../reflection/IMember.js";
import { AttributeRenderer } from "../AttributeRenderer.js";

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
export interface IST {
    groupThatCreatedThisInstance: ISTGroup;

    /** The implementation for this template among all instances of same template . */
    impl?: ICompiledST;

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
    add(name: string, value: unknown): IST;

    /**
     * Set {@code locals} attribute value when you only know the name, not the
     *  index. This is ultimately invoked by calling {@code ST#add} from
     *  outside so toss an exception to notify them.
     */
    rawSetAttribute(name: string, value: unknown): void;
}

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
export interface IInterpreter {

}

export interface IErrorManager {
}

export interface IInterpEvent {
}

export interface IEvalTemplateEvent extends IInterpEvent {
}

export interface IInstanceScope {
    /** Template that invoked us. */
    readonly parent?: IInstanceScope;

    /** Template we're executing. */
    //readonly st?: ST;

    /** Current instruction pointer. */
    ip: number;

    /**
     * Includes the {@link EvalTemplateEvent} for this template. This is a
     * subset of {@link Interpreter#events} field. The final
     * {@link EvalTemplateEvent} is stored in 3 places:
     *
     * <ol>
     *  <li>In {@link #parent}'s {@link #childEvalTemplateEvents} list</li>
     *  <li>In this list</li>
     *  <li>In the {@link Interpreter#events} list</li>
     * </ol>
     *
     * The root ST has the final {@link EvalTemplateEvent} in its list.
     * <p>
     * All events get added to the {@link #parent}'s event list.</p>
     */
    events: IInterpEvent[];

    /**
     * All templates evaluated and embedded in this {@link ST}. Used
     *  for tree view in STViz.
     */
    childEvalTemplateEvents: IEvalTemplateEvent[];

    earlyEval: boolean;
}

/**
 * A directory or directory tree of {@code .st} template files and/or group files.
 *  Individual template files contain formal template definitions. In a sense,
 *  it's like a single group file broken into multiple files, one for each template.
 *  ST v3 had just the pure template inside, not the template name and header.
 *  Name inside must match filename (minus suffix).
 */
export interface ISTGroup {
    /**
     * Every group can import templates/dictionaries from other groups.
     *  The list must be synchronized (see {@link STGroup#importTemplates}).
     */
    readonly imports: ISTGroup[];

    /**
     * The {@link ErrorManager} for entire group; all compilations and executions.
     *  This gets copied to parsers, walkers, and interpreters.
     */
    errMgr: IErrorManager;

    rawGetDictionary(name: string): Map<string, unknown> | undefined;
    isDictionary(name: string): boolean;

    /**
     * Get renderer for class {@code T} associated with this group.
     * <p>
     *  For non-imported groups and object-to-render of class {@code T}, use renderer
     *  (if any) registered for {@code T}.  For imports, any renderer
     *  set on import group is ignored even when using an imported template.
     *  You should set the renderer on the main group
     *  you use (or all to be sure).  I look at import groups as
     *  "helpers" that should give me templates and nothing else. If you
     *  have multiple renderers for {@code String}, say, then just make uber combined
     *  renderer with more specific format names.</p>
     */
    getAttributeRenderer<T>(attributeType: Constructor<T>): AttributeRenderer<T> | undefined;

    lookupImportedTemplate(name: string): ICompiledST | undefined;

    getEmbeddedInstanceOf(interp: IInterpreter, scope: IInstanceScope, name: string): IST;

    /**
     * Differentiate so we can avoid having creation events for regions,
     *  map operations, and other implicit "new ST" events during rendering.
     */
    createStringTemplateInternally(implOrProto: ICompiledST | IST): IST;

}

/**
 * The result of compiling an {@link ST}.  Contains all the bytecode instructions,
 *  string table, bytecode address to source code map, and other bookkeeping
 *  info.  It's the implementation of an ST you might say.  All instances
 *  of the same template share a single implementation ({@link ST#impl} field).
 */
export interface ICompiledST {
    name: string;

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
    prefix: string;

    /**
     * The original, immutable pattern (not really used again after
     *  initial "compilation"). Useful for debugging.  Even for
     *  sub templates, this is entire overall template.
     */
    template: string;

    /** The token that begins template definition; could be {@code <@r>} of region. */
    templateDefStartToken?: Token;

    /** Overall token stream for template (debug only). */
    tokens?: TokenStreamV3;

    /** How do we interpret syntax of template? (debug only) */
    ast?: CommonTree;

    formalArguments: Map<string, IFormalArgument>;

    hasFormalArgs: boolean;

    numberOfArgsWithDefaultValues: number;

    /**
     * The group that physically defines this {@link ST} definition. We use it
     * to initiate interpretation via {@link ST#toString}. From there, it
     * becomes field {@link Interpreter#group} and is fixed until rendering
     * completes.
     */
    nativeGroup: ISTGroup;

    /**
     * Does this template come from a {@code <@region>...<@end>} embedded in
     *  another template?
     */
    isRegion: boolean;

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
    regionDefType: RegionType;

    isAnonSubtemplate: boolean;

    strings: string[];     // string operands of instructions
    codeSize: number;
    sourceMap: Interval[]; // maps IP to range in template pattern

    instructions: Int8Array;    // byte-addressable code memory.

    clone(): ICompiledST;

    /**
     * Used by {@link ST#add} to add args one by one without turning on full formal args definition signal.
     */
    addArg(a: IFormalArgument): void;

    defineImplicitlyDefinedTemplates(group: ISTGroup): void;
    defineArgDefaultValueTemplates(group: ISTGroup): void;

    dump(): void;
}

/**
 * Represents the name of a formal argument defined in a template:
 * <pre>
 *  test(a,b,x=defaultValue) ::= "<a> <n> <x>"
 * </pre> Each template has a set of these formal arguments or sets
 * {@link CompiledST#hasFormalArgs} to {@code false} (indicating that no
 * arguments were specified such as when we create a template with
 * {@code new ST(...)}).
 *
 * <p>
 * Note: originally, I tracked cardinality as well as the name of an attribute.
 * I'm leaving the code here as I suspect something may come of it later.
 * Currently, though, cardinality is not used.</p>
 */
export interface IFormalArgument {
    name: string;

    index: number; // which argument is it? from 0..n-1

    /** If they specified default value {@code x=y}, store the token here */
    defaultValueToken?: Token;
    defaultValue: unknown; // x="str", x=true, x=false
    compiledDefaultValue?: ICompiledST; // x={...}
}

/** Parameters for the compilation step. */
export interface ICompilerParameters {
    srcName?: string,
    name?: string,
    args?: IFormalArgument[],
    template: string,
    templateToken?: Token;
}

/** {@code <@r()>}, {@code <@r>...<@end>}, and {@code @t.r() ::= "..."} defined manually by coder */
export enum RegionType {
    /** {@code <@r()>} */
    IMPLICIT,

    /** {@code <@r>...<@end>} */
    EMBEDDED,

    /** {@code @t.r() ::= "..."} */
    EXPLICIT,
};

export const isCompiledST = (value: unknown): value is ICompiledST => {
    const candidate = value as ICompiledST;

    return (candidate !== undefined)
        && (candidate.name !== undefined)
        && (candidate.prefix !== undefined) && (candidate.template !== undefined);
};
