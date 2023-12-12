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



import { java, JavaObject, type int } from "jree";
import { FormalArgument } from "./FormalArgument.js";
import { BytecodeDisassembler } from "./BytecodeDisassembler.js";
import { STGroup } from "../STGroup.js";
import { ST } from "../ST.js";
import { Misc } from "../misc/Misc.js";
import { Interval } from "../misc/Interval.js";

type Cloneable = java.lang.Cloneable;
type String = java.lang.String;
const String = java.lang.String;
type Compiler = java.lang.Compiler;
const Compiler = java.lang.Compiler;
type UnsupportedOperationException = java.lang.UnsupportedOperationException;
const UnsupportedOperationException = java.lang.UnsupportedOperationException;
type IllegalArgumentException = java.lang.IllegalArgumentException;
const IllegalArgumentException = java.lang.IllegalArgumentException;
type Integer = java.lang.Integer;
const Integer = java.lang.Integer;
type Math = java.lang.Math;
const Math = java.lang.Math;
type System = java.lang.System;
const System = java.lang.System;



/** The result of compiling an {@link ST}.  Contains all the bytecode instructions,
 *  string table, bytecode address to source code map, and other bookkeeping
 *  info.  It's the implementation of an ST you might say.  All instances
 *  of the same template share a single implementation ({@link ST#impl} field).
 */
export  class CompiledST extends JavaObject implements Cloneable {
    public  name:  String;

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
    public  prefix = "/";

    /** The original, immutable pattern (not really used again after
     *  initial "compilation"). Useful for debugging.  Even for
     *  subtemplates, this is entire overall template.
     */
    public  template:  String;

    /** The token that begins template definition; could be {@code <@r>} of region. */
    public  templateDefStartToken:  Token;

    /** Overall token stream for template (debug only). */
    public  tokens:  TokenStream;

    /** How do we interpret syntax of template? (debug only) */
    public  ast:  CommonTree;

    public  formalArguments:  java.util.Map<String, FormalArgument>;

    public  hasFormalArgs:  boolean;

    public  numberOfArgsWithDefaultValues:  int;

    /** A list of all regions and subtemplates. */
    public  implicitlyDefinedTemplates:  java.util.List<CompiledST>;

    /**
     * The group that physically defines this {@link ST} definition. We use it
     * to initiate interpretation via {@link ST#toString}. From there, it
     * becomes field {@link Interpreter#group} and is fixed until rendering
     * completes.
     */
    public  nativeGroup = STGroup.defaultGroup;

    /** Does this template come from a {@code <@region>...<@end>} embedded in
     *  another template?
     */
    public  isRegion:  boolean;

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
    public  regionDefType:  ST.RegionType;

    public  isAnonSubtemplate:  boolean; // {...}

    public  strings:  String[];     // string operands of instructions
    public  instrs:  Int8Array;        // byte-addressable code memory.
    public  codeSize:  int;
    public  sourceMap:  Interval[]; // maps IP to range in template pattern

    public  constructor() {
        super();
this.instrs = new  Int8Array(Compiler.TEMPLATE_INITIAL_CODE_SIZE);
        this.sourceMap = new  Array<Interval>(Compiler.TEMPLATE_INITIAL_CODE_SIZE);
        this.template = "";
    }

    /**
     * Cloning the {@link CompiledST} for an {@link ST} instance allows
     * {@link ST#add} to be called safely during interpretation for templates
     * that do not contain formal arguments.
     *
     * @return A copy of the current {@link CompiledST} instance. The copy is a
     * shallow copy, with the exception of the {@link #formalArguments} field
     * which is also cloned.
     *
     * @exception CloneNotSupportedException If the current instance cannot be
     * cloned.
     */
    @Override
public override  clone():  CompiledST {
        let  clone = super.clone() as CompiledST;
        if (this.formalArguments !== null) {
            this.formalArguments = java.util.Collections.synchronizedMap(new  java.util.LinkedHashMap<String,FormalArgument>(this.formalArguments));
        }

        return clone;
    }

    public  addImplicitlyDefinedTemplate(sub: CompiledST):  void {
        sub.prefix = this.prefix;
        if ( sub.name.charAt(0)!=='/' ) {
 sub.name = sub.prefix+sub.name;
}

        if ( this.implicitlyDefinedTemplates === null ) {
            this.implicitlyDefinedTemplates = new  java.util.ArrayList<CompiledST>();
        }
        this.implicitlyDefinedTemplates.add(sub);
    }

    public  defineArgDefaultValueTemplates(group: STGroup):  void {
        if ( this.formalArguments===null ) {
 return;
}

        for (let a of this.formalArguments.keySet()) {
            let  fa = this.formalArguments.get(a);
            if ( fa.defaultValueToken!==null ) {
                this.numberOfArgsWithDefaultValues++;
                switch (fa.defaultValueToken.getType()) {
                case GroupParser.ANONYMOUS_TEMPLATE:{
                    let  argSTname = fa.name + "_default_value";
                    let  c2 = new  Compiler(group);
                    let  defArgTemplate =
                        Misc.strip(fa.defaultValueToken.getText(), 1);
                    fa.compiledDefaultValue =
                        c2.compile(group.getFileName(), argSTname, null,
                                   defArgTemplate, fa.defaultValueToken);
                    fa.compiledDefaultValue.name = argSTname;
                    fa.compiledDefaultValue.defineImplicitlyDefinedTemplates(group);
                    break;
}


                case GroupParser.STRING:{
                    fa.defaultValue = Misc.strip(fa.defaultValueToken.getText(), 1);
                    break;
}


                case GroupParser.LBRACK:{
                    fa.defaultValue = java.util.Collections.emptyList();
                    break;
}


                case GroupParser.TRUE:
                case GroupParser.FALSE:{
                    fa.defaultValue = fa.defaultValueToken.getType()===GroupParser.TRUE;
                    break;
}


                default:{
                    throw new  UnsupportedOperationException("Unexpected default value token type.");
}

                }
            }
        }
    }

    public  defineFormalArgs(args: java.util.List<FormalArgument>):  void {
        this.hasFormalArgs = true; // even if no args; it's formally defined
        if ( args === null ) {
 this.formalArguments = null;
}

        else {
 for (let a of args) {
 this.addArg(a);
}

}

    }

    /** Used by {@link ST#add} to add args one by one without turning on full formal args definition signal. */
    public  addArg(a: FormalArgument):  void {
        if ( this.formalArguments===null ) {
            this.formalArguments = java.util.Collections.synchronizedMap(new  java.util.LinkedHashMap<String,FormalArgument>());
        }
        else {
 if (this.formalArguments.containsKey(a.name)) {
            throw new  IllegalArgumentException(String.format("Formal argument %s already exists.", a.name));
        }
}


        a.index = this.formalArguments.size();
        this.formalArguments.put(a.name, a);
    }

    public  defineImplicitlyDefinedTemplates(group: STGroup):  void {
        if ( this.implicitlyDefinedTemplates !==null ) {
            for (let sub of this.implicitlyDefinedTemplates) {
                group.rawDefineTemplate(sub.name, sub, sub.templateDefStartToken);
                sub.defineImplicitlyDefinedTemplates(group);
            }
        }
    }

    public  getTemplateSource():  String {
        let  r = this.getTemplateRange();
        return this.template.substring(r.a, r.b+1);
    }

    public  getTemplateRange():  Interval {
        if ( this.isAnonSubtemplate ) {
            let  start = Integer.MAX_VALUE;
            let  stop = Integer.MIN_VALUE;
            for (let interval of this.sourceMap) {
                if (interval === null) {
                    continue;
                }

                start = Math.min(start, interval.a);
                stop = Math.max(stop, interval.b);
            }

            if (start <= stop + 1) {
                return new  Interval(start, stop);
            }
        }
        return new  Interval(0, this.template.length()-1);
    }

    public  instrs():  String {
        let  dis = new  BytecodeDisassembler(this);
        return dis.instrs();
    }

    public  dump():  void {
        let  dis = new  BytecodeDisassembler(this);
        System.out.println(this.name+":");
        System.out.println(dis.disassemble());
        System.out.println("Strings:");
        System.out.println(dis.strings());
        System.out.println("Bytecode to template map:");
        System.out.println(dis.sourceMap());
    }

    public  disasm():  String {
        let  dis = new  BytecodeDisassembler(this);
        let  sw = new  java.io.StringWriter();
        let  pw = new  java.io.PrintWriter(sw);
        pw.println(dis.disassemble());
        pw.println("Strings:");
        pw.println(dis.strings());
        pw.println("Bytecode to template map:");
        pw.println(dis.sourceMap());
        pw.close();
        return sw.toString();
    }
}
