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



import { java, JavaObject, type int, S } from "jree";
import { STLexer } from "./STLexer.js";
import { STException } from "./STException.js";
import { FormalArgument } from "./FormalArgument.js";
import { CompiledST } from "./CompiledST.js";
import { Bytecode } from "./Bytecode.js";
import { Interpreter } from "../Interpreter.js";
import { ST } from "../ST.js";
import { STGroup } from "../STGroup.js";
import { ErrorType } from "../misc/ErrorType.js";



/** A compiler for a single template. */
export class Compiler {
    public static readonly SUBTEMPLATE_PREFIX = "_sub";

    public static readonly TEMPLATE_INITIAL_CODE_SIZE = 15;

    public static readonly supportedOptions: Map<string, Interpreter.Option>;

    public static readonly NUM_OPTIONS = Compiler.supportedOptions.size();

    public static readonly defaultOptionValues: Map<string, string>;

    public static funcs: Map<string, java.lang.Short>;

    /** Name subtemplates {@code _sub1}, {@code _sub2}, ... */
    public static subtemplateCount = new java.util.concurrent.atomic.AtomicInteger(0);

    public group: STGroup;

    public constructor();
    public constructor(group: STGroup);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 0: {
                this(STGroup.defaultGroup);

                break;
            }

            case 1: {
                const [group] = args as [STGroup];

                super();
                this.group = group;

                break;
            }

            default: {
                throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
            }
        }
    }


    public static defineBlankRegion(outermostImpl: CompiledST, nameToken: Token): CompiledST {
        let outermostTemplateName = outermostImpl.name;
        let mangled = STGroup.getMangledRegionName(outermostTemplateName, nameToken.getText());
        let blank = new CompiledST();
        blank.isRegion = true;
        blank.templateDefStartToken = nameToken;
        blank.regionDefType = ST.RegionType.IMPLICIT;
        blank.name = mangled;
        outermostImpl.addImplicitlyDefinedTemplate(blank);
        return blank;
    }

    public static getNewSubtemplateName(): string {
        let count = Compiler.subtemplateCount.incrementAndGet();
        return Compiler.SUBTEMPLATE_PREFIX + count;
    }

    public compile(template: string): CompiledST;

    /** Compile full template with unknown formal arguments. */
    public compile(name: string, template: string): CompiledST;

    /** Compile full template with respect to a list of formal arguments. */
    public compile(srcName: string,
        name: string,
        args: java.util.List<FormalArgument>,
        template: string,
        templateToken: Token): CompiledST;
    public compile(...args: unknown[]): CompiledST {
        switch (args.length) {
            case 1: {
                const [template] = args as [string];


                let code = this.compile(null, null, null, template, null);
                code.hasFormalArgs = false;
                return code;


                break;
            }

            case 2: {
                const [name, template] = args as [string, string];


                let code = this.compile(null, name, null, template, null);
                code.hasFormalArgs = false;
                return code;


                break;
            }

            case 5: {
                const [srcName, name, args, template, templateToken] = args as [string, string, java.util.List<FormalArgument>, string, Token];


                let is = new ANTLRStringStream(template);
                is.name = srcName !== null ? srcName : name;
                let lexer: STLexer;
                if (templateToken !== null &&
                    templateToken.getType() === GroupParser.BIGSTRING_NO_NL) {
                    lexer = new class extends STLexer {
                        /** Throw out \n and indentation tokens inside BIGSTRING_NO_NL */
                        public nextToken(): Token {
                            let t = super.nextToken();
                            while (t.getType() === STLexer.NEWLINE ||
                                t.getType() === STLexer.INDENT) {
                                t = super.nextToken();
                            }
                            return t;
                        }
                    }($outer.group.errMgr, is, templateToken,
                        $outer.group.delimiterStartChar, $outer.group.delimiterStopChar);
                }
                else {
                    lexer = new STLexer(this.group.errMgr, is, templateToken,
                        this.group.delimiterStartChar, this.group.delimiterStopChar);
                }
                let tokens = new CommonTokenStream(lexer);
                let p = new STParser(tokens, this.group.errMgr, templateToken);
                let r: STParser.templateAndEOF_return;
                try {
                    r = p.templateAndEOF();
                } catch (re) {
                    if (re instanceof RecognitionException) {
                        this.reportMessageAndThrowSTException(tokens, templateToken, p, re);
                        return null;
                    } else {
                        throw re;
                    }
                }
                if (p.getNumberOfSyntaxErrors() > 0 || r.getTree() === null) {
                    let impl = new CompiledST();
                    impl.defineFormalArgs(args);
                    return impl;
                }

                //System.out.println(((CommonTree)r.getTree()).toStringTree());
                let nodes = new CommonTreeNodeStream(r.getTree());
                nodes.setTokenStream(tokens);
                let gen = new CodeGenerator(nodes, this.group.errMgr, name, template, templateToken);

                let impl = null;
                try {
                    impl = gen.template(name, args);
                    impl.nativeGroup = this.group;
                    impl.template = template;
                    impl.ast = r.getTree();
                    impl.ast.setUnknownTokenBoundaries();
                    impl.tokens = tokens;
                } catch (re) {
                    if (re instanceof RecognitionException) {
                        this.group.errMgr.internalError(null, "bad tree structure", re);
                    } else {
                        throw re;
                    }
                }

                return impl;


                break;
            }

            default: {
                throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
            }
        }
    }


    protected reportMessageAndThrowSTException(tokens: TokenStream, templateToken: Token,
        parser: Parser, re: RecognitionException): void {
        if (re.token.getType() === STLexer.EOF_TYPE) {
            let msg = "premature EOF";
            this.group.errMgr.compileTimeError(ErrorType.SYNTAX_ERROR, templateToken, re.token, msg);
        }
        else {
            if (re instanceof NoViableAltException) {
                let msg = "'" + re.token.getText() + "' came as a complete surprise to me";
                this.group.errMgr.compileTimeError(ErrorType.SYNTAX_ERROR, templateToken, re.token, msg);
            }
            else {
                if (tokens.index() === 0) { // couldn't parse anything
                    let msg = "this doesn't look like a template: \"" + tokens + "\"";
                    this.group.errMgr.compileTimeError(ErrorType.SYNTAX_ERROR, templateToken, re.token, msg);
                }
                else {
                    if (tokens.LA(1) === STLexer.LDELIM) { // couldn't parse expr
                        let msg = "doesn't look like an expression";
                        this.group.errMgr.compileTimeError(ErrorType.SYNTAX_ERROR, templateToken, re.token, msg);
                    }
                    else {
                        let msg = parser.getErrorMessage(re, parser.getTokenNames());
                        this.group.errMgr.compileTimeError(ErrorType.SYNTAX_ERROR, templateToken, re.token, msg);
                    }
                }

            }

        }

        throw new STException(); // we have reported the error, so just blast out
    }

    static {
        let map = new Map<string, Interpreter.Option>();
        map.put("anchor", Interpreter.Option.ANCHOR);
        map.put("format", Interpreter.Option.FORMAT);
        map.put("null", Interpreter.Option.NULL);
        map.put("separator", Interpreter.Option.SEPARATOR);
        map.put("wrap", Interpreter.Option.WRAP);
        Compiler.supportedOptions = java.util.Collections.unmodifiableMap(map);
    }

    static {
        let map = new Map<string, string>();
        map.put("anchor", "true");
        map.put("wrap", "\n");
        Compiler.defaultOptionValues = java.util.Collections.unmodifiableMap(map);
    }

    static {
        let map = new Map<string, java.lang.Short>();
        map.put("first", Bytecode.INSTR_FIRST);
        map.put("last", Bytecode.INSTR_LAST);
        map.put("rest", Bytecode.INSTR_REST);
        map.put("trunc", Bytecode.INSTR_TRUNC);
        map.put("strip", Bytecode.INSTR_STRIP);
        map.put("trim", Bytecode.INSTR_TRIM);
        map.put("length", Bytecode.INSTR_LENGTH);
        map.put("strlen", Bytecode.INSTR_STRLEN);
        map.put("reverse", Bytecode.INSTR_REVERSE);
        Compiler.funcs = java.util.Collections.unmodifiableMap(map);
    }

}
