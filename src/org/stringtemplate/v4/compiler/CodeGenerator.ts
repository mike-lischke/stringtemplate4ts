/* java2ts: keep */

// $ANTLR 3.5.3 CodeGenerator.g 2023-12-16 19:26:21

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

// cspell: disable

/* eslint-disable @typescript-eslint/naming-convention, no-lone-blocks */

import { BitSet, RecognitionException, Token } from "antlr4ng";

import { STLexer } from "./STLexer.js";
import { FormalArgument } from "./FormalArgument.js";
import { CompiledST } from "./CompiledST.js";
import { CompilationState } from "./CompilationState.js";
import { Bytecode } from "./Bytecode.js";
import { ErrorType } from "../misc/ErrorType.js";
import { STGroup } from "../STGroup.js";
import { ST } from "../ST.js";
import { ErrorManager } from "../misc/ErrorManager.js";
import { TreeParser } from "../support/TreeParser.js";
import { TreeRuleReturnScope } from "../support/TreeRuleReturnScope.js";
import { Stack } from "../support/Stack.js";
import { CommonTree } from "../support/CommonTree.js";
import { TreeNodeStream } from "../support/TreeNodeStream.js";
import { Compiler } from "./Compiler.js";
import { RecognizerSharedState } from "../support/RecognizerSharedState.js";
import { EarlyExitException } from "../support/EarlyExitException.js";
import { NoViableAltExceptionV3 } from "../support/NoViableAltExceptionV3.js";

export class CodeGenerator extends TreeParser {
    public static readonly tokenNames = [
        "<invalid>", "<EOR>", "<DOWN>", "<UP>", "IF", "ELSE", "ELSEIF", "ENDIF",
        "SUPER", "SEMI", "BANG", "ELLIPSIS", "EQUALS", "COLON", "LPAREN", "RPAREN",
        "LBRACK", "RBRACK", "COMMA", "DOT", "LCURLY", "RCURLY", "TEXT", "LDELIM",
        "RDELIM", "ID", "STRING", "WS", "PIPE", "OR", "AND", "INDENT", "NEWLINE",
        "AT", "END", "TRUE", "FALSE", "COMMENT", "SLASH", "EXPR", "OPTIONS", "PROP",
        "PROP_IND", "INCLUDE", "INCLUDE_IND", "EXEC_FUNC", "INCLUDE_SUPER", "INCLUDE_SUPER_REGION",
        "INCLUDE_REGION", "TO_STR", "LIST", "MAP", "ZIP", "SUBTEMPLATE", "ARGS",
        "ELEMENTS", "REGION", "NULL", "INDENTED_EXPR",
    ];
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
    // $ANTLR end "templateAndEOF"

    public static template_scope = class template_scope {
        public state!: CompilationState;
    };

    // $ANTLR end "exprElement"

    public static region_return = class region_return extends TreeRuleReturnScope {
        public name!: string;
    };

    // $ANTLR end "region"

    public static subtemplate_return = class subtemplate_return extends TreeRuleReturnScope {
        public name!: string;
    };

    // $ANTLR end "ifstat"

    public static conditional_return = class conditional_return extends TreeRuleReturnScope {
    };

    // $ANTLR end "conditional"

    public static exprOptions_return = class exprOptions_return extends TreeRuleReturnScope {
    };

    // $ANTLR end "prop"

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

    // Delegated rules

    public static readonly FOLLOW_template_in_templateAndEOF69 = new BitSet([0x0000000000000000n]);
    public static readonly FOLLOW_EOF_in_templateAndEOF72 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_chunk_in_template106 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_element_in_chunk120 = new BitSet([0x0500008100400012n]);
    public static readonly FOLLOW_INDENTED_EXPR_in_element143 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_INDENT_in_element145 = new BitSet([0x0100000000000010n]);
    public static readonly FOLLOW_compoundElement_in_element147 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_compoundElement_in_element163 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_INDENTED_EXPR_in_element182 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_INDENT_in_element184 = new BitSet([0x0000008100400008n]);
    public static readonly FOLLOW_singleElement_in_element188 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_singleElement_in_element205 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_exprElement_in_singleElement217 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_TEXT_in_singleElement225 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_NEWLINE_in_singleElement235 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_ifstat_in_compoundElement250 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_region_in_compoundElement259 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_EXPR_in_exprElement282 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_expr_in_exprElement284 = new BitSet([0x0000010000000008n]);
    public static readonly FOLLOW_exprOptions_in_exprElement287 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_REGION_in_region342 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_ID_in_region344 = new BitSet([0x0500008100400010n]);
    public static readonly FOLLOW_template_in_region348 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_SUBTEMPLATE_in_subtemplate395 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_ARGS_in_subtemplate399 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_ID_in_subtemplate402 = new BitSet([0x0000000002000008n]);
    public static readonly FOLLOW_template_in_subtemplate413 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_SUBTEMPLATE_in_subtemplate430 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_IF_in_ifstat482 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_conditional_in_ifstat484 = new BitSet([0x0500008100400078n]);
    public static readonly FOLLOW_chunk_in_ifstat488 = new BitSet([0x0000000000000068n]);
    public static readonly FOLLOW_ELSEIF_in_ifstat526 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_conditional_in_ifstat534 = new BitSet([0x0500008100400018n]);
    public static readonly FOLLOW_chunk_in_ifstat538 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_ELSE_in_ifstat601 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_chunk_in_ifstat605 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_OR_in_conditional651 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_conditional_in_conditional653 = new BitSet([0x003FFE1866000400n]);
    public static readonly FOLLOW_conditional_in_conditional655 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_AND_in_conditional667 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_conditional_in_conditional669 = new BitSet([0x003FFE1866000400n]);
    public static readonly FOLLOW_conditional_in_conditional671 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_BANG_in_conditional683 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_conditional_in_conditional685 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_expr_in_conditional696 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_OPTIONS_in_exprOptions712 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_option_in_exprOptions714 = new BitSet([0x0000000000001008n]);
    public static readonly FOLLOW_EQUALS_in_option729 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_ID_in_option731 = new BitSet([0x003FFE1806000000n]);
    public static readonly FOLLOW_expr_in_option733 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_ZIP_in_expr758 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_ELEMENTS_in_expr761 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_expr_in_expr764 = new BitSet([0x003FFE1806000008n]);
    public static readonly FOLLOW_mapTemplateRef_in_expr771 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_MAP_in_expr784 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_expr_in_expr786 = new BitSet([0x0020180000000000n]);
    public static readonly FOLLOW_mapTemplateRef_in_expr789 = new BitSet([0x0020180000000008n]);
    public static readonly FOLLOW_prop_in_expr805 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_includeExpr_in_expr813 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_PROP_in_prop826 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_expr_in_prop828 = new BitSet([0x0000000002000000n]);
    public static readonly FOLLOW_ID_in_prop830 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_PROP_IND_in_prop842 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_expr_in_prop844 = new BitSet([0x003FFE1806000000n]);
    public static readonly FOLLOW_expr_in_prop846 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_INCLUDE_in_mapTemplateRef872 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_qualifiedId_in_mapTemplateRef874 = new BitSet([0x003FFE1806001808n]);
    public static readonly FOLLOW_args_in_mapTemplateRef878 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_subtemplate_in_mapTemplateRef894 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_INCLUDE_IND_in_mapTemplateRef914 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_expr_in_mapTemplateRef916 = new BitSet([0x003FFE1806001808n]);
    public static readonly FOLLOW_args_in_mapTemplateRef920 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_EXEC_FUNC_in_includeExpr941 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_ID_in_includeExpr943 = new BitSet([0x003FFE1806000008n]);
    public static readonly FOLLOW_expr_in_includeExpr945 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_INCLUDE_in_includeExpr958 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_qualifiedId_in_includeExpr960 = new BitSet([0x003FFE1806001808n]);
    public static readonly FOLLOW_args_in_includeExpr962 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_INCLUDE_SUPER_in_includeExpr974 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_ID_in_includeExpr976 = new BitSet([0x003FFE1806001808n]);
    public static readonly FOLLOW_args_in_includeExpr978 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_INCLUDE_REGION_in_includeExpr990 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_ID_in_includeExpr992 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_INCLUDE_SUPER_REGION_in_includeExpr1004 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_ID_in_includeExpr1006 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_primary_in_includeExpr1017 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_ID_in_primary1029 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_STRING_in_primary1039 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_TRUE_in_primary1049 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_FALSE_in_primary1059 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_subtemplate_in_primary1069 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_list_in_primary1084 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_INCLUDE_IND_in_primary1102 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_expr_in_primary1104 = new BitSet([0x003FFE1806001808n]);
    public static readonly FOLLOW_args_in_primary1108 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_TO_STR_in_primary1125 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_expr_in_primary1127 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_SLASH_in_qualifiedId1143 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_qualifiedId_in_qualifiedId1145 = new BitSet([0x0000000002000000n]);
    public static readonly FOLLOW_ID_in_qualifiedId1147 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_SLASH_in_qualifiedId1157 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_ID_in_qualifiedId1159 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_ID_in_qualifiedId1168 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_expr_in_arg1180 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_arg_in_args1196 = new BitSet([0x003FFE1806000002n]);
    public static readonly FOLLOW_EQUALS_in_args1225 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_ID_in_args1227 = new BitSet([0x003FFE1806000000n]);
    public static readonly FOLLOW_expr_in_args1229 = new BitSet([0x0000000000000008n]);
    public static readonly FOLLOW_ELLIPSIS_in_args1242 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_ELLIPSIS_in_args1254 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_LIST_in_list1286 = new BitSet([0x0000000000000004n]);
    public static readonly FOLLOW_listElement_in_list1289 = new BitSet([0x023FFE1806000008n]);
    public static readonly FOLLOW_expr_in_listElement1311 = new BitSet([0x0000000000000002n]);
    public static readonly FOLLOW_NULL_in_listElement1319 = new BitSet([0x0000000000000002n]);

    protected outermostTemplateName?: string;	// name of overall template
    protected outermostImpl!: CompiledST;
    protected templateToken?: Token;			// overall template token
    protected errMgr?: ErrorManager;
    protected template_stack = new Stack<CodeGenerator.template_scope>();

    #template?: string;  				// overall template text

    // delegators

    public constructor(input: TreeNodeStream);
    public constructor(input: TreeNodeStream, state: RecognizerSharedState);
    public constructor(input: TreeNodeStream, errMgr?: ErrorManager, name?: string, template?: string,
        templateToken?: Token);
    public constructor(...args: unknown[]) {
        let input;
        let state;
        let errMgr;
        let name;
        let template;
        let templateToken;

        switch (args.length) {
            case 1: {
                [input] = args as [TreeNodeStream];
                state = new RecognizerSharedState();

                break;
            }

            case 2: {
                [input, state] = args as [TreeNodeStream, RecognizerSharedState];

                break;
            }

            case 5: {
                [input, errMgr, name, template, templateToken] = args as [TreeNodeStream, ErrorManager, string, string,
                    Token];
                state = new RecognizerSharedState();

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }

        super(input, state);

        this.errMgr = errMgr;
        this.outermostTemplateName = name;
        this.#template = template;
        this.templateToken = templateToken;
    }

    // delegates
    public getDelegates(): TreeParser[] {
        return [];
    }

    public getTokenNames(): string[] { return CodeGenerator.tokenNames; }
    public override getGrammarFileName(): string { return "CodeGenerator.g"; }

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

    public emit1(opAST: CommonTree | null, opcode: number, arg: string | number): void {
        this.template_stack.peek().state.emit1(opAST, opcode, arg);
    }

    public emit2(opAST: CommonTree | null, opcode: number, arg: number | string, arg2: number): void {
        this.template_stack.peek().state.emit2(opAST, opcode, arg, arg2);
    }

    public emit(opAST: CommonTree | null, opcode: number): void {
        this.template_stack.peek().state.emit(opAST, opcode);
    }

    public insert(addr: number, opcode: number, s: string): void {
        this.template_stack.peek().state.insert(addr, opcode, s);
    }

    public setOption(id: CommonTree): void {
        this.template_stack.peek().state.setOption(id);
    }

    public write(addr: number, value: number): void {
        this.template_stack.peek().state.write(addr, value);
    }

    public address(): number { return this.template_stack.peek().state.ip; }
    public func(id: CommonTree | null): void { this.template_stack.peek().state.func(this.templateToken!, id); }
    public refAttr(id: CommonTree | null): void { this.template_stack.peek().state.refAttr(this.templateToken!, id); }
    public defineString(s: string): number { return this.template_stack.peek().state.defineString(s); }

    public displayRecognitionError(tokenNames: string[], e: RecognitionException): void {
        let tokenWithPosition = e.offendingToken;
        if (!tokenWithPosition?.inputStream) {
            tokenWithPosition = this.input.getTreeAdaptor().getToken(this.input.LT(-1));
        }

        const hdr = this.getErrorHeader(e);
        const msg = this.getErrorMessage(e, tokenNames);
        this.errMgr?.compileTimeError(ErrorType.SYNTAX_ERROR, this.templateToken, tokenWithPosition, hdr + " " + msg);
    }

    // $ANTLR start "templateAndEOF"
    // CodeGenerator.g:142:1: templateAndEOF : template[null,null] EOF ;
    public templateAndEOF(): void {
        try {
            // CodeGenerator.g:142:15: ( template[null,null] EOF )
            // CodeGenerator.g:143:5: template[null,null] EOF
            this.pushFollow(CodeGenerator.FOLLOW_template_in_templateAndEOF69);
            this.template(null, []);
            this.state._fsp--;

            this.match(this.input, CodeGenerator.EOF, CodeGenerator.FOLLOW_EOF_in_templateAndEOF72);
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
    public template(name: string | null, args: FormalArgument[]): CompiledST {
        this.template_stack.push(new CodeGenerator.template_scope());
        this.template_stack.peek().state = new CompilationState(this.errMgr!, name ?? "", this.input.getTokenStream());
        const impl = this.template_stack.peek().state.impl;
        if (this.template_stack.size() === 1) {
            this.outermostImpl = impl;
        }

        impl.defineFormalArgs(args); // make sure args are defined prior to compilation
        if (name !== null && name.startsWith(Compiler.SUBTEMPLATE_PREFIX)) {
            impl.addArg(new FormalArgument("i"));
            impl.addArg(new FormalArgument("i0"));
        }
        impl.template = this.#template ?? ""; // always forget the entire template; char indexes are relative to it

        try {
            // CodeGenerator.g:160:2: ( chunk )
            // CodeGenerator.g:161:5: chunk
            this.pushFollow(CodeGenerator.FOLLOW_chunk_in_template106);
            this.chunk();
            this.state._fsp--;

            // finish off the CompiledST result
            if (this.template_stack.peek().state.stringTable !== null) {
                impl.strings = this.template_stack.peek().state.stringTable.toArray();
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
    // $ANTLR end "template"

    // $ANTLR start "chunk"
    // CodeGenerator.g:167:1: chunk : ( element )* ;
    public chunk(): void {
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
                        this.pushFollow(CodeGenerator.FOLLOW_element_in_chunk120);
                        this.element();
                        this.state._fsp--;

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
        }
        finally {
            // do for sure before leaving
        }
    }
    // $ANTLR end "chunk"

    // $ANTLR start "element"
    // CodeGenerator.g:171:1: element : ( ^( INDENTED_EXPR INDENT compoundElement[$INDENT] ) | compoundElement[null]
    // | ^( INDENTED_EXPR INDENT ( singleElement )? ) | singleElement );
    public element(): void {
        let INDENT1 = null;
        let INDENT2 = null;

        try {
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
                                            const nvae = new NoViableAltExceptionV3("", 3, 5, this.input);
                                            throw nvae;
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
                                    const nvae =
                                        new NoViableAltExceptionV3("", 3, 4, this.input);
                                    throw nvae;
                                } finally {
                                    this.input.seek(nvaeMark);
                                }
                            }

                        }

                        else {
                            const nvaeMark = this.input.mark();
                            try {
                                this.input.consume();
                                const nvae =
                                    new NoViableAltExceptionV3("", 3, 1, this.input);
                                throw nvae;
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
                    const nvae =
                        new NoViableAltExceptionV3("", 3, 0, this.input);
                    throw nvae;
                }

            }
            switch (alt3) {
                case 1: {
                    // CodeGenerator.g:172:5: ^( INDENTED_EXPR INDENT compoundElement[$INDENT] )
                    {
                        this.match(this.input, CodeGenerator.INDENTED_EXPR,
                            CodeGenerator.FOLLOW_INDENTED_EXPR_in_element143);
                        this.match(this.input, TreeParser.DOWN, null);
                        INDENT1 = this.match(this.input, CodeGenerator.INDENT,
                            CodeGenerator.FOLLOW_INDENT_in_element145);
                        this.pushFollow(CodeGenerator.FOLLOW_compoundElement_in_element147);
                        this.compoundElement(INDENT1);
                        this.state._fsp--;

                        this.match(this.input, TreeParser.UP, null);

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:175:7: compoundElement[null]
                    {
                        this.pushFollow(CodeGenerator.FOLLOW_compoundElement_in_element163);
                        this.compoundElement(null);
                        this.state._fsp--;

                    }
                    break;
                }

                case 3: {
                    // CodeGenerator.g:176:7: ^( INDENTED_EXPR INDENT ( singleElement )? )
                    {
                        this.match(this.input, CodeGenerator.INDENTED_EXPR,
                            CodeGenerator.FOLLOW_INDENTED_EXPR_in_element182);
                        this.match(this.input, TreeParser.DOWN, null);
                        INDENT2 = this.match(this.input, CodeGenerator.INDENT,
                            CodeGenerator.FOLLOW_INDENT_in_element184);
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
                                    this.pushFollow(CodeGenerator.FOLLOW_singleElement_in_element188);
                                    this.singleElement();
                                    this.state._fsp--;

                                }
                                break;
                            }

                            default:

                        }

                        this.template_stack.peek().state.emit(Bytecode.INSTR_DEDENT);
                        this.match(this.input, TreeParser.UP, null);

                    }
                    break;
                }

                case 4: {
                    // CodeGenerator.g:179:7: singleElement
                    {
                        this.pushFollow(CodeGenerator.FOLLOW_singleElement_in_element205);
                        this.singleElement();
                        this.state._fsp--;

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
        }
        finally {
            // do for sure before leaving
        }
    }
    // $ANTLR end "element"

    // $ANTLR start "singleElement"
    // CodeGenerator.g:182:1: singleElement : ( exprElement | TEXT | NEWLINE );
    public singleElement(): void {
        let TEXT3 = null;
        let NEWLINE4 = null;

        try {
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
                    const nvae =
                        new NoViableAltExceptionV3("", 4, 0, this.input);
                    throw nvae;
                }

            }
            switch (alt4) {
                case 1: {
                    // CodeGenerator.g:183:5: exprElement
                    {
                        this.pushFollow(CodeGenerator.FOLLOW_exprElement_in_singleElement217);
                        this.exprElement();
                        this.state._fsp--;

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:184:7: TEXT
                    {
                        TEXT3 = this.match(this.input, CodeGenerator.TEXT,
                            CodeGenerator.FOLLOW_TEXT_in_singleElement225);

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
                        NEWLINE4 = this.match(this.input, CodeGenerator.NEWLINE,
                            CodeGenerator.FOLLOW_NEWLINE_in_singleElement235);
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
        }
        finally {
            // do for sure before leaving
        }
    }
    // $ANTLR end "singleElement"

    // $ANTLR start "compoundElement"
    // CodeGenerator.g:192:1: compoundElement[CommonTree indent] : ( ifstat[indent] | region[indent] );
    public compoundElement(indent: CommonTree | null): void {
        try {
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
                    const nvae =
                        new NoViableAltExceptionV3("", 5, 0, this.input);
                    throw nvae;
                }
            }

            switch (alt5) {
                case 1: {
                    // CodeGenerator.g:193:5: ifstat[indent]
                    {
                        this.pushFollow(CodeGenerator.FOLLOW_ifstat_in_compoundElement250);
                        this.ifstat(indent);
                        this.state._fsp--;

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:194:7: region[indent]
                    {
                        this.pushFollow(CodeGenerator.FOLLOW_region_in_compoundElement259);
                        this.region(indent);
                        this.state._fsp--;

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
        }
        finally {
            // do for sure before leaving
        }
    }
    // $ANTLR end "compoundElement"

    // $ANTLR start "exprElement"
    // CodeGenerator.g:197:1: exprElement : ^( EXPR expr ( exprOptions )? ) ;
    public exprElement(): void {
        let EXPR5 = null;

        let op = Bytecode.INSTR_WRITE;
        try {
            // CodeGenerator.g:198:47: ( ^( EXPR expr ( exprOptions )? ) )
            // CodeGenerator.g:199:5: ^( EXPR expr ( exprOptions )? )
            {
                EXPR5 = this.match(this.input, CodeGenerator.EXPR, CodeGenerator.FOLLOW_EXPR_in_exprElement282);
                this.match(this.input, TreeParser.DOWN, null);
                this.pushFollow(CodeGenerator.FOLLOW_expr_in_exprElement284);
                this.expr();
                this.state._fsp--;

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
                            this.pushFollow(CodeGenerator.FOLLOW_exprOptions_in_exprElement287);
                            this.exprOptions();
                            this.state._fsp--;

                            op = Bytecode.INSTR_WRITE_OPT;
                        }
                        break;
                    }

                    default:

                }

                this.match(this.input, TreeParser.UP, null);

                /*
                CompilationState state = template_stack.peek().state;
                CompiledST impl = state.impl;
                if ( impl.instrs[state.ip-1] == Bytecode.INSTR_LOAD_LOCAL ) {
                    impl.instrs[state.ip-1] = Bytecode.INSTR_WRITE_LOCAL;
                }
                else {
                    emit(EXPR5, op);
                }
                */
                this.emit(EXPR5, op);

            }

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

    // $ANTLR start "region"
    // CodeGenerator.g:214:1: region[CommonTree indent] returns [String name] : ^( REGION ID template[$name,null] ) ;
    public region(indent: CommonTree | null): CodeGenerator.region_return {
        const retval = new CodeGenerator.region_return();
        retval.start = this.input.LT(1);

        let ID6 = null;
        let template7 = null;

        if (indent !== null) {
            this.template_stack.peek().state.indent(indent);
        }

        try {
            // CodeGenerator.g:221:2: ( ^( REGION ID template[$name,null] ) )
            // CodeGenerator.g:222:5: ^( REGION ID template[$name,null] )
            {
                this.match(this.input, CodeGenerator.REGION, CodeGenerator.FOLLOW_REGION_in_region342);
                this.match(this.input, TreeParser.DOWN, null);
                ID6 = this.match(this.input, CodeGenerator.ID, CodeGenerator.FOLLOW_ID_in_region344);
                retval.name = STGroup.getMangledRegionName(this.outermostTemplateName!, ID6?.getText() ?? "");
                this.pushFollow(CodeGenerator.FOLLOW_template_in_region348);
                template7 = this.template(retval.name, []);
                this.state._fsp--;

                const sub = template7;
                sub.isRegion = true;
                sub.regionDefType = ST.RegionType.EMBEDDED;
                sub.templateDefStartToken = ID6?.token;

                this.outermostImpl.addImplicitlyDefinedTemplate(sub);
                this.emit2((retval.start), Bytecode.INSTR_NEW, retval.name, 0);
                this.emit((retval.start), Bytecode.INSTR_WRITE);

                this.match(this.input, TreeParser.UP, null);

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
        }
        finally {
            // do for sure before leaving
        }

        return retval;
    }

    // $ANTLR start "subtemplate"
    // CodeGenerator.g:236:1: subtemplate returns [String name, int nargs] : ( ^( SUBTEMPLATE
    // ( ^( ARGS ( ID )+ ) )* template[$name,args] ) | SUBTEMPLATE );
    public subtemplate(): CodeGenerator.subtemplate_return {
        const retval = new CodeGenerator.subtemplate_return();
        retval.start = this.input.LT(1);

        let ID8 = null;
        let SUBTEMPLATE10 = null;
        let SUBTEMPLATE11 = null;
        let template9 = null;

        retval.name = Compiler.getNewSubtemplateName();
        const args = new Array<FormalArgument>();

        try {
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
                        || (LA9_1 >= CodeGenerator.TRUE && LA9_1 <= CodeGenerator.FALSE) || (LA9_1 >= CodeGenerator.EXPR
                            && LA9_1 <= CodeGenerator.SUBTEMPLATE) || (LA9_1 >= CodeGenerator.REGION
                                && LA9_1 <= CodeGenerator.INDENTED_EXPR))) {
                        alt9 = 2;
                    }

                    else {
                        const nvaeMark = this.input.mark();
                        try {
                            this.input.consume();
                            const nvae =
                                new NoViableAltExceptionV3("", 9, 1, this.input);
                            throw nvae;
                        } finally {
                            this.input.seek(nvaeMark);
                        }
                    }
                }

            }

            else {
                const nvae =
                    new NoViableAltExceptionV3("", 9, 0, this.input);
                throw nvae;
            }

            switch (alt9) {
                case 1: {
                    // CodeGenerator.g:242:5: ^( SUBTEMPLATE ( ^( ARGS ( ID )+ ) )* template[$name,args] )
                    {
                        SUBTEMPLATE10 = this.match(this.input, CodeGenerator.SUBTEMPLATE,
                            CodeGenerator.FOLLOW_SUBTEMPLATE_in_subtemplate395)!;
                        if (this.input.LA(1) === TreeParser.DOWN) {
                            this.match(this.input, TreeParser.DOWN, null);
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
                                            this.match(this.input, CodeGenerator.ARGS,
                                                CodeGenerator.FOLLOW_ARGS_in_subtemplate399);
                                            this.match(this.input, TreeParser.DOWN, null);
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
                                                            ID8 = this.match(this.input, CodeGenerator.ID,
                                                                CodeGenerator.FOLLOW_ID_in_subtemplate402)!;
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

                                            this.match(this.input, TreeParser.UP, null);

                                        }
                                        break;
                                    }

                                    default: {
                                        break loop8;
                                    }

                                }
                            }

                            retval.nargs = args.length;
                            this.pushFollow(CodeGenerator.FOLLOW_template_in_subtemplate413);
                            template9 = this.template(retval.name, args);
                            this.state._fsp--;

                            const sub = template9;
                            sub.isAnonSubtemplate = true;
                            sub.templateDefStartToken = SUBTEMPLATE10.token;
                            sub.ast = SUBTEMPLATE10;
                            sub.ast.setUnknownTokenBoundaries();
                            sub.tokens = this.input.getTokenStream();

                            this.outermostImpl.addImplicitlyDefinedTemplate(sub);

                            this.match(this.input, TreeParser.UP, null);
                        }

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:254:7: SUBTEMPLATE
                    {
                        SUBTEMPLATE11 = this.match(this.input, CodeGenerator.SUBTEMPLATE,
                            CodeGenerator.FOLLOW_SUBTEMPLATE_in_subtemplate430)!;

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
        }
        finally {
            // do for sure before leaving
        }

        return retval;
    }
    // $ANTLR end "subtemplate"

    // $ANTLR start "ifstat"
    // CodeGenerator.g:271:1: ifstat[CommonTree indent] : ^(i= 'if' conditional chunk
    // ( ^(eif= 'elseif' ec= conditional chunk ) )* ( ^(el= 'else' chunk ) )? ) ;
    public ifstat(indent: CommonTree | null): void {
        let i = null;
        let eif = null;
        let el = null;
        let ec = null;

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
        if (indent !== null) {
            this.template_stack.peek().state.indent(indent);
        }

        try {
            // CodeGenerator.g:285:2: ( ^(i= 'if' conditional chunk ( ^(eif= 'elseif' ec= conditional chunk ) )*
            // ( ^(el= 'else' chunk ) )? ) )
            // CodeGenerator.g:286:5: ^(i= 'if' conditional chunk ( ^(eif= 'elseif' ec= conditional chunk ) )*
            // ( ^(el= 'else' chunk ) )? )
            {
                i = this.match(this.input, CodeGenerator.IF, CodeGenerator.FOLLOW_IF_in_ifstat482);
                this.match(this.input, TreeParser.DOWN, null);
                this.pushFollow(CodeGenerator.FOLLOW_conditional_in_ifstat484);
                this.conditional();
                this.state._fsp--;

                prevBranchOperand = this.address() + 1;
                this.emit1(i, Bytecode.INSTR_BRF, -1); // write placeholder as branch target

                this.pushFollow(CodeGenerator.FOLLOW_chunk_in_ifstat488);
                this.chunk();
                this.state._fsp--;

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
                                eif = this.match(this.input, CodeGenerator.ELSEIF,
                                    CodeGenerator.FOLLOW_ELSEIF_in_ifstat526);

                                endRefs.push(this.address() + 1);
                                this.emit1(eif, Bytecode.INSTR_BR, -1); // br end
                                // update previous branch instruction
                                this.write(prevBranchOperand, this.address());
                                prevBranchOperand = -1;

                                this.match(this.input, TreeParser.DOWN, null);
                                this.pushFollow(CodeGenerator.FOLLOW_conditional_in_ifstat534);
                                ec = this.conditional();
                                this.state._fsp--;

                                prevBranchOperand = this.address() + 1;
                                // write placeholder as branch target
                                this.emit1((ec !== null ? (ec.start as CommonTree) : null), Bytecode.INSTR_BRF, -1);

                                this.pushFollow(CodeGenerator.FOLLOW_chunk_in_ifstat538);
                                this.chunk();
                                this.state._fsp--;

                                this.match(this.input, TreeParser.UP, null);

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
                            el = this.match(this.input, CodeGenerator.ELSE, CodeGenerator.FOLLOW_ELSE_in_ifstat601);

                            endRefs.push(this.address() + 1);
                            this.emit1(el, Bytecode.INSTR_BR, -1); // br end
                            // update previous branch instruction
                            this.write(prevBranchOperand, this.address());
                            prevBranchOperand = -1;

                            if (this.input.LA(1) === TreeParser.DOWN) {
                                this.match(this.input, TreeParser.DOWN, null);
                                this.pushFollow(CodeGenerator.FOLLOW_chunk_in_ifstat605);
                                this.chunk();
                                this.state._fsp--;

                                this.match(this.input, TreeParser.UP, null);
                            }

                        }
                        break;
                    }

                    default:

                }

                this.match(this.input, TreeParser.UP, null);

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
        }
        finally {
            // do for sure before leaving
        }
    }

    // $ANTLR start "conditional"
    // CodeGenerator.g:323:1: conditional : ( ^( OR conditional conditional ) | ^( AND conditional conditional )
    // | ^( BANG conditional ) | expr );
    public conditional(): CodeGenerator.conditional_return {
        const retval = new CodeGenerator.conditional_return();
        retval.start = this.input.LT(1);

        let OR12 = null;
        let AND13 = null;
        let BANG14 = null;

        try {
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
                    const nvae =
                        new NoViableAltExceptionV3("", 12, 0, this.input);
                    throw nvae;
                }

            }
            switch (alt12) {
                case 1: {
                    // CodeGenerator.g:324:5: ^( OR conditional conditional )
                    {
                        OR12 = this.match(this.input, CodeGenerator.OR, CodeGenerator.FOLLOW_OR_in_conditional651);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_conditional_in_conditional653);
                        this.conditional();
                        this.state._fsp--;

                        this.pushFollow(CodeGenerator.FOLLOW_conditional_in_conditional655);
                        this.conditional();
                        this.state._fsp--;

                        this.match(this.input, TreeParser.UP, null);

                        this.emit(OR12, Bytecode.INSTR_OR);
                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:325:7: ^( AND conditional conditional )
                    {
                        AND13 = this.match(this.input, CodeGenerator.AND, CodeGenerator.FOLLOW_AND_in_conditional667);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_conditional_in_conditional669);
                        this.conditional();
                        this.state._fsp--;

                        this.pushFollow(CodeGenerator.FOLLOW_conditional_in_conditional671);
                        this.conditional();
                        this.state._fsp--;

                        this.match(this.input, TreeParser.UP, null);

                        this.emit(AND13, Bytecode.INSTR_AND);
                    }
                    break;
                }

                case 3: {
                    // CodeGenerator.g:326:7: ^( BANG conditional )
                    {
                        BANG14 = this.match(this.input, CodeGenerator.BANG,
                            CodeGenerator.FOLLOW_BANG_in_conditional683);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_conditional_in_conditional685);
                        this.conditional();
                        this.state._fsp--;

                        this.match(this.input, TreeParser.UP, null);

                        this.emit(BANG14, Bytecode.INSTR_NOT);
                    }
                    break;
                }

                case 4: {
                    // CodeGenerator.g:327:7: expr
                    {
                        this.pushFollow(CodeGenerator.FOLLOW_expr_in_conditional696);
                        this.expr();
                        this.state._fsp--;

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
        }
        finally {
            // do for sure before leaving
        }

        return retval;
    }

    // $ANTLR start "exprOptions"
    // CodeGenerator.g:330:1: exprOptions : ^( OPTIONS ( option )* ) ;
    public exprOptions(): CodeGenerator.exprOptions_return {
        const retval = new CodeGenerator.exprOptions_return();
        retval.start = this.input.LT(1);

        try {
            // CodeGenerator.g:330:12: ( ^( OPTIONS ( option )* ) )
            // CodeGenerator.g:331:5: ^( OPTIONS ( option )* )
            {
                this.emit((retval.start), Bytecode.INSTR_OPTIONS);
                this.match(this.input, CodeGenerator.OPTIONS, CodeGenerator.FOLLOW_OPTIONS_in_exprOptions712);
                if (this.input.LA(1) === TreeParser.DOWN) {
                    this.match(this.input, TreeParser.DOWN, null);
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
                                    this.pushFollow(CodeGenerator.FOLLOW_option_in_exprOptions714);
                                    this.option();
                                    this.state._fsp--;

                                }
                                break;
                            }

                            default: {
                                break loop13;
                            }

                        }
                    }

                    this.match(this.input, TreeParser.UP, null);
                }

            }

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

        return retval;
    }
    // $ANTLR end "exprOptions"

    // $ANTLR start "option"
    // CodeGenerator.g:334:1: option : ^( '=' ID expr ) ;
    public option(): void {
        let ID15 = null;

        try {
            // CodeGenerator.g:334:7: ( ^( '=' ID expr ) )
            // CodeGenerator.g:335:5: ^( '=' ID expr )
            {
                this.match(this.input, CodeGenerator.EQUALS, CodeGenerator.FOLLOW_EQUALS_in_option729);
                this.match(this.input, TreeParser.DOWN, null);
                ID15 = this.match(this.input, CodeGenerator.ID, CodeGenerator.FOLLOW_ID_in_option731)!;
                this.pushFollow(CodeGenerator.FOLLOW_expr_in_option733);
                this.expr();
                this.state._fsp--;

                this.match(this.input, TreeParser.UP, null);

                this.setOption(ID15);
            }

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
    // $ANTLR end "option"

    // $ANTLR start "expr"
    // CodeGenerator.g:338:1: expr : ( ^( ZIP ^( ELEMENTS ( expr )+ ) mapTemplateRef[ne] )
    // | ^( MAP expr ( mapTemplateRef[1] )+ ) | prop | includeExpr );
    public expr(): void {
        let ZIP16 = null;
        let MAP17 = null;

        let nt = 0;
        let ne = 0;
        try {
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
                    const nvae =
                        new NoViableAltExceptionV3("", 16, 0, this.input);
                    throw nvae;
                }

            }
            switch (alt16) {
                case 1: {
                    // CodeGenerator.g:340:5: ^( ZIP ^( ELEMENTS ( expr )+ ) mapTemplateRef[ne] )
                    {
                        ZIP16 = this.match(this.input, CodeGenerator.ZIP, CodeGenerator.FOLLOW_ZIP_in_expr758);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.match(this.input, CodeGenerator.ELEMENTS, CodeGenerator.FOLLOW_ELEMENTS_in_expr761);
                        this.match(this.input, TreeParser.DOWN, null);
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
                                        this.pushFollow(CodeGenerator.FOLLOW_expr_in_expr764);
                                        this.expr();
                                        this.state._fsp--;

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

                        this.match(this.input, TreeParser.UP, null);

                        this.pushFollow(CodeGenerator.FOLLOW_mapTemplateRef_in_expr771);
                        this.mapTemplateRef(ne);
                        this.state._fsp--;

                        this.match(this.input, TreeParser.UP, null);

                        this.emit1(ZIP16, Bytecode.INSTR_ZIP_MAP, ne);
                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:341:7: ^( MAP expr ( mapTemplateRef[1] )+ )
                    {
                        MAP17 = this.match(this.input, CodeGenerator.MAP, CodeGenerator.FOLLOW_MAP_in_expr784);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_expr_in_expr786);
                        this.expr();
                        this.state._fsp--;

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
                                        this.pushFollow(CodeGenerator.FOLLOW_mapTemplateRef_in_expr789);
                                        this.mapTemplateRef(1);
                                        this.state._fsp--;

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

                        this.match(this.input, TreeParser.UP, null);

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
                        this.pushFollow(CodeGenerator.FOLLOW_prop_in_expr805);
                        this.prop();
                        this.state._fsp--;

                    }
                    break;
                }

                case 4: {
                    // CodeGenerator.g:346:7: includeExpr
                    {
                        this.pushFollow(CodeGenerator.FOLLOW_includeExpr_in_expr813);
                        this.includeExpr();
                        this.state._fsp--;

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
        }
        finally {
            // do for sure before leaving
        }
    }
    // $ANTLR end "expr"

    // $ANTLR start "prop"
    // CodeGenerator.g:349:1: prop : ( ^( PROP expr ID ) | ^( PROP_IND expr expr ) );
    public prop(): void {
        let PROP18 = null;
        let ID19 = null;
        let PROP_IND20 = null;

        try {
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
                    const nvae =
                        new NoViableAltExceptionV3("", 17, 0, this.input);
                    throw nvae;
                }
            }

            switch (alt17) {
                case 1: {
                    // CodeGenerator.g:350:5: ^( PROP expr ID )
                    {
                        PROP18 = this.match(this.input, CodeGenerator.PROP, CodeGenerator.FOLLOW_PROP_in_prop826);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_expr_in_prop828);
                        this.expr();
                        this.state._fsp--;

                        ID19 = this.match(this.input, CodeGenerator.ID, CodeGenerator.FOLLOW_ID_in_prop830);
                        this.match(this.input, TreeParser.UP, null);

                        this.emit1(PROP18, Bytecode.INSTR_LOAD_PROP, ID19?.getText() ?? "");
                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:351:7: ^( PROP_IND expr expr )
                    {
                        PROP_IND20 = this.match(this.input, CodeGenerator.PROP_IND,
                            CodeGenerator.FOLLOW_PROP_IND_in_prop842);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_expr_in_prop844);
                        this.expr();
                        this.state._fsp--;

                        this.pushFollow(CodeGenerator.FOLLOW_expr_in_prop846);
                        this.expr();
                        this.state._fsp--;

                        this.match(this.input, TreeParser.UP, null);

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
        }
        finally {
            // do for sure before leaving
        }
    }

    // $ANTLR start "mapTemplateRef"
    // CodeGenerator.g:354:1: mapTemplateRef[int num_exprs] : ( ^( INCLUDE qualifiedId args ) | subtemplate
    // | ^( INCLUDE_IND expr args ) );
    public mapTemplateRef(num_exprs: number): CodeGenerator.mapTemplateRef_return {
        const retval = new CodeGenerator.mapTemplateRef_return();
        retval.start = this.input.LT(1);

        let INCLUDE21 = null;
        let INCLUDE_IND25 = null;
        let args22 = null;
        let qualifiedId23 = null;
        let subtemplate24 = null;
        let args26 = null;

        try {
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
                    const nvae =
                        new NoViableAltExceptionV3("", 18, 0, this.input);
                    throw nvae;
                }

            }
            switch (alt18) {
                case 1: {
                    // CodeGenerator.g:355:5: ^( INCLUDE qualifiedId args )
                    {
                        INCLUDE21 = this.match(this.input, CodeGenerator.INCLUDE,
                            CodeGenerator.FOLLOW_INCLUDE_in_mapTemplateRef872);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_qualifiedId_in_mapTemplateRef874);
                        qualifiedId23 = this.qualifiedId();
                        this.state._fsp--;

                        for (let i = 1; i <= num_exprs; i++) {
                            this.emit(INCLUDE21, Bytecode.INSTR_NULL);
                        }

                        this.pushFollow(CodeGenerator.FOLLOW_args_in_mapTemplateRef878);
                        args22 = this.args();
                        this.state._fsp--;

                        this.match(this.input, TreeParser.UP, null);

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
                        this.pushFollow(CodeGenerator.FOLLOW_subtemplate_in_mapTemplateRef894);
                        subtemplate24 = this.subtemplate();
                        this.state._fsp--;

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
                        INCLUDE_IND25 = this.match(this.input, CodeGenerator.INCLUDE_IND,
                            CodeGenerator.FOLLOW_INCLUDE_IND_in_mapTemplateRef914);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_expr_in_mapTemplateRef916);
                        this.expr();
                        this.state._fsp--;

                        this.emit(INCLUDE_IND25, Bytecode.INSTR_TOSTR);
                        for (let i = 1; i <= num_exprs; i++) {
                            this.emit(INCLUDE_IND25, Bytecode.INSTR_NULL);
                        }

                        this.pushFollow(CodeGenerator.FOLLOW_args_in_mapTemplateRef920);
                        args26 = this.args();
                        this.state._fsp--;

                        this.emit1(INCLUDE_IND25, Bytecode.INSTR_NEW_IND, args26.n + num_exprs);

                        this.match(this.input, TreeParser.UP, null);

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
        }
        finally {
            // do for sure before leaving
        }

        return retval;
    }

    // $ANTLR start "includeExpr"
    // CodeGenerator.g:382:1: includeExpr : ( ^( EXEC_FUNC ID ( expr )? ) | ^( INCLUDE qualifiedId args )
    // | ^( INCLUDE_SUPER ID args ) | ^( INCLUDE_REGION ID ) | ^( INCLUDE_SUPER_REGION ID ) | primary );
    public includeExpr(): CodeGenerator.includeExpr_return {
        const retval = new CodeGenerator.includeExpr_return();
        retval.start = this.input.LT(1);

        let ID27 = null;
        let INCLUDE30 = null;
        let ID32 = null;
        let INCLUDE_SUPER33 = null;
        let ID34 = null;
        let INCLUDE_REGION35 = null;
        let ID36 = null;
        let INCLUDE_SUPER_REGION37 = null;
        let args28 = null;
        let qualifiedId29 = null;
        let args31 = null;

        try {
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
                    const nvae =
                        new NoViableAltExceptionV3("", 20, 0, this.input);
                    throw nvae;
                }

            }
            switch (alt20) {
                case 1: {
                    // CodeGenerator.g:383:5: ^( EXEC_FUNC ID ( expr )? )
                    {
                        this.match(this.input, CodeGenerator.EXEC_FUNC,
                            CodeGenerator.FOLLOW_EXEC_FUNC_in_includeExpr941);
                        this.match(this.input, TreeParser.DOWN, null);
                        ID27 = this.match(this.input, CodeGenerator.ID, CodeGenerator.FOLLOW_ID_in_includeExpr943);
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
                                    this.pushFollow(CodeGenerator.FOLLOW_expr_in_includeExpr945);
                                    this.expr();
                                    this.state._fsp--;

                                }
                                break;
                            }

                            default:

                        }

                        this.match(this.input, TreeParser.UP, null);

                        this.func(ID27);
                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:384:7: ^( INCLUDE qualifiedId args )
                    {
                        INCLUDE30 = this.match(this.input, CodeGenerator.INCLUDE,
                            CodeGenerator.FOLLOW_INCLUDE_in_includeExpr958);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_qualifiedId_in_includeExpr960);
                        qualifiedId29 = this.qualifiedId();
                        this.state._fsp--;

                        this.pushFollow(CodeGenerator.FOLLOW_args_in_includeExpr962);
                        args28 = this.args();
                        this.state._fsp--;

                        this.match(this.input, TreeParser.UP, null);

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
                        INCLUDE_SUPER33 = this.match(this.input, CodeGenerator.INCLUDE_SUPER,
                            CodeGenerator.FOLLOW_INCLUDE_SUPER_in_includeExpr974);
                        this.match(this.input, TreeParser.DOWN, null);
                        ID32 = this.match(this.input, CodeGenerator.ID, CodeGenerator.FOLLOW_ID_in_includeExpr976);
                        this.pushFollow(CodeGenerator.FOLLOW_args_in_includeExpr978);
                        args31 = this.args();
                        this.state._fsp--;

                        this.match(this.input, TreeParser.UP, null);

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
                        INCLUDE_REGION35 = this.match(this.input, CodeGenerator.INCLUDE_REGION,
                            CodeGenerator.FOLLOW_INCLUDE_REGION_in_includeExpr990);
                        this.match(this.input, TreeParser.DOWN, null);
                        ID34 = this.match(this.input, CodeGenerator.ID, CodeGenerator.FOLLOW_ID_in_includeExpr992);
                        this.match(this.input, TreeParser.UP, null);

                        const impl = Compiler.defineBlankRegion(this.outermostImpl, ID34?.token);

                        this.emit2(INCLUDE_REGION35, Bytecode.INSTR_NEW, impl.name, 0);

                    }
                    break;
                }

                case 5: {
                    // CodeGenerator.g:400:7: ^( INCLUDE_SUPER_REGION ID )
                    {
                        INCLUDE_SUPER_REGION37 = this.match(this.input, CodeGenerator.INCLUDE_SUPER_REGION,
                            CodeGenerator.FOLLOW_INCLUDE_SUPER_REGION_in_includeExpr1004);
                        this.match(this.input, TreeParser.DOWN, null);
                        ID36 = this.match(this.input, CodeGenerator.ID, CodeGenerator.FOLLOW_ID_in_includeExpr1006);
                        this.match(this.input, TreeParser.UP, null);

                        const mangled =
                            STGroup.getMangledRegionName(this.outermostImpl.name, ID36?.getText() ?? "");
                        this.emit2(INCLUDE_SUPER_REGION37, Bytecode.INSTR_SUPER_NEW, mangled, 0);

                    }
                    break;
                }

                case 6: {
                    // CodeGenerator.g:405:7: primary
                    {
                        this.pushFollow(CodeGenerator.FOLLOW_primary_in_includeExpr1017);
                        this.primary();
                        this.state._fsp--;

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
        }
        finally {
            // do for sure before leaving
        }

        return retval;
    }

    // $ANTLR start "primary"
    // CodeGenerator.g:408:1: primary : ( ID | STRING | TRUE | FALSE | subtemplate | list | ^( INCLUDE_IND expr args )
    // | ^( TO_STR expr ) );
    public primary(): CodeGenerator.primary_return {
        const retval = new CodeGenerator.primary_return();
        retval.start = this.input.LT(1);

        let ID38 = null;
        let STRING39 = null;
        let TRUE40 = null;
        let FALSE41 = null;
        let INCLUDE_IND43 = null;
        let TO_STR45 = null;
        let subtemplate42 = null;
        let args44 = null;

        try {
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
                    const nvae =
                        new NoViableAltExceptionV3("", 21, 0, this.input);
                    throw nvae;
                }

            }
            switch (alt21) {
                case 1: {
                    // CodeGenerator.g:409:5: ID
                    {
                        ID38 = this.match(this.input, CodeGenerator.ID, CodeGenerator.FOLLOW_ID_in_primary1029);
                        this.refAttr(ID38);
                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:410:7: STRING
                    {
                        STRING39 = this.match(this.input, CodeGenerator.STRING,
                            CodeGenerator.FOLLOW_STRING_in_primary1039);
                        this.emit1(STRING39, Bytecode.INSTR_LOAD_STR, STRING39?.getText().substring(1) ?? "");
                    }
                    break;
                }

                case 3: {
                    // CodeGenerator.g:411:7: TRUE
                    {
                        TRUE40 = this.match(this.input, CodeGenerator.TRUE, CodeGenerator.FOLLOW_TRUE_in_primary1049);
                        this.emit(TRUE40, Bytecode.INSTR_TRUE);
                    }
                    break;
                }

                case 4: {
                    // CodeGenerator.g:412:7: FALSE
                    {
                        FALSE41 = this.match(this.input, CodeGenerator.FALSE,
                            CodeGenerator.FOLLOW_FALSE_in_primary1059);
                        this.emit(FALSE41, Bytecode.INSTR_FALSE);
                    }
                    break;
                }

                case 5: {
                    // CodeGenerator.g:413:7: subtemplate
                    {
                        this.pushFollow(CodeGenerator.FOLLOW_subtemplate_in_primary1069);
                        subtemplate42 = this.subtemplate();
                        this.state._fsp--;

                        this.emit2((retval.start), Bytecode.INSTR_NEW, subtemplate42.name, 0);
                    }
                    break;
                }

                case 6: {
                    // CodeGenerator.g:415:7: list
                    {
                        this.pushFollow(CodeGenerator.FOLLOW_list_in_primary1084);
                        this.list();
                        this.state._fsp--;

                    }
                    break;
                }

                case 7: {
                    // CodeGenerator.g:416:7: ^( INCLUDE_IND expr args )
                    {
                        INCLUDE_IND43 = this.match(this.input, CodeGenerator.INCLUDE_IND,
                            CodeGenerator.FOLLOW_INCLUDE_IND_in_primary1102);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_expr_in_primary1104);
                        this.expr();
                        this.state._fsp--;

                        this.emit(INCLUDE_IND43, Bytecode.INSTR_TOSTR);
                        this.pushFollow(CodeGenerator.FOLLOW_args_in_primary1108);
                        args44 = this.args();
                        this.state._fsp--;

                        this.emit1(INCLUDE_IND43, Bytecode.INSTR_NEW_IND, (args44 !== null ? (args44).n : 0));
                        this.match(this.input, TreeParser.UP, null);

                    }
                    break;
                }

                case 8: {
                    // CodeGenerator.g:419:7: ^( TO_STR expr )
                    {
                        TO_STR45 = this.match(this.input, CodeGenerator.TO_STR,
                            CodeGenerator.FOLLOW_TO_STR_in_primary1125);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_expr_in_primary1127);
                        this.expr();
                        this.state._fsp--;

                        this.match(this.input, TreeParser.UP, null);

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
        }
        finally {
            // do for sure before leaving
        }

        return retval;
    }

    // $ANTLR start "qualifiedId"
    // CodeGenerator.g:422:1: qualifiedId : ( ^( SLASH qualifiedId ID ) | ^( SLASH ID ) | ID );
    public qualifiedId(): CodeGenerator.qualifiedId_return {
        const retval = new CodeGenerator.qualifiedId_return();
        retval.start = this.input.LT(1);

        try {
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
                                    const nvae =
                                        new NoViableAltExceptionV3("", 22, 4, this.input);
                                    throw nvae;
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
                                const nvae =
                                    new NoViableAltExceptionV3("", 22, 3, this.input);
                                throw nvae;
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
                        const nvae =
                            new NoViableAltExceptionV3("", 22, 1, this.input);
                        throw nvae;
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
                    const nvae =
                        new NoViableAltExceptionV3("", 22, 0, this.input);
                    throw nvae;
                }
            }

            switch (alt22) {
                case 1: {
                    // CodeGenerator.g:423:5: ^( SLASH qualifiedId ID )
                    {
                        this.match(this.input, CodeGenerator.SLASH, CodeGenerator.FOLLOW_SLASH_in_qualifiedId1143);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.pushFollow(CodeGenerator.FOLLOW_qualifiedId_in_qualifiedId1145);
                        this.qualifiedId();
                        this.state._fsp--;

                        this.match(this.input, CodeGenerator.ID, CodeGenerator.FOLLOW_ID_in_qualifiedId1147);
                        this.match(this.input, TreeParser.UP, null);

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:424:7: ^( SLASH ID )
                    {
                        this.match(this.input, CodeGenerator.SLASH, CodeGenerator.FOLLOW_SLASH_in_qualifiedId1157);
                        this.match(this.input, TreeParser.DOWN, null);
                        this.match(this.input, CodeGenerator.ID, CodeGenerator.FOLLOW_ID_in_qualifiedId1159);
                        this.match(this.input, TreeParser.UP, null);

                    }
                    break;
                }

                case 3: {
                    // CodeGenerator.g:425:7: ID
                    {
                        this.match(this.input, CodeGenerator.ID, CodeGenerator.FOLLOW_ID_in_qualifiedId1168);
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
        }
        finally {
            // do for sure before leaving
        }

        return retval;
    }
    // $ANTLR end "qualifiedId"

    // $ANTLR start "arg"
    // CodeGenerator.g:428:1: arg : expr ;
    public arg(): void {
        try {
            // CodeGenerator.g:428:4: ( expr )
            // CodeGenerator.g:429:5: expr
            {
                this.pushFollow(CodeGenerator.FOLLOW_expr_in_arg1180);
                this.expr();
                this.state._fsp--;

            }

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

    // $ANTLR start "args"
    // CodeGenerator.g:432:1: args returns [int n=0, boolean namedArgs=false, boolean passThru] : ( ( arg )+
    // | ( ^(eq= '=' ID expr ) )+ ( '...' )? | '...' |);
    public args(): CodeGenerator.args_return {
        const retval = new CodeGenerator.args_return();
        retval.start = this.input.LT(1);

        let eq = null;
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
                    const nvae =
                        new NoViableAltExceptionV3("", 26, 0, this.input);
                    throw nvae;
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
                                        this.pushFollow(CodeGenerator.FOLLOW_arg_in_args1196);
                                        this.arg();
                                        this.state._fsp--;

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
                                        eq = this.match(this.input, CodeGenerator.EQUALS,
                                            CodeGenerator.FOLLOW_EQUALS_in_args1225);
                                        this.match(this.input, TreeParser.DOWN, null);
                                        ID46 = this.match(this.input, CodeGenerator.ID,
                                            CodeGenerator.FOLLOW_ID_in_args1227);
                                        this.pushFollow(CodeGenerator.FOLLOW_expr_in_args1229);
                                        this.expr();
                                        this.state._fsp--;

                                        this.match(this.input, TreeParser.UP, null);

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
                                    this.match(this.input, CodeGenerator.ELLIPSIS,
                                        CodeGenerator.FOLLOW_ELLIPSIS_in_args1242);
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
                        this.match(this.input, CodeGenerator.ELLIPSIS, CodeGenerator.FOLLOW_ELLIPSIS_in_args1254);
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
        }
        finally {
            // do for sure before leaving
        }

        return retval;
    }

    // $ANTLR start "list"
    // CodeGenerator.g:441:1: list : ^( LIST ( listElement )* ) ;
    public list(): CodeGenerator.list_return {
        const retval = new CodeGenerator.list_return();
        retval.start = this.input.LT(1);

        let listElement47 = null;

        try {
            // CodeGenerator.g:441:5: ( ^( LIST ( listElement )* ) )
            // CodeGenerator.g:442:5: ^( LIST ( listElement )* )
            {
                this.emit((retval.start), Bytecode.INSTR_LIST);
                this.match(this.input, CodeGenerator.LIST, CodeGenerator.FOLLOW_LIST_in_list1286);
                if (this.input.LA(1) === TreeParser.DOWN) {
                    this.match(this.input, TreeParser.DOWN, null);
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
                                    this.pushFollow(CodeGenerator.FOLLOW_listElement_in_list1289);
                                    listElement47 = this.listElement();
                                    this.state._fsp--;

                                    this.emit(listElement47.start, Bytecode.INSTR_ADD);
                                }
                                break;
                            }

                            default: {
                                break loop27;
                            }

                        }
                    }

                    this.match(this.input, TreeParser.UP, null);
                }

            }

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

        return retval;
    }

    // $ANTLR start "listElement"
    // CodeGenerator.g:447:1: listElement : ( expr | NULL );
    public listElement(): CodeGenerator.listElement_return {
        const retval = new CodeGenerator.listElement_return();
        retval.start = this.input.LT(1);

        let NULL48 = null;

        try {
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
                    const nvae =
                        new NoViableAltExceptionV3("", 28, 0, this.input);
                    throw nvae;
                }
            }

            switch (alt28) {
                case 1: {
                    // CodeGenerator.g:448:5: expr
                    {
                        this.pushFollow(CodeGenerator.FOLLOW_expr_in_listElement1311);
                        this.expr();
                        this.state._fsp--;

                    }
                    break;
                }

                case 2: {
                    // CodeGenerator.g:449:7: NULL
                    {
                        NULL48 = this.match(this.input, CodeGenerator.NULL,
                            CodeGenerator.FOLLOW_NULL_in_listElement1319);
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
        }
        finally {
            // do for sure before leaving
        }

        return retval;
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
