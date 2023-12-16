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



import { java, JavaObject, S, type int, type char } from "jree";
import { STWriter } from "./STWriter.js";
import { STGroup } from "./STGroup.js";
import { STErrorListener } from "./STErrorListener.js";
import { Interpreter } from "./Interpreter.js";
import { InstanceScope } from "./InstanceScope.js";
import { AutoIndentWriter } from "./AutoIndentWriter.js";
import { CompiledST } from "./compiler/CompiledST.js";
import { FormalArgument } from "./compiler/FormalArgument.js";
import { AddAttributeEvent } from "./debug/AddAttributeEvent.js";
import { ConstructionEvent } from "./debug/ConstructionEvent.js";
import { EvalTemplateEvent } from "./debug/EvalTemplateEvent.js";
import { InterpEvent } from "./debug/InterpEvent.js";
import { STViz } from "./gui/STViz.js";
import { Aggregate } from "./misc/Aggregate.js";
import { ErrorBuffer } from "./misc/ErrorBuffer.js";
import { MultiMap } from "./misc/MultiMap.js";



/** An instance of the StringTemplate. It consists primarily of
 *  a {@linkplain ST#impl reference} to its implementation (shared among all
 *  instances) and a hash table of {@linkplain ST#locals attributes}.  Because
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
export  class ST extends JavaObject {
    public static readonly  VERSION = "4.3.4";

    /** Events during template hierarchy construction (not evaluation) */
    public static DebugState =  class DebugState extends JavaObject {
        /** Record who made us? {@link ConstructionEvent} creates {@link Exception} to grab stack */
        public  newSTEvent:  ConstructionEvent;

        /** Track construction-time add attribute "events"; used for ST user-level debugging */
        public  addAttrEvents = new  MultiMap<string, AddAttributeEvent>();
    };


    public static readonly  UNKNOWN_NAME = "anonymous";
    public static readonly  EMPTY_ATTR = new  Object();

    /** When there are no formal args for template t and you map t across
     *  some values, t implicitly gets arg "it".  E.g., "<b>$it$</b>"
     */
    public static readonly  IMPLICIT_ARG_NAME = "it";

    /** Just an alias for {@link ArrayList}, but this way I can track whether a
     *  list is something ST created or it's an incoming list.
     */
    public static readonly AttributeList =  class AttributeList extends Array<Object> {
        public  constructor();
        public  constructor(size: int);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {
 super(); 

				break;
			}

			case 1: {
				const [size] = args as [int];

 super(size); 

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}

    };


    /** The implementation for this template among all instances of same template . */
    public  impl:  CompiledST;

    /** Created as instance of which group? We need this to initialize interpreter
     *  via render.  So, we create st and then it needs to know which
     *  group created it for sake of polymorphism:
     *
     *  <pre>
     *  st = skin1.getInstanceOf("searchbox");
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
    public  groupThatCreatedThisInstance:  STGroup;

    /** If {@link STGroup#trackCreationEvents}, track creation and add
     *  attribute events for each object. Create this object on first use.
     */
    public  debugState:  ST.DebugState;

    /** Safe to simultaneously write via {@link #add}, which is synchronized.
     *  Reading during exec is, however, NOT synchronized.  So, not thread safe
     *  to add attributes while it is being evaluated.  Initialized to
     *  {@link #EMPTY_ATTR} to distinguish {@code null} from empty.
     */
    protected  locals:  Object[];

    /** Used by group creation routine, not by users */
    protected  constructor();

    /** Used to make templates inline in code for simple things like SQL or log records.
     *  No formal arguments are set and there is no enclosing instance.
     */
    public  constructor(template: string);

    /** Clone a prototype template.
     *  Copy all fields minus {@link #debugState}; don't delegate to {@link #ST()},
     *  which creates {@link ConstructionEvent}.
     */
    public  constructor(proto: ST);

    public  constructor(group: STGroup, template: string);

    /** Create ST using non-default delimiters; each one of these will live
     *  in it's own group since you're overriding a default; don't want to
     *  alter {@link STGroup#defaultGroup}.
     */
    public  constructor(template: string, delimiterStartChar: char, delimiterStopChar: char);
    protected constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {

        super();
if ( STGroup.trackCreationEvents ) {
            if ( this.debugState===null ) {
 this.debugState = new  ST.DebugState();
}

            this.debugState.newSTEvent = new  ConstructionEvent();
        }
    

				break;
			}

			case 1: {
				const [template] = args as [string];


        this(STGroup.defaultGroup, template);
    

				break;
			}

			case 1: {
				const [proto] = args as [ST];


        super();
try {
            // Because add() can fake a formal arg def, make sure to clone impl
            // entire impl so formalArguments list is cloned as well. Don't want
            // further derivations altering previous arg defs. See
            // testRedefOfKeyInCloneAfterAddingAttribute().
            this.impl = proto.impl.clone();
        } catch (e) {
if (e instanceof java.lang.CloneNotSupportedException) {
            throw new  java.lang.RuntimeException(e);
        } else {
	throw e;
	}
}
        if ( proto.locals!==null ) {
            this.locals = new  Array<Object>(proto.locals.length);
            java.lang.System.arraycopy(proto.locals, 0, this.locals, 0, proto.locals.length);
        }
        else {
 if (this.impl.formalArguments !== null && !this.impl.formalArguments.isEmpty()) {
            this.locals = new  Array<Object>(this.impl.formalArguments.size());
            java.util.Arrays.fill(this.locals, ST.EMPTY_ATTR);
        }
}

        this.groupThatCreatedThisInstance = proto.groupThatCreatedThisInstance;
    

				break;
			}

			case 2: {
				const [group, template] = args as [STGroup, string];


        this();
        this.groupThatCreatedThisInstance = group;
        this.impl = this.groupThatCreatedThisInstance.compile(group.getFileName(), null,
                                                    null, template, null);
        this.impl.hasFormalArgs = false;
        this.impl.name = ST.UNKNOWN_NAME;
        this.impl.defineImplicitlyDefinedTemplates(this.groupThatCreatedThisInstance);
    

				break;
			}

			case 3: {
				const [template, delimiterStartChar, delimiterStopChar] = args as [string, char, char];


        this(new  STGroup(delimiterStartChar, delimiterStopChar), template);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    /**
     * <pre>
     * ST.format("&lt;%1&gt;:&lt;%2&gt;", n, p);
     * </pre>
     */
    public static  format(template: string,... attributes: Object[]):  string;

    public static  format(lineWidth: int, template: string,... attributes: Object[]):  string;
public static format(...args: unknown[]):  string {
		switch (args.length) {
			case 2: {
				const [template, attributes] = args as [string, Object[]];


        return ST.format(STWriter.NO_WRAP, template, attributes);
    

				break;
			}

			case 3: {
				const [lineWidth, template, attributes] = args as [int, string, Object[]];


        template = template.replaceAll("%([0-9]+)", "arg$1");
        let  st = new  ST(template);
        let  i = 1;
        for (let a of attributes) {
            st.add("arg"+i, a);
            i++;
        }
        return st.render(lineWidth);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    protected static  convertToAttributeList(curvalue: Object):  ST.AttributeList {
        let  multi: ST.AttributeList;
        if ( curvalue === null ) {
            multi = new  ST.AttributeList(); // make list to hold multiple values
            multi.add(curvalue);                 // add previous single-valued attribute
        }
        else {
 if ( curvalue instanceof ST.AttributeList ) { // already a list made by ST
            multi = curvalue as ST.AttributeList;
        }
        else {
 if ( curvalue instanceof java.util.List) { // existing attribute is non-ST List
            // must copy to an ST-managed list before adding new attribute
            // (can't alter incoming attributes)
            let  listAttr = curvalue as java.util.List<unknown>;
            multi = new  ST.AttributeList(listAttr.size());
            multi.addAll(listAttr);
        }
        else {
 if ( curvalue instanceof Object[] ) { // copy array to list
            let  a = curvalue as Object[];
            multi = new  ST.AttributeList(a.length);
            multi.addAll(java.util.Arrays.asList(a)); // asList doesn't copy as far as I can tell
        }
        else {
 if ( curvalue.getClass().isArray() ) { // copy primitive array to list
            let  length = java.lang.reflect.Array.getLength(curvalue);
            multi = new  ST.AttributeList(length);
            for (let  i = 0; i < length; i++) {
                multi.add(java.lang.reflect.Array.get(curvalue, i));
            }
        }
        else {
            // curvalue nonlist and we want to add an attribute
            // must convert curvalue existing to list
            multi = new  ST.AttributeList(); // make list to hold multiple values
            multi.add(curvalue);                 // add previous single-valued attribute
        }
}

}

}

}

        return multi;
    }

    /** Inject an attribute (name/value pair). If there is already an attribute
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
    public  add(name: string, value: Object):  ST {
        if ( name===null ) {
            throw new  java.lang.NullPointerException("null attribute name");
        }
        if ( name.indexOf('.')>=0 ) {
            throw new  java.lang.IllegalArgumentException("cannot have '.' in attribute names");
        }

        if ( STGroup.trackCreationEvents ) {
            if ( this.debugState===null ) {
 this.debugState = new  ST.DebugState();
}

            this.debugState.addAttrEvents.map(name, new  AddAttributeEvent(name, value));
        }

        let  arg = null;
        if ( this.impl.hasFormalArgs ) {
            if ( this.impl.formalArguments!==null ) {
 arg = this.impl.formalArguments.get(name);
}

            if ( arg===null ) {
                throw new  java.lang.IllegalArgumentException("no such attribute: "+name);
            }
        }
        else {
            // define and make room in locals (a hack to make new ST("simple template") work.)
            if ( this.impl.formalArguments!==null ) {
                arg = this.impl.formalArguments.get(name);
            }
            if ( arg===null ) { // not defined
                arg = new  FormalArgument(name);
                this.impl.addArg(arg);
                if ( this.locals===null ) {
 this.locals = new  Array<Object>(1);
}

                else {
                    let  copy = new  Array<Object>(this.impl.formalArguments.size());
                    java.lang.System.arraycopy(this.locals, 0, copy, 0,
                                     java.lang.Math.min(this.locals.length, this.impl.formalArguments.size()));
                    this.locals = copy;
                }
                this.locals[arg.index] = ST.EMPTY_ATTR;
            }
        }

        let  curvalue = this.locals[arg.index];
        if ( curvalue===ST.EMPTY_ATTR ) { // new attribute
            this.locals[arg.index] = value;
            return this;
        }

        // attribute will be multi-valued for sure now
        // convert current attribute to list if not already
        // copy-on-write semantics; copy a list injected by user to add new value
        let  multi = ST.convertToAttributeList(curvalue);
        this.locals[arg.index] = multi; // replace with list

        // now, add incoming value to multi-valued attribute
        if ( value instanceof java.util.List ) {
            // flatten incoming list into existing list
            multi.addAll(value as java.util.List<unknown>);
        }
        else {
 if ( value!==null && value.getClass().isArray() ) {
            if (value instanceof Object[]) {
                multi.addAll(java.util.Arrays.asList(value as Object[]));
            }
            else {
                multi.addAll(ST.convertToAttributeList(value));
            }
        }
        else {
            multi.add(value);
        }
}

        return this;
    }

    /** Split {@code aggrName.{propName1,propName2}} into list
     *  {@code [propName1, propName2]} and the {@code aggrName}. Spaces are
     *  allowed around {@code ','}.
     */
    public  addAggr(aggrSpec: string,... values: Object[]):  ST {
        let  dot = aggrSpec.indexOf(".{");
        if ( java.io.ObjectInputFilter.Status.values===null || java.io.ObjectInputFilter.Status.values.length===0 ) {
            throw new  java.lang.IllegalArgumentException("missing values for aggregate attribute format: "+
                                               aggrSpec);
        }
        let  finalCurly = aggrSpec.indexOf('}');
        if ( dot<0 || finalCurly < 0 ) {
            throw new  java.lang.IllegalArgumentException("invalid aggregate attribute format: "+
                                               aggrSpec);
        }
        let  aggrName = aggrSpec.substring(0, dot);
        let  propString = aggrSpec.substring(dot+2, aggrSpec.length()-1);
        propString = propString.trim();
        let  propNames = propString.split("\\ *,\\ *");
        if ( propNames===null || propNames.length===0 ) {
            throw new  java.lang.IllegalArgumentException("invalid aggregate attribute format: "+
                                               aggrSpec);
        }
        if ( java.io.ObjectInputFilter.Status.values.length !== propNames.length ) {
            throw new  java.lang.IllegalArgumentException(
                "number of properties and values mismatch for aggregate attribute format: "+
                aggrSpec);
        }
        let  i=0;
        let  aggr = new  Aggregate();
        for (let p of propNames) {
            let  v = java.io.ObjectInputFilter.Status.values[i++];
            aggr.properties.put(p, v);
        }

        this.add(aggrName, aggr); // now add as usual
        return this;
    }

    /** Remove an attribute value entirely (can't remove attribute definitions). */
    public  remove(name: string):  void {
        if ( this.impl.formalArguments===null ) {
            if ( this.impl.hasFormalArgs ) {
                throw new  java.lang.IllegalArgumentException("no such attribute: "+name);
            }
            return;
        }
        let  arg = this.impl.formalArguments.get(name);
        if ( arg===null ) {
            throw new  java.lang.IllegalArgumentException("no such attribute: "+name);
        }
        this.locals[arg.index] = ST.EMPTY_ATTR; // reset value
    }

    /** Find an attribute in this template only. */
    public  getAttribute(name: string):  Object {
        let  localArg = null;
        if ( this.impl.formalArguments!==null ) {
 localArg = this.impl.formalArguments.get(name);
}

        if ( localArg!==null ) {
            let  o = this.locals[localArg.index];
            if ( o===ST.EMPTY_ATTR ) {
 o = null;
}

            return o;
        }
        return null;
    }

    public  getAttributes():  Map<string, Object> {
        if ( this.impl.formalArguments===null ) {
 return null;
}

        let  attributes = new  Map<string, Object>();
        for (let a of this.impl.formalArguments.values()) {
            let  o = this.locals[a.index];
            if ( o===ST.EMPTY_ATTR ) {
 o = null;
}

            attributes.put(a.name, o);
        }
        return attributes;
    }

    public  getName():  string { return this.impl.name; }

    public  isAnonSubtemplate():  boolean { return this.impl.isAnonSubtemplate; }

    public  write(out: STWriter):  int;

    public  write(out: STWriter, locale: Intl.Locale):  int;

    public  write(out: STWriter, listener: STErrorListener):  int;

    public  write(outputFile: java.io.File, listener: STErrorListener):  int;

    public  write(out: STWriter, locale: Intl.Locale, listener: STErrorListener):  int;

    public  write(outputFile: java.io.File, listener: STErrorListener, encoding: string):  int;

    public  write(outputFile: java.io.File, listener: STErrorListener, encoding: string, lineWidth: int):  int;

    public  write(outputFile: java.io.File,
                     listener: STErrorListener,
                     encoding: string,
                     locale: Intl.Locale,
                     lineWidth: int):  int;
public write(...args: unknown[]):  int {
		switch (args.length) {
			case 1: {
				const [out] = args as [STWriter];


        let  interp = new  Interpreter(this.groupThatCreatedThisInstance,
                                             this.impl.nativeGroup.errMgr,
                                             false);
        let  scope = new  InstanceScope(null, this);
        return interp.exec(out, scope);
    

				break;
			}

			case 2: {
				const [out, locale] = args as [STWriter, Intl.Locale];


        let  interp = new  Interpreter(this.groupThatCreatedThisInstance,
                                             locale,
                                             this.impl.nativeGroup.errMgr,
                                             false);
        let  scope = new  InstanceScope(null, this);
        return interp.exec(out, scope);
    

				break;
			}

			case 2: {
				const [out, listener] = args as [STWriter, STErrorListener];


        let  interp = new  Interpreter(this.groupThatCreatedThisInstance,
                                             new  java.util.logging.ErrorManager(listener),
                                             false);
        let  scope = new  InstanceScope(null, this);
        return interp.exec(out, scope);
    

				break;
			}

			case 2: {
				const [outputFile, listener] = args as [java.io.File, STErrorListener];


        return this.write(outputFile, listener, "UTF-8", Intl.Locale.getDefault(), STWriter.NO_WRAP);
    

				break;
			}

			case 3: {
				const [out, locale, listener] = args as [STWriter, Intl.Locale, STErrorListener];


        let  interp = new  Interpreter(this.groupThatCreatedThisInstance,
                                             locale,
                                             new  java.util.logging.ErrorManager(listener),
                                             false);
        let  scope = new  InstanceScope(null, this);
        return interp.exec(out, scope);
    

				break;
			}

			case 3: {
				const [outputFile, listener, encoding] = args as [java.io.File, STErrorListener, string];


        return this.write(outputFile, listener, encoding, Intl.Locale.getDefault(), STWriter.NO_WRAP);
    

				break;
			}

			case 4: {
				const [outputFile, listener, encoding, lineWidth] = args as [java.io.File, STErrorListener, string, int];


        return this.write(outputFile, listener, encoding, Intl.Locale.getDefault(), lineWidth);
    

				break;
			}

			case 5: {
				const [outputFile, listener, encoding, locale, lineWidth] = args as [java.io.File, STErrorListener, string, Intl.Locale, int];


        let  bw = null;
        try {
            let  fos = new  java.io.FileOutputStream(outputFile);
            let  osw = new  java.io.OutputStreamWriter(fos, encoding);
            bw = new  java.io.BufferedWriter(osw);
            let  w = new  AutoIndentWriter(bw);
            w.setLineWidth(lineWidth);
            let  n = this.write(w, locale, listener);
            bw.close();
            bw = null;
            return n;
        }
        finally {
            if (bw !== null) {
 bw.close();
}

        }
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  render():  string;

    public  render(lineWidth: int):  string;

    public  render(locale: Intl.Locale):  string;

    public  render(locale: Intl.Locale, lineWidth: int):  string;
public render(...args: unknown[]):  string {
		switch (args.length) {
			case 0: {
 return this.render(Intl.Locale.getDefault()); 

				break;
			}

			case 1: {
				const [lineWidth] = args as [int];

 return this.render(Intl.Locale.getDefault(), lineWidth); 

				break;
			}

			case 1: {
				const [locale] = args as [Intl.Locale];

 return this.render(locale, STWriter.NO_WRAP); 

				break;
			}

			case 2: {
				const [locale, lineWidth] = args as [Intl.Locale, int];


        let  out = new  java.io.StringWriter();
        let  wr = new  AutoIndentWriter(out);
        wr.setLineWidth(lineWidth);
        this.write(wr, locale);
        return out.toString();
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    // LAUNCH A WINDOW TO INSPECT TEMPLATE HIERARCHY

    public  inspect():  STViz;

    public  inspect(lineWidth: int):  STViz;

    public  inspect(locale: Intl.Locale):  STViz;

    public  inspect(errMgr: java.util.logging.ErrorManager, locale: Intl.Locale, lineWidth: int):  STViz;
public inspect(...args: unknown[]):  STViz {
		switch (args.length) {
			case 0: {
 return this.inspect(Intl.Locale.getDefault()); 

				break;
			}

			case 1: {
				const [lineWidth] = args as [int];


        return this.inspect(this.impl.nativeGroup.errMgr, Intl.Locale.getDefault(), lineWidth);
    

				break;
			}

			case 1: {
				const [locale] = args as [Intl.Locale];


        return this.inspect(this.impl.nativeGroup.errMgr, locale, STWriter.NO_WRAP);
    

				break;
			}

			case 3: {
				const [errMgr, locale, lineWidth] = args as [java.util.logging.ErrorManager, Intl.Locale, int];


        let  errors = new  ErrorBuffer();
        this.impl.nativeGroup.setListener(errors);
        let  out = new  java.io.StringWriter();
        let  wr = new  AutoIndentWriter(out);
        wr.setLineWidth(lineWidth);
        let  interp =
            new  Interpreter(this.groupThatCreatedThisInstance, locale, true);
        let  scope = new  InstanceScope(null, this);
        interp.exec(wr, scope); // render and track events
        let  events = interp.getEvents();
        let  overallTemplateEval =
            events.get(events.size()-1) as EvalTemplateEvent;
        let  viz = new  STViz(errMgr, overallTemplateEval, out.toString(), interp,
                              interp.getExecutionTrace(), errors.errors);
        viz.open();
        return viz;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    // TESTING SUPPORT

    public  getEvents():  java.util.List<InterpEvent>;

    public  getEvents(lineWidth: int):  java.util.List<InterpEvent>;

    public  getEvents(locale: Intl.Locale):  java.util.List<InterpEvent>;

    public  getEvents(locale: Intl.Locale, lineWidth: int):  java.util.List<InterpEvent>;
public getEvents(...args: unknown[]):  java.util.List<InterpEvent> {
		switch (args.length) {
			case 0: {
 return this.getEvents(Intl.Locale.getDefault()); 

				break;
			}

			case 1: {
				const [lineWidth] = args as [int];

 return this.getEvents(Intl.Locale.getDefault(), lineWidth); 

				break;
			}

			case 1: {
				const [locale] = args as [Intl.Locale];

 return this.getEvents(locale, STWriter.NO_WRAP); 

				break;
			}

			case 2: {
				const [locale, lineWidth] = args as [Intl.Locale, int];


        let  out = new  java.io.StringWriter();
        let  wr = new  AutoIndentWriter(out);
        wr.setLineWidth(lineWidth);
        let  interp =
            new  Interpreter(this.groupThatCreatedThisInstance, locale, true);
        let  scope = new  InstanceScope(null, this);
        interp.exec(wr, scope); // render and track events
        return interp.getEvents();
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public override  toString():  string {
        if ( this.impl===null ) {
 return "bad-template()";
}

        let  name = this.impl.name+"()";
        if (this.impl.isRegion) {
            name = "@" + STGroup.getUnMangledTemplateName(name);
        }

        return name;
    }

    /** Set {@code locals} attribute value when you only know the name, not the
     *  index. This is ultimately invoked by calling {@code ST#add} from
     *  outside so toss an exception to notify them.
     */
    protected  rawSetAttribute(name: string, value: Object):  void {
        if ( this.impl.formalArguments===null ) {
            throw new  java.lang.IllegalArgumentException("no such attribute: "+name);
        }
        let  arg = this.impl.formalArguments.get(name);
        if ( arg===null ) {
            throw new  java.lang.IllegalArgumentException("no such attribute: "+name);
        }
        this.locals[arg.index] = value;
    }

    /** {@code <@r()>}, {@code <@r>...<@end>}, and {@code @t.r() ::= "..."} defined manually by coder */
    public static  RegionType =  class RegionType extends java.lang.Enum<RegionType> {
        /** {@code <@r()>} */
        public static readonly IMPLICIT: RegionType = new class extends RegionType {
}(S`IMPLICIT`, 0);
        /** {@code <@r>...<@end>} */
        public static readonly EMBEDDED: RegionType = new class extends RegionType {
}(S`EMBEDDED`, 1);
        /** {@code @t.r() ::= "..."} */
        public static readonly EXPLICIT: RegionType = new class extends RegionType {
}(S`EXPLICIT`, 2)
    };

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace ST {
	export type RegionType = InstanceType<typeof ST.RegionType>;
	export type DebugState = InstanceType<typeof ST.DebugState>;
	export type AttributeList = InstanceType<typeof ST.AttributeList>;
}


