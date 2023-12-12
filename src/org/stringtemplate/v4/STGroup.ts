/*
 * [The "BSD license"]
 *  Copyright (c) 2011 Terence Parr
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



import { java, JavaObject, type char, type int, S } from "jree";
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

type String = java.lang.String;
const String = java.lang.String;
type List<E> = java.util.List<E>;
type Collections = java.util.Collections;
const Collections = java.util.Collections;
type ArrayList<E> = java.util.ArrayList<E>;
const ArrayList = java.util.ArrayList;
type Map<K,​V> = java.util.Map<K,​V>;
type LinkedHashMap<K,​V> = java.util.LinkedHashMap<K,​V>;
const LinkedHashMap = java.util.LinkedHashMap;
type HashMap<K,​V> = java.util.HashMap<K,​V>;
const HashMap = java.util.HashMap;
type Class<T> = java.lang.Class<T>;
const Class = java.lang.Class;
type System = java.lang.System;
const System = java.lang.System;
type IllegalArgumentException = java.lang.IllegalArgumentException;
const IllegalArgumentException = java.lang.IllegalArgumentException;
type Compiler = java.lang.Compiler;
const Compiler = java.lang.Compiler;
type URL = java.net.URL;
const URL = java.net.URL;
type MalformedURLException = java.net.MalformedURLException;
const MalformedURLException = java.net.MalformedURLException;
type InputStream = java.io.InputStream;
const InputStream = java.io.InputStream;
type IOException = java.io.IOException;
const IOException = java.io.IOException;
type Exception = java.lang.Exception;
const Exception = java.lang.Exception;
type Arrays = java.util.Arrays;
const Arrays = java.util.Arrays;
type ClassLoader = java.lang.ClassLoader;
const ClassLoader = java.lang.ClassLoader;
type Thread = java.lang.Thread;
const Thread = java.lang.Thread;
type StringBuilder = java.lang.StringBuilder;
const StringBuilder = java.lang.StringBuilder;
type Set<E> = java.util.Set<E>;
type HashSet<E> = java.util.HashSet<E>;
const HashSet = java.util.HashSet;



/** A directory or directory tree of {@code .st} template files and/or group files.
 *  Individual template files contain formal template definitions. In a sense,
 *  it's like a single group file broken into multiple files, one for each template.
 *  ST v3 had just the pure template inside, not the template name and header.
 *  Name inside must match filename (minus suffix).
 */
export  class STGroup extends JavaObject {
    public static readonly  GROUP_FILE_EXTENSION:  String;
    public static readonly  TEMPLATE_FILE_EXTENSION:  String;

    /** When we use key as a value in a dictionary, this is how we signify. */
    public static readonly  DICT_KEY = "key";
    public static readonly  DEFAULT_KEY = "default";

    public static readonly  DEFAULT_ERR_MGR = new  java.util.logging.ErrorManager();

    /** Watch loading of groups and templates. */
    public static  verbose = false;

    /**
     * For debugging with {@link STViz}. Records where in code an {@link ST} was
     * created and where code added attributes.
     */
    public static  trackCreationEvents = false;

    public static  defaultGroup = new  STGroup();

    /** Used to indicate that the template doesn't exist.
     *  Prevents duplicate group file loads and unnecessary file checks.
     */
    protected static readonly  NOT_FOUND_ST = new  CompiledST();

    private static readonly  RESERVED_CHARACTERS = new  boolean[](127);

    /** The encoding to use for loading files. Defaults to UTF-8. */
    public  encoding = "UTF-8";

    public  delimiterStartChar = '<'; // Use <expr> by default
    public  delimiterStopChar = '>';

    /** v3 compatibility; used to iterate across {@link Map#values()} instead of
     *  v4's default {@link Map#keySet()}.
     *  But to convert ANTLR templates, it's too hard to find without
     *  static typing in templates.
     */
    public  iterateAcrossValues = false;

    /** The {@link ErrorManager} for entire group; all compilations and executions.
     *  This gets copied to parsers, walkers, and interpreters.
     */
    public  errMgr = STGroup.DEFAULT_ERR_MGR;

    /** Every group can import templates/dictionaries from other groups.
     *  The list must be synchronized (see {@link STGroup#importTemplates}).
     */
    protected readonly  imports = Collections.synchronizedList(new  ArrayList<STGroup>());

    protected readonly  importsToClearOnUnload = Collections.synchronizedList(new  ArrayList<STGroup>());

    /** Maps template name to {@link CompiledST} object. This map is synchronized. */
    protected  templates =
        Collections.synchronizedMap(new  LinkedHashMap<String, CompiledST>());

    /** Maps dictionary names to {@link Map} objects representing the dictionaries
     *  defined by the user like {@code typeInitMap ::= ["int":"0"]}.
     */
    protected  dictionaries =
        Collections.synchronizedMap(new  HashMap<String, Map<String,java.lang.Object>>());

    /** A dictionary that allows people to register a renderer for
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
    protected  renderers:  Map<Class<unknown>, AttributeRenderer<unknown>>;

    /** A dictionary that allows people to register a model adaptor for
     *  a particular kind of object (subclass or implementation). Applies
     *  for any template evaluated relative to this group.
     * <p>
     *  ST initializes with model adaptors that know how to pull
     *  properties out of {@link Object}s, {@link Map}s, and {@link ST}s.</p>
     * <p>
     *  The last one you register gets priority; do least to most specific.</p>
     */
    protected readonly  adaptors:  Map<Class<unknown>, ModelAdaptor<unknown>>;

    public  constructor();

    public  constructor(delimiterStartChar: char, delimiterStopChar: char);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {
 super();


				break;
			}

			case 2: {
				const [delimiterStartChar, delimiterStopChar] = args as [char, char];


        super();
this.delimiterStartChar = delimiterStartChar;
        this.delimiterStopChar = delimiterStopChar;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}

        let  registry = new  TypeRegistry<ModelAdaptor<unknown>>();
        registry.put(java.lang.Object.class, new  ObjectModelAdaptor<java.lang.Object>());
        registry.put(ST.class, new  STModelAdaptor());
        registry.put(Map.class, new  MapModelAdaptor());
        registry.put(Aggregate.class, new  AggregateModelAdaptor());
        this.adaptors = Collections.synchronizedMap(registry);
    
	}


    /**
     * Determines if a specified character may be used as a user-specified delimiter.
     *
     * @param c The character
     * @return {@code true} if the character is reserved by the StringTemplate
     * language; otherwise, {@code false} if the character may be used as a
     * delimiter.
     *
     * @since 4.0.9
     */
    public static  isReservedCharacter(c: char):  boolean {
        return c >= 0
            && c < STGroup.RESERVED_CHARACTERS.length
            && STGroup.RESERVED_CHARACTERS[c];
    }

    /** The {@code "foo"} of {@code t() ::= "<@foo()>"} is mangled to
     *  {@code "/region__/t__foo"}
     */
    public static  getMangledRegionName(enclosingTemplateName: String,
                                              name: String):  String
    {
        if ( enclosingTemplateName.charAt(0)!=='/' ) {
            enclosingTemplateName = '/'+enclosingTemplateName;
        }
        return "/region__"+enclosingTemplateName+"__"+name;
    }

    /** Return {@code "t.foo"} from {@code "/region__/t__foo"} */
    public static  getUnMangledTemplateName(mangledName: String):  String {
        let  t = mangledName.substring("/region__".length(),
                                         mangledName.lastIndexOf("__"));
        let  r = mangledName.substring(mangledName.lastIndexOf("__")+2,
                                         mangledName.length());
        return t+'.'+r;
    }

    /** The primary means of getting an instance of a template from this
     *  group. Names must be absolute, fully-qualified names like {@code /a/b}.
     */
    public  getInstanceOf(name: String):  ST {
        if ( name===null ) {
 return null;
}

        if ( STGroup.verbose ) {
 System.out.println(this.getName()+".getInstanceOf("+name+")");
}

        if ( name.charAt(0)!=='/' ) {
 name = "/"+name;
}

        let  c = this.lookupTemplate(name);
        if ( c!==null ) {
            return this.createStringTemplate(c);
        }
        return null;
    }

    /** Create singleton template for use with dictionary values. */
    public  createSingleton(templateToken: Token):  ST {
        let  template: String;
        if ( templateToken.getType()===GroupParser.BIGSTRING || templateToken.getType()===GroupParser.BIGSTRING_NO_NL ) {
            template = Misc.strip(templateToken.getText(),2);
        }
        else {
            template = Misc.strip(templateToken.getText(),1);
        }
        let  impl = this.compile(this.getFileName(), null, null, template, templateToken);
        let  st = this.createStringTemplateInternally(impl);
        st.groupThatCreatedThisInstance = this;
        st.impl.hasFormalArgs = false;
        st.impl.name = ST.UNKNOWN_NAME;
        st.impl.defineImplicitlyDefinedTemplates(this);
        return st;
    }

    /** Is this template defined in this group or from this group below?
     *  Names must be absolute, fully-qualified names like {@code /a/b}.
     */
    public  isDefined(name: String):  boolean {
        return this.lookupTemplate(name)!==null;
    }

    /** Look up a fully-qualified name. */
    public  lookupTemplate(name: String):  CompiledST {
        if ( name.charAt(0)!=='/' ) {
 name = "/"+name;
}

        if ( STGroup.verbose ) {
 System.out.println(this.getName()+".lookupTemplate("+name+")");
}

        let  code = this.rawGetTemplate(name);
        if ( code===STGroup.NOT_FOUND_ST ) {
            if ( STGroup.verbose ) {
 System.out.println(name+" previously seen as not found");
}

            return null;
        }
        // try to load from disk and look up again
        if ( code===null ) {
 code = this.load(name);
}

        if ( code===null ) {
 code = this.lookupImportedTemplate(name);
}

        if ( code===null ) {
            if ( STGroup.verbose ) {
 System.out.println(name+" recorded not found");
}

            this.templates.put(name, STGroup.NOT_FOUND_ST);
        }
        if ( STGroup.verbose ) {
 if ( code!==null ) {
 System.out.println(this.getName()+".lookupTemplate("+name+") found");
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
    public  unload():  void {
        this.templates.clear();
        this.dictionaries.clear();
        for (let imp of this.imports) {
            imp.unload();
        }
        for (let imp of this.importsToClearOnUnload) {
            this.imports.remove(imp);
        }
        this.importsToClearOnUnload.clear();
    }

    /** Force a load if it makes sense for the group. */
    public  load():  void;

    /** Load st from disk if directory or load whole group file if .stg file (then
     *  return just one template). {@code name} is fully-qualified.
     */
    protected  load(name: String):  CompiledST;
public load(...args: unknown[]):  void |  CompiledST {
		switch (args.length) {
			case 0: {
 

				break;
			}

			case 1: {
				const [name] = args as [String];

 return null; 

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  rawGetTemplate(name: String):  CompiledST { return this.templates.get(name); }
    public  rawGetDictionary(name: String):  Map<String,java.lang.Object> { return this.dictionaries.get(name); }
    public  isDictionary(name: String):  boolean { return this.dictionaries.get(name)!==null; }

    /** for testing */
    public  defineTemplate(templateName: String, template: String):  CompiledST;

    /** for testing */
    public  defineTemplate(name: String, argsS: String, template: String):  CompiledST;

    public  defineTemplate(fullyQualifiedTemplateName: String,
                                     nameT: Token,
                                     args: List<FormalArgument>,
                                     template: String,
                                     templateToken: Token):  CompiledST;
public defineTemplate(...args: unknown[]):  CompiledST {
		switch (args.length) {
			case 2: {
				const [templateName, template] = args as [String, String];


        if ( templateName.charAt(0)!=='/' ) {
 templateName = "/"+templateName;
}

        try {
            let  impl =
                this.defineTemplate(templateName,
                               new  CommonToken(GroupParser.ID, templateName),
                               null, template, null);
            return impl;
        } catch (se) {
if (se instanceof STException) {
            // we have reported the error; the exception just blasts us
            // out of parsing this template
        } else {
	throw se;
	}
}
        return null;
    

				break;
			}

			case 3: {
				const [name, argsS, template] = args as [String, String, String];


        if ( name.charAt(0)!=='/' ) {
 name = "/"+name;
}

        let  args = argsS.split(",");
        let  a = new  ArrayList<FormalArgument>();
        for (let arg of args) {
            a.add(new  FormalArgument(arg));
        }
        return this.defineTemplate(name, new  CommonToken(GroupParser.ID, name),
                              a, template, null);
    

				break;
			}

			case 5: {
				const [fullyQualifiedTemplateName, nameT, args, template, templateToken] = args as [String, Token, List<FormalArgument>, String, Token];


        if ( STGroup.verbose ) {
 System.out.println("defineTemplate("+fullyQualifiedTemplateName+")");
}

        if ( fullyQualifiedTemplateName===null || fullyQualifiedTemplateName.length()===0 ) {
            throw new  IllegalArgumentException("empty template name");
        }
        if ( fullyQualifiedTemplateName.indexOf('.')>=0 ) {
            throw new  IllegalArgumentException("cannot have '.' in template names");
        }
        template = Misc.trimOneStartingNewline(template);
        template = Misc.trimOneTrailingNewline(template);
        // compile, passing in templateName as enclosing name for any embedded regions
        let  code = this.compile(this.getFileName(), fullyQualifiedTemplateName, args, template, templateToken);
        code.name = fullyQualifiedTemplateName;
        this.rawDefineTemplate(fullyQualifiedTemplateName, code, nameT);
        code.defineArgDefaultValueTemplates(this);
        code.defineImplicitlyDefinedTemplates(this); // define any anonymous subtemplates

        return code;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    /** Make name and alias for target.  Replace any previous definition of name. */
    public  defineTemplateAlias(aliasT: Token, targetT: Token):  CompiledST {
        let  alias = aliasT.getText();
        let  target = targetT.getText();
        let  targetCode = this.rawGetTemplate("/"+target);
        if ( targetCode===null ){
            this.errMgr.compileTimeError(ErrorType.ALIAS_TARGET_UNDEFINED, null, aliasT, alias, target);
            return null;
        }
        this.rawDefineTemplate("/" + alias, targetCode, aliasT);
        return targetCode;
    }

    public  defineRegion(enclosingTemplateName: String,
                                   regionT: Token,
                                   template: String,
                                   templateToken: Token):  CompiledST
    {
        let  name = regionT.getText();
        template = Misc.trimOneStartingNewline(template);
        template = Misc.trimOneTrailingNewline(template);
        let  code = this.compile(this.getFileName(), enclosingTemplateName, null, template, templateToken);
        let  mangled = STGroup.getMangledRegionName(enclosingTemplateName, name);

        if ( this.lookupTemplate(mangled)===null ) {
            this.errMgr.compileTimeError(ErrorType.NO_SUCH_REGION, templateToken, regionT,
                                          enclosingTemplateName, name);
            return new  CompiledST();
        }
        code.name = mangled;
        code.isRegion = true;
        code.regionDefType = ST.RegionType.EXPLICIT;
        code.templateDefStartToken = regionT;

        this.rawDefineTemplate(mangled, code, regionT);
        code.defineArgDefaultValueTemplates(this);
        code.defineImplicitlyDefinedTemplates(this);

        return code;
    }

    public  defineTemplateOrRegion(
        fullyQualifiedTemplateName: String,
        regionSurroundingTemplateName: String,
        templateToken: Token,
        template: String,
        nameToken: Token,
        args: List<FormalArgument>):  void
    {
        try {
            if ( regionSurroundingTemplateName!==null ) {
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

    public  rawDefineTemplate(name: String, code: CompiledST, defT: Token):  void {
        let  prev = this.rawGetTemplate(name);
        if ( prev!==null ) {
            if ( !prev.isRegion ) {
                this.errMgr.compileTimeError(ErrorType.TEMPLATE_REDEFINITION, null, defT);
                return;
            }
            else {
                if ( code.regionDefType!==ST.RegionType.IMPLICIT &&
                     prev.regionDefType===ST.RegionType.EMBEDDED )
                {
                    this.errMgr.compileTimeError(ErrorType.EMBEDDED_REGION_REDEFINITION,
                                            null,
                                            defT,
                                            STGroup.getUnMangledTemplateName(name));
                    return;
                }
                else {
 if ( code.regionDefType===ST.RegionType.IMPLICIT ||
                          prev.regionDefType===ST.RegionType.EXPLICIT )
                {
                    this.errMgr.compileTimeError(ErrorType.REGION_REDEFINITION,
                                            null,
                                            defT,
                                            STGroup.getUnMangledTemplateName(name));
                    return;
                }
}

            }
        }
        code.nativeGroup = this;
        code.templateDefStartToken = defT;
        this.templates.put(name, code);
    }

    public  undefineTemplate(name: String):  void {
        this.templates.remove(name);
    }

    /** Compile a template. */
    public  compile(srcName: String,
                              name: String,
                              args: List<FormalArgument>,
                              template: String,
                              templateToken: Token):  CompiledST // for error location
    {
        //System.out.println("STGroup.compile: "+enclosingTemplateName);
        let  c = new  Compiler(this);
        return c.compile(srcName, name, args, template, templateToken);
    }

    /** Define a map for this group.
     * <p>
     * Not thread safe...do not keep adding these while you reference them.</p>
     */
    public  defineDictionary(name: String, mapping: Map<String,java.lang.Object>):  void {
        this.dictionaries.put(name, mapping);
    }

    /**
     * Make this group import templates/dictionaries from {@code g}.
     *<p>
     * On unload imported templates are unloaded but stay in the {@link #imports} list.</p>
     */
    public  importTemplates(g: STGroup):  void;

    /** Import template files, directories, and group files.
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
    public  importTemplates(fileNameToken: Token):  void;

    protected  importTemplates(g: STGroup, clearOnUnload: boolean):  void;
public importTemplates(...args: unknown[]):  void {
		switch (args.length) {
			case 1: {
				const [g] = args as [STGroup];


        this.importTemplates(g, false);
    

				break;
			}

			case 1: {
				const [fileNameToken] = args as [Token];


        if ( STGroup.verbose ) {
 System.out.println("importTemplates("+fileNameToken.getText()+")");
}

        let  fileName = fileNameToken.getText();
        // do nothing upon syntax error
        if ( fileName===null || fileName.equals("<missing STRING>") ) {
 return;
}

        fileName = Misc.strip(fileName, 1);

        //System.out.println("import "+fileName);
        let  isGroupFile = fileName.endsWith(STGroup.GROUP_FILE_EXTENSION);
        let  isTemplateFile = fileName.endsWith(STGroup.TEMPLATE_FILE_EXTENSION);
        let  isGroupDir = !(isGroupFile || isTemplateFile);

        let  g = null;

        // search path is: working dir, g.stg's dir, CLASSPATH
        let  thisRoot = this.getRootDirURL();
        let  fileUnderRoot: URL;
//      System.out.println("thisRoot="+thisRoot);
        try {
            fileUnderRoot = new  URL(thisRoot+"/"+fileName);
        } catch (mfe) {
if (mfe instanceof MalformedURLException) {
            this.errMgr.internalError(null, "can't build URL for "+thisRoot+"/"+fileName, mfe);
            return;
        } else {
	throw mfe;
	}
}
        if ( isTemplateFile ) {
            g = new  STGroup(this.delimiterStartChar, this.delimiterStopChar);
            g.setListener(this.getListener());
            let  fileURL: URL;
            if ( Misc.urlExists(fileUnderRoot) ) {
 fileURL = fileUnderRoot;
}

            else {
 fileURL = this.getURL(fileName);
}
 // try CLASSPATH
            if ( fileURL!==null ) {
                try {
                    let  s = fileURL.openStream();
                    let  templateStream = new  ANTLRInputStream(s, this.encoding);
                    templateStream.name = fileName;
                    let  code = g.loadTemplateFile("/", fileName, templateStream);
                    if ( code===null ) {
 g = null;
}

                } catch (ioe) {
if (ioe instanceof IOException) {
                    this.errMgr.internalError(null, "can't read from "+fileURL, ioe);
                    g = null;
                } else {
	throw ioe;
	}
}
            }
            else {
                g = null;
            }
        }
        else {
 if ( isGroupFile ) {
            //System.out.println("look for fileUnderRoot: "+fileUnderRoot);
            if ( Misc.urlExists(fileUnderRoot) ) {
                g = new  STGroupFile(fileUnderRoot, this.encoding, this.delimiterStartChar, this.delimiterStopChar);
                g.setListener(this.getListener());
            }
            else {
                g = new  STGroupFile(fileName, this.delimiterStartChar, this.delimiterStopChar);
                g.setListener(this.getListener());
            }
        }
        else {
 if ( isGroupDir ) {
//          System.out.println("try dir "+fileUnderRoot);
            if ( Misc.urlExists(fileUnderRoot) ) {
                g = new  STGroupDir(fileUnderRoot, this.encoding, this.delimiterStartChar, this.delimiterStopChar);
                g.setListener(this.getListener());
            }
            else {
                // try in CLASSPATH
//              System.out.println("try dir in CLASSPATH "+fileName);
                g = new  STGroupDir(fileName, this.delimiterStartChar, this.delimiterStopChar);
                g.setListener(this.getListener());
            }
        }
}

}


        if ( g===null ) {
            this.errMgr.compileTimeError(ErrorType.CANT_IMPORT, null,
                                    fileNameToken, fileName);
        }
        else {
            this.importTemplates(g, true);
        }
    

				break;
			}

			case 2: {
				const [g, clearOnUnload] = args as [STGroup, boolean];


        if ( g===null ) {
 return;
}

        this.imports.add(g);
        if (clearOnUnload) {
            this.importsToClearOnUnload.add(g);
        }
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  getImportedGroups():  List<STGroup> { return this.imports; }

    /** Load a group file with full path {@code fileName}; it's relative to root by {@code prefix}. */
    public  loadGroupFile(prefix: String, fileName: String):  void {
        if ( STGroup.verbose ) {
 System.out.println(this.getClass().getSimpleName()+
                                          ".loadGroupFile(group-file-prefix="+prefix+", fileName="+fileName+")");
}

        let  parser: GroupParser;
        try {
            let  f = new  URL(fileName);
            let  fs = new  ANTLRInputStream(f.openStream(), this.encoding);
            let  lexer = new  GroupLexer(fs);
            fs.name = fileName;
            let  tokens = new  CommonTokenStream(lexer);
            parser = new  GroupParser(tokens);
            parser.group(this, prefix);
        } catch (e) {
if (e instanceof Exception) {
            this.errMgr.IOError(null, ErrorType.CANT_LOAD_GROUP_FILE, e, fileName);
        } else {
	throw e;
	}
}
    }

    /** Load template file into this group using absolute {@code fileName}. */
    public  loadAbsoluteTemplateFile(fileName: String):  CompiledST {
        let  fs: ANTLRFileStream;
        try {
            fs = new  ANTLRFileStream(fileName, this.encoding);
            fs.name = fileName;
        } catch (ioe) {
if (ioe instanceof IOException) {
            // doesn't exist
            //errMgr.IOError(null, ErrorType.NO_SUCH_TEMPLATE, ioe, fileName);
            return null;
        } else {
	throw ioe;
	}
}
        return this.loadTemplateFile("", fileName, fs);
    }

    /** Load template stream into this group. {@code unqualifiedFileName} is
     *  {@code "a.st"}. The {@code prefix} is path from group root to
     *  {@code unqualifiedFileName} like {@code "/subdir"} if file is in
     *  {@code /subdir/a.st}.
     */
    public  loadTemplateFile(prefix: String, unqualifiedFileName: String, templateStream: CharStream):  CompiledST {
        let  lexer = new  GroupLexer(templateStream);
        let  tokens = new  CommonTokenStream(lexer);
        let  parser = new  GroupParser(tokens);
        parser.group = this;
        lexer.group = this;
        try {
            parser.templateDef(prefix);
        } catch (re) {
if (re instanceof RecognitionException) {
            this.errMgr.groupSyntaxError(ErrorType.SYNTAX_ERROR,
                                    unqualifiedFileName,
                                    re, re.getMessage());
        } else {
	throw re;
	}
}
        let  templateName = Misc.getFileNameNoSuffix(unqualifiedFileName);
        if ( prefix!==null && prefix.length()>0 ) {
 templateName = prefix+templateName;
}

        let  impl = this.rawGetTemplate(templateName);
        impl.prefix = prefix;
        return impl;
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
    public  registerModelAdaptor <T>(attributeType: Class<T>, adaptor: ModelAdaptor< T>):  void {
        if ( attributeType.isPrimitive() ) {
            throw new  IllegalArgumentException("can't register ModelAdaptor for primitive type "+
                                               attributeType.getSimpleName());
        }

        this.adaptors.put(attributeType, adaptor);
    }

    public  getModelAdaptor <T>(attributeType: Class<T>):  ModelAdaptor< T> {
        //noinspection unchecked
        return  this.adaptors.get(attributeType) as ModelAdaptor< T>;
    }

    /** Register a renderer for all objects of a particular "kind" for all
     *  templates evaluated relative to this group.  Use {@code r} to render if
     *  object in question is an instance of {@code attributeType}.  Recursively
     *  set renderer into all import groups.
     */
    public  registerRenderer <T>(attributeType: Class<T>, r: AttributeRenderer< T>):  void;

    public  registerRenderer <T>(attributeType: Class<T>, r: AttributeRenderer< T>, recursive: boolean):  void;
public registerRenderer <T>(...args: unknown[]):  void {
		switch (args.length) {
			case 2: {
				const [attributeType, r] = args as [Class<T>, AttributeRenderer< T>];


        this.registerRenderer(attributeType, r, true);
    

				break;
			}

			case 3: {
				const [attributeType, r, recursive] = args as [Class<T>, AttributeRenderer< T>, boolean];


        if ( attributeType.isPrimitive() ) {
            throw new  IllegalArgumentException("can't register renderer for primitive type "+
                                               attributeType.getSimpleName());
        }

        if ( this.renderers === null ) {
            this.renderers = Collections.synchronizedMap(new  TypeRegistry<AttributeRenderer<unknown>>());
        }

        this.renderers.put(attributeType, r);

        if ( recursive ) {
            this.load(); // make sure imports exist (recursively)
            for (let g of this.imports) {
                g.registerRenderer(attributeType, r, true);
            }
        }
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    /** Get renderer for class {@code T} associated with this group.
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
    public  getAttributeRenderer <T>(attributeType: Class<T>):  AttributeRenderer< T> {
        if ( this.renderers===null ) {
            return null;
        }

        //noinspection unchecked
        return  this.renderers.get(attributeType) as AttributeRenderer< T>;
    }

    public  createStringTemplate(impl: CompiledST):  ST {
        let  st = new  ST();
        st.impl = impl;
        st.groupThatCreatedThisInstance = this;
        if ( impl.formalArguments!==null ) {
            st.locals = new  Array<java.lang.Object>(impl.formalArguments.size());
            Arrays.fill(st.locals, ST.EMPTY_ATTR);
        }
        return st;
    }

    /** Differentiate so we can avoid having creation events for regions,
     *  map operations, and other implicit "new ST" events during rendering.
     */
    public  createStringTemplateInternally(impl: CompiledST):  ST;

    public  createStringTemplateInternally(proto: ST):  ST;
public createStringTemplateInternally(...args: unknown[]):  ST {
		switch (args.length) {
			case 1: {
				const [impl] = args as [CompiledST];


        let  st = this.createStringTemplate(impl);
        if ( STGroup.trackCreationEvents && st.debugState!==null ) {
            st.debugState.newSTEvent = null; // toss it out
        }
        return st;
    

				break;
			}

			case 1: {
				const [proto] = args as [ST];


        return new  ST(proto); // no need to wack debugState; not set in ST(proto).
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  getName():  String { return "<no name>;"; }
    public  getFileName():  String { return null; }

    /** Return root dir if this is group dir; return dir containing group file
     *  if this is group file.  This is derived from original incoming
     *  dir or filename.  If it was absolute, this should come back
     *  as full absolute path.  If only a URL is available, return URL of
     *  one dir up.
     */
    public  getRootDirURL():  URL { return null; }

    public  getURL(fileName: String):  URL {
        let  url = null;
        let  cl = Thread.currentThread().getContextClassLoader();
        if ( cl!==null ) {
 url = cl.getResource(fileName);
}

        if ( url===null ) {
            cl = this.getClass().getClassLoader();
            if ( cl!==null ) {
 url = cl.getResource(fileName);
}

        }
        return url;
    }

    @Override
public override  toString():  String { return this.getName(); }

    public  show():  String {
        let  buf = new  StringBuilder();
        if ( this.imports.size()!==0 ) {
 buf.append(" : "+this.imports);
}

        for (let name of this.templates.keySet()) {
            let  c = this.rawGetTemplate(name);
            if ( c.isAnonSubtemplate || c===STGroup.NOT_FOUND_ST ) {
 continue;
}

            let  slash = name.lastIndexOf('/');
            name = name.substring(slash+1, name.length());
            buf.append(name);
            buf.append('(');
            if ( c.formalArguments!==null ) {
 buf.append( Misc.join(c.formalArguments.values().iterator(), ",") );
}

            buf.append(')');
            buf.append(" ::= <<"+Misc.newline);
            buf.append(c.template+ Misc.newline);
            buf.append(">>"+Misc.newline);
        }
        return buf.toString();
    }

    public  getListener():  STErrorListener {
        return this.errMgr.listener;
    }

    public  setListener(listener: STErrorListener):  void {
        this.errMgr = new  java.util.logging.ErrorManager(listener);
    }

    public  getTemplateNames():  Set<String> {
        this.load();
        let  result = new  HashSet<String>();
        for (let eof this.templates.entrySet()) {
            if (e.getValue() !== STGroup.NOT_FOUND_ST) {
                result.add(e.getKey());
            }
        }
        return result;
    }

    protected  getEmbeddedInstanceOf(interp: Interpreter,
                                       scope: InstanceScope,
                                       name: String):  ST
    {
        let  fullyQualifiedName = name;
        if ( name.charAt(0)!=='/' ) {
            fullyQualifiedName = scope.st.impl.prefix + name;
        }
        if ( STGroup.verbose ) {
 System.out.println("getEmbeddedInstanceOf(" + fullyQualifiedName +")");
}

        let  st = this.getInstanceOf(fullyQualifiedName);
        if ( st===null ) {
            this.errMgr.runTimeError(interp, scope,
                                ErrorType.NO_SUCH_TEMPLATE,
                                fullyQualifiedName);
            return this.createStringTemplateInternally(new  CompiledST());
        }
        // this is only called internally. wack any debug ST create events
        if ( STGroup.trackCreationEvents ) {
            st.debugState.newSTEvent = null; // toss it out
        }
        return st;
    }

    protected  lookupImportedTemplate(name: String):  CompiledST {
        if ( this.imports.size()===0 ) {
 return null;
}

        for (let g of this.imports) {
            if ( STGroup.verbose ) {
 System.out.println("checking "+g.getName()+" for imported "+name);
}

            let  code = g.lookupTemplate(name);
            if ( code!==null ) {
                if ( STGroup.verbose ) {
 System.out.println(g.getName()+".lookupImportedTemplate("+name+") found");
}

                return code;
            }
        }
        if ( STGroup.verbose ) {
 System.out.println(name+" not found in "+this.getName()+" imports");
}

        return null;
    }
     static {
        STGroup.GROUP_FILE_EXTENSION = ".stg";
        STGroup.TEMPLATE_FILE_EXTENSION = ".st";
    }
     static {
        for (let  c = 'a'; c <= 'z'; c++) {
            STGroup.RESERVED_CHARACTERS[c] = true;
        }

        for (let  c = 'A'; c <= 'Z'; c++) {
            STGroup.RESERVED_CHARACTERS[c] = true;
        }

        for (let  c = '0'; c <= '9'; c++) {
            STGroup.RESERVED_CHARACTERS[c] = true;
        }

        STGroup.RESERVED_CHARACTERS['@'] = true;
        STGroup.RESERVED_CHARACTERS['-'] = true;
        STGroup.RESERVED_CHARACTERS['_'] = true;
        STGroup.RESERVED_CHARACTERS['['] = true;
        STGroup.RESERVED_CHARACTERS[']'] = true;
    }
}
