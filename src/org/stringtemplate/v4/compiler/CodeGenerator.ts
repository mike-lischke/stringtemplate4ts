/* java2ts: keep */

// $ANTLR 3.5.3 CodeGenerator.g 2023-12-16 19:26:21

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

// cspell: disable

/* eslint-disable @typescript-eslint/naming-convention, no-lone-blocks */

import { ParseTree, RecognitionException, TerminalNode, Token, TokenStream } from "antlr4ng";

import { IFormalArgument, RegionType } from "./common.js";

import { FormalArgument } from "./FormalArgument.js";
import { CompiledST } from "./CompiledST.js";
import { CompilationState } from "./CompilationState.js";
import { Bytecode } from "./Bytecode.js";
import { ErrorType } from "../misc/ErrorType.js";
import { STGroup } from "../STGroup.js";
import { ErrorManager } from "../misc/ErrorManager.js";
import { TreeParser } from "../support/TreeParser.js";
import { TreeRuleReturnScope } from "../support/TreeRuleReturnScope.js";
import { Stack } from "../support/Stack.js";
import { Compiler } from "./Compiler.js";
import { RecognizerSharedState } from "../support/RecognizerSharedState.js";
import {
    AndConditionalContext, ArgContext, ArgsContext, CompoundElementContext, ConditionalContext, ElementContext,
    ExprNoCommaContext, ExprOptionsContext, ExprTagContext, IfstatContext, IncludeExprContext, ListContext,
    ListElementContext, MapExprContext, MapTemplateRefContext, MemberExprContext, NotConditionalContext, OptionContext,
    PrimaryContext, QualifiedIdContext, RegionContext, SingleElementContext, SubtemplateContext, TemplateAndEOFContext,
    TemplateContext,
} from "./generated/STParser.js";
import { Misc } from "../misc/Misc.js";
import { STLexer } from "./STLexer.js";

export class CodeGenerator extends TreeParser {
    public static readonly EOF = -1;
    public static readonly RBRACK = 17;
    public static readonly LBRACK = 16;
    public static readonly ELSE = 5;
    public static readonly ELLIPSIS = 11;
    public static readonly LCURLY = 20;
    public static readonly BANG = 10;
    public static readonly EQUALS = 12;
    public static readonly TEXT = 22;
    public static readonly ID = 25;
    public static readonly SEMI = 9;
    public static readonly LPAREN = 14;
    public static readonly IF = 4;
    public static readonly ELSEIF = 6;
    public static readonly COLON = 13;
    public static readonly RPAREN = 15;
    public static readonly WS = 27;
    public static readonly COMMA = 18;
    public static readonly RCURLY = 21;
    public static readonly ENDIF = 7;
    public static readonly RDELIM = 24;
    public static readonly SUPER = 8;
    public static readonly DOT = 19;
    public static readonly LDELIM = 23;
    public static readonly STRING = 26;
    public static readonly PIPE = 28;
    public static readonly OR = 29;
    public static readonly AND = 30;
    public static readonly INDENT = 31;
    public static readonly NEWLINE = 32;
    public static readonly AT = 33;
    public static readonly END = 34;
    public static readonly TRUE = 35;
    public static readonly FALSE = 36;
    public static readonly COMMENT = 37;
    public static readonly SLASH = 38;
    public static readonly EXPR = 39;
    public static readonly OPTIONS = 40;
    public static readonly PROP = 41;
    public static readonly PROP_IND = 42;
    public static readonly INCLUDE = 43;
    public static readonly INCLUDE_IND = 44;
    public static readonly EXEC_FUNC = 45;
    public static readonly INCLUDE_SUPER = 46;
    public static readonly INCLUDE_SUPER_REGION = 47;
    public static readonly INCLUDE_REGION = 48;
    public static readonly TO_STR = 49;
    public static readonly LIST = 50;
    public static readonly MAP = 51;
    public static readonly ZIP = 52;
    public static readonly SUBTEMPLATE = 53;
    public static readonly ARGS = 54;
    public static readonly ELEMENTS = 55;
    public static readonly REGION = 56;
    public static readonly NULL = 57;
    public static readonly INDENTED_EXPR = 58;

    public static template_scope = class template_scope {
        public state!: CompilationState;
    };

    public static region_return = class region_return extends TreeRuleReturnScope {
        public name!: string;
    };

    public static subtemplate_return = class subtemplate_return extends TreeRuleReturnScope {
        public name!: string;
    };

    public static conditional_return = class conditional_return extends TreeRuleReturnScope {
    };

    public static exprOptions_return = class exprOptions_return extends TreeRuleReturnScope {
    };

    public static mapTemplateRef_return = class mapTemplateRef_return extends TreeRuleReturnScope {
    };

    // $ANTLR end "mapTemplateRef"

    public static includeExpr_return = class includeExpr_return extends TreeRuleReturnScope {
    };

    // $ANTLR end "includeExpr"

    public static primary_return = class primary_return extends TreeRuleReturnScope {
    };

    // $ANTLR end "primary"

    public static qualifiedId_return = class qualifiedId_return extends TreeRuleReturnScope {
    };

    // $ANTLR end "arg"

    public static args_return = class args_return extends TreeRuleReturnScope {
        public n = 0;
        public namedArgs = false;
        public passThru = false;
    };

    // $ANTLR end "args"

    public static list_return = class list_return extends TreeRuleReturnScope {
    };

    // $ANTLR end "list"

    public static listElement_return = class listElement_return extends TreeRuleReturnScope {
    };

    // $ANTLR end "listElement"

    private outermostTemplateName?: string;	// name of overall template
    private outermostImpl!: CompiledST;
    private templateToken?: Token;			// overall template token
    private errMgr?: ErrorManager;
    private template_stack = new Stack<CodeGenerator.template_scope>();

    // overall template text
    #template?: string;
    #tree: ParseTree;

    #throwInternalError(): never {
        throw new Error("Internal error: unexpected parse tree structure");
    }

    public constructor(input: TokenStream, tree: ParseTree, errMgr?: ErrorManager, name?: string, template?: string,
        templateToken?: Token) {
        super(input, new RecognizerSharedState());

        this.#tree = tree;
        this.errMgr = errMgr;
        this.outermostTemplateName = name;
        this.#template = template;
        this.templateToken = templateToken;
    }

    public addArgument(args: FormalArgument[], t: Token): void {
        const name = t.text!;
        for (const arg of args) {
            if (arg.name === name) {
                this.errMgr?.compileTimeError(ErrorType.PARAMETER_REDEFINITION, this.templateToken, t, name);

                return;
            }
        }

        args.push(new FormalArgument(name));
    }

    // convenience funcs to hide offensive sending of emit messages to
    // CompilationState temp data object.

    public emit1(opNode: ParseTree | null, opcode: number, arg: string | number): void {
        this.template_stack.peek().state.emit1(opNode, opcode, arg);
    }

    public emit2(opNode: ParseTree | null, opcode: number, arg: number | string, arg2: number): void {
        this.template_stack.peek().state.emit2(opNode, opcode, arg, arg2);
    }

    public emit(opTree: ParseTree | null, opcode: number): void {
        this.template_stack.peek().state.emit(opTree, opcode);
    }

    public insert(addr: number, opcode: number, s: string): void {
        this.template_stack.peek().state.insert(addr, opcode, s);
    }

    public setOption(id: TerminalNode): void {
        this.template_stack.peek().state.setOption(id);
    }

    public write(addr: number, value: number): void {
        this.template_stack.peek().state.write(addr, value);
    }

    public address(): number {
        return this.template_stack.peek().state.ip;
    }

    public func(id: TerminalNode | null): void {
        this.template_stack.peek().state.func(this.templateToken!, id);
    }

    public refAttr(id: TerminalNode | null): void {
        this.template_stack.peek().state.refAttr(this.templateToken, id);
    }

    public defineString(s: string): number {
        return this.template_stack.peek().state.defineString(s);
    }

    // $ANTLR start "templateAndEOF"
    // CodeGenerator.g:142:1: templateAndEOF : template[null,null] EOF ;
    public templateAndEOF(context: TemplateAndEOFContext): void {
        try {
            // CodeGenerator.g:142:15: ( template[null,null] EOF )
            // CodeGenerator.g:143:5: template[null,null] EOF
            this.template(context.template());

            this.match(this.input, CodeGenerator.EOF);
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }
        finally {
            // do for sure before leaving
        }
    }

    // $ANTLR start "template"
    // CodeGenerator.g:146:1: template[String name, List<FormalArgument> args] returns [CompiledST impl] : chunk ;
    public template(context: TemplateContext, name?: string, args?: IFormalArgument[]): CompiledST {
        this.template_stack.push(new CodeGenerator.template_scope());
        this.template_stack.peek().state = new CompilationState(this.errMgr!, name, this.input);
        const impl = this.template_stack.peek().state.impl;
        if (this.template_stack.size() === 1) {
            this.outermostImpl = impl;
        }

        impl.defineFormalArgs(args); // make sure args are defined prior to compilation
        if (name && name.startsWith(Compiler.SUBTEMPLATE_PREFIX)) {
            impl.addArg(new FormalArgument("i"));
            impl.addArg(new FormalArgument("i0"));
        }
        impl.template = this.#template ?? ""; // always forget the entire template; char indexes are relative to it

        try {
            // CodeGenerator.g:160:2: ( chunk )
            // CodeGenerator.g:161:5: chunk
            this.handleElements(context.element());

            // finish off the CompiledST result
            if (this.template_stack.peek().state.stringTable) {
                impl.strings.push(...this.template_stack.peek().state.stringTable);
            }

            impl.codeSize = this.template_stack.peek().state.ip;

        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        } finally {
            // do for sure before leaving
            this.template_stack.pop();
        }

        return impl;
    }

    // CodeGenerator.g:167:1: chunk : ( element )* ;
    public handleElements(list: ElementContext[]): void {
        list.forEach((element) => {
            this.element(element);
        });

        /*
        try {
            // CodeGenerator.g:167:6: ( ( element )* )
            // CodeGenerator.g:168:5: ( element )*
            // CodeGenerator.g:168:5: ( element )*
            loop1:
            while (true) {
                let alt1 = 2;
                const LA1_0 = this.input.LA(1);
                if ((LA1_0 === CodeGenerator.IF || LA1_0 === CodeGenerator.TEXT || LA1_0 === CodeGenerator.NEWLINE
                    || LA1_0 === CodeGenerator.EXPR || LA1_0 === CodeGenerator.REGION
                    || LA1_0 === CodeGenerator.INDENTED_EXPR)) {
                    alt1 = 1;
                }

                switch (alt1) {
                    case 1: {
                        // CodeGenerator.g:168:5: element
                        this.element();

                        break;
                    }

                    default: {
                        break loop1;
                    }

                }
            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/
    }

    // CodeGenerator.g:171:1: element : ( ^( INDENTED_EXPR INDENT compoundElement[$INDENT] ) | compoundElement[null]
    // | ^( INDENTED_EXPR INDENT ( singleElement )? ) | singleElement );
    public element(context: ElementContext): void {
        //const INDENT1 = null;
        // const INDENT2 = null;

        if (context.singleElement() !== null) {
            const hasIndent = context.INDENT() !== null;
            if (hasIndent) {
                this.template_stack.peek().state.indent(context.INDENT(), context.INDENT()?.getText() ?? "");
            }
            this.singleElement(context.singleElement()!);

            if (hasIndent) {
                this.template_stack.peek().state.emit(Bytecode.INSTR_DEDENT);
            }
        } else if (context.compoundElement() !== null) {
            // Ignore the indent token, it's only used for singleElement.
            this.compoundElement(context.compoundElement()!);
        }

        /*try {
            // CodeGenerator.g:171:8: ( ^( INDENTED_EXPR INDENT compoundElement[$INDENT] ) | compoundElement[null]
            // | ^( INDENTED_EXPR INDENT ( singleElement )? ) | singleElement )
            let alt3 = 4;
            switch (this.input.LA(1)) {
                case CodeGenerator.INDENTED_EXPR: {
                    {
                        const LA3_1 = this.input.LA(2);
                        if ((LA3_1 === TreeParser.DOWN)) {
                            const LA3_4 = this.input.LA(3);
                            if ((LA3_4 === CodeGenerator.INDENT)) {
                                const LA3_5 = this.input.LA(4);
                                if ((LA3_5 === CodeGenerator.IF || LA3_5 === CodeGenerator.REGION)) {
                                    alt3 = 1;
                                }
                                else {
                                    if ((LA3_5 === TreeParser.UP || LA3_5 === CodeGenerator.TEXT
                                        || LA3_5 === CodeGenerator.NEWLINE || LA3_5 === CodeGenerator.EXPR)) {
                                        alt3 = 3;
                                    }

                                    else {
                                        const nvaeMark = this.input.mark();
                                        try {
                                            for (let nvaeConsume = 0; nvaeConsume < 4 - 1; nvaeConsume++) {
                                                this.input.consume();
                                            }
                                            this.#throwInternalError();

                                        } finally {
                                            this.input.seek(nvaeMark);
                                        }
                                    }
                                }

                            }

                            else {
                                const nvaeMark = this.input.mark();
                                try {
                                    for (let nvaeConsume = 0; nvaeConsume < 3 - 1; nvaeConsume++) {
                                        this.input.consume();
                                    }
                                    this.#throwInternalError();

                                } finally {
                                    this.input.seek(nvaeMark);
                                }
                            }

                        }

                        else {
                            const nvaeMark = this.input.mark();
                            try {
                                this.input.consume();
                                this.#throwInternalError();

                            } finally {
                                this.input.seek(nvaeMark);
                            }
                        }

                    }
                    break;
                }

                case STLexer.IF:
                case CodeGenerator.REGION: {
                    {
                        alt3 = 2;
                    }
                    break;
                }

                case STLexer.TEXT:
                case STLexer.NEWLINE:
                case CodeGenerator.EXPR: {
                    {
                        alt3 = 4;
                    }
                    break;
                }

                default: {
                    this.#throwInternalError();

                }

            }
            switch (alt3) {
                case 1: {
                    // CodeGenerator.g:172:5: ^( INDENTED_EXPR INDENT compoundElement[$INDENT] )
                    {
                        this.match(this.input, CodeGenerator.INDENTED_EXPR);
                        this.match(this.input, TreeParser.DOWN);
                        INDENT1 = this.match(this.input, CodeGenerator.INDENT);
                        this.compoundElement(INDENT1);

                        this.match(this.input, TreeParser.UP);

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:175:7: compoundElement[null]
                    {
                        this.compoundElement(null);

                    }
                    break;
                }

                case 3: {
                    // CodeGenerator.g:176:7: ^( INDENTED_EXPR INDENT ( singleElement )? )
                    {
                        this.match(this.input, CodeGenerator.INDENTED_EXPR);
                        this.match(this.input, TreeParser.DOWN);
                        INDENT2 = this.match(this.input, CodeGenerator.INDENT);
                        this.template_stack.peek().state.indent(INDENT2);
                        // CodeGenerator.g:177:66: ( singleElement )?
                        let alt2 = 2;
                        const LA2_0 = this.input.LA(1);
                        if ((LA2_0 === CodeGenerator.TEXT || LA2_0 === CodeGenerator.NEWLINE
                            || LA2_0 === CodeGenerator.EXPR)) {
                            alt2 = 1;
                        }
                        switch (alt2) {
                            case 1: {
                                // CodeGenerator.g:177:66: singleElement
                                {
                                    this.singleElement();

                                }
                                break;
                            }

                            default:

                        }

                        this.template_stack.peek().state.emit(Bytecode.INSTR_DEDENT);
                        this.match(this.input, TreeParser.UP);

                    }
                    break;
                }

                case 4: {
                    // CodeGenerator.g:179:7: singleElement
                    {
                        this.singleElement();

                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/
    }

    // CodeGenerator.g:182:1: singleElement : ( exprElement | TEXT | NEWLINE );
    public singleElement(context: SingleElementContext): void {
        //const TEXT3 = null;
        //const NEWLINE4 = null;

        if (context.exprTag() !== null) {
            this.exprTag(context.exprTag()!);
        } else if (context.TEXT() !== null) {
            const token = context.TEXT()!;

            const text = token.getText();
            if (text.length > 0) {
                this.emit1(token, Bytecode.INSTR_WRITE_STR, text);
            }
        } else if (context.NEWLINE() !== null) {
            this.emit(context.NEWLINE(), Bytecode.INSTR_NEWLINE);
        }

        /*try {
            // CodeGenerator.g:182:14: ( exprElement | TEXT | NEWLINE )
            let alt4 = 3;
            switch (this.input.LA(1)) {
                case CodeGenerator.EXPR: {
                    {
                        alt4 = 1;
                    }
                    break;
                }

                case STLexer.TEXT: {
                    {
                        alt4 = 2;
                    }
                    break;
                }

                case STLexer.NEWLINE: {
                    {
                        alt4 = 3;
                    }
                    break;
                }

                default: {
                    this.#throwInternalError();

                }

            }
            switch (alt4) {
                case 1: {
                    // CodeGenerator.g:183:5: exprElement
                    {
                        this.exprTag();

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:184:7: TEXT
                    {
                        TEXT3 = this.match(this.input, CodeGenerator.TEXT);

                        const text = TEXT3?.getText() ?? "";
                        if (text.length > 0) {
                            this.emit1(TEXT3, Bytecode.INSTR_WRITE_STR, text);
                        }

                    }
                    break;
                }

                case 3: {
                    // CodeGenerator.g:189:7: NEWLINE
                    {
                        NEWLINE4 = this.match(this.input, CodeGenerator.NEWLINE);
                        this.emit(NEWLINE4, Bytecode.INSTR_NEWLINE);
                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/
    }

    // CodeGenerator.g:192:1: compoundElement[CommonTree indent] : ( ifstat[indent] | region[indent] );
    public compoundElement(context: CompoundElementContext): void {
        if (context.ifstat() !== null) {
            this.ifstat(context.ifstat()!);
        } else if (context.region() !== null) {
            this.region(context.region()!);
        }

        /*try {
            // CodeGenerator.g:192:35: ( ifstat[indent] | region[indent] )
            let alt5 = 2;
            const LA5_0 = this.input.LA(1);
            if ((LA5_0 === CodeGenerator.IF)) {
                alt5 = 1;
            }
            else {
                if ((LA5_0 === CodeGenerator.REGION)) {
                    alt5 = 2;
                }

                else {
                    this.#throwInternalError();

                }
            }

            switch (alt5) {
                case 1: {
                    // CodeGenerator.g:193:5: ifstat[indent]
                    {
                        this.ifstat(indent);

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:194:7: region[indent]
                    {
                        this.region(indent);

                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/
    }

    // CodeGenerator.g:197:1: exprElement : ^( EXPR expr ( exprOptions )? ) ;
    public exprTag(context: ExprTagContext): void {
        //let EXPR5 = null;

        let op = Bytecode.INSTR_WRITE;
        this.expr(context.expr().mapExpr());
        if (context.exprOptions() !== null) {
            this.exprOptions(context.exprOptions()!);
            op = Bytecode.INSTR_WRITE_OPT;
        }
        this.emit(context.expr(), op);

        /*try {
            // CodeGenerator.g:198:47: ( ^( EXPR expr ( exprOptions )? ) )
            // CodeGenerator.g:199:5: ^( EXPR expr ( exprOptions )? )
            {
                EXPR5 = this.match(this.input, CodeGenerator.EXPR);
                this.match(this.input, TreeParser.DOWN);
                this.expr();

                // CodeGenerator.g:199:17: ( exprOptions )?
                let alt6 = 2;
                const LA6_0 = this.input.LA(1);
                if ((LA6_0 === CodeGenerator.OPTIONS)) {
                    alt6 = 1;
                }
                switch (alt6) {
                    case 1: {
                        // CodeGenerator.g:199:18: exprOptions
                        {
                            this.exprOptions();

                            op = Bytecode.INSTR_WRITE_OPT;
                        }
                        break;
                    }

                    default:

                }

                this.match(this.input, TreeParser.UP);

                /*
                CompilationState state = template_stack.peek().state;
                CompiledST impl = state.impl;
                if ( impl.instrs[state.ip-1] == Bytecode.INSTR_LOAD_LOCAL ) {
                    impl.instrs[state.ip-1] = Bytecode.INSTR_WRITE_LOCAL;
                }
                else {
                    emit(EXPR5, op);
                }
                * /
                this.emit(EXPR5, op);

            }

        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/
    }

    // CodeGenerator.g:214:1: region[CommonTree indent] returns [String name] : ^( REGION ID template[$name,null] ) ;
    public region(context: RegionContext): void {
        //const retval = new CodeGenerator.region_return();
        //retval.start = this.input.LT(1);

        //let ID6 = null;
        //let template7 = null;

        if (context._indent) {
            this.template_stack.peek().state.indent(context, context._indent.text ?? "");
        }

        const id = context.ID();
        const name = STGroup.getMangledRegionName(this.outermostTemplateName!, id.getText() ?? "");
        const template = this.template(context.template(), name, []);

        template.isRegion = true;
        template.regionDefType = RegionType.EMBEDDED;
        template.templateDefStartToken = id.symbol;

        this.outermostImpl.addImplicitlyDefinedTemplate(template);
        this.emit2(context, Bytecode.INSTR_NEW, name, 0);
        this.emit(context, Bytecode.INSTR_WRITE);

        if (context._indent) {
            this.template_stack.peek().state.emit(Bytecode.INSTR_DEDENT);
        }

        /* try {
             // CodeGenerator.g:221:2: ( ^( REGION ID template[$name,null] ) )
             // CodeGenerator.g:222:5: ^( REGION ID template[$name,null] )
             {
                 this.match(this.input, CodeGenerator.REGION);
                 this.match(this.input, TreeParser.DOWN);
                 ID6 = this.match(this.input, CodeGenerator.ID);
                 retval.name = STGroup.getMangledRegionName(this.outermostTemplateName!, ID6?.getText() ?? "");
                 template7 = this.template(retval.name, []);

                 const sub = template7;
                 sub.isRegion = true;
                 sub.regionDefType = RegionType.EMBEDDED;
                 sub.templateDefStartToken = ID6?.token;

                 this.outermostImpl.addImplicitlyDefinedTemplate(sub);
                 this.emit2((retval.start), Bytecode.INSTR_NEW, retval.name, 0);
                 this.emit((retval.start), Bytecode.INSTR_WRITE);

                 this.match(this.input, TreeParser.UP);

             }

             if (indent !== null) {
                 this.template_stack.peek().state.emit(Bytecode.INSTR_DEDENT);
             }

         } catch (re) {
             if (re instanceof RecognitionException) {
                 this.reportError(re);
                 this.recover(this.input, re);
             } else {
                 throw re;
             }
         }*/

        //return retval;
    }

    // CodeGenerator.g:236:1: subtemplate returns [String name, int nargs] : ( ^( SUBTEMPLATE
    // ( ^( ARGS ( ID )+ ) )* template[$name,args] ) | SUBTEMPLATE );
    public subtemplate(context: SubtemplateContext): CodeGenerator.subtemplate_return {
        const retval = new CodeGenerator.subtemplate_return();
        retval.start = context;

        // let ID8 = null;
        // let SUBTEMPLATE10 = null;
        // let SUBTEMPLATE11 = null;
        // let template9 = null;

        retval.name = Compiler.getNewSubtemplateName();
        const args = new Array<FormalArgument>();

        if (context.template() === null) {
            // Confusing original code: according to the grammar there can be no subtemplate without a template.
            // However, the original tree grammar had a case for this, so we keep it.
            const sub = new CompiledST();
            sub.name = retval.name;
            sub.template = "";
            sub.addArg(new FormalArgument("i"));
            sub.addArg(new FormalArgument("i0"));
            sub.isAnonSubtemplate = true;
            sub.templateDefStartToken = context.start!;
            sub.ast = context;
            sub.tokens = this.input;

            this.outermostImpl.addImplicitlyDefinedTemplate(sub);
        } else {
            context.ID().forEach((id) => {
                this.addArgument(args, id.symbol);
            });

            retval.nargs = args.length;
            const sub = this.template(context.template(), retval.name, args);
            sub.isAnonSubtemplate = true;
            sub.templateDefStartToken = context.template().start!;
            sub.ast = context.template();
            sub.tokens = this.input;

            this.outermostImpl.addImplicitlyDefinedTemplate(sub);
        }

        /* try {
             // CodeGenerator.g:241:2: ( ^( SUBTEMPLATE ( ^( ARGS ( ID )+ ) )* template[$name,args] ) | SUBTEMPLATE )
             let alt9 = 2;
             const LA9_0 = this.input.LA(1);
             if ((LA9_0 === CodeGenerator.SUBTEMPLATE)) {
                 const LA9_1 = this.input.LA(2);
                 if ((LA9_1 === TreeParser.DOWN)) {
                     alt9 = 1;
                 }
                 else {
                     if (((LA9_1 >= TreeParser.UP && LA9_1 <= CodeGenerator.ELSEIF)
                         || (LA9_1 >= CodeGenerator.BANG && LA9_1 <= CodeGenerator.EQUALS)
                         || LA9_1 === CodeGenerator.TEXT || (LA9_1 >= CodeGenerator.ID && LA9_1 <= CodeGenerator.STRING)
                         || (LA9_1 >= CodeGenerator.OR && LA9_1 <= CodeGenerator.AND) || LA9_1 === CodeGenerator.NEWLINE
                         || (LA9_1 >= CodeGenerator.TRUE && LA9_1 <= CodeGenerator.FALSE)
                         || (LA9_1 >= CodeGenerator.EXPR
                             && LA9_1 <= CodeGenerator.SUBTEMPLATE) || (LA9_1 >= CodeGenerator.REGION
                                 && LA9_1 <= CodeGenerator.INDENTED_EXPR))) {
                         alt9 = 2;
                     }

                     else {
                         const nvaeMark = this.input.mark();
                         try {
                             this.input.consume();
                             this.#throwInternalError();

                         } finally {
                             this.input.seek(nvaeMark);
                         }
                     }
                 }

             }

             else {
                 this.#throwInternalError();

             }

             switch (alt9) {
                 case 1: {
                     // CodeGenerator.g:242:5: ^( SUBTEMPLATE ( ^( ARGS ( ID )+ ) )* template[$name,args] )
                     {
                         SUBTEMPLATE10 = this.match(this.input, CodeGenerator.SUBTEMPLATE)!;
                         if (this.input.LA(1) === TreeParser.DOWN) {
                             this.match(this.input, TreeParser.DOWN);
                             // CodeGenerator.g:243:21: ( ^( ARGS ( ID )+ ) )*
                             loop8:
                             while (true) {
                                 let alt8 = 2;
                                 const LA8_0 = this.input.LA(1);
                                 if ((LA8_0 === CodeGenerator.ARGS)) {
                                     alt8 = 1;
                                 }

                                 switch (alt8) {
                                     case 1: {
                                         // CodeGenerator.g:243:22: ^( ARGS ( ID )+ )
                                         {
                                             this.match(this.input, CodeGenerator.ARGS);
                                             this.match(this.input, TreeParser.DOWN);
                                             // CodeGenerator.g:243:29: ( ID )+
                                             let cnt7 = 0;
                                             loop7:
                                             while (true) {
                                                 let alt7 = 2;
                                                 const LA7_0 = this.input.LA(1);
                                                 if ((LA7_0 === CodeGenerator.ID)) {
                                                     alt7 = 1;
                                                 }

                                                 switch (alt7) {
                                                     case 1: {
                                                         // CodeGenerator.g:243:30: ID
                                                         {
                                                             ID8 = this.match(this.input, CodeGenerator.ID)!;
                                                             this.addArgument(args, ID8.token);
                                                         }
                                                         break;
                                                     }

                                                     default: {
                                                         if (cnt7 >= 1) {
                                                             break loop7;
                                                         }

                                                         const eee = new EarlyExitException(7, this.input);
                                                         throw eee;
                                                     }

                                                 }
                                                 cnt7++;
                                             }

                                             this.match(this.input, TreeParser.UP);

                                         }
                                         break;
                                     }

                                     default: {
                                         break loop8;
                                     }

                                 }
                             }

                             retval.nargs = args.length;
                             template9 = this.template(retval.name, args);

                             const sub = template9;
                             sub.isAnonSubtemplate = true;
                             sub.templateDefStartToken = SUBTEMPLATE10.token;
                             sub.ast = SUBTEMPLATE10;
                             sub.ast.setUnknownTokenBoundaries();
                             sub.tokens = this.input.getTokenStream();

                             this.outermostImpl.addImplicitlyDefinedTemplate(sub);

                             this.match(this.input, TreeParser.UP);
                         }

                     }
                     break;
                 }

                 case 2: {
                     // CodeGenerator.g:254:7: SUBTEMPLATE
                     {
                         SUBTEMPLATE11 = this.match(this.input, CodeGenerator.SUBTEMPLATE)!;

                         const sub = new CompiledST();
                         sub.name = retval.name;
                         sub.template = "";
                         sub.addArg(new FormalArgument("i"));
                         sub.addArg(new FormalArgument("i0"));
                         sub.isAnonSubtemplate = true;
                         sub.templateDefStartToken = SUBTEMPLATE11.token;
                         sub.ast = SUBTEMPLATE11;
                         sub.ast.setUnknownTokenBoundaries();
                         sub.tokens = this.input.getTokenStream();

                         this.outermostImpl.addImplicitlyDefinedTemplate(sub);

                     }
                     break;
                 }

                 default:

             }
         } catch (re) {
             if (re instanceof RecognitionException) {
                 this.reportError(re);
                 this.recover(this.input, re);
             } else {
                 throw re;
             }
         }*/

        return retval;
    }

    // CodeGenerator.g:271:1: ifstat[CommonTree indent] : ^(i= 'if' conditional chunk
    // ( ^(eif= 'elseif' ec= conditional chunk ) )* ( ^(el= 'else' chunk ) )? ) ;
    public ifstat(context: IfstatContext): void {
        // let i = null;
        // let eif = null;
        // let el = null;
        // let ec = null;

        /**
         * Tracks address of branch operand (in code block).  It's how
         *  we backpatch forward references when generating code for IFs.
         */
        let prevBranchOperand = -1;

        /**
         * Branch instruction operands that are forward refs to end of IF.
         *  We need to update them once we see the endif.
         */
        const endRefs = new Array<number>();
        if (context._indent) {
            this.template_stack.peek().state.indent(context, context._indent.text ?? "");
        }

        this.conditional(context.conditional(0)!);

        prevBranchOperand = this.address() + 1;
        this.emit1(context.IF(), Bytecode.INSTR_BRF, -1); // write placeholder as branch target

        this.handleElements(context._t1!.element());

        if (context.ELSEIF().length > 0) {
            for (let i = 0; i < context.ELSEIF().length; ++i) {
                const eif = context.ELSEIF(i);
                endRefs.push(this.address() + 1);
                this.emit1(eif, Bytecode.INSTR_BR, -1); // br end

                // update previous branch instruction
                this.write(prevBranchOperand, this.address());
                prevBranchOperand = -1;

                const ec = context.conditional(i + 1)!; // +1 since we did first one already (for "if").
                this.conditional(ec);
                prevBranchOperand = this.address() + 1;

                // write placeholder as branch target
                this.emit1(ec, Bytecode.INSTR_BRF, -1);

                this.handleElements(context._t2[i]!.element());
            }
        }

        if (context.ELSE() !== null) {
            endRefs.push(this.address() + 1);
            this.emit1(context.ELSE(), Bytecode.INSTR_BR, -1); // br end

            // update previous branch instruction
            this.write(prevBranchOperand, this.address());
            prevBranchOperand = -1;

            this.handleElements(context._t3!.element());
        }

        if (prevBranchOperand >= 0) {
            this.write(prevBranchOperand, this.address());
        }

        for (const opnd of endRefs) {
            this.write(opnd, this.address());
        }

        if (context._indent) {
            this.template_stack.peek().state.emit(Bytecode.INSTR_DEDENT);
        }

        /*try {
            // CodeGenerator.g:285:2: ( ^(i= 'if' conditional chunk ( ^(eif= 'elseif' ec= conditional chunk ) )*
            // ( ^(el= 'else' chunk ) )? ) )
            // CodeGenerator.g:286:5: ^(i= 'if' conditional chunk ( ^(eif= 'elseif' ec= conditional chunk ) )*
            // ( ^(el= 'else' chunk ) )? )
            {
                i = this.match(this.input, CodeGenerator.IF);
                this.match(this.input, TreeParser.DOWN);
                this.conditional();

                prevBranchOperand = this.address() + 1;
                this.emit1(i, Bytecode.INSTR_BRF, -1); // write placeholder as branch target

                this.handleElements();

                // CodeGenerator.g:290:12: ( ^(eif= 'elseif' ec= conditional chunk ) )*
                loop10:
                while (true) {
                    let alt10 = 2;
                    const LA10_0 = this.input.LA(1);
                    if ((LA10_0 === CodeGenerator.ELSEIF)) {
                        alt10 = 1;
                    }

                    switch (alt10) {
                        case 1: {
                            // CodeGenerator.g:291:13: ^(eif= 'elseif' ec= conditional chunk )
                            {
                                eif = this.match(this.input, CodeGenerator.ELSEIF);

                                endRefs.push(this.address() + 1);
                                this.emit1(eif, Bytecode.INSTR_BR, -1); // br end
                                // update previous branch instruction
                                this.write(prevBranchOperand, this.address());
                                prevBranchOperand = -1;

                                this.match(this.input, TreeParser.DOWN);
                                ec = this.conditional();

                                prevBranchOperand = this.address() + 1;
                                // write placeholder as branch target
                                this.emit1((ec !== null ? (ec.start as CommonTree) : null), Bytecode.INSTR_BRF, -1);

                                this.handleElements();

                                this.match(this.input, TreeParser.UP);

                            }
                            break;
                        }

                        default: {
                            break loop10;
                        }

                    }
                }

                // CodeGenerator.g:304:12: ( ^(el= 'else' chunk ) )?
                let alt11 = 2;
                const LA11_0 = this.input.LA(1);
                if ((LA11_0 === CodeGenerator.ELSE)) {
                    alt11 = 1;
                }
                switch (alt11) {
                    case 1: {
                        // CodeGenerator.g:305:13: ^(el= 'else' chunk )
                        {
                            el = this.match(this.input, CodeGenerator.ELSE);

                            endRefs.push(this.address() + 1);
                            this.emit1(el, Bytecode.INSTR_BR, -1); // br end
                            // update previous branch instruction
                            this.write(prevBranchOperand, this.address());
                            prevBranchOperand = -1;

                            if (this.input.LA(1) === TreeParser.DOWN) {
                                this.match(this.input, TreeParser.DOWN);
                                this.handleElements();

                                this.match(this.input, TreeParser.UP);
                            }

                        }
                        break;
                    }

                    default:

                }

                this.match(this.input, TreeParser.UP);

                if (prevBranchOperand >= 0) {
                    this.write(prevBranchOperand, this.address());
                }
                for (const opnd of endRefs) {
                    this.write(opnd, this.address());
                }

            }

            if (indent !== null) {
                this.template_stack.peek().state.emit(Bytecode.INSTR_DEDENT);
            }

        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/
    }

    // CodeGenerator.g:323:1: conditional : ( ^( OR conditional conditional ) | ^( AND conditional conditional )
    // | ^( BANG conditional ) | expr );
    public conditional(context: ConditionalContext): void {
        //const retval = new CodeGenerator.conditional_return();
        //retval.start = this.input.LT(1);

        // let OR12 = null;
        // let AND13 = null;
        // let BANG14 = null;

        // Strange handling in the original code: a single AND expression is handled as `expr`, which misses
        // handling for negation. This is fixed here.
        this.andConditional(context.andConditional(0)!);
        if (context.OR().length > 0) {
            for (let i = 0; i < context.andConditional().length - 1; ++i) {
                this.andConditional(context.andConditional(i + 1)!);
                this.emit(context.OR(i), Bytecode.INSTR_OR);
            }
        }

        /* try {
             // CodeGenerator.g:323:12: ( ^( OR conditional conditional ) | ^( AND conditional conditional )
             // | ^( BANG conditional ) | expr )
             let alt12 = 4;
             switch (this.input.LA(1)) {
                 case STLexer.OR: {
                     {
                         alt12 = 1;
                     }
                     break;
                 }

                 case STLexer.AND: {
                     {
                         alt12 = 2;
                     }
                     break;
                 }

                 case STLexer.BANG: {
                     {
                         alt12 = 3;
                     }
                     break;
                 }

                 case STLexer.ID:
                 case STLexer.STRING:
                 case STLexer.TRUE:
                 case STLexer.FALSE:
                 case CodeGenerator.PROP:
                 case CodeGenerator.PROP_IND:
                 case CodeGenerator.INCLUDE:
                 case CodeGenerator.INCLUDE_IND:
                 case CodeGenerator.EXEC_FUNC:
                 case CodeGenerator.INCLUDE_SUPER:
                 case CodeGenerator.INCLUDE_SUPER_REGION:
                 case CodeGenerator.INCLUDE_REGION:
                 case CodeGenerator.TO_STR:
                 case CodeGenerator.LIST:
                 case CodeGenerator.MAP:
                 case CodeGenerator.ZIP:
                 case CodeGenerator.SUBTEMPLATE: {
                     {
                         alt12 = 4;
                     }
                     break;
                 }

                 default: {
                     this.#throwInternalError();

                 }

             }
             switch (alt12) {
                 case 1: {
                     // CodeGenerator.g:324:5: ^( OR conditional conditional )
                     {
                         OR12 = this.match(this.input, CodeGenerator.OR);
                         this.match(this.input, TreeParser.DOWN);
                         this.conditional();

                         this.conditional();

                         this.match(this.input, TreeParser.UP);

                         this.emit(OR12, Bytecode.INSTR_OR);
                     }
                     break;
                 }

                 case 2: {
                     // CodeGenerator.g:325:7: ^( AND conditional conditional )
                     {
                         AND13 = this.match(this.input, CodeGenerator.AND);
                         this.match(this.input, TreeParser.DOWN);
                         this.conditional();

                         this.conditional();

                         this.match(this.input, TreeParser.UP);

                         this.emit(AND13, Bytecode.INSTR_AND);
                     }
                     break;
                 }

                 case 3: {
                     // CodeGenerator.g:326:7: ^( BANG conditional )
                     {
                         BANG14 = this.match(this.input, CodeGenerator.BANG);
                         this.match(this.input, TreeParser.DOWN);
                         this.conditional();

                         this.match(this.input, TreeParser.UP);

                         this.emit(BANG14, Bytecode.INSTR_NOT);
                     }
                     break;
                 }

                 case 4: {
                     // CodeGenerator.g:327:7: expr
                     {
                         this.expr();

                     }
                     break;
                 }

                 default:

             }
         } catch (re) {
             if (re instanceof RecognitionException) {
                 this.reportError(re);
                 this.recover(this.input, re);
             } else {
                 throw re;
             }
         }*/

        // return retval;
    }

    public andConditional(context: AndConditionalContext): void {
        this.notConditional(context.notConditional(0)!);
        if (context.AND().length > 0) {
            for (let i = 0; i < context.notConditional().length - 1; ++i) {
                this.notConditional(context.notConditional(i + 1)!);
                this.emit(context.AND(i), Bytecode.INSTR_AND);
            }
        }
    }

    public notConditional(context: NotConditionalContext): void {
        this.memberExpr(context.memberExpr()!);
        context.BANG().forEach((bang) => {
            this.emit(bang, Bytecode.INSTR_NOT);
        });
    }

    // CodeGenerator.g:330:1: exprOptions : ^( OPTIONS ( option )* ) ;
    public exprOptions(context: ExprOptionsContext): void {
        //const retval = new CodeGenerator.exprOptions_return();
        //retval.start = this.input.LT(1);

        this.emit(context, Bytecode.INSTR_OPTIONS);
        context.option().forEach((option) => {
            this.option(option);
        });

        /*try {
            // CodeGenerator.g:330:12: ( ^( OPTIONS ( option )* ) )
            // CodeGenerator.g:331:5: ^( OPTIONS ( option )* )
            {
                this.emit(context, Bytecode.INSTR_OPTIONS);
                this.match(this.input, CodeGenerator.OPTIONS);
                if (this.input.LA(1) === TreeParser.DOWN) {
                    this.match(this.input, TreeParser.DOWN);
                    // CodeGenerator.g:331:55: ( option )*
                    loop13:
                    while (true) {
                        let alt13 = 2;
                        const LA13_0 = this.input.LA(1);
                        if ((LA13_0 === CodeGenerator.EQUALS)) {
                            alt13 = 1;
                        }

                        switch (alt13) {
                            case 1: {
                                // CodeGenerator.g:331:55: option
                                {
                                    this.option();

                                }
                                break;
                            }

                            default: {
                                break loop13;
                            }

                        }
                    }

                    this.match(this.input, TreeParser.UP);
                }

            }

        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/

        //return retval;
    }

    // CodeGenerator.g:334:1: option : ^( '=' ID expr ) ;
    public option(context: OptionContext): void {
        //const ID15 = null;

        const id = context.ID();
        if (context.exprNoComma()) {
            this.exprNoComma(context.exprNoComma()!);
        } else {
            // If no value is given use the default. The parser takes care not to allow invalid options.
            const defVal = Compiler.defaultOptionValues.get(id.getText());
            this.emit1(id, Bytecode.INSTR_LOAD_STR, defVal!);
        }
        this.setOption(id);

        /*try {
            // CodeGenerator.g:334:7: ( ^( '=' ID expr ) )
            // CodeGenerator.g:335:5: ^( '=' ID expr )
            {
                this.match(this.input, CodeGenerator.EQUALS);
                this.match(this.input, TreeParser.DOWN);
                ID15 = this.match(this.input, CodeGenerator.ID)!;
                this.exprNoComma();

                this.match(this.input, TreeParser.UP);

                this.setOption(ID15);
            }

        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/
    }

    // CodeGenerator.g:338:1: expr : ( ^( ZIP ^( ELEMENTS ( expr )+ ) mapTemplateRef[ne] )
    // | ^( MAP expr ( mapTemplateRef[1] )+ ) | prop | includeExpr );
    public expr(context: MapExprContext): void {
        //const ZIP16 = null;
        //const MAP17 = null;

        let ne = 0;
        let colonIndex = -1;
        context.memberExpr().forEach((memberExpr) => {
            this.memberExpr(memberExpr);
            ne++;
        });

        if (ne > 1) { // More than one member expression. Must be a ZIP map.
            this.mapTemplateRef(context.mapTemplateRef(0)!, ne);
            this.emit1(context, Bytecode.INSTR_ZIP_MAP, ne);

            // Jump over the initial member expression and any following comma/member expression pair.
            // This takes us to the first colon token, which is followed by the first template ref.
            // Jump over these 2 too.
            colonIndex = 2 * (ne - 1) + 1 + 2;
        } else if (context.COLON().length > 0) {
            colonIndex = 1; // Must directly follow the (only) member expression.
        }

        // In the next step we need to count the template refs between colon tokens.
        if (colonIndex < 0 || colonIndex >= context.getChildCount()) {
            // No (more) colon tokens found, so we're done.
            return;
        }

        // Now walk over all child nodes, starting at the first colon, and handle the template refs.
        let nt = 0;
        for (let i = colonIndex + 1; i < context.getChildCount(); ++i) {
            const child = context.getChild(i);
            if (child instanceof TerminalNode) {
                if (child.symbol.type === STLexer.COLON) {
                    if (nt > 1) {
                        this.emit1(context, Bytecode.INSTR_ROT_MAP, nt);
                    } else {
                        this.emit(context, Bytecode.INSTR_MAP);
                    }

                    nt = 0;
                } // Otherwise it's a comma, which we can ignore.
            } else {
                this.mapTemplateRef(child as MapTemplateRefContext, 1);
                ++nt;
            }
        }

        if (nt > 0) {
            if (nt > 1) {
                this.emit1(context, Bytecode.INSTR_ROT_MAP, nt);
            } else {
                this.emit(context, Bytecode.INSTR_MAP);
            }
        }

        /*try {
            // CodeGenerator.g:339:32: ( ^( ZIP ^( ELEMENTS ( expr )+ ) mapTemplateRef[ne] )
            // | ^( MAP expr ( mapTemplateRef[1] )+ ) | prop | includeExpr )
            let alt16 = 4;
            switch (this.input.LA(1)) {
                case CodeGenerator.ZIP: {
                    {
                        alt16 = 1;
                    }
                    break;
                }

                case CodeGenerator.MAP: {
                    {
                        alt16 = 2;
                    }
                    break;
                }

                case CodeGenerator.PROP:
                case CodeGenerator.PROP_IND: {
                    {
                        alt16 = 3;
                    }
                    break;
                }

                case STLexer.ID:
                case STLexer.STRING:
                case STLexer.TRUE:
                case STLexer.FALSE:
                case CodeGenerator.INCLUDE:
                case CodeGenerator.INCLUDE_IND:
                case CodeGenerator.EXEC_FUNC:
                case CodeGenerator.INCLUDE_SUPER:
                case CodeGenerator.INCLUDE_SUPER_REGION:
                case CodeGenerator.INCLUDE_REGION:
                case CodeGenerator.TO_STR:
                case CodeGenerator.LIST:
                case CodeGenerator.SUBTEMPLATE: {
                    {
                        alt16 = 4;
                    }
                    break;
                }

                default: {
                    this.#throwInternalError();

                }

            }
            switch (alt16) {
                case 1: {
                    // CodeGenerator.g:340:5: ^( ZIP ^( ELEMENTS ( expr )+ ) mapTemplateRef[ne] )
                    {
                        ZIP16 = this.match(this.input, CodeGenerator.ZIP);
                        this.match(this.input, TreeParser.DOWN);
                        this.match(this.input, CodeGenerator.ELEMENTS);
                        this.match(this.input, TreeParser.DOWN);
                        // CodeGenerator.g:340:22: ( expr )+
                        let cnt14 = 0;
                        loop14:
                        while (true) {
                            let alt14 = 2;
                            const LA14_0 = this.input.LA(1);
                            if (((LA14_0 >= CodeGenerator.ID && LA14_0 <= CodeGenerator.STRING)
                                || (LA14_0 >= CodeGenerator.TRUE && LA14_0 <= CodeGenerator.FALSE)
                                || (LA14_0 >= CodeGenerator.PROP && LA14_0 <= CodeGenerator.SUBTEMPLATE))) {
                                alt14 = 1;
                            }

                            switch (alt14) {
                                case 1: {
                                    // CodeGenerator.g:340:23: expr
                                    {
                                        this.expr();

                                        ne++;
                                    }
                                    break;
                                }

                                default: {
                                    if (cnt14 >= 1) {
                                        break loop14;
                                    }

                                    const eee = new EarlyExitException(14, this.input);
                                    throw eee;
                                }

                            }
                            cnt14++;
                        }

                        this.match(this.input, TreeParser.UP);

                        this.mapTemplateRef(ne);

                        this.match(this.input, TreeParser.UP);

                        this.emit1(ZIP16, Bytecode.INSTR_ZIP_MAP, ne);
                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:341:7: ^( MAP expr ( mapTemplateRef[1] )+ )
                    {
                        MAP17 = this.match(this.input, CodeGenerator.MAP);
                        this.match(this.input, TreeParser.DOWN);
                        this.expr();

                        // CodeGenerator.g:341:18: ( mapTemplateRef[1] )+
                        let cnt15 = 0;
                        loop15:
                        while (true) {
                            let alt15 = 2;
                            const LA15_0 = this.input.LA(1);
                            if (((LA15_0 >= CodeGenerator.INCLUDE && LA15_0 <= CodeGenerator.INCLUDE_IND)
                                || LA15_0 === CodeGenerator.SUBTEMPLATE)) {
                                alt15 = 1;
                            }

                            switch (alt15) {
                                case 1: {
                                    // CodeGenerator.g:341:19: mapTemplateRef[1]
                                    {
                                        this.mapTemplateRef(1);

                                        nt++;
                                    }
                                    break;
                                }

                                default: {
                                    if (cnt15 >= 1) {
                                        break loop15;
                                    }

                                    const eee = new EarlyExitException(15, this.input);
                                    throw eee;
                                }

                            }
                            cnt15++;
                        }

                        this.match(this.input, TreeParser.UP);

                        if (nt > 1) {
                            this.emit1(MAP17, nt > 1 ? Bytecode.INSTR_ROT_MAP : Bytecode.INSTR_MAP, nt);
                        }

                        else {
                            this.emit(MAP17, Bytecode.INSTR_MAP);
                        }

                    }
                    break;
                }

                case 3: {
                    // CodeGenerator.g:345:7: prop
                    {
                        this.prop();

                    }
                    break;
                }

                case 4: {
                    // CodeGenerator.g:346:7: includeExpr
                    {
                        this.includeExpr();

                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/
    }

    public exprNoComma(context: ExprNoCommaContext): void {
        this.memberExpr(context.memberExpr());
        if (context.mapTemplateRef() !== null) {
            this.mapTemplateRef(context.mapTemplateRef()!, 1);
            this.emit(context, Bytecode.INSTR_MAP);
        }

    }

    public memberExpr(context: MemberExprContext): void {
        this.includeExpr(context.includeExpr()!);
        let index = 1;

        while (index < context.children!.length) {
            // Jump over the dot.
            ++index;

            const child = context.children![index++] as TerminalNode;
            if (child.symbol.type === STLexer.ID) {
                // A simple ID.
                this.prop(child);
            } else {
                // A map expression in parentheses.
                this.prop(context.children![index]);
                index += 2;
            }
        }
    }

    // CodeGenerator.g:349:1: prop : ( ^( PROP expr ID ) | ^( PROP_IND expr expr ) );
    public prop(context: ParseTree): void {
        //let PROP18 = null;
        //let ID19 = null;
        //let PROP_IND20 = null;

        if (context instanceof TerminalNode) {
            // Must be an ID.
            this.emit1(context, Bytecode.INSTR_LOAD_PROP, context.getText() ?? "");
        } else {
            // A map expression.
            const expression = context as MapExprContext;
            this.expr(expression);
            this.emit(expression, Bytecode.INSTR_LOAD_PROP_IND);

        }

        /*try {
            // CodeGenerator.g:349:5: ( ^( PROP expr ID ) | ^( PROP_IND expr expr ) )
            let alt17 = 2;
            const LA17_0 = this.input.LA(1);
            if ((LA17_0 === CodeGenerator.PROP)) {
                alt17 = 1;
            }
            else {
                if ((LA17_0 === CodeGenerator.PROP_IND)) {
                    alt17 = 2;
                }

                else {
                    this.#throwInternalError();

                }
            }

            switch (alt17) {
                case 1: {
                    // CodeGenerator.g:350:5: ^( PROP expr ID )
                    {
                        PROP18 = this.match(this.input, CodeGenerator.PROP);
                        this.match(this.input, TreeParser.DOWN);
                        this.expr();

                        ID19 = this.match(this.input, CodeGenerator.ID);
                        this.match(this.input, TreeParser.UP);

                        this.emit1(PROP18, Bytecode.INSTR_LOAD_PROP, ID19?.getText() ?? "");
                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:351:7: ^( PROP_IND expr expr )
                    {
                        PROP_IND20 = this.match(this.input, CodeGenerator.PROP_IND);
                        this.match(this.input, TreeParser.DOWN);
                        this.expr();

                        this.expr();

                        this.match(this.input, TreeParser.UP);

                        this.emit(PROP_IND20, Bytecode.INSTR_LOAD_PROP_IND);
                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/
    }

    // CodeGenerator.g:354:1: mapTemplateRef[int num_exprs] : ( ^( INCLUDE qualifiedId args ) | subtemplate
    // | ^( INCLUDE_IND expr args ) );
    public mapTemplateRef(context: MapTemplateRefContext, num_exprs: number): void {
        //const retval = new CodeGenerator.mapTemplateRef_return();
        //retval.start = this.input.LT(1);

        // let INCLUDE21 = null;
        // let INCLUDE_IND25 = null;
        // let args22 = null;
        // let qualifiedId23 = null;
        // let subtemplate24 = null;
        // let args26 = null;

        if (context.qualifiedId() !== null) {
            for (let i = 1; i <= num_exprs; i++) {
                this.emit(context.qualifiedId(), Bytecode.INSTR_NULL);
            }

            const args22 = this.args(context.args());

            if (args22.passThru) {
                this.emit1(context, Bytecode.INSTR_PASSTHRU, context.qualifiedId()?.getText() ?? "");
            }

            if (args22.namedArgs) {
                this.emit1(context, Bytecode.INSTR_NEW_BOX_ARGS, context.qualifiedId()?.getText() ?? "");
            } else {
                this.emit2(context, Bytecode.INSTR_NEW, context.qualifiedId()?.getText() ?? "", args22.n + num_exprs);
            }
        } else if (context.subtemplate() !== null) {
            const subtemplate24 = this.subtemplate(context.subtemplate()!);

            if (subtemplate24.nargs !== num_exprs) {
                this.errMgr?.compileTimeError(ErrorType.ANON_ARGUMENT_MISMATCH, this.templateToken,
                    context.subtemplate()!.start ?? undefined, subtemplate24.nargs, num_exprs);
            }

            for (let i = 1; i <= num_exprs; i++) {
                this.emit(context.subtemplate(), Bytecode.INSTR_NULL);
            }

            this.emit2(context.subtemplate(), Bytecode.INSTR_NEW, subtemplate24.name, num_exprs);
        } else {
            this.expr(context.mapExpr()!);

            this.emit(context, Bytecode.INSTR_TOSTR);
            for (let i = 1; i <= num_exprs; i++) {
                this.emit(context, Bytecode.INSTR_NULL);
            }

            let count = 0;
            context.argExprList()?.arg().forEach((arg) => {
                this.arg(arg);
                ++count;
            });

            this.emit1(context, Bytecode.INSTR_NEW_IND, count + num_exprs);
        }

        /*try {
            // CodeGenerator.g:354:30: ( ^( INCLUDE qualifiedId args ) | subtemplate | ^( INCLUDE_IND expr args ) )
            let alt18 = 3;
            switch (this.input.LA(1)) {
                case CodeGenerator.INCLUDE: {
                    {
                        alt18 = 1;
                    }
                    break;
                }

                case CodeGenerator.SUBTEMPLATE: {
                    {
                        alt18 = 2;
                    }
                    break;
                }

                case CodeGenerator.INCLUDE_IND: {
                    {
                        alt18 = 3;
                    }
                    break;
                }

                default: {
                    this.#throwInternalError();

                }

            }
            switch (alt18) {
                case 1: {
                    // CodeGenerator.g:355:5: ^( INCLUDE qualifiedId args )
                    {
                        INCLUDE21 = this.match(this.input, CodeGenerator.INCLUDE);
                        this.match(this.input, TreeParser.DOWN);
                        qualifiedId23 = this.qualifiedId();

                        for (let i = 1; i <= num_exprs; i++) {
                            this.emit(INCLUDE21, Bytecode.INSTR_NULL);
                        }

                        args22 = this.args();

                        this.match(this.input, TreeParser.UP);

                        if ((args22 !== null ? (args22).passThru : false)) {
                            this.emit1((retval.start), Bytecode.INSTR_PASSTHRU,
                                this.input.getTokenStream()
                                    .toString(this.input.getTreeAdaptor().getTokenStartIndex(qualifiedId23.start),
                                        this.input.getTreeAdaptor().getTokenStopIndex(qualifiedId23.start)));
                        }

                        if ((args22 !== null ? (args22).namedArgs : false)) {
                            this.emit1(INCLUDE21, Bytecode.INSTR_NEW_BOX_ARGS,
                                (this.input.getTokenStream()
                                    .toString(this.input.getTreeAdaptor().getTokenStartIndex(qualifiedId23.start),
                                        this.input.getTreeAdaptor().getTokenStopIndex(qualifiedId23.start))));
                        } else {
                            this.emit2(INCLUDE21, Bytecode.INSTR_NEW,
                                this.input.getTokenStream().toString(
                                    this.input.getTreeAdaptor().getTokenStartIndex(qualifiedId23.start),
                                    this.input.getTreeAdaptor().getTokenStopIndex(qualifiedId23.start)),
                                args22.n + num_exprs);
                        }

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:362:7: subtemplate
                    {
                        subtemplate24 = this.subtemplate();

                        if ((subtemplate24 !== null ? (subtemplate24).nargs : 0) !== num_exprs) {
                            this.errMgr?.compileTimeError(ErrorType.ANON_ARGUMENT_MISMATCH,
                                this.templateToken,
                                subtemplate24.start?.token,
                                subtemplate24.nargs, num_exprs);
                        }
                        for (let i = 1; i <= num_exprs; i++) {
                            this.emit((subtemplate24 !== null ? (subtemplate24.start as CommonTree) : null),
                                Bytecode.INSTR_NULL);
                        }

                        this.emit2((subtemplate24 !== null ? (subtemplate24.start as CommonTree) : null),
                            Bytecode.INSTR_NEW, subtemplate24.name, num_exprs);

                    }
                    break;
                }

                case 3: {
                    // CodeGenerator.g:372:7: ^( INCLUDE_IND expr args )
                    {
                        INCLUDE_IND25 = this.match(this.input, CodeGenerator.INCLUDE_IND);
                        this.match(this.input, TreeParser.DOWN);
                        this.expr();

                        this.emit(INCLUDE_IND25, Bytecode.INSTR_TOSTR);
                        for (let i = 1; i <= num_exprs; i++) {
                            this.emit(INCLUDE_IND25, Bytecode.INSTR_NULL);
                        }

                        args26 = this.args();

                        this.emit1(INCLUDE_IND25, Bytecode.INSTR_NEW_IND, args26.n + num_exprs);

                        this.match(this.input, TreeParser.UP);

                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/

        // return retval;
    }

    // CodeGenerator.g:382:1: includeExpr : ( ^( EXEC_FUNC ID ( expr )? ) | ^( INCLUDE qualifiedId args )
    // | ^( INCLUDE_SUPER ID args ) | ^( INCLUDE_REGION ID ) | ^( INCLUDE_SUPER_REGION ID ) | primary );
    public includeExpr(context: IncludeExprContext): void {
        //const retval = new CodeGenerator.includeExpr_return();
        //retval.start = this.input.LT(1);

        // let ID27 = null;
        // let INCLUDE30 = null;
        // let ID32 = null;
        // let INCLUDE_SUPER33 = null;
        // let ID34 = null;
        // let INCLUDE_REGION35 = null;
        // let ID36 = null;
        // let INCLUDE_SUPER_REGION37 = null;
        // let args28 = null;
        // let qualifiedId29 = null;
        // let args31 = null;

        if (context.ID() !== null) {
            const id = context.ID()!;
            if (context.SUPER() === null && context.AT() === null) {
                // A function call.
                this.expr(context.expr()!.mapExpr()!);
                this.func(id);
            } else if (context.SUPER() !== null) {
                if (context.AT() === null) {
                    // Include super ID.
                    const args = this.args(context.args());

                    if (args.passThru) {
                        this.emit1(context, Bytecode.INSTR_PASSTHRU, id.getText() ?? "");
                    }

                    if ((args !== null ? (args).namedArgs : false)) {
                        this.emit1(context, Bytecode.INSTR_SUPER_NEW_BOX_ARGS, id.getText() ?? "");
                    } else {
                        this.emit2(context, Bytecode.INSTR_SUPER_NEW, id.getText() ?? "", args.n);
                    }
                } else {
                    // Include super region ID.
                    const mangled = STGroup.getMangledRegionName(this.outermostImpl.name!, id.getText() ?? "");
                    this.emit2(id, Bytecode.INSTR_SUPER_NEW, mangled, 0);
                }
            } else if (context.AT() !== null) {
                // Include region ID.
                const impl = Compiler.defineBlankRegion(this.outermostImpl, id?.symbol);

                this.emit2(id, Bytecode.INSTR_NEW, impl.name!, 0);
            }
        } else {
            if (context.primary() !== null) {
                this.primary(context.primary()!);
            } else {
                // Include qualified args.
                const id = context.qualifiedId()!;
                const args = this.args(context.args());

                if (args.passThru) {
                    this.emit1(context, Bytecode.INSTR_PASSTHRU, id.getText());
                }

                if (args.namedArgs) {
                    this.emit1(id, Bytecode.INSTR_NEW_BOX_ARGS, id.getText());
                } else {
                    this.emit2(id, Bytecode.INSTR_NEW, id.getText(), args.n);
                }

            }
        }

        /* try {
             // CodeGenerator.g:382:12: ( ^( EXEC_FUNC ID ( expr )? ) | ^( INCLUDE qualifiedId args )
             // | ^( INCLUDE_SUPER ID args ) | ^( INCLUDE_REGION ID ) | ^( INCLUDE_SUPER_REGION ID ) | primary )
             let alt20 = 6;
             switch (this.input.LA(1)) {
                 case CodeGenerator.EXEC_FUNC: {
                     {
                         alt20 = 1;
                     }
                     break;
                 }

                 case CodeGenerator.INCLUDE: {
                     {
                         alt20 = 2;
                     }
                     break;
                 }

                 case CodeGenerator.INCLUDE_SUPER: {
                     {
                         alt20 = 3;
                     }
                     break;
                 }

                 case CodeGenerator.INCLUDE_REGION: {
                     {
                         alt20 = 4;
                     }
                     break;
                 }

                 case CodeGenerator.INCLUDE_SUPER_REGION: {
                     {
                         alt20 = 5;
                     }
                     break;
                 }

                 case STLexer.ID:
                 case STLexer.STRING:
                 case STLexer.TRUE:
                 case STLexer.FALSE:
                 case CodeGenerator.INCLUDE_IND:
                 case CodeGenerator.TO_STR:
                 case CodeGenerator.LIST:
                 case CodeGenerator.SUBTEMPLATE: {
                     {
                         alt20 = 6;
                     }
                     break;
                 }

                 default: {
                     this.#throwInternalError();

                 }

             }
             switch (alt20) {
                 case 1: {
                     // CodeGenerator.g:383:5: ^( EXEC_FUNC ID ( expr )? )
                     {
                         this.match(this.input, CodeGenerator.EXEC_FUNC);
                         this.match(this.input, TreeParser.DOWN);
                         ID27 = this.match(this.input, CodeGenerator.ID);
                         // CodeGenerator.g:383:20: ( expr )?
                         let alt19 = 2;
                         const LA19_0 = this.input.LA(1);
                         if (((LA19_0 >= CodeGenerator.ID && LA19_0 <= CodeGenerator.STRING)
                             || (LA19_0 >= CodeGenerator.TRUE && LA19_0 <= CodeGenerator.FALSE)
                             || (LA19_0 >= CodeGenerator.PROP && LA19_0 <= CodeGenerator.SUBTEMPLATE))) {
                             alt19 = 1;
                         }
                         switch (alt19) {
                             case 1: {
                                 // CodeGenerator.g:383:20: expr
                                 {
                                     this.expr();

                                 }
                                 break;
                             }

                             default:

                         }

                         this.match(this.input, TreeParser.UP);

                         this.func(ID27);
                     }
                     break;
                 }

                 case 2: {
                     // CodeGenerator.g:384:7: ^( INCLUDE qualifiedId args )
                     {
                         INCLUDE30 = this.match(this.input, CodeGenerator.INCLUDE);
                         this.match(this.input, TreeParser.DOWN);
                         qualifiedId29 = this.qualifiedId();

                         args28 = this.args();

                         this.match(this.input, TreeParser.UP);

                         if ((args28 !== null ? (args28).passThru : false)) {
                             this.emit1((retval.start), Bytecode.INSTR_PASSTHRU,
                                 this.input.getTokenStream().toString(
                                     this.input.getTreeAdaptor().getTokenStartIndex(qualifiedId29.start),
                                     this.input.getTreeAdaptor().getTokenStopIndex(qualifiedId29.start)));
                         }

                         if (args28.namedArgs) {
                             this.emit1(INCLUDE30, Bytecode.INSTR_NEW_BOX_ARGS,
                                 this.input.getTokenStream().toString(
                                     this.input.getTreeAdaptor().getTokenStartIndex(qualifiedId29.start),
                                     this.input.getTreeAdaptor().getTokenStopIndex(qualifiedId29.start)));
                         } else {
                             this.emit2(INCLUDE30, Bytecode.INSTR_NEW, this.input.getTokenStream().toString(
                                 this.input.getTreeAdaptor().getTokenStartIndex(qualifiedId29.start),
                                 this.input.getTreeAdaptor().getTokenStopIndex(qualifiedId29.start)), args28.n);
                         }

                     }
                     break;
                 }

                 case 3: {
                     // CodeGenerator.g:389:7: ^( INCLUDE_SUPER ID args )
                     {
                         INCLUDE_SUPER33 = this.match(this.input, CodeGenerator.INCLUDE_SUPER);
                         this.match(this.input, TreeParser.DOWN);
                         ID32 = this.match(this.input, CodeGenerator.ID);
                         args31 = this.args();

                         this.match(this.input, TreeParser.UP);

                         if ((args31 !== null ? (args31).passThru : false)) {
                             this.emit1((retval.start), Bytecode.INSTR_PASSTHRU, ID32?.getText() ?? "");
                         }

                         if ((args31 !== null ? (args31).namedArgs : false)) {
                             this.emit1(INCLUDE_SUPER33, Bytecode.INSTR_SUPER_NEW_BOX_ARGS, ID32?.getText() ?? "");
                         } else {
                             this.emit2(INCLUDE_SUPER33, Bytecode.INSTR_SUPER_NEW, ID32?.getText() ?? "", args31.n);
                         }

                     }
                     break;
                 }

                 case 4: {
                     // CodeGenerator.g:394:7: ^( INCLUDE_REGION ID )
                     {
                         INCLUDE_REGION35 = this.match(this.input, CodeGenerator.INCLUDE_REGION);
                         this.match(this.input, TreeParser.DOWN);
                         ID34 = this.match(this.input, CodeGenerator.ID);
                         this.match(this.input, TreeParser.UP);

                         const impl = Compiler.defineBlankRegion(this.outermostImpl, ID34?.token);

                         this.emit2(INCLUDE_REGION35, Bytecode.INSTR_NEW, impl.name, 0);

                     }
                     break;
                 }

                 case 5: {
                     // CodeGenerator.g:400:7: ^( INCLUDE_SUPER_REGION ID )
                     {
                         INCLUDE_SUPER_REGION37 = this.match(this.input, CodeGenerator.INCLUDE_SUPER_REGION);
                         this.match(this.input, TreeParser.DOWN);
                         ID36 = this.match(this.input, CodeGenerator.ID);
                         this.match(this.input, TreeParser.UP);

                         const mangled =
                             STGroup.getMangledRegionName(this.outermostImpl.name, ID36?.getText() ?? "");
                         this.emit2(INCLUDE_SUPER_REGION37, Bytecode.INSTR_SUPER_NEW, mangled, 0);

                     }
                     break;
                 }

                 case 6: {
                     // CodeGenerator.g:405:7: primary
                     {
                         this.primary();

                     }
                     break;
                 }

                 default:

             }
         } catch (re) {
             if (re instanceof RecognitionException) {
                 this.reportError(re);
                 this.recover(this.input, re);
             } else {
                 throw re;
             }
         }*/

        //return retval;
    }

    // CodeGenerator.g:408:1: primary : ( ID | STRING | TRUE | FALSE | subtemplate | list | ^( INCLUDE_IND expr args )
    // | ^( TO_STR expr ) );
    public primary(context: PrimaryContext): void {
        //const retval = new CodeGenerator.primary_return();
        //retval.start = this.input.LT(1);

        // let ID38 = null;
        // let STRING39 = null;
        // let TRUE40 = null;
        // let FALSE41 = null;
        // let INCLUDE_IND43 = null;
        // let TO_STR45 = null;
        // let subtemplate42 = null;
        // let args44 = null;

        if (context.ID() !== null) {
            this.refAttr(context.ID());
        } else if (context.STRING() !== null) {
            const s = context.STRING();
            this.emit1(s, Bytecode.INSTR_LOAD_STR, Misc.strip(s?.getText(), 1));
        } else if (context.TRUE() !== null) {
            this.emit(context.TRUE(), Bytecode.INSTR_TRUE);
        } else if (context.FALSE() !== null) {
            this.emit(context.FALSE(), Bytecode.INSTR_FALSE);
        } else if (context.subtemplate() !== null) {
            const subtemplate42 = this.subtemplate(context.subtemplate()!);
            this.emit2(context, Bytecode.INSTR_NEW, subtemplate42.name, 0);
        } else if (context.list() !== null) {
            this.list(context.list()!);
        } else if (context.conditional() !== null) {
            this.conditional(context.conditional()!);
        } else if (context.expr() !== null) {
            this.expr(context.expr()!.mapExpr()!);
            this.emit(context.expr(), Bytecode.INSTR_TOSTR);

            if (context.LPAREN().length > 1) {
                // Indirection. May have arguments.
                let count = 0;
                if (context.argExprList() !== null) {
                    context.argExprList()?.arg().forEach((arg) => {
                        this.arg(arg);
                        ++count;
                    });
                }
                this.emit1(context.expr(), Bytecode.INSTR_NEW_IND, count);
            }

            /*if (context.argExprList() !== null) {
                this.emit(context.expr(), Bytecode.INSTR_TOSTR);

                let count = 0;
                context.argExprList()?.arg().forEach((arg) => {
                    this.arg(arg);
                    ++count;
                });

                this.emit1(context.expr(), Bytecode.INSTR_NEW_IND, count);
            } else {
                this.emit(context.expr(), Bytecode.INSTR_TOSTR);
            }*/
        } else {
            this.#throwInternalError();
        }

        /*try {
            // CodeGenerator.g:408:8: ( ID | STRING | TRUE | FALSE | subtemplate | list | ^( INCLUDE_IND expr args )
            // | ^( TO_STR expr ) )
            let alt21 = 8;
            switch (this.input.LA(1)) {
                case STLexer.ID: {
                    {
                        alt21 = 1;
                    }
                    break;
                }

                case STLexer.STRING: {
                    {
                        alt21 = 2;
                    }
                    break;
                }

                case STLexer.TRUE: {
                    {
                        alt21 = 3;
                    }
                    break;
                }

                case STLexer.FALSE: {
                    {
                        alt21 = 4;
                    }
                    break;
                }

                case CodeGenerator.SUBTEMPLATE: {
                    {
                        alt21 = 5;
                    }
                    break;
                }

                case CodeGenerator.LIST: {
                    {
                        alt21 = 6;
                    }
                    break;
                }

                case CodeGenerator.INCLUDE_IND: {
                    {
                        alt21 = 7;
                    }
                    break;
                }

                case CodeGenerator.TO_STR: {
                    {
                        alt21 = 8;
                    }
                    break;
                }

                default: {
                    this.#throwInternalError();

                }

            }
            switch (alt21) {
                case 1: {
                    // CodeGenerator.g:409:5: ID
                    {
                        ID38 = this.match(this.input, CodeGenerator.ID);
                        this.refAttr(ID38);
                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:410:7: STRING
                    {
                        STRING39 = this.match(this.input, CodeGenerator.STRING);
                        this.emit1(STRING39, Bytecode.INSTR_LOAD_STR, STRING39?.getText().substring(1) ?? "");
                    }
                    break;
                }

                case 3: {
                    // CodeGenerator.g:411:7: TRUE
                    {
                        TRUE40 = this.match(this.input, CodeGenerator.TRUE);
                        this.emit(TRUE40, Bytecode.INSTR_TRUE);
                    }
                    break;
                }

                case 4: {
                    // CodeGenerator.g:412:7: FALSE
                    {
                        FALSE41 = this.match(this.input, CodeGenerator.FALSE);
                        this.emit(FALSE41, Bytecode.INSTR_FALSE);
                    }
                    break;
                }

                case 5: {
                    // CodeGenerator.g:413:7: subtemplate
                    {
                        subtemplate42 = this.subtemplate();

                        this.emit2((retval.start), Bytecode.INSTR_NEW, subtemplate42.name, 0);
                    }
                    break;
                }

                case 6: {
                    // CodeGenerator.g:415:7: list
                    {
                        this.list();

                    }
                    break;
                }

                case 7: {
                    // CodeGenerator.g:416:7: ^( INCLUDE_IND expr args )
                    {
                        INCLUDE_IND43 = this.match(this.input, CodeGenerator.INCLUDE_IND);
                        this.match(this.input, TreeParser.DOWN);
                        this.expr();

                        this.emit(INCLUDE_IND43, Bytecode.INSTR_TOSTR);
                        args44 = this.args();

                        this.emit1(INCLUDE_IND43, Bytecode.INSTR_NEW_IND, (args44 !== null ? (args44).n : 0));
                        this.match(this.input, TreeParser.UP);

                    }
                    break;
                }

                case 8: {
                    // CodeGenerator.g:419:7: ^( TO_STR expr )
                    {
                        TO_STR45 = this.match(this.input, CodeGenerator.TO_STR);
                        this.match(this.input, TreeParser.DOWN);
                        this.expr();

                        this.match(this.input, TreeParser.UP);

                        this.emit(TO_STR45, Bytecode.INSTR_TOSTR);
                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/

        //return retval;
    }

    // CodeGenerator.g:422:1: qualifiedId : ( ^( SLASH qualifiedId ID ) | ^( SLASH ID ) | ID );
    public qualifiedId(context: QualifiedIdContext): CodeGenerator.qualifiedId_return {
        // Odd parsing here. The original tree grammar does not return anything from the qualifiedId rule, except its
        // start. And it checks the syntax by matching the individual elements (slash and ID).
        const retval = new CodeGenerator.qualifiedId_return();
        retval.start = context;

        /*try {
            // CodeGenerator.g:422:12: ( ^( SLASH qualifiedId ID ) | ^( SLASH ID ) | ID )
            let alt22 = 3;
            const LA22_0 = this.input.LA(1);
            if ((LA22_0 === CodeGenerator.SLASH)) {
                const LA22_1 = this.input.LA(2);
                if ((LA22_1 === TreeParser.DOWN)) {
                    const LA22_3 = this.input.LA(3);
                    if ((LA22_3 === CodeGenerator.ID)) {
                        const LA22_4 = this.input.LA(4);
                        if ((LA22_4 === TreeParser.UP)) {
                            alt22 = 2;
                        }
                        else {
                            if ((LA22_4 === CodeGenerator.ID)) {
                                alt22 = 1;
                            }

                            else {
                                const nvaeMark = this.input.mark();
                                try {
                                    for (let nvaeConsume = 0; nvaeConsume < 4 - 1; nvaeConsume++) {
                                        this.input.consume();
                                    }
                                    this.#throwInternalError();

                                } finally {
                                    this.input.seek(nvaeMark);
                                }
                            }
                        }

                    }
                    else {
                        if ((LA22_3 === CodeGenerator.SLASH)) {
                            alt22 = 1;
                        }

                        else {
                            const nvaeMark = this.input.mark();
                            try {
                                for (let nvaeConsume = 0; nvaeConsume < 3 - 1; nvaeConsume++) {
                                    this.input.consume();
                                }
                                this.#throwInternalError();

                            } finally {
                                this.input.seek(nvaeMark);
                            }
                        }
                    }

                }

                else {
                    const nvaeMark = this.input.mark();
                    try {
                        this.input.consume();
                        this.#throwInternalError();

                    } finally {
                        this.input.seek(nvaeMark);
                    }
                }

            }
            else {
                if ((LA22_0 === CodeGenerator.ID)) {
                    alt22 = 3;
                }

                else {
                    this.#throwInternalError();

                }
            }

            switch (alt22) {
                case 1: {
                    // CodeGenerator.g:423:5: ^( SLASH qualifiedId ID )
                    {
                        this.match(this.input, CodeGenerator.SLASH);
                        this.match(this.input, TreeParser.DOWN);
                        this.qualifiedId();

                        this.match(this.input, CodeGenerator.ID);
                        this.match(this.input, TreeParser.UP);

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:424:7: ^( SLASH ID )
                    {
                        this.match(this.input, CodeGenerator.SLASH);
                        this.match(this.input, TreeParser.DOWN);
                        this.match(this.input, CodeGenerator.ID);
                        this.match(this.input, TreeParser.UP);

                    }
                    break;
                }

                case 3: {
                    // CodeGenerator.g:425:7: ID
                    {
                        this.match(this.input, CodeGenerator.ID);
                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/

        return retval;
    }

    // CodeGenerator.g:428:1: arg : expr ;
    public arg(context: ArgContext): void {
        this.exprNoComma(context.exprNoComma());

        /*try {
            ;
            // CodeGenerator.g:428:4: ( expr )
            // CodeGenerator.g:429:5: expr
            {
                this.expr();

            }

        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/
    }

    // $ANTLR start "args"
    // CodeGenerator.g:432:1: args returns [int n=0, boolean namedArgs=false, boolean passThru] : ( ( arg )+
    // | ( ^(eq= '=' ID expr ) )+ ( '...' )? | '...' |);
    public args(context?: ArgsContext | null): CodeGenerator.args_return {
        const retval = new CodeGenerator.args_return();
        retval.start = context ?? null;

        if (!context) {
            return retval;
        }

        if (context.argExprList() !== null) {
            context.argExprList()?.arg().forEach((arg) => {
                this.arg(arg);
                retval.n++;
            });
        } else if (context.namedArg().length > 0 || context.ELLIPSIS() !== null) {
            this.emit(context, Bytecode.INSTR_ARGS);
            retval.namedArgs = true;

            context.namedArg().forEach((namedArg) => {
                this.arg(namedArg.arg());
                this.emit1(namedArg.EQUALS(), Bytecode.INSTR_STORE_ARG,
                    this.defineString(namedArg.ID().getText() ?? ""));
                retval.n++;
            });
        }

        if (context.ELLIPSIS() !== null) {
            retval.passThru = true;
        }

        /*let eq = null;
        let ID46 = null;

        try {
            // CodeGenerator.g:433:64: ( ( arg )+ | ( ^(eq= '=' ID expr ) )+ ( '...' )? | '...' |)
            let alt26 = 4;
            switch (this.input.LA(1)) {
                case STLexer.ID:
                case STLexer.STRING:
                case STLexer.TRUE:
                case STLexer.FALSE:
                case CodeGenerator.PROP:
                case CodeGenerator.PROP_IND:
                case CodeGenerator.INCLUDE:
                case CodeGenerator.INCLUDE_IND:
                case CodeGenerator.EXEC_FUNC:
                case CodeGenerator.INCLUDE_SUPER:
                case CodeGenerator.INCLUDE_SUPER_REGION:
                case CodeGenerator.INCLUDE_REGION:
                case CodeGenerator.TO_STR:
                case CodeGenerator.LIST:
                case CodeGenerator.MAP:
                case CodeGenerator.ZIP:
                case CodeGenerator.SUBTEMPLATE: {
                    {
                        alt26 = 1;
                    }
                    break;
                }

                case STLexer.EQUALS: {
                    {
                        alt26 = 2;
                    }
                    break;
                }

                case STLexer.ELLIPSIS: {
                    {
                        alt26 = 3;
                    }
                    break;
                }

                case CodeGenerator.UP: {
                    {
                        alt26 = 4;
                    }
                    break;
                }

                default: {
                    this.#throwInternalError();

                }

            }
            switch (alt26) {
                case 1: {
                    // CodeGenerator.g:433:66: ( arg )+
                    {
                        // CodeGenerator.g:433:66: ( arg )+
                        let cnt23 = 0;
                        loop23:
                        while (true) {
                            let alt23 = 2;
                            const LA23_0 = this.input.LA(1);
                            if (((LA23_0 >= CodeGenerator.ID && LA23_0 <= CodeGenerator.STRING)
                                || (LA23_0 >= CodeGenerator.TRUE && LA23_0 <= CodeGenerator.FALSE)
                                || (LA23_0 >= CodeGenerator.PROP && LA23_0 <= CodeGenerator.SUBTEMPLATE))) {
                                alt23 = 1;
                            }

                            switch (alt23) {
                                case 1: {
                                    // CodeGenerator.g:433:67: arg
                                    {
                                        this.arg();

                                        retval.n++;
                                    }
                                    break;
                                }

                                default: {
                                    if (cnt23 >= 1) {
                                        break loop23;
                                    }

                                    const eee = new EarlyExitException(23, this.input);
                                    throw eee;
                                }

                            }
                            cnt23++;
                        }

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:434:7: ( ^(eq= '=' ID expr ) )+ ( '...' )?
                    {
                        this.emit((retval.start), Bytecode.INSTR_ARGS); retval.namedArgs = true;
                        // CodeGenerator.g:434:66: ( ^(eq= '=' ID expr ) )+
                        let cnt24 = 0;
                        loop24:
                        while (true) {
                            let alt24 = 2;
                            const LA24_0 = this.input.LA(1);
                            if ((LA24_0 === CodeGenerator.EQUALS)) {
                                alt24 = 1;
                            }

                            switch (alt24) {
                                case 1: {
                                    // CodeGenerator.g:435:9: ^(eq= '=' ID expr )
                                    {
                                        eq = this.match(this.input, CodeGenerator.EQUALS);
                                        this.match(this.input, TreeParser.DOWN);
                                        ID46 = this.match(this.input, CodeGenerator.ID);
                                        this.expr();

                                        this.match(this.input, TreeParser.UP);

                                        retval.n++; this.emit1(eq, Bytecode.INSTR_STORE_ARG,
                                            this.defineString(ID46?.getText() ?? ""));
                                    }
                                    break;
                                }

                                default: {
                                    if (cnt24 >= 1) {
                                        break loop24;
                                    }

                                    const eee = new EarlyExitException(24, this.input);
                                    throw eee;
                                }

                            }
                            cnt24++;
                        }

                        // CodeGenerator.g:436:8: ( '...' )?
                        let alt25 = 2;
                        const LA25_0 = this.input.LA(1);
                        if ((LA25_0 === CodeGenerator.ELLIPSIS)) {
                            alt25 = 1;
                        }
                        switch (alt25) {
                            case 1: {
                                // CodeGenerator.g:436:9: '...'
                                {
                                    this.match(this.input, CodeGenerator.ELLIPSIS);
                                    retval.passThru = true;
                                }
                                break;
                            }

                            default:

                        }

                    }
                    break;
                }

                case 3: {
                    // CodeGenerator.g:437:7: '...'
                    {
                        this.match(this.input, CodeGenerator.ELLIPSIS);
                        retval.passThru = true; this.emit((retval.start), Bytecode.INSTR_ARGS); retval.namedArgs = true;
                    }
                    break;
                }

                case 4: {
                    // CodeGenerator.g:439:5:
                    {
                        //
                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/

        return retval;
    }

    // CodeGenerator.g:441:1: list : ^( LIST ( listElement )* ) ;
    public list(context: ListContext): void {
        //const retval = new CodeGenerator.list_return();
        //retval.start = context;

        //let listElement47 = null;

        this.emit(context, Bytecode.INSTR_LIST);
        context.listElement().forEach((listElement) => {
            this.listElement(listElement);
            this.emit(listElement, Bytecode.INSTR_ADD);
        });

        /*try {
            // CodeGenerator.g:441:5: ( ^( LIST ( listElement )* ) )
            // CodeGenerator.g:442:5: ^( LIST ( listElement )* )
            {
                this.emit((retval.start), Bytecode.INSTR_LIST);
                this.match(this.input, CodeGenerator.LIST);
                if (this.input.LA(1) === TreeParser.DOWN) {
                    this.match(this.input, TreeParser.DOWN);
                    // CodeGenerator.g:443:14: ( listElement )*
                    loop27:
                    while (true) {
                        let alt27 = 2;
                        const LA27_0 = this.input.LA(1);
                        if (((LA27_0 >= CodeGenerator.ID && LA27_0 <= CodeGenerator.STRING)
                            || (LA27_0 >= CodeGenerator.TRUE && LA27_0 <= CodeGenerator.FALSE)
                            || (LA27_0 >= CodeGenerator.PROP && LA27_0 <= CodeGenerator.SUBTEMPLATE)
                            || LA27_0 === CodeGenerator.NULL)) {
                            alt27 = 1;
                        }

                        switch (alt27) {
                            case 1: {
                                // CodeGenerator.g:443:15: listElement
                                {
                                    listElement47 = this.listElement();

                                    this.emit(listElement47.start, Bytecode.INSTR_ADD);
                                }
                                break;
                            }

                            default: {
                                break loop27;
                            }

                        }
                    }

                    this.match(this.input, TreeParser.UP);
                }

            }

        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/

        //return retval;
    }

    // CodeGenerator.g:447:1: listElement : ( expr | NULL );
    public listElement(context: ListElementContext): void {
        //const retval = new CodeGenerator.listElement_return();
        //retval.start = this.input.LT(1);

        //let NULL48 = null;

        if (context.exprNoComma() !== null) {
            this.exprNoComma(context.exprNoComma()!);
        } else {
            this.emit(context, Bytecode.INSTR_NULL);
        }

        /*try {
            // CodeGenerator.g:447:12: ( expr | NULL )
            let alt28 = 2;
            const LA28_0 = this.input.LA(1);
            if (((LA28_0 >= CodeGenerator.ID && LA28_0 <= CodeGenerator.STRING)
                || (LA28_0 >= CodeGenerator.TRUE && LA28_0 <= CodeGenerator.FALSE)
                || (LA28_0 >= CodeGenerator.PROP && LA28_0 <= CodeGenerator.SUBTEMPLATE))) {
                alt28 = 1;
            }
            else {
                if ((LA28_0 === CodeGenerator.NULL)) {
                    alt28 = 2;
                }

                else {
                    this.#throwInternalError();

                }
            }

            switch (alt28) {
                case 1: {
                    // CodeGenerator.g:448:5: expr
                    {
                        this.expr();

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:449:7: NULL
                    {
                        NULL48 = this.match(this.input, CodeGenerator.NULL);
                        this.emit(NULL48, Bytecode.INSTR_NULL);
                    }
                    break;
                }

                default:

            }
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportError(re);
                this.recover(this.input, re);
            } else {
                throw re;
            }
        }*/

        //return retval;
    }
}

export namespace CodeGenerator {
    export type template_scope = InstanceType<typeof CodeGenerator.template_scope>;
    export type region_return = InstanceType<typeof CodeGenerator.region_return>;
    export type subtemplate_return = InstanceType<typeof CodeGenerator.subtemplate_return>;
    export type conditional_return = InstanceType<typeof CodeGenerator.conditional_return>;
    export type exprOptions_return = InstanceType<typeof CodeGenerator.exprOptions_return>;
    export type mapTemplateRef_return = InstanceType<typeof CodeGenerator.mapTemplateRef_return>;
    export type includeExpr_return = InstanceType<typeof CodeGenerator.includeExpr_return>;
    export type primary_return = InstanceType<typeof CodeGenerator.primary_return>;
    export type qualifiedId_return = InstanceType<typeof CodeGenerator.qualifiedId_return>;
    export type args_return = InstanceType<typeof CodeGenerator.args_return>;
    export type list_return = InstanceType<typeof CodeGenerator.list_return>;
    export type listElement_return = InstanceType<typeof CodeGenerator.listElement_return>;
}
