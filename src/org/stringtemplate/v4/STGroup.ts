/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-returns, jsdoc/require-param */

import * as fs from "fs";
import path from "path";

import { CharStream, CharStreams, CommonToken, CommonTokenStream, RecognitionException, Token } from "antlr4ng";

import { STGroupFile } from "./STGroupFile.js";
import { STGroupDir } from "./STGroupDir.js";
import { STErrorListener } from "./STErrorListener.js";
import { ST } from "./ST.js";
import { ModelAdaptor } from "./ModelAdaptor.js";
import { Interpreter } from "./Interpreter.js";
import { InstanceScope } from "./InstanceScope.js";
import { AttributeRenderer } from "./AttributeRenderer.js";
import { CompiledST } from "./compiler/CompiledST.js";
import { FormalArgument } from "./compiler/FormalArgument.js";
import { STException } from "./compiler/STException.js";
import { Aggregate } from "./misc/Aggregate.js";
import { AggregateModelAdaptor } from "./misc/AggregateModelAdaptor.js";
import { ErrorType } from "./misc/ErrorType.js";
import { MapModelAdaptor } from "./misc/MapModelAdaptor.js";
import { Misc } from "./misc/Misc.js";
import { ObjectModelAdaptor } from "./misc/ObjectModelAdaptor.js";
import { STModelAdaptor } from "./misc/STModelAdaptor.js";
import { TypeRegistry } from "./misc/TypeRegistry.js";
import { ErrorManager } from "./misc/ErrorManager.js";
import { Constructor } from "./reflection/IMember.js";
import { GroupParser } from "./compiler/generated/GroupParser.js";
import { Compiler } from "./compiler/Compiler.js";
import { GroupLexer } from "./compiler/generated/GroupLexer.js";

/**
 * A directory or directory tree of {@code .st} template files and/or group files.
 *  Individual template files contain formal template definitions. In a sense,
 *  it's like a single group file broken into multiple files, one for each template.
 *  ST v3 had just the pure template inside, not the template name and header.
 *  Name inside must match filename (minus suffix).
 */
export class STGroup {
    public static readonly GROUP_FILE_EXTENSION = ".stg";
    public static readonly TEMPLATE_FILE_EXTENSION = ".st";

    /** When we use key as a value in a dictionary, this is how we signify. */
    public static readonly DICT_KEY = "key";
    public static readonly DEFAULT_KEY = "default";

    public static readonly DEFAULT_ERR_MGR = new ErrorManager();

    /** Watch loading of groups and templates. */
    public static verbose = false;

    /**
     * For debugging with `STViz`. Records where in code an {@link ST} was
     * created and where code added attributes.
     */
    public static trackCreationEvents = false;

    public static defaultGroup = new STGroup();

    /**
     * Used to indicate that the template doesn't exist.
     *  Prevents duplicate group file loads and unnecessary file checks.
     */
    protected static readonly NOT_FOUND_ST = new CompiledST();

    /** The encoding to use for loading files. Defaults to UTF-8. */
    public encoding = "utf-8";

    public delimiterStartChar = "<"; // Use <expr> by default
    public delimiterStopChar = ">";

    /**
     * v3 compatibility; used to iterate across {@link Map#values()} instead of
     *  v4's default {@link Map#keySet()}.
     *  But to convert ANTLR templates, it's too hard to find without
     *  static typing in templates.
     */
    public iterateAcrossValues = false;

    /**
     * The {@link ErrorManager} for entire group; all compilations and executions.
     *  This gets copied to parsers, walkers, and interpreters.
     */
    public errMgr = STGroup.DEFAULT_ERR_MGR;

    /**
     * Every group can import templates/dictionaries from other groups.
     *  The list must be synchronized (see {@link STGroup#importTemplates}).
     */
    public readonly imports = new Array<STGroup>();

    protected readonly importsToClearOnUnload = new Array<STGroup>();

    /** Maps template name to {@link CompiledST} object. This map is synchronized. */
    protected templates = new Map<string, CompiledST>();

    /**
     * Maps dictionary names to {@link Map} objects representing the dictionaries
     *  defined by the user like {@code typeInitMap ::= ["int":"0"]}.
     */
    protected dictionaries = new Map<string, Map<string, unknown>>();

    /**
     * A dictionary that allows people to register a renderer for
     *  a particular kind of object for any template evaluated relative to this
     *  group.  For example, a date should be formatted differently depending
     *  on the locale.  You can set {@code Date.class} to an object whose
     *  {@code toString(Object)} method properly formats a {@link Date} attribute
     *  according to locale.  Or you can have a different renderer object
     *  for each locale.
     *  <p>
     *  Order of addition is recorded and matters.  If more than one
     *  renderer works for an object, the first registered has priority.</p>
     *  <p>
     *  Renderer associated with type {@code t} works for object {@code o} if</p>
     *  <pre>
     *  t.isAssignableFrom(o.getClass()) // would assignment t = o work?
     *  </pre>
     *  So it works if {@code o} is subclass or implements {@code t}.
     *  <p>
     *  This structure is synchronized.</p>
     */
    protected renderers = new TypeRegistry<Constructor, AttributeRenderer<unknown>>();

    /**
     * A dictionary that allows people to register a model adaptor for
     *  a particular kind of object (subclass or implementation). Applies
     *  for any template evaluated relative to this group.
     * <p>
     *  ST initializes with model adaptors that know how to pull
     *  properties out of {@link Object}s, {@link Map}s, and {@link ST}s.</p>
     * <p>
     *  The last one you register gets priority; do least to most specific.</p>
     */
    protected readonly adaptors: Map<Constructor, ModelAdaptor<unknown>>;

    static #reservedCharsPattern = /[a-zA-Z0-9@\-_[\]]/;

    public constructor(delimiterStartChar?: string, delimiterStopChar?: string) {
        if (delimiterStartChar) {
            this.delimiterStartChar = delimiterStartChar;
        }

        if (delimiterStopChar) {
            this.delimiterStopChar = delimiterStopChar;
        }

        const registry = new TypeRegistry<Constructor, ModelAdaptor<Object>>();
        registry.put(Object, new ObjectModelAdaptor());
        registry.put(ST, new STModelAdaptor());
        registry.put(Map, new MapModelAdaptor());
        registry.put(Aggregate, new AggregateModelAdaptor());
        this.adaptors = registry;
    }

    /**
     * Determines if a specified character may be used as a user-specified delimiter.
     *
     * @param c The character
     * @returns `true` if the character is reserved by the StringTemplate
     * language; otherwise, {@code false} if the character may be used as a
     * delimiter.
     *
     * @since 4.0.9
     */
    public static isReservedCharacter(c: string): boolean {
        return c.match(STGroup.#reservedCharsPattern) !== null;
    }

    /**
     * The {@code "foo"} of {@code t() ::= "<@foo()>"} is mangled to
     *  {@code "/region__/t__foo"}
     */
    public static getMangledRegionName(enclosingTemplateName: string,
        name: string): string {
        if (enclosingTemplateName.charAt(0) !== "/") {
            enclosingTemplateName = "/" + enclosingTemplateName;
        }

        return "/region__" + enclosingTemplateName + "__" + name;
    }

    /**
     * Return {@code "t.foo"} from {@code "/region__/t__foo"}
     */
    public static getUnMangledTemplateName(mangledName: string): string {
        const t = mangledName.substring("/region__".length,
            mangledName.lastIndexOf("__"));
        const r = mangledName.substring(mangledName.lastIndexOf("__") + 2,
            mangledName.length);

        return t + "." + r;
    }

    /**
     * The primary means of getting an instance of a template from this
     *  group. Names must be absolute, fully-qualified names like {@code /a/b}.
     */
    public getInstanceOf(name: string): ST | undefined {
        if (STGroup.verbose) {
            console.log(this.constructor.name + ".getInstanceOf(" + name + ")");
        }

        if (name.length === 0) {
            return undefined;
        }

        if (name[0] !== "/") {
            name = "/" + name;
        }

        const c = this.lookupTemplate(name);
        if (c) {
            return this.createStringTemplate(c);
        }

        return undefined;
    }

    /**
     * Create singleton template for use with dictionary values.
     */
    public createSingleton(templateToken: Token): ST {
        let template: string;
        if (templateToken.type === GroupParser.BIGSTRING || templateToken.type === GroupParser.BIGSTRING_NO_NL) {
            template = templateToken.text!.substring(2);
        } else {
            template = templateToken.text!.substring(1);
        }

        const impl = this.compile(this.getFileName(), undefined, undefined, template, templateToken)!;
        const st = this.createStringTemplateInternally(impl);
        st.groupThatCreatedThisInstance = this;
        st.impl!.hasFormalArgs = false;
        st.impl!.name = ST.UNKNOWN_NAME;
        st.impl!.defineImplicitlyDefinedTemplates(this);

        return st;
    }

    /**
     * Is this template defined in this group or from this group below?
     *  Names must be absolute, fully-qualified names like {@code /a/b}.
     */
    public isDefined(name: string): boolean {
        return this.lookupTemplate(name) !== null;
    }

    /**
     * Look up a fully-qualified name.
     */
    public lookupTemplate(name: string): CompiledST | undefined {
        if (name.length === 0) {
            return undefined;
        }

        if (name[0] !== "/") {
            name = "/" + name;
        }

        if (STGroup.verbose) {
            console.log(this.getName() + ".lookupTemplate(" + name + ")");
        }

        let code = this.rawGetTemplate(name);
        if (code === STGroup.NOT_FOUND_ST) {
            if (STGroup.verbose) {
                console.log(name + " previously seen as not found");
            }

            return undefined;
        }

        // try to load from disk and look up again
        if (!code) {
            code = this.load(name);
        }

        if (!code) {
            code = this.lookupImportedTemplate(name);
        }

        if (!code) {
            if (STGroup.verbose) {
                console.log(name + " recorded not found");
            }

            this.templates.set(name, STGroup.NOT_FOUND_ST);
        }

        if (STGroup.verbose) {
            if (code) {
                console.log(this.getName() + ".lookupTemplate(" + name + ") found");
            }
        }

        return code;
    }

    /**
     * Unload all templates, dictionaries and import relationships, but leave
     * renderers and adaptors. This essentially forces the next call to
     * {@link #getInstanceOf} to reload templates. Call {@code unload()} on each
     * group in the {@link #imports} list, and remove all elements in
     * {@link #importsToClearOnUnload} from {@link #imports}.
     */
    public unload(): void {
        this.templates.clear();
        this.dictionaries.clear();
        for (const imp of this.imports) {
            imp.unload();
        }

        // Remove the imports marked as clear-on-unload.
        for (const imp of this.importsToClearOnUnload) {
            const index = this.imports.indexOf(imp);
            if (index >= 0) {
                this.imports.splice(index, 1);
            }
        }

        this.importsToClearOnUnload.length = 0;
    }

    /**
     * Load st from disk if directory or load whole group file if .stg file (then
     *  return just one template). {@code name} is fully-qualified.
     */
    public load(): void;
    public load(name: string): CompiledST | undefined;
    public load(name?: string): CompiledST | undefined | void {
        // Force a load if it makes sense for the group, if no name is given.
        if (name) {
            return undefined;
        }
    }

    public rawGetTemplate(name: string): CompiledST | undefined {
        return this.templates.get(name);
    }

    public rawGetDictionary(name: string): Map<string, unknown> | undefined {
        return this.dictionaries.get(name);
    }

    public isDictionary(name: string): boolean {
        return this.dictionaries.get(name) !== undefined;
    }

    /** for testing */
    public defineTemplate(templateName: string, template: string): CompiledST;
    public defineTemplate(name: string, argsS: string, template: string): CompiledST;
    public defineTemplate(fullyQualifiedTemplateName: string, nameT: Token, args: FormalArgument[], template: string,
        templateToken: Token): CompiledST;
    public defineTemplate(...args: unknown[]): CompiledST | undefined {
        let fullyQualifiedTemplateName;
        let nameT;
        let compileArgs;
        let template;
        let templateToken;

        switch (args.length) {
            case 2: {
                fullyQualifiedTemplateName = args[0] as string;
                template = args[1] as string;

                if (!fullyQualifiedTemplateName.startsWith("/")) {
                    fullyQualifiedTemplateName = "/" + fullyQualifiedTemplateName;
                }

                nameT = new CommonToken([null, null], GroupParser.ID, 0, -1, -1);
                nameT.text = fullyQualifiedTemplateName;
                break;
            }

            case 3: {
                fullyQualifiedTemplateName = args[0] as string;
                const argsS = args[1] as string;
                template = args[2] as string;

                if (fullyQualifiedTemplateName.charAt(0) !== "/") {
                    fullyQualifiedTemplateName = "/" + fullyQualifiedTemplateName;
                }

                const list = argsS.split(",");
                const compileArgs = new Array<FormalArgument>();
                for (const entry of list) {
                    compileArgs.push(new FormalArgument(entry));
                }

                nameT = new CommonToken([null, null], GroupParser.ID, 0, -1, -1);
                nameT.text = fullyQualifiedTemplateName;

                break;
            }

            case 5: {
                [fullyQualifiedTemplateName, nameT, args, template, templateToken] =
                    args as [string, Token, FormalArgument[], string, Token];

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }

        if (STGroup.verbose) {
            console.log("defineTemplate(" + fullyQualifiedTemplateName + ")");
        }

        if (fullyQualifiedTemplateName.length === 0) {
            throw new Error("empty template name");
        }

        if (fullyQualifiedTemplateName.indexOf(".") >= 0) {
            throw new Error("cannot have '.' in template names");
        }

        template = Misc.trimOneStartingNewline(template);
        template = Misc.trimOneTrailingNewline(template);

        // compile, passing in templateName as enclosing name for any embedded regions
        const code = this.compile(this.getFileName(), fullyQualifiedTemplateName, compileArgs, template, templateToken);
        if (code) {
            code.name = fullyQualifiedTemplateName;
            this.rawDefineTemplate(fullyQualifiedTemplateName, code, nameT);
            code.defineArgDefaultValueTemplates(this);
            code.defineImplicitlyDefinedTemplates(this); // define any anonymous sub templates
        }

        return code;
    }

    /**
     * Make name and alias for target.  Replace any previous definition of name.
     */
    public defineTemplateAlias(aliasT: Token, targetT: Token): CompiledST | undefined {
        const alias = aliasT.text!;
        const target = targetT.text!;
        const targetCode = this.rawGetTemplate("/" + target);
        if (!targetCode) {
            this.errMgr.compileTimeError(ErrorType.ALIAS_TARGET_UNDEFINED, undefined, aliasT, alias, target);

            return undefined;
        }

        this.rawDefineTemplate("/" + alias, targetCode, aliasT);

        return targetCode;
    }

    public defineRegion(enclosingTemplateName: string, regionT: Token, template: string,
        templateToken: Token): CompiledST {
        const name = regionT.text!;
        template = Misc.trimOneStartingNewline(template);
        template = Misc.trimOneTrailingNewline(template);
        const code = this.compile(this.getFileName(), enclosingTemplateName, undefined, template, templateToken);
        const mangled = STGroup.getMangledRegionName(enclosingTemplateName, name);

        if (!this.lookupTemplate(mangled)) {
            this.errMgr.compileTimeError(ErrorType.NO_SUCH_REGION, templateToken, regionT, enclosingTemplateName, name);

            return new CompiledST();
        }

        if (code) {
            code.name = mangled;
            code.isRegion = true;
            code.regionDefType = ST.RegionType.EXPLICIT;
            code.templateDefStartToken = regionT;

            this.rawDefineTemplate(mangled, code, regionT);
            code.defineArgDefaultValueTemplates(this);
            code.defineImplicitlyDefinedTemplates(this);

            return code;
        }

        // We arrive here if there was a problem parsing or compiling the region.
        return new CompiledST();
    }

    public defineTemplateOrRegion(
        fullyQualifiedTemplateName: string,
        regionSurroundingTemplateName: string,
        templateToken: Token,
        template: string,
        nameToken: Token,
        args: FormalArgument[]): void {
        try {
            if (regionSurroundingTemplateName !== null) {
                this.defineRegion(regionSurroundingTemplateName, nameToken, template, templateToken);
            }
            else {
                this.defineTemplate(fullyQualifiedTemplateName, nameToken, args, template, templateToken);
            }
        } catch (e) {
            if (e instanceof STException) {
                // after getting syntax error in a template, we emit msg
                // and throw exception to blast all the way out to here.
            } else {
                throw e;
            }
        }
    }

    public rawDefineTemplate(name: string, code: CompiledST, defT?: Token): void {
        const prev = this.rawGetTemplate(name);
        if (prev) {
            if (!prev.isRegion) {
                this.errMgr.compileTimeError(ErrorType.TEMPLATE_REDEFINITION, undefined, defT);

                return;
            } else {
                if (code.regionDefType !== ST.RegionType.IMPLICIT &&
                    prev.regionDefType === ST.RegionType.EMBEDDED) {
                    this.errMgr.compileTimeError(ErrorType.EMBEDDED_REGION_REDEFINITION, undefined, defT,
                        STGroup.getUnMangledTemplateName(name));

                    return;
                } else {
                    if (code.regionDefType === ST.RegionType.IMPLICIT ||
                        prev.regionDefType === ST.RegionType.EXPLICIT) {
                        this.errMgr.compileTimeError(ErrorType.REGION_REDEFINITION, undefined, defT,
                            STGroup.getUnMangledTemplateName(name));

                        return;
                    }
                }

            }
        }
        code.nativeGroup = this;
        code.templateDefStartToken = defT;
        this.templates.set(name, code);
    }

    public undefineTemplate(name: string): void {
        this.templates.delete(name);
    };

    /**
     * Compile a template.
     */
    public compile(srcName: string,
        name: string | undefined,
        args: FormalArgument[] | undefined,
        template: string,
        templateToken: Token | undefined): CompiledST | undefined { // for error location
        const c = new Compiler(this);

        return c.compile({ srcName, name, args, template, templateToken });
    }

    /**
     * Define a map for this group.
     * <p>
     * Not thread safe...do not keep adding these while you reference them.</p>
     */
    public defineDictionary(name: string, mapping: Map<string, unknown>): void {
        this.dictionaries.set(name, mapping);
    };

    /**
     * Make this group import templates/dictionaries from {@code g}.
     *<p>
     * On unload imported templates are unloaded but stay in the {@link #imports} list.</p>
     */
    public importTemplates(g: STGroup): void;
    /**
     * Import template files, directories, and group files.
     *  Priority is given to templates defined in the current group;
     *  this, in effect, provides inheritance. Polymorphism is in effect so
     *  that if an inherited template references template {@code t()} then we
     *  search for {@code t()} in the subgroup first.
     *  <p>
     *  Templates are loaded on-demand from import dirs.  Imported groups are
     *  loaded on-demand when searching for a template.</p>
     *  <p>
     *  The listener of this group is passed to the import group so errors
     *  found while loading imported element are sent to listener of this group.</p>
     *  <p>
     *  On unload imported templates are unloaded and removed from the imports
     *  list.</p>
     *  <p>
     *  This method is called when processing import statements specified in
     *  group files. Use {@link #importTemplates(STGroup)} to import templates
     *  'programmatically'.</p>
     */
    public importTemplates(fileNameToken: Token): void;
    public importTemplates(g: STGroup, clearOnUnload: boolean): void;
    public importTemplates(...args: unknown[]): void {
        let g;
        let clearOnUnload;

        switch (args.length) {
            case 1: {
                if (args[0] instanceof STGroup) {
                    g = args[0];
                    clearOnUnload = true;
                } else {
                    const [fileNameToken] = args as [Token];

                    if (STGroup.verbose) {
                        console.log("importTemplates(" + fileNameToken.text + ")");
                    }

                    let fileName = fileNameToken.text;

                    // do nothing upon syntax error
                    if (!fileName || fileName === "<missing STRING>") {
                        return;
                    }

                    fileName = fileName.substring(1);

                    const isGroupFile = fileName.endsWith(STGroup.GROUP_FILE_EXTENSION);
                    const isTemplateFile = fileName.endsWith(STGroup.TEMPLATE_FILE_EXTENSION);
                    const isGroupDir = !(isGroupFile || isTemplateFile);

                    // Search path is: working dir, g.stg's dir, CLASSPATH.
                    const thisRoot = this.getRootDir();
                    let fileUnderRoot: string;

                    if (path.isAbsolute(fileName)) {
                        fileUnderRoot = fileName;
                    } else {
                        fileUnderRoot = path.join(thisRoot, fileName);
                    }

                    if (isTemplateFile) {
                        g = new STGroup(this.delimiterStartChar, this.delimiterStopChar);
                        g.setListener(this.getListener());
                        let fileURL = "";
                        if (fs.existsSync(fileUnderRoot)) {
                            fileURL = fileUnderRoot;
                        }

                        if (fileURL) {
                            const content = fs.readFileSync(fileURL, { encoding: this.encoding as BufferEncoding });
                            const templateStream = CharStreams.fromString(content);
                            templateStream.name = fileName;
                            const code = g.loadTemplateFile("/", fileName, templateStream);
                            if (!code) {
                                g = undefined;
                            }
                        }
                    } else {
                        if (isGroupFile) {
                            if (fs.existsSync(fileUnderRoot)) {
                                g = new STGroupFile(fileUnderRoot, this.encoding, this.delimiterStartChar,
                                    this.delimiterStopChar);
                                g.setListener(this.getListener());
                            } else {
                                g = new STGroupFile(fileName, this.delimiterStartChar, this.delimiterStopChar);
                                g.setListener(this.getListener());
                            }
                        } else {
                            if (isGroupDir) {
                                if (fs.existsSync(fileUnderRoot)) {
                                    g = new STGroupDir(fileUnderRoot, this.encoding, this.delimiterStartChar,
                                        this.delimiterStopChar);
                                    g.setListener(this.getListener());
                                } else {
                                    // try in CLASSPATH
                                    g = new STGroupDir(fileName, this.delimiterStartChar, this.delimiterStopChar);
                                    g.setListener(this.getListener());
                                }
                            }
                        }

                    }

                    if (!g) {
                        this.errMgr.compileTimeError(ErrorType.CANT_IMPORT, undefined, fileNameToken, fileName);

                        return;
                    } else {
                        clearOnUnload = true;
                    }
                }

                break;
            }

            case 2: {
                [g, clearOnUnload] = args as [STGroup, boolean];

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }

        if (g) {
            this.imports.push(g);
            if (clearOnUnload) {
                this.importsToClearOnUnload.push(g);
            }
        }
    }

    public getImportedGroups(): STGroup[] {
        return this.imports;
    };

    /**
     * Load a group file with full path {@code fileName}; it's relative to root by {@code prefix}.
     */
    public loadGroupFile(prefix: string, fileName: string): void {
        if (STGroup.verbose) {
            console.log(this.constructor.name + ".loadGroupFile(group-file-prefix=" + prefix + ", fileName=" +
                fileName + ")");
        }

        let parser: GroupParser;
        try {
            const content = fs.readFileSync(fileName, { encoding: this.encoding as BufferEncoding });
            const stream = CharStreams.fromString(content.toString());
            const lexer = new GroupLexer(stream);
            const tokens = new CommonTokenStream(lexer);
            parser = new GroupParser(tokens);
            parser.group(this, prefix);
        } catch (e) {
            if (e instanceof Error) {
                this.errMgr.iOError(undefined, ErrorType.CANT_LOAD_GROUP_FILE, e, fileName);
            } else {
                throw e;
            }
        }
    }

    /**
     * Load template file into this group using absolute {@code fileName}.
     */
    public loadAbsoluteTemplateFile(fileName: string): CompiledST | undefined {
        const content = fs.readFileSync(fileName, { encoding: this.encoding as BufferEncoding });
        const stream = CharStreams.fromString(content.toString());

        return this.loadTemplateFile("", fileName, stream);
    }

    /**
     * Load template stream into this group. {@code unqualifiedFileName} is
     *  {@code "a.st"}. The {@code prefix} is path from group root to
     *  {@code unqualifiedFileName} like {@code "/subdir"} if file is in
     *  {@code /subdir/a.st}.
     */
    public loadTemplateFile(prefix: string, unqualifiedFileName: string,
        templateStream: CharStream): CompiledST | undefined {
        const lexer = new GroupLexer(templateStream);
        const tokens = new CommonTokenStream(lexer);
        const parser = new GroupParser(tokens);
        parser.currentGroup = this;
        lexer.currentGroup = this;

        try {
            parser.templateDef(prefix);
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.errMgr.groupSyntaxError(ErrorType.SYNTAX_ERROR, unqualifiedFileName, re, re.message);
            } else {
                throw re;
            }
        }

        let templateName = Misc.getFileNameNoSuffix(unqualifiedFileName);
        if (prefix.length > 0) {
            templateName = prefix + templateName;
        }

        const impl = this.rawGetTemplate(templateName);
        if (impl) {
            impl.prefix = prefix;

            return impl;
        }

        return undefined;
    }

    /**
     * Add an adaptor for a kind of object so ST knows how to pull properties
     * from them. Add adaptors in increasing order of specificity. ST adds
     * {@link Object}, {@link Map}, {@link ST}, and {@link Aggregate} model
     * adaptors for you first. Adaptors you add have priority over default
     * adaptors.
     * <p>
     * If an adaptor for type {@code T} already exists, it is replaced by the
     * {@code adaptor} argument.</p>
     * <p>
     * This must invalidate cache entries, so set your adaptors up before
     * calling {@link ST#render} for efficiency.</p>
     */
    public registerModelAdaptor<T>(attributeType: Constructor<T>, adaptor: ModelAdaptor<T>): void {
        this.adaptors.set(attributeType, adaptor);
    }

    public getModelAdaptor<T>(attributeType: Constructor<T>): ModelAdaptor<T> {
        return this.adaptors.get(attributeType) as ModelAdaptor<T>;
    };

    /**
     * Register a renderer for all objects of a particular "kind" for all
     *  templates evaluated relative to this group.  Use {@code r} to render if
     *  object in question is an instance of {@code attributeType}.  Recursively
     *  set renderer into all import groups.
     */
    public registerRenderer<T>(attributeType: Constructor<T>, r: AttributeRenderer<T>, recursive?: boolean): void {
        this.renderers.set(attributeType, r);

        if (recursive) {
            this.load(); // make sure imports exist (recursively)
            for (const g of this.imports) {
                g.registerRenderer(attributeType, r, true);
            }
        }
    }

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
    public getAttributeRenderer<T>(attributeType: Constructor<T>): AttributeRenderer<T> | undefined {
        if (!this.renderers) {
            return undefined;
        }

        return this.renderers.get(attributeType);
    }

    public createStringTemplate(impl: CompiledST): ST {
        const st = new ST();
        st.impl = impl;
        st.groupThatCreatedThisInstance = this;
        if (impl.formalArguments !== null) {
            st.locals = new Array<Object>(impl.formalArguments.size);
            st.locals.fill(ST.EMPTY_ATTR);
        }

        return st;
    }

    /**
     * Differentiate so we can avoid having creation events for regions,
     *  map operations, and other implicit "new ST" events during rendering.
     */
    public createStringTemplateInternally(implOrProto: CompiledST | ST): ST {
        if (implOrProto instanceof CompiledST) {
            const st = this.createStringTemplate(implOrProto);
            if (STGroup.trackCreationEvents && st.debugState) {
                st.debugState.newSTEvent = undefined; // toss it out
            }

            return st;
        }

        return new ST(implOrProto); // no need to wack debugState; not set in ST(proto).
    }

    public getName(): string {
        return "<no name>;";
    }

    public getFileName(): string {
        return "";
    }

    /**
     * Return root dir if this is group dir; return dir containing group file
     *  if this is group file.  This is derived from original incoming
     *  dir or filename.  If it was absolute, this should come back
     *  as full absolute path.  If only a URL is available, return URL of
     *  one dir up.
     */
    public getRootDir(): string {
        return "";
    }

    public toString(): string {
        return this.getName();
    }

    public show(): string {
        let buf = "";
        if (this.imports.length > 0) {
            buf += " : " + this.imports;
        }

        for (let name of this.templates.keys()) {
            const c = this.rawGetTemplate(name);
            if (!c || c.isAnonSubtemplate || c === STGroup.NOT_FOUND_ST) {
                continue;
            }

            const slash = name.lastIndexOf("/");
            name = name.substring(slash + 1, name.length);
            buf += name;
            buf += "(";
            if (c.formalArguments) {
                buf += [...c.formalArguments.values()].join(",");
            }

            buf += ")";
            buf += " ::= <<" + Misc.newLine;
            buf += c.template + Misc.newLine;
            buf += ">>" + Misc.newLine;
        }

        return buf;
    }

    public getListener(): STErrorListener {
        return this.errMgr.listener;
    }

    public setListener(listener: STErrorListener): void {
        this.errMgr = new ErrorManager(listener);
    }

    public getTemplateNames(): Set<string> {
        this.load();
        const result = new Set<string>();
        for (const [key, value] of this.templates.entries()) {
            if (value !== STGroup.NOT_FOUND_ST) {
                result.add(key);
            }
        }

        return result;
    }

    public getEmbeddedInstanceOf(interp: Interpreter, scope: InstanceScope, name: string): ST {
        let fullyQualifiedName = name;
        if (name[0] !== "/" && scope.st) {
            fullyQualifiedName = scope.st.impl!.prefix + name;
        }

        if (STGroup.verbose) {
            console.log("getEmbeddedInstanceOf(" + fullyQualifiedName + ")");
        }

        const st = this.getInstanceOf(fullyQualifiedName);
        if (!st) {
            this.errMgr.runTimeError(interp, scope, ErrorType.NO_SUCH_TEMPLATE, fullyQualifiedName);

            return this.createStringTemplateInternally(new CompiledST());
        }

        // this is only called internally. wack any debug ST create events
        if (STGroup.trackCreationEvents && st.debugState) {
            st.debugState.newSTEvent = undefined; // toss it out
        }

        return st;
    }

    public lookupImportedTemplate(name: string): CompiledST | undefined {
        if (this.imports.length === 0) {
            return undefined;
        }

        for (const g of this.imports) {
            if (STGroup.verbose) {
                console.log("checking " + g.getName() + " for imported " + name);
            }

            const code = g.lookupTemplate(name);
            if (code) {
                if (STGroup.verbose) {
                    console.log(g.getName() + ".lookupImportedTemplate(" + name + ") found");
                }

                return code;
            }
        }

        if (STGroup.verbose) {
            console.log(name + " not found in " + this.getName() + " imports");
        }

        return undefined;
    }
}
