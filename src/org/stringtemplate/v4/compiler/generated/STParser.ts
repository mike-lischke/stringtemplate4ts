// Generated from src/org/stringtemplate/v4/compiler/STParser.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


// cspell: disable

import { ErrorManager } from "../../misc/ErrorManager.js";
import { STLexer } from "../STLexer.js";
import { Compiler } from "../Compiler.js";
import { Interpreter } from "../../Interpreter.js";
import { ErrorType } from "../../misc/ErrorType.js";


export class STParser extends antlr.Parser {
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
    public static readonly RULE_templateAndEOF = 0;
    public static readonly RULE_template = 1;
    public static readonly RULE_element = 2;
    public static readonly RULE_singleElement = 3;
    public static readonly RULE_compoundElement = 4;
    public static readonly RULE_exprTag = 5;
    public static readonly RULE_region = 6;
    public static readonly RULE_subtemplate = 7;
    public static readonly RULE_ifstat = 8;
    public static readonly RULE_conditional = 9;
    public static readonly RULE_andConditional = 10;
    public static readonly RULE_notConditional = 11;
    public static readonly RULE_notConditionalExpr = 12;
    public static readonly RULE_exprOptions = 13;
    public static readonly RULE_option = 14;
    public static readonly RULE_exprNoComma = 15;
    public static readonly RULE_expr = 16;
    public static readonly RULE_mapExpr = 17;
    public static readonly RULE_mapTemplateRef = 18;
    public static readonly RULE_memberExpr = 19;
    public static readonly RULE_includeExpr = 20;
    public static readonly RULE_primary = 21;
    public static readonly RULE_qualifiedId = 22;
    public static readonly RULE_args = 23;
    public static readonly RULE_argExprList = 24;
    public static readonly RULE_arg = 25;
    public static readonly RULE_namedArg = 26;
    public static readonly RULE_list = 27;
    public static readonly RULE_listElement = 28;

    public static readonly literalNames = [
        null, null, null, null, "'if'", "'else'", "'elseif'", "'endif'", 
        "'super'", "';'", "'!'", "'...'", "'='", "':'", "'('", "')'", "'['", 
        "']'", "','", "'.'", "'{'", "'}'", null, null, null, null, null, 
        null, "'|'", "'||'", "'&&'", null, null, "'@'", "'@end'", null, 
        null, null, "'/'"
    ];

    public static readonly symbolicNames = [
        null, null, null, null, "IF", "ELSE", "ELSEIF", "ENDIF", "SUPER", 
        "SEMI", "BANG", "ELLIPSIS", "EQUALS", "COLON", "LPAREN", "RPAREN", 
        "LBRACK", "RBRACK", "COMMA", "DOT", "LCURLY", "RCURLY", "TEXT", 
        "LDELIM", "RDELIM", "ID", "STRING", "WS", "PIPE", "OR", "AND", "INDENT", 
        "NEWLINE", "AT", "END", "TRUE", "FALSE", "COMMENT", "SLASH", "EXPR", 
        "OPTIONS", "PROP", "PROP_IND", "INCLUDE", "INCLUDE_IND", "EXEC_FUNC", 
        "INCLUDE_SUPER", "INCLUDE_SUPER_REGION", "INCLUDE_REGION", "TO_STR", 
        "LIST", "MAP", "ZIP", "SUBTEMPLATE", "ARGS", "ELEMENTS", "REGION", 
        "NULL", "INDENTED_EXPR"
    ];
    public static readonly ruleNames = [
        "templateAndEOF", "template", "element", "singleElement", "compoundElement", 
        "exprTag", "region", "subtemplate", "ifstat", "conditional", "andConditional", 
        "notConditional", "notConditionalExpr", "exprOptions", "option", 
        "exprNoComma", "expr", "mapExpr", "mapTemplateRef", "memberExpr", 
        "includeExpr", "primary", "qualifiedId", "args", "argExprList", 
        "arg", "namedArg", "list", "listElement",
    ];

    public get grammarFileName(): string { return "STParser.g4"; }
    public get literalNames(): (string | null)[] { return STParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return STParser.symbolicNames; }
    public get ruleNames(): string[] { return STParser.ruleNames; }
    public get serializedATN(): number[] { return STParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }


    private errMgr!: ErrorManager;
    private templateToken?: Token;

    public static create(input: antlr.TokenStream, errMgr: ErrorManager, templateToken?: antlr.Token): STParser {
        const result = new STParser(input);
        result.errMgr = errMgr;
        result.templateToken = templateToken;

        return result;
    }

    /*
    protected recoverFromMismatchedToken(input: antlr.IntStream, ttype: number, follow: antlr.BitSet): void {
    	throw new antlr.NoViableAltException(this, input);
    } */

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, STParser._ATN, STParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public templateAndEOF(): TemplateAndEOFContext {
        let localContext = new TemplateAndEOFContext(this.context, this.state);
        this.enterRule(localContext, 0, STParser.RULE_templateAndEOF);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 58;
            this.template();
            this.state = 59;
            this.match(STParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public template(): TemplateContext {
        let localContext = new TemplateContext(this.context, this.state);
        this.enterRule(localContext, 2, STParser.RULE_template);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 64;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 0, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 61;
                    this.element();
                    }
                    }
                }
                this.state = 66;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 0, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public element(): ElementContext {
        let localContext = new ElementContext(this.context, this.state);
        this.enterRule(localContext, 4, STParser.RULE_element);
        let _la: number;
        try {
            this.state = 77;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 2, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 67;
                if (!(this.inputStream.LT(1)!.column === 0)) {
                    throw this.createFailedPredicateException("this.inputStream.LT(1)!.column === 0");
                }
                this.state = 69;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 31) {
                    {
                    this.state = 68;
                    this.match(STParser.INDENT);
                    }
                }

                this.state = 71;
                this.match(STParser.COMMENT);
                this.state = 72;
                this.match(STParser.NEWLINE);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 73;
                this.match(STParser.INDENT);
                this.state = 74;
                this.singleElement();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 75;
                this.singleElement();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 76;
                this.compoundElement();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public singleElement(): SingleElementContext {
        let localContext = new SingleElementContext(this.context, this.state);
        this.enterRule(localContext, 6, STParser.RULE_singleElement);
        try {
            this.state = 83;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case STParser.LDELIM:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 79;
                this.exprTag();
                }
                break;
            case STParser.TEXT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 80;
                this.match(STParser.TEXT);
                }
                break;
            case STParser.NEWLINE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 81;
                this.match(STParser.NEWLINE);
                }
                break;
            case STParser.COMMENT:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 82;
                this.match(STParser.COMMENT);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public compoundElement(): CompoundElementContext {
        let localContext = new CompoundElementContext(this.context, this.state);
        this.enterRule(localContext, 8, STParser.RULE_compoundElement);
        try {
            this.state = 87;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 4, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 85;
                this.ifstat();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 86;
                this.region();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public exprTag(): ExprTagContext {
        let localContext = new ExprTagContext(this.context, this.state);
        this.enterRule(localContext, 10, STParser.RULE_exprTag);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 89;
            this.match(STParser.LDELIM);
            this.state = 90;
            this.expr();
            this.state = 93;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 9) {
                {
                this.state = 91;
                this.match(STParser.SEMI);
                this.state = 92;
                this.exprOptions();
                }
            }

            this.state = 95;
            this.match(STParser.RDELIM);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public region(): RegionContext {
        let localContext = new RegionContext(this.context, this.state);
        this.enterRule(localContext, 12, STParser.RULE_region);
        let indent: Token | null | undefined;
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 98;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 31) {
                {
                this.state = 97;
                localContext._i = this.match(STParser.INDENT);
                }
            }

            this.state = 100;
            localContext._x = this.match(STParser.LDELIM);
            this.state = 101;
            this.match(STParser.AT);
            this.state = 102;
            this.match(STParser.ID);
            this.state = 103;
            this.match(STParser.RDELIM);
            if (this.inputStream.LA(1) != STLexer.NEWLINE) indent=localContext?._i;
            this.state = 105;
            this.template();
            this.state = 107;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 31) {
                {
                this.state = 106;
                this.match(STParser.INDENT);
                }
            }

            this.state = 109;
            this.match(STParser.LDELIM);
            this.state = 110;
            this.match(STParser.END);
            this.state = 111;
            this.match(STParser.RDELIM);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subtemplate(): SubtemplateContext {
        let localContext = new SubtemplateContext(this.context, this.state);
        this.enterRule(localContext, 14, STParser.RULE_subtemplate);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 113;
            localContext._lc = this.match(STParser.LCURLY);
            this.state = 123;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 9, this.context) ) {
            case 1:
                {
                this.state = 114;
                localContext._ID = this.match(STParser.ID);
                localContext._ids.push(localContext._ID);
                this.state = 119;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 18) {
                    {
                    {
                    this.state = 115;
                    this.match(STParser.COMMA);
                    this.state = 116;
                    localContext._ID = this.match(STParser.ID);
                    localContext._ids.push(localContext._ID);
                    }
                    }
                    this.state = 121;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 122;
                this.match(STParser.PIPE);
                }
                break;
            }
            this.state = 125;
            this.template();
            this.state = 127;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 31) {
                {
                this.state = 126;
                this.match(STParser.INDENT);
                }
            }

            this.state = 129;
            this.match(STParser.RCURLY);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ifstat(): IfstatContext {
        let localContext = new IfstatContext(this.context, this.state);
        this.enterRule(localContext, 16, STParser.RULE_ifstat);
        let indent: Token | null | undefined;
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 132;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 31) {
                {
                this.state = 131;
                localContext._i = this.match(STParser.INDENT);
                }
            }

            this.state = 134;
            this.match(STParser.LDELIM);
            this.state = 135;
            this.match(STParser.IF);
            this.state = 136;
            this.match(STParser.LPAREN);
            this.state = 137;
            localContext._c1 = this.conditional();
            this.state = 138;
            this.match(STParser.RPAREN);
            this.state = 139;
            this.match(STParser.RDELIM);
            if (this.inputStream.LA(1) != STLexer.NEWLINE) indent=localContext?._i;
            this.state = 141;
            localContext._t1 = this.template();
            this.state = 155;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 13, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 143;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 31) {
                        {
                        this.state = 142;
                        this.match(STParser.INDENT);
                        }
                    }

                    this.state = 145;
                    this.match(STParser.LDELIM);
                    this.state = 146;
                    this.match(STParser.ELSEIF);
                    this.state = 147;
                    this.match(STParser.LPAREN);
                    this.state = 148;
                    localContext._conditional = this.conditional();
                    localContext._c2.push(localContext._conditional);
                    this.state = 149;
                    this.match(STParser.RPAREN);
                    this.state = 150;
                    this.match(STParser.RDELIM);
                    this.state = 151;
                    localContext._template = this.template();
                    localContext._t2.push(localContext._template);
                    }
                    }
                }
                this.state = 157;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 13, this.context);
            }
            this.state = 165;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 15, this.context) ) {
            case 1:
                {
                this.state = 159;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 31) {
                    {
                    this.state = 158;
                    this.match(STParser.INDENT);
                    }
                }

                this.state = 161;
                this.match(STParser.LDELIM);
                this.state = 162;
                this.match(STParser.ELSE);
                this.state = 163;
                this.match(STParser.RDELIM);
                this.state = 164;
                localContext._t3 = this.template();
                }
                break;
            }
            this.state = 168;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 31) {
                {
                this.state = 167;
                this.match(STParser.INDENT);
                }
            }

            this.state = 170;
            localContext._endif = this.match(STParser.LDELIM);
            this.state = 171;
            this.match(STParser.ENDIF);
            this.state = 172;
            this.match(STParser.RDELIM);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public conditional(): ConditionalContext {
        let localContext = new ConditionalContext(this.context, this.state);
        this.enterRule(localContext, 18, STParser.RULE_conditional);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 174;
            this.andConditional();
            this.state = 179;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 29) {
                {
                {
                this.state = 175;
                this.match(STParser.OR);
                this.state = 176;
                this.andConditional();
                }
                }
                this.state = 181;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public andConditional(): AndConditionalContext {
        let localContext = new AndConditionalContext(this.context, this.state);
        this.enterRule(localContext, 20, STParser.RULE_andConditional);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 182;
            this.notConditional();
            this.state = 187;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 30) {
                {
                {
                this.state = 183;
                this.match(STParser.AND);
                this.state = 184;
                this.notConditional();
                }
                }
                this.state = 189;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public notConditional(): NotConditionalContext {
        let localContext = new NotConditionalContext(this.context, this.state);
        this.enterRule(localContext, 22, STParser.RULE_notConditional);
        try {
            this.state = 193;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 19, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 190;
                this.match(STParser.BANG);
                this.state = 191;
                this.notConditional();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 192;
                this.memberExpr();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public notConditionalExpr(): NotConditionalExprContext {
        let localContext = new NotConditionalExprContext(this.context, this.state);
        this.enterRule(localContext, 24, STParser.RULE_notConditionalExpr);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 195;
            this.match(STParser.ID);
            this.state = 205;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 19) {
                {
                this.state = 203;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 20, this.context) ) {
                case 1:
                    {
                    this.state = 196;
                    localContext._p = this.match(STParser.DOT);
                    this.state = 197;
                    localContext._prop = this.match(STParser.ID);
                    }
                    break;
                case 2:
                    {
                    this.state = 198;
                    localContext._p = this.match(STParser.DOT);
                    this.state = 199;
                    this.match(STParser.LPAREN);
                    this.state = 200;
                    this.mapExpr();
                    this.state = 201;
                    this.match(STParser.RPAREN);
                    }
                    break;
                }
                }
                this.state = 207;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public exprOptions(): ExprOptionsContext {
        let localContext = new ExprOptionsContext(this.context, this.state);
        this.enterRule(localContext, 26, STParser.RULE_exprOptions);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 208;
            this.option();
            this.state = 213;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 18) {
                {
                {
                this.state = 209;
                this.match(STParser.COMMA);
                this.state = 210;
                this.option();
                }
                }
                this.state = 215;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public option(): OptionContext {
        let localContext = new OptionContext(this.context, this.state);
        this.enterRule(localContext, 28, STParser.RULE_option);

        	const id = this.inputStream.LT(1)!.text!;
        	const defVal = Compiler.defaultOptionValues.get(id);
        	const validOption = Interpreter.supportedOptions.get(id) != null;

        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 216;
            localContext._ID = this.match(STParser.ID);

            		if (!validOption) {
                        this.errMgr.compileTimeError(ErrorType.NO_SUCH_OPTION, this.templateToken, localContext?._ID, (localContext._ID?.text ?? ''));
            		}
            		
            this.state = 221;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case STParser.EQUALS:
                {
                this.state = 218;
                this.match(STParser.EQUALS);
                this.state = 219;
                this.exprNoComma();
                }
                break;
            case STParser.COMMA:
            case STParser.RDELIM:
                {

                			if (defVal == null) {
                				this.errMgr.compileTimeError(ErrorType.NO_DEFAULT_VALUE, this.templateToken, localContext?._ID);
                			}
                		
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public exprNoComma(): ExprNoCommaContext {
        let localContext = new ExprNoCommaContext(this.context, this.state);
        this.enterRule(localContext, 30, STParser.RULE_exprNoComma);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 223;
            this.memberExpr();
            this.state = 227;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case STParser.COLON:
                {
                this.state = 224;
                this.match(STParser.COLON);
                this.state = 225;
                this.mapTemplateRef();
                }
                break;
            case STParser.RPAREN:
            case STParser.RBRACK:
            case STParser.COMMA:
            case STParser.RDELIM:
                // tslint:disable-next-line:no-empty
                {
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public expr(): ExprContext {
        let localContext = new ExprContext(this.context, this.state);
        this.enterRule(localContext, 32, STParser.RULE_expr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 229;
            this.mapExpr();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public mapExpr(): MapExprContext {
        let localContext = new MapExprContext(this.context, this.state);
        this.enterRule(localContext, 34, STParser.RULE_mapExpr);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 231;
            this.memberExpr();
            this.state = 242;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case STParser.COMMA:
                {
                this.state = 234;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 232;
                    localContext._c = this.match(STParser.COMMA);
                    this.state = 233;
                    this.memberExpr();
                    }
                    }
                    this.state = 236;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (_la === 18);
                this.state = 238;
                localContext._col = this.match(STParser.COLON);
                this.state = 239;
                this.mapTemplateRef();
                }
                break;
            case STParser.SEMI:
            case STParser.COLON:
            case STParser.RPAREN:
            case STParser.RDELIM:
                // tslint:disable-next-line:no-empty
                {
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            this.state = 257;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 13) {
                {
                {
                if (localContext?._x!=null) localContext?._x.splice(0);
                this.state = 245;
                localContext._col = this.match(STParser.COLON);
                this.state = 246;
                localContext._mapTemplateRef = this.mapTemplateRef();
                localContext._x.push(localContext._mapTemplateRef);
                this.state = 252;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 27, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 247;
                        if (!(localContext?._c === null)) {
                            throw this.createFailedPredicateException("$c === null");
                        }
                        this.state = 248;
                        this.match(STParser.COMMA);
                        this.state = 249;
                        localContext._mapTemplateRef = this.mapTemplateRef();
                        localContext._x.push(localContext._mapTemplateRef);
                        }
                        }
                    }
                    this.state = 254;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 27, this.context);
                }
                }
                }
                this.state = 259;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public mapTemplateRef(): MapTemplateRefContext {
        let localContext = new MapTemplateRefContext(this.context, this.state);
        this.enterRule(localContext, 36, STParser.RULE_mapTemplateRef);
        try {
            this.state = 275;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case STParser.ID:
            case STParser.SLASH:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 260;
                this.qualifiedId();
                this.state = 261;
                this.match(STParser.LPAREN);
                this.state = 262;
                this.args();
                this.state = 263;
                this.match(STParser.RPAREN);
                }
                break;
            case STParser.LCURLY:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 265;
                this.subtemplate();
                }
                break;
            case STParser.LPAREN:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 266;
                localContext._lp = this.match(STParser.LPAREN);
                this.state = 267;
                this.mapExpr();
                this.state = 268;
                localContext._rp = this.match(STParser.RPAREN);
                this.state = 269;
                this.match(STParser.LPAREN);
                this.state = 271;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 29, this.context) ) {
                case 1:
                    {
                    this.state = 270;
                    this.argExprList();
                    }
                    break;
                }
                this.state = 273;
                this.match(STParser.RPAREN);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public memberExpr(): MemberExprContext {
        let localContext = new MemberExprContext(this.context, this.state);
        this.enterRule(localContext, 38, STParser.RULE_memberExpr);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            {
            this.state = 277;
            this.includeExpr();
            }
            this.state = 287;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 19) {
                {
                this.state = 285;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 31, this.context) ) {
                case 1:
                    {
                    this.state = 278;
                    localContext._p = this.match(STParser.DOT);
                    this.state = 279;
                    this.match(STParser.ID);
                    }
                    break;
                case 2:
                    {
                    this.state = 280;
                    localContext._p = this.match(STParser.DOT);
                    this.state = 281;
                    this.match(STParser.LPAREN);
                    this.state = 282;
                    this.mapExpr();
                    this.state = 283;
                    this.match(STParser.RPAREN);
                    }
                    break;
                }
                }
                this.state = 289;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public includeExpr(): IncludeExprContext {
        let localContext = new IncludeExprContext(this.context, this.state);
        this.enterRule(localContext, 40, STParser.RULE_includeExpr);
        try {
            this.state = 320;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 34, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 290;
                if (!(Compiler.funcs.has(this.inputStream.LT(1)!.text ?? ""))) {
                    throw this.createFailedPredicateException("Compiler.funcs.has(this.inputStream.LT(1)!.text ?? \"\")");
                }
                this.state = 291;
                this.match(STParser.ID);
                this.state = 292;
                this.match(STParser.LPAREN);
                this.state = 294;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 33, this.context) ) {
                case 1:
                    {
                    this.state = 293;
                    this.expr();
                    }
                    break;
                }
                this.state = 296;
                this.match(STParser.RPAREN);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 297;
                this.match(STParser.SUPER);
                this.state = 298;
                this.match(STParser.DOT);
                this.state = 299;
                this.match(STParser.ID);
                this.state = 300;
                this.match(STParser.LPAREN);
                this.state = 301;
                this.args();
                this.state = 302;
                this.match(STParser.RPAREN);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 304;
                this.qualifiedId();
                this.state = 305;
                this.match(STParser.LPAREN);
                this.state = 306;
                this.args();
                this.state = 307;
                this.match(STParser.RPAREN);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 309;
                this.match(STParser.AT);
                this.state = 310;
                this.match(STParser.SUPER);
                this.state = 311;
                this.match(STParser.DOT);
                this.state = 312;
                this.match(STParser.ID);
                this.state = 313;
                this.match(STParser.LPAREN);
                this.state = 314;
                localContext._rp = this.match(STParser.RPAREN);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 315;
                this.match(STParser.AT);
                this.state = 316;
                this.match(STParser.ID);
                this.state = 317;
                this.match(STParser.LPAREN);
                this.state = 318;
                localContext._rp = this.match(STParser.RPAREN);
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 319;
                this.primary();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public primary(): PrimaryContext {
        let localContext = new PrimaryContext(this.context, this.state);
        this.enterRule(localContext, 42, STParser.RULE_primary);
        try {
            this.state = 343;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 37, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 322;
                this.match(STParser.ID);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 323;
                this.match(STParser.STRING);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 324;
                this.match(STParser.TRUE);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 325;
                this.match(STParser.FALSE);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 326;
                this.subtemplate();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 327;
                this.list();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 328;
                this.match(STParser.LPAREN);
                this.state = 329;
                this.conditional();
                this.state = 330;
                this.match(STParser.RPAREN);
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 332;
                localContext._lp = this.match(STParser.LPAREN);
                this.state = 333;
                this.expr();
                this.state = 334;
                this.match(STParser.RPAREN);
                this.state = 341;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case STParser.LPAREN:
                    {
                    this.state = 335;
                    this.match(STParser.LPAREN);
                    this.state = 337;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 35, this.context) ) {
                    case 1:
                        {
                        this.state = 336;
                        this.argExprList();
                        }
                        break;
                    }
                    this.state = 339;
                    this.match(STParser.RPAREN);
                    }
                    break;
                case STParser.SEMI:
                case STParser.COLON:
                case STParser.RPAREN:
                case STParser.RBRACK:
                case STParser.COMMA:
                case STParser.DOT:
                case STParser.RDELIM:
                case STParser.OR:
                case STParser.AND:
                    // tslint:disable-next-line:no-empty
                    {
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public qualifiedId(): QualifiedIdContext {
        let localContext = new QualifiedIdContext(this.context, this.state);
        this.enterRule(localContext, 44, STParser.RULE_qualifiedId);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 348;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case STParser.ID:
                {
                this.state = 345;
                this.match(STParser.ID);
                }
                break;
            case STParser.SLASH:
                {
                this.state = 346;
                this.match(STParser.SLASH);
                this.state = 347;
                this.match(STParser.ID);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            this.state = 354;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 38) {
                {
                {
                this.state = 350;
                this.match(STParser.SLASH);
                this.state = 351;
                localContext._r = this.match(STParser.ID);
                }
                }
                this.state = 356;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public args(): ArgsContext {
        let localContext = new ArgsContext(this.context, this.state);
        this.enterRule(localContext, 46, STParser.RULE_args);
        let _la: number;
        try {
            let alternative: number;
            this.state = 372;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 42, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 357;
                this.argExprList();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 358;
                this.namedArg();
                this.state = 363;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 40, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 359;
                        this.match(STParser.COMMA);
                        this.state = 360;
                        this.namedArg();
                        }
                        }
                    }
                    this.state = 365;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 40, this.context);
                }
                this.state = 368;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 18) {
                    {
                    this.state = 366;
                    this.match(STParser.COMMA);
                    this.state = 367;
                    this.match(STParser.ELLIPSIS);
                    }
                }

                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 370;
                this.match(STParser.ELLIPSIS);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                // tslint:disable-next-line:no-empty
                {
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public argExprList(): ArgExprListContext {
        let localContext = new ArgExprListContext(this.context, this.state);
        this.enterRule(localContext, 48, STParser.RULE_argExprList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 374;
            this.arg();
            this.state = 379;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 18) {
                {
                {
                this.state = 375;
                this.match(STParser.COMMA);
                this.state = 376;
                this.arg();
                }
                }
                this.state = 381;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public arg(): ArgContext {
        let localContext = new ArgContext(this.context, this.state);
        this.enterRule(localContext, 50, STParser.RULE_arg);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 382;
            this.exprNoComma();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public namedArg(): NamedArgContext {
        let localContext = new NamedArgContext(this.context, this.state);
        this.enterRule(localContext, 52, STParser.RULE_namedArg);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 384;
            this.match(STParser.ID);
            this.state = 385;
            this.match(STParser.EQUALS);
            this.state = 386;
            this.arg();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public list(): ListContext {
        let localContext = new ListContext(this.context, this.state);
        this.enterRule(localContext, 54, STParser.RULE_list);
        let _la: number;
        try {
            this.state = 402;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 45, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 388;
                if (!(this.inputStream.LA(2) == STLexer.RBRACK)) {
                    throw this.createFailedPredicateException("this.inputStream.LA(2) == STLexer.RBRACK");
                }
                this.state = 389;
                localContext._lb = this.match(STParser.LBRACK);
                this.state = 390;
                this.match(STParser.RBRACK);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 391;
                localContext._lb = this.match(STParser.LBRACK);
                this.state = 392;
                this.listElement();
                this.state = 397;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 18) {
                    {
                    {
                    this.state = 393;
                    this.match(STParser.COMMA);
                    this.state = 394;
                    this.listElement();
                    }
                    }
                    this.state = 399;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 400;
                this.match(STParser.RBRACK);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public listElement(): ListElementContext {
        let localContext = new ListElementContext(this.context, this.state);
        this.enterRule(localContext, 56, STParser.RULE_listElement);
        try {
            this.state = 406;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 46, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 404;
                this.exprNoComma();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                // tslint:disable-next-line:no-empty
                {
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public override sempred(localContext: antlr.RuleContext | null, ruleIndex: number, predIndex: number): boolean {
        switch (ruleIndex) {
        case 2:
            return this.element_sempred(localContext as ElementContext, predIndex);
        case 17:
            return this.mapExpr_sempred(localContext as MapExprContext, predIndex);
        case 20:
            return this.includeExpr_sempred(localContext as IncludeExprContext, predIndex);
        case 27:
            return this.list_sempred(localContext as ListContext, predIndex);
        }
        return true;
    }
    private element_sempred(localContext: ElementContext | null, predIndex: number): boolean {
        switch (predIndex) {
        case 0:
            return this.inputStream.LT(1)!.column === 0;
        }
        return true;
    }
    private mapExpr_sempred(localContext: MapExprContext | null, predIndex: number): boolean {
        switch (predIndex) {
        case 1:
            return localContext?._c === null;
        }
        return true;
    }
    private includeExpr_sempred(localContext: IncludeExprContext | null, predIndex: number): boolean {
        switch (predIndex) {
        case 2:
            return Compiler.funcs.has(this.inputStream.LT(1)!.text ?? "");
        }
        return true;
    }
    private list_sempred(localContext: ListContext | null, predIndex: number): boolean {
        switch (predIndex) {
        case 3:
            return this.inputStream.LA(2) == STLexer.RBRACK;
        }
        return true;
    }

    public static readonly _serializedATN: number[] = [
        4,1,58,409,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,
        7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,
        2,27,7,27,2,28,7,28,1,0,1,0,1,0,1,1,5,1,63,8,1,10,1,12,1,66,9,1,
        1,2,1,2,3,2,70,8,2,1,2,1,2,1,2,1,2,1,2,1,2,3,2,78,8,2,1,3,1,3,1,
        3,1,3,3,3,84,8,3,1,4,1,4,3,4,88,8,4,1,5,1,5,1,5,1,5,3,5,94,8,5,1,
        5,1,5,1,6,3,6,99,8,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,3,6,108,8,6,1,6,
        1,6,1,6,1,6,1,7,1,7,1,7,1,7,5,7,118,8,7,10,7,12,7,121,9,7,1,7,3,
        7,124,8,7,1,7,1,7,3,7,128,8,7,1,7,1,7,1,8,3,8,133,8,8,1,8,1,8,1,
        8,1,8,1,8,1,8,1,8,1,8,1,8,3,8,144,8,8,1,8,1,8,1,8,1,8,1,8,1,8,1,
        8,1,8,5,8,154,8,8,10,8,12,8,157,9,8,1,8,3,8,160,8,8,1,8,1,8,1,8,
        1,8,3,8,166,8,8,1,8,3,8,169,8,8,1,8,1,8,1,8,1,8,1,9,1,9,1,9,5,9,
        178,8,9,10,9,12,9,181,9,9,1,10,1,10,1,10,5,10,186,8,10,10,10,12,
        10,189,9,10,1,11,1,11,1,11,3,11,194,8,11,1,12,1,12,1,12,1,12,1,12,
        1,12,1,12,1,12,5,12,204,8,12,10,12,12,12,207,9,12,1,13,1,13,1,13,
        5,13,212,8,13,10,13,12,13,215,9,13,1,14,1,14,1,14,1,14,1,14,3,14,
        222,8,14,1,15,1,15,1,15,1,15,3,15,228,8,15,1,16,1,16,1,17,1,17,1,
        17,4,17,235,8,17,11,17,12,17,236,1,17,1,17,1,17,1,17,3,17,243,8,
        17,1,17,1,17,1,17,1,17,1,17,1,17,5,17,251,8,17,10,17,12,17,254,9,
        17,5,17,256,8,17,10,17,12,17,259,9,17,1,18,1,18,1,18,1,18,1,18,1,
        18,1,18,1,18,1,18,1,18,1,18,3,18,272,8,18,1,18,1,18,3,18,276,8,18,
        1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,5,19,286,8,19,10,19,12,19,
        289,9,19,1,20,1,20,1,20,1,20,3,20,295,8,20,1,20,1,20,1,20,1,20,1,
        20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,
        20,1,20,1,20,1,20,1,20,1,20,1,20,3,20,321,8,20,1,21,1,21,1,21,1,
        21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,3,21,338,
        8,21,1,21,1,21,3,21,342,8,21,3,21,344,8,21,1,22,1,22,1,22,3,22,349,
        8,22,1,22,1,22,5,22,353,8,22,10,22,12,22,356,9,22,1,23,1,23,1,23,
        1,23,5,23,362,8,23,10,23,12,23,365,9,23,1,23,1,23,3,23,369,8,23,
        1,23,1,23,3,23,373,8,23,1,24,1,24,1,24,5,24,378,8,24,10,24,12,24,
        381,9,24,1,25,1,25,1,26,1,26,1,26,1,26,1,27,1,27,1,27,1,27,1,27,
        1,27,1,27,5,27,396,8,27,10,27,12,27,399,9,27,1,27,1,27,3,27,403,
        8,27,1,28,1,28,3,28,407,8,28,1,28,0,0,29,0,2,4,6,8,10,12,14,16,18,
        20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,0,0,443,
        0,58,1,0,0,0,2,64,1,0,0,0,4,77,1,0,0,0,6,83,1,0,0,0,8,87,1,0,0,0,
        10,89,1,0,0,0,12,98,1,0,0,0,14,113,1,0,0,0,16,132,1,0,0,0,18,174,
        1,0,0,0,20,182,1,0,0,0,22,193,1,0,0,0,24,195,1,0,0,0,26,208,1,0,
        0,0,28,216,1,0,0,0,30,223,1,0,0,0,32,229,1,0,0,0,34,231,1,0,0,0,
        36,275,1,0,0,0,38,277,1,0,0,0,40,320,1,0,0,0,42,343,1,0,0,0,44,348,
        1,0,0,0,46,372,1,0,0,0,48,374,1,0,0,0,50,382,1,0,0,0,52,384,1,0,
        0,0,54,402,1,0,0,0,56,406,1,0,0,0,58,59,3,2,1,0,59,60,5,0,0,1,60,
        1,1,0,0,0,61,63,3,4,2,0,62,61,1,0,0,0,63,66,1,0,0,0,64,62,1,0,0,
        0,64,65,1,0,0,0,65,3,1,0,0,0,66,64,1,0,0,0,67,69,4,2,0,0,68,70,5,
        31,0,0,69,68,1,0,0,0,69,70,1,0,0,0,70,71,1,0,0,0,71,72,5,37,0,0,
        72,78,5,32,0,0,73,74,5,31,0,0,74,78,3,6,3,0,75,78,3,6,3,0,76,78,
        3,8,4,0,77,67,1,0,0,0,77,73,1,0,0,0,77,75,1,0,0,0,77,76,1,0,0,0,
        78,5,1,0,0,0,79,84,3,10,5,0,80,84,5,22,0,0,81,84,5,32,0,0,82,84,
        5,37,0,0,83,79,1,0,0,0,83,80,1,0,0,0,83,81,1,0,0,0,83,82,1,0,0,0,
        84,7,1,0,0,0,85,88,3,16,8,0,86,88,3,12,6,0,87,85,1,0,0,0,87,86,1,
        0,0,0,88,9,1,0,0,0,89,90,5,23,0,0,90,93,3,32,16,0,91,92,5,9,0,0,
        92,94,3,26,13,0,93,91,1,0,0,0,93,94,1,0,0,0,94,95,1,0,0,0,95,96,
        5,24,0,0,96,11,1,0,0,0,97,99,5,31,0,0,98,97,1,0,0,0,98,99,1,0,0,
        0,99,100,1,0,0,0,100,101,5,23,0,0,101,102,5,33,0,0,102,103,5,25,
        0,0,103,104,5,24,0,0,104,105,6,6,-1,0,105,107,3,2,1,0,106,108,5,
        31,0,0,107,106,1,0,0,0,107,108,1,0,0,0,108,109,1,0,0,0,109,110,5,
        23,0,0,110,111,5,34,0,0,111,112,5,24,0,0,112,13,1,0,0,0,113,123,
        5,20,0,0,114,119,5,25,0,0,115,116,5,18,0,0,116,118,5,25,0,0,117,
        115,1,0,0,0,118,121,1,0,0,0,119,117,1,0,0,0,119,120,1,0,0,0,120,
        122,1,0,0,0,121,119,1,0,0,0,122,124,5,28,0,0,123,114,1,0,0,0,123,
        124,1,0,0,0,124,125,1,0,0,0,125,127,3,2,1,0,126,128,5,31,0,0,127,
        126,1,0,0,0,127,128,1,0,0,0,128,129,1,0,0,0,129,130,5,21,0,0,130,
        15,1,0,0,0,131,133,5,31,0,0,132,131,1,0,0,0,132,133,1,0,0,0,133,
        134,1,0,0,0,134,135,5,23,0,0,135,136,5,4,0,0,136,137,5,14,0,0,137,
        138,3,18,9,0,138,139,5,15,0,0,139,140,5,24,0,0,140,141,6,8,-1,0,
        141,155,3,2,1,0,142,144,5,31,0,0,143,142,1,0,0,0,143,144,1,0,0,0,
        144,145,1,0,0,0,145,146,5,23,0,0,146,147,5,6,0,0,147,148,5,14,0,
        0,148,149,3,18,9,0,149,150,5,15,0,0,150,151,5,24,0,0,151,152,3,2,
        1,0,152,154,1,0,0,0,153,143,1,0,0,0,154,157,1,0,0,0,155,153,1,0,
        0,0,155,156,1,0,0,0,156,165,1,0,0,0,157,155,1,0,0,0,158,160,5,31,
        0,0,159,158,1,0,0,0,159,160,1,0,0,0,160,161,1,0,0,0,161,162,5,23,
        0,0,162,163,5,5,0,0,163,164,5,24,0,0,164,166,3,2,1,0,165,159,1,0,
        0,0,165,166,1,0,0,0,166,168,1,0,0,0,167,169,5,31,0,0,168,167,1,0,
        0,0,168,169,1,0,0,0,169,170,1,0,0,0,170,171,5,23,0,0,171,172,5,7,
        0,0,172,173,5,24,0,0,173,17,1,0,0,0,174,179,3,20,10,0,175,176,5,
        29,0,0,176,178,3,20,10,0,177,175,1,0,0,0,178,181,1,0,0,0,179,177,
        1,0,0,0,179,180,1,0,0,0,180,19,1,0,0,0,181,179,1,0,0,0,182,187,3,
        22,11,0,183,184,5,30,0,0,184,186,3,22,11,0,185,183,1,0,0,0,186,189,
        1,0,0,0,187,185,1,0,0,0,187,188,1,0,0,0,188,21,1,0,0,0,189,187,1,
        0,0,0,190,191,5,10,0,0,191,194,3,22,11,0,192,194,3,38,19,0,193,190,
        1,0,0,0,193,192,1,0,0,0,194,23,1,0,0,0,195,205,5,25,0,0,196,197,
        5,19,0,0,197,204,5,25,0,0,198,199,5,19,0,0,199,200,5,14,0,0,200,
        201,3,34,17,0,201,202,5,15,0,0,202,204,1,0,0,0,203,196,1,0,0,0,203,
        198,1,0,0,0,204,207,1,0,0,0,205,203,1,0,0,0,205,206,1,0,0,0,206,
        25,1,0,0,0,207,205,1,0,0,0,208,213,3,28,14,0,209,210,5,18,0,0,210,
        212,3,28,14,0,211,209,1,0,0,0,212,215,1,0,0,0,213,211,1,0,0,0,213,
        214,1,0,0,0,214,27,1,0,0,0,215,213,1,0,0,0,216,217,5,25,0,0,217,
        221,6,14,-1,0,218,219,5,12,0,0,219,222,3,30,15,0,220,222,6,14,-1,
        0,221,218,1,0,0,0,221,220,1,0,0,0,222,29,1,0,0,0,223,227,3,38,19,
        0,224,225,5,13,0,0,225,228,3,36,18,0,226,228,1,0,0,0,227,224,1,0,
        0,0,227,226,1,0,0,0,228,31,1,0,0,0,229,230,3,34,17,0,230,33,1,0,
        0,0,231,242,3,38,19,0,232,233,5,18,0,0,233,235,3,38,19,0,234,232,
        1,0,0,0,235,236,1,0,0,0,236,234,1,0,0,0,236,237,1,0,0,0,237,238,
        1,0,0,0,238,239,5,13,0,0,239,240,3,36,18,0,240,243,1,0,0,0,241,243,
        1,0,0,0,242,234,1,0,0,0,242,241,1,0,0,0,243,257,1,0,0,0,244,245,
        6,17,-1,0,245,246,5,13,0,0,246,252,3,36,18,0,247,248,4,17,1,1,248,
        249,5,18,0,0,249,251,3,36,18,0,250,247,1,0,0,0,251,254,1,0,0,0,252,
        250,1,0,0,0,252,253,1,0,0,0,253,256,1,0,0,0,254,252,1,0,0,0,255,
        244,1,0,0,0,256,259,1,0,0,0,257,255,1,0,0,0,257,258,1,0,0,0,258,
        35,1,0,0,0,259,257,1,0,0,0,260,261,3,44,22,0,261,262,5,14,0,0,262,
        263,3,46,23,0,263,264,5,15,0,0,264,276,1,0,0,0,265,276,3,14,7,0,
        266,267,5,14,0,0,267,268,3,34,17,0,268,269,5,15,0,0,269,271,5,14,
        0,0,270,272,3,48,24,0,271,270,1,0,0,0,271,272,1,0,0,0,272,273,1,
        0,0,0,273,274,5,15,0,0,274,276,1,0,0,0,275,260,1,0,0,0,275,265,1,
        0,0,0,275,266,1,0,0,0,276,37,1,0,0,0,277,287,3,40,20,0,278,279,5,
        19,0,0,279,286,5,25,0,0,280,281,5,19,0,0,281,282,5,14,0,0,282,283,
        3,34,17,0,283,284,5,15,0,0,284,286,1,0,0,0,285,278,1,0,0,0,285,280,
        1,0,0,0,286,289,1,0,0,0,287,285,1,0,0,0,287,288,1,0,0,0,288,39,1,
        0,0,0,289,287,1,0,0,0,290,291,4,20,2,0,291,292,5,25,0,0,292,294,
        5,14,0,0,293,295,3,32,16,0,294,293,1,0,0,0,294,295,1,0,0,0,295,296,
        1,0,0,0,296,321,5,15,0,0,297,298,5,8,0,0,298,299,5,19,0,0,299,300,
        5,25,0,0,300,301,5,14,0,0,301,302,3,46,23,0,302,303,5,15,0,0,303,
        321,1,0,0,0,304,305,3,44,22,0,305,306,5,14,0,0,306,307,3,46,23,0,
        307,308,5,15,0,0,308,321,1,0,0,0,309,310,5,33,0,0,310,311,5,8,0,
        0,311,312,5,19,0,0,312,313,5,25,0,0,313,314,5,14,0,0,314,321,5,15,
        0,0,315,316,5,33,0,0,316,317,5,25,0,0,317,318,5,14,0,0,318,321,5,
        15,0,0,319,321,3,42,21,0,320,290,1,0,0,0,320,297,1,0,0,0,320,304,
        1,0,0,0,320,309,1,0,0,0,320,315,1,0,0,0,320,319,1,0,0,0,321,41,1,
        0,0,0,322,344,5,25,0,0,323,344,5,26,0,0,324,344,5,35,0,0,325,344,
        5,36,0,0,326,344,3,14,7,0,327,344,3,54,27,0,328,329,5,14,0,0,329,
        330,3,18,9,0,330,331,5,15,0,0,331,344,1,0,0,0,332,333,5,14,0,0,333,
        334,3,32,16,0,334,341,5,15,0,0,335,337,5,14,0,0,336,338,3,48,24,
        0,337,336,1,0,0,0,337,338,1,0,0,0,338,339,1,0,0,0,339,342,5,15,0,
        0,340,342,1,0,0,0,341,335,1,0,0,0,341,340,1,0,0,0,342,344,1,0,0,
        0,343,322,1,0,0,0,343,323,1,0,0,0,343,324,1,0,0,0,343,325,1,0,0,
        0,343,326,1,0,0,0,343,327,1,0,0,0,343,328,1,0,0,0,343,332,1,0,0,
        0,344,43,1,0,0,0,345,349,5,25,0,0,346,347,5,38,0,0,347,349,5,25,
        0,0,348,345,1,0,0,0,348,346,1,0,0,0,349,354,1,0,0,0,350,351,5,38,
        0,0,351,353,5,25,0,0,352,350,1,0,0,0,353,356,1,0,0,0,354,352,1,0,
        0,0,354,355,1,0,0,0,355,45,1,0,0,0,356,354,1,0,0,0,357,373,3,48,
        24,0,358,363,3,52,26,0,359,360,5,18,0,0,360,362,3,52,26,0,361,359,
        1,0,0,0,362,365,1,0,0,0,363,361,1,0,0,0,363,364,1,0,0,0,364,368,
        1,0,0,0,365,363,1,0,0,0,366,367,5,18,0,0,367,369,5,11,0,0,368,366,
        1,0,0,0,368,369,1,0,0,0,369,373,1,0,0,0,370,373,5,11,0,0,371,373,
        1,0,0,0,372,357,1,0,0,0,372,358,1,0,0,0,372,370,1,0,0,0,372,371,
        1,0,0,0,373,47,1,0,0,0,374,379,3,50,25,0,375,376,5,18,0,0,376,378,
        3,50,25,0,377,375,1,0,0,0,378,381,1,0,0,0,379,377,1,0,0,0,379,380,
        1,0,0,0,380,49,1,0,0,0,381,379,1,0,0,0,382,383,3,30,15,0,383,51,
        1,0,0,0,384,385,5,25,0,0,385,386,5,12,0,0,386,387,3,50,25,0,387,
        53,1,0,0,0,388,389,4,27,3,0,389,390,5,16,0,0,390,403,5,17,0,0,391,
        392,5,16,0,0,392,397,3,56,28,0,393,394,5,18,0,0,394,396,3,56,28,
        0,395,393,1,0,0,0,396,399,1,0,0,0,397,395,1,0,0,0,397,398,1,0,0,
        0,398,400,1,0,0,0,399,397,1,0,0,0,400,401,5,17,0,0,401,403,1,0,0,
        0,402,388,1,0,0,0,402,391,1,0,0,0,403,55,1,0,0,0,404,407,3,30,15,
        0,405,407,1,0,0,0,406,404,1,0,0,0,406,405,1,0,0,0,407,57,1,0,0,0,
        47,64,69,77,83,87,93,98,107,119,123,127,132,143,155,159,165,168,
        179,187,193,203,205,213,221,227,236,242,252,257,271,275,285,287,
        294,320,337,341,343,348,354,363,368,372,379,397,402,406
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!STParser.__ATN) {
            STParser.__ATN = new antlr.ATNDeserializer().deserialize(STParser._serializedATN);
        }

        return STParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(STParser.literalNames, STParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return STParser.vocabulary;
    }

    private static readonly decisionsToDFA = STParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class TemplateAndEOFContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public template(): TemplateContext {
        return this.getRuleContext(0, TemplateContext)!;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(STParser.EOF, 0)!;
    }
    public override get ruleIndex(): number {
        return STParser.RULE_templateAndEOF;
    }
}


export class TemplateContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public element(): ElementContext[];
    public element(i: number): ElementContext | null;
    public element(i?: number): ElementContext[] | ElementContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ElementContext);
        }

        return this.getRuleContext(i, ElementContext);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_template;
    }
}


export class ElementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public COMMENT(): antlr.TerminalNode | null {
        return this.getToken(STParser.COMMENT, 0);
    }
    public NEWLINE(): antlr.TerminalNode | null {
        return this.getToken(STParser.NEWLINE, 0);
    }
    public INDENT(): antlr.TerminalNode | null {
        return this.getToken(STParser.INDENT, 0);
    }
    public singleElement(): SingleElementContext | null {
        return this.getRuleContext(0, SingleElementContext);
    }
    public compoundElement(): CompoundElementContext | null {
        return this.getRuleContext(0, CompoundElementContext);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_element;
    }
}


export class SingleElementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public exprTag(): ExprTagContext | null {
        return this.getRuleContext(0, ExprTagContext);
    }
    public TEXT(): antlr.TerminalNode | null {
        return this.getToken(STParser.TEXT, 0);
    }
    public NEWLINE(): antlr.TerminalNode | null {
        return this.getToken(STParser.NEWLINE, 0);
    }
    public COMMENT(): antlr.TerminalNode | null {
        return this.getToken(STParser.COMMENT, 0);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_singleElement;
    }
}


export class CompoundElementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ifstat(): IfstatContext | null {
        return this.getRuleContext(0, IfstatContext);
    }
    public region(): RegionContext | null {
        return this.getRuleContext(0, RegionContext);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_compoundElement;
    }
}


export class ExprTagContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LDELIM(): antlr.TerminalNode {
        return this.getToken(STParser.LDELIM, 0)!;
    }
    public expr(): ExprContext {
        return this.getRuleContext(0, ExprContext)!;
    }
    public RDELIM(): antlr.TerminalNode {
        return this.getToken(STParser.RDELIM, 0)!;
    }
    public SEMI(): antlr.TerminalNode | null {
        return this.getToken(STParser.SEMI, 0);
    }
    public exprOptions(): ExprOptionsContext | null {
        return this.getRuleContext(0, ExprOptionsContext);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_exprTag;
    }
}


export class RegionContext extends antlr.ParserRuleContext {
    public _i?: Token | null;
    public _x?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public AT(): antlr.TerminalNode {
        return this.getToken(STParser.AT, 0)!;
    }
    public ID(): antlr.TerminalNode {
        return this.getToken(STParser.ID, 0)!;
    }
    public RDELIM(): antlr.TerminalNode[];
    public RDELIM(i: number): antlr.TerminalNode | null;
    public RDELIM(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.RDELIM);
    	} else {
    		return this.getToken(STParser.RDELIM, i);
    	}
    }
    public template(): TemplateContext {
        return this.getRuleContext(0, TemplateContext)!;
    }
    public LDELIM(): antlr.TerminalNode[];
    public LDELIM(i: number): antlr.TerminalNode | null;
    public LDELIM(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.LDELIM);
    	} else {
    		return this.getToken(STParser.LDELIM, i);
    	}
    }
    public END(): antlr.TerminalNode {
        return this.getToken(STParser.END, 0)!;
    }
    public INDENT(): antlr.TerminalNode[];
    public INDENT(i: number): antlr.TerminalNode | null;
    public INDENT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.INDENT);
    	} else {
    		return this.getToken(STParser.INDENT, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_region;
    }
}


export class SubtemplateContext extends antlr.ParserRuleContext {
    public _lc?: Token | null;
    public _ID?: Token | null;
    public _ids: antlr.Token[] = [];
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public template(): TemplateContext {
        return this.getRuleContext(0, TemplateContext)!;
    }
    public RCURLY(): antlr.TerminalNode {
        return this.getToken(STParser.RCURLY, 0)!;
    }
    public LCURLY(): antlr.TerminalNode {
        return this.getToken(STParser.LCURLY, 0)!;
    }
    public PIPE(): antlr.TerminalNode | null {
        return this.getToken(STParser.PIPE, 0);
    }
    public INDENT(): antlr.TerminalNode | null {
        return this.getToken(STParser.INDENT, 0);
    }
    public ID(): antlr.TerminalNode[];
    public ID(i: number): antlr.TerminalNode | null;
    public ID(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.ID);
    	} else {
    		return this.getToken(STParser.ID, i);
    	}
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.COMMA);
    	} else {
    		return this.getToken(STParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_subtemplate;
    }
}


export class IfstatContext extends antlr.ParserRuleContext {
    public _i?: Token | null;
    public _c1?: ConditionalContext;
    public _t1?: TemplateContext;
    public _conditional?: ConditionalContext;
    public _c2: ConditionalContext[] = [];
    public _template?: TemplateContext;
    public _t2: TemplateContext[] = [];
    public _t3?: TemplateContext;
    public _endif?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LDELIM(): antlr.TerminalNode[];
    public LDELIM(i: number): antlr.TerminalNode | null;
    public LDELIM(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.LDELIM);
    	} else {
    		return this.getToken(STParser.LDELIM, i);
    	}
    }
    public IF(): antlr.TerminalNode {
        return this.getToken(STParser.IF, 0)!;
    }
    public LPAREN(): antlr.TerminalNode[];
    public LPAREN(i: number): antlr.TerminalNode | null;
    public LPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.LPAREN);
    	} else {
    		return this.getToken(STParser.LPAREN, i);
    	}
    }
    public RPAREN(): antlr.TerminalNode[];
    public RPAREN(i: number): antlr.TerminalNode | null;
    public RPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.RPAREN);
    	} else {
    		return this.getToken(STParser.RPAREN, i);
    	}
    }
    public RDELIM(): antlr.TerminalNode[];
    public RDELIM(i: number): antlr.TerminalNode | null;
    public RDELIM(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.RDELIM);
    	} else {
    		return this.getToken(STParser.RDELIM, i);
    	}
    }
    public ENDIF(): antlr.TerminalNode {
        return this.getToken(STParser.ENDIF, 0)!;
    }
    public conditional(): ConditionalContext[];
    public conditional(i: number): ConditionalContext | null;
    public conditional(i?: number): ConditionalContext[] | ConditionalContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ConditionalContext);
        }

        return this.getRuleContext(i, ConditionalContext);
    }
    public template(): TemplateContext[];
    public template(i: number): TemplateContext | null;
    public template(i?: number): TemplateContext[] | TemplateContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TemplateContext);
        }

        return this.getRuleContext(i, TemplateContext);
    }
    public ELSEIF(): antlr.TerminalNode[];
    public ELSEIF(i: number): antlr.TerminalNode | null;
    public ELSEIF(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.ELSEIF);
    	} else {
    		return this.getToken(STParser.ELSEIF, i);
    	}
    }
    public ELSE(): antlr.TerminalNode | null {
        return this.getToken(STParser.ELSE, 0);
    }
    public INDENT(): antlr.TerminalNode[];
    public INDENT(i: number): antlr.TerminalNode | null;
    public INDENT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.INDENT);
    	} else {
    		return this.getToken(STParser.INDENT, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_ifstat;
    }
}


export class ConditionalContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public andConditional(): AndConditionalContext[];
    public andConditional(i: number): AndConditionalContext | null;
    public andConditional(i?: number): AndConditionalContext[] | AndConditionalContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AndConditionalContext);
        }

        return this.getRuleContext(i, AndConditionalContext);
    }
    public OR(): antlr.TerminalNode[];
    public OR(i: number): antlr.TerminalNode | null;
    public OR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.OR);
    	} else {
    		return this.getToken(STParser.OR, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_conditional;
    }
}


export class AndConditionalContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public notConditional(): NotConditionalContext[];
    public notConditional(i: number): NotConditionalContext | null;
    public notConditional(i?: number): NotConditionalContext[] | NotConditionalContext | null {
        if (i === undefined) {
            return this.getRuleContexts(NotConditionalContext);
        }

        return this.getRuleContext(i, NotConditionalContext);
    }
    public AND(): antlr.TerminalNode[];
    public AND(i: number): antlr.TerminalNode | null;
    public AND(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.AND);
    	} else {
    		return this.getToken(STParser.AND, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_andConditional;
    }
}


export class NotConditionalContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public BANG(): antlr.TerminalNode | null {
        return this.getToken(STParser.BANG, 0);
    }
    public notConditional(): NotConditionalContext | null {
        return this.getRuleContext(0, NotConditionalContext);
    }
    public memberExpr(): MemberExprContext | null {
        return this.getRuleContext(0, MemberExprContext);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_notConditional;
    }
}


export class NotConditionalExprContext extends antlr.ParserRuleContext {
    public _p?: Token | null;
    public _prop?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ID(): antlr.TerminalNode[];
    public ID(i: number): antlr.TerminalNode | null;
    public ID(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.ID);
    	} else {
    		return this.getToken(STParser.ID, i);
    	}
    }
    public LPAREN(): antlr.TerminalNode[];
    public LPAREN(i: number): antlr.TerminalNode | null;
    public LPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.LPAREN);
    	} else {
    		return this.getToken(STParser.LPAREN, i);
    	}
    }
    public mapExpr(): MapExprContext[];
    public mapExpr(i: number): MapExprContext | null;
    public mapExpr(i?: number): MapExprContext[] | MapExprContext | null {
        if (i === undefined) {
            return this.getRuleContexts(MapExprContext);
        }

        return this.getRuleContext(i, MapExprContext);
    }
    public RPAREN(): antlr.TerminalNode[];
    public RPAREN(i: number): antlr.TerminalNode | null;
    public RPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.RPAREN);
    	} else {
    		return this.getToken(STParser.RPAREN, i);
    	}
    }
    public DOT(): antlr.TerminalNode[];
    public DOT(i: number): antlr.TerminalNode | null;
    public DOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.DOT);
    	} else {
    		return this.getToken(STParser.DOT, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_notConditionalExpr;
    }
}


export class ExprOptionsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public option(): OptionContext[];
    public option(i: number): OptionContext | null;
    public option(i?: number): OptionContext[] | OptionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OptionContext);
        }

        return this.getRuleContext(i, OptionContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.COMMA);
    	} else {
    		return this.getToken(STParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_exprOptions;
    }
}


export class OptionContext extends antlr.ParserRuleContext {
    public _ID?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ID(): antlr.TerminalNode {
        return this.getToken(STParser.ID, 0)!;
    }
    public EQUALS(): antlr.TerminalNode | null {
        return this.getToken(STParser.EQUALS, 0);
    }
    public exprNoComma(): ExprNoCommaContext | null {
        return this.getRuleContext(0, ExprNoCommaContext);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_option;
    }
}


export class ExprNoCommaContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public memberExpr(): MemberExprContext {
        return this.getRuleContext(0, MemberExprContext)!;
    }
    public COLON(): antlr.TerminalNode | null {
        return this.getToken(STParser.COLON, 0);
    }
    public mapTemplateRef(): MapTemplateRefContext | null {
        return this.getRuleContext(0, MapTemplateRefContext);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_exprNoComma;
    }
}


export class ExprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public mapExpr(): MapExprContext {
        return this.getRuleContext(0, MapExprContext)!;
    }
    public override get ruleIndex(): number {
        return STParser.RULE_expr;
    }
}


export class MapExprContext extends antlr.ParserRuleContext {
    public _c?: Token | null;
    public _col?: Token | null;
    public _mapTemplateRef?: MapTemplateRefContext;
    public _x: MapTemplateRefContext[] = [];
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public memberExpr(): MemberExprContext[];
    public memberExpr(i: number): MemberExprContext | null;
    public memberExpr(i?: number): MemberExprContext[] | MemberExprContext | null {
        if (i === undefined) {
            return this.getRuleContexts(MemberExprContext);
        }

        return this.getRuleContext(i, MemberExprContext);
    }
    public mapTemplateRef(): MapTemplateRefContext[];
    public mapTemplateRef(i: number): MapTemplateRefContext | null;
    public mapTemplateRef(i?: number): MapTemplateRefContext[] | MapTemplateRefContext | null {
        if (i === undefined) {
            return this.getRuleContexts(MapTemplateRefContext);
        }

        return this.getRuleContext(i, MapTemplateRefContext);
    }
    public COLON(): antlr.TerminalNode[];
    public COLON(i: number): antlr.TerminalNode | null;
    public COLON(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.COLON);
    	} else {
    		return this.getToken(STParser.COLON, i);
    	}
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.COMMA);
    	} else {
    		return this.getToken(STParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_mapExpr;
    }
}


export class MapTemplateRefContext extends antlr.ParserRuleContext {
    public _lp?: Token | null;
    public _rp?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public qualifiedId(): QualifiedIdContext | null {
        return this.getRuleContext(0, QualifiedIdContext);
    }
    public LPAREN(): antlr.TerminalNode[];
    public LPAREN(i: number): antlr.TerminalNode | null;
    public LPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.LPAREN);
    	} else {
    		return this.getToken(STParser.LPAREN, i);
    	}
    }
    public args(): ArgsContext | null {
        return this.getRuleContext(0, ArgsContext);
    }
    public RPAREN(): antlr.TerminalNode[];
    public RPAREN(i: number): antlr.TerminalNode | null;
    public RPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.RPAREN);
    	} else {
    		return this.getToken(STParser.RPAREN, i);
    	}
    }
    public subtemplate(): SubtemplateContext | null {
        return this.getRuleContext(0, SubtemplateContext);
    }
    public mapExpr(): MapExprContext | null {
        return this.getRuleContext(0, MapExprContext);
    }
    public argExprList(): ArgExprListContext | null {
        return this.getRuleContext(0, ArgExprListContext);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_mapTemplateRef;
    }
}


export class MemberExprContext extends antlr.ParserRuleContext {
    public _p?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public includeExpr(): IncludeExprContext | null {
        return this.getRuleContext(0, IncludeExprContext);
    }
    public ID(): antlr.TerminalNode[];
    public ID(i: number): antlr.TerminalNode | null;
    public ID(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.ID);
    	} else {
    		return this.getToken(STParser.ID, i);
    	}
    }
    public LPAREN(): antlr.TerminalNode[];
    public LPAREN(i: number): antlr.TerminalNode | null;
    public LPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.LPAREN);
    	} else {
    		return this.getToken(STParser.LPAREN, i);
    	}
    }
    public mapExpr(): MapExprContext[];
    public mapExpr(i: number): MapExprContext | null;
    public mapExpr(i?: number): MapExprContext[] | MapExprContext | null {
        if (i === undefined) {
            return this.getRuleContexts(MapExprContext);
        }

        return this.getRuleContext(i, MapExprContext);
    }
    public RPAREN(): antlr.TerminalNode[];
    public RPAREN(i: number): antlr.TerminalNode | null;
    public RPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.RPAREN);
    	} else {
    		return this.getToken(STParser.RPAREN, i);
    	}
    }
    public DOT(): antlr.TerminalNode[];
    public DOT(i: number): antlr.TerminalNode | null;
    public DOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.DOT);
    	} else {
    		return this.getToken(STParser.DOT, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_memberExpr;
    }
}


export class IncludeExprContext extends antlr.ParserRuleContext {
    public _rp?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ID(): antlr.TerminalNode | null {
        return this.getToken(STParser.ID, 0);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(STParser.LPAREN, 0);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(STParser.RPAREN, 0);
    }
    public expr(): ExprContext | null {
        return this.getRuleContext(0, ExprContext);
    }
    public SUPER(): antlr.TerminalNode | null {
        return this.getToken(STParser.SUPER, 0);
    }
    public DOT(): antlr.TerminalNode | null {
        return this.getToken(STParser.DOT, 0);
    }
    public args(): ArgsContext | null {
        return this.getRuleContext(0, ArgsContext);
    }
    public qualifiedId(): QualifiedIdContext | null {
        return this.getRuleContext(0, QualifiedIdContext);
    }
    public AT(): antlr.TerminalNode | null {
        return this.getToken(STParser.AT, 0);
    }
    public primary(): PrimaryContext | null {
        return this.getRuleContext(0, PrimaryContext);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_includeExpr;
    }
}


export class PrimaryContext extends antlr.ParserRuleContext {
    public _lp?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ID(): antlr.TerminalNode | null {
        return this.getToken(STParser.ID, 0);
    }
    public STRING(): antlr.TerminalNode | null {
        return this.getToken(STParser.STRING, 0);
    }
    public TRUE(): antlr.TerminalNode | null {
        return this.getToken(STParser.TRUE, 0);
    }
    public FALSE(): antlr.TerminalNode | null {
        return this.getToken(STParser.FALSE, 0);
    }
    public subtemplate(): SubtemplateContext | null {
        return this.getRuleContext(0, SubtemplateContext);
    }
    public list(): ListContext | null {
        return this.getRuleContext(0, ListContext);
    }
    public LPAREN(): antlr.TerminalNode[];
    public LPAREN(i: number): antlr.TerminalNode | null;
    public LPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.LPAREN);
    	} else {
    		return this.getToken(STParser.LPAREN, i);
    	}
    }
    public conditional(): ConditionalContext | null {
        return this.getRuleContext(0, ConditionalContext);
    }
    public RPAREN(): antlr.TerminalNode[];
    public RPAREN(i: number): antlr.TerminalNode | null;
    public RPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.RPAREN);
    	} else {
    		return this.getToken(STParser.RPAREN, i);
    	}
    }
    public expr(): ExprContext | null {
        return this.getRuleContext(0, ExprContext);
    }
    public argExprList(): ArgExprListContext | null {
        return this.getRuleContext(0, ArgExprListContext);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_primary;
    }
}


export class QualifiedIdContext extends antlr.ParserRuleContext {
    public _r?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ID(): antlr.TerminalNode[];
    public ID(i: number): antlr.TerminalNode | null;
    public ID(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.ID);
    	} else {
    		return this.getToken(STParser.ID, i);
    	}
    }
    public SLASH(): antlr.TerminalNode[];
    public SLASH(i: number): antlr.TerminalNode | null;
    public SLASH(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.SLASH);
    	} else {
    		return this.getToken(STParser.SLASH, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_qualifiedId;
    }
}


export class ArgsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public argExprList(): ArgExprListContext | null {
        return this.getRuleContext(0, ArgExprListContext);
    }
    public namedArg(): NamedArgContext[];
    public namedArg(i: number): NamedArgContext | null;
    public namedArg(i?: number): NamedArgContext[] | NamedArgContext | null {
        if (i === undefined) {
            return this.getRuleContexts(NamedArgContext);
        }

        return this.getRuleContext(i, NamedArgContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.COMMA);
    	} else {
    		return this.getToken(STParser.COMMA, i);
    	}
    }
    public ELLIPSIS(): antlr.TerminalNode | null {
        return this.getToken(STParser.ELLIPSIS, 0);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_args;
    }
}


export class ArgExprListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public arg(): ArgContext[];
    public arg(i: number): ArgContext | null;
    public arg(i?: number): ArgContext[] | ArgContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ArgContext);
        }

        return this.getRuleContext(i, ArgContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.COMMA);
    	} else {
    		return this.getToken(STParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_argExprList;
    }
}


export class ArgContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public exprNoComma(): ExprNoCommaContext {
        return this.getRuleContext(0, ExprNoCommaContext)!;
    }
    public override get ruleIndex(): number {
        return STParser.RULE_arg;
    }
}


export class NamedArgContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ID(): antlr.TerminalNode {
        return this.getToken(STParser.ID, 0)!;
    }
    public EQUALS(): antlr.TerminalNode {
        return this.getToken(STParser.EQUALS, 0)!;
    }
    public arg(): ArgContext {
        return this.getRuleContext(0, ArgContext)!;
    }
    public override get ruleIndex(): number {
        return STParser.RULE_namedArg;
    }
}


export class ListContext extends antlr.ParserRuleContext {
    public _lb?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RBRACK(): antlr.TerminalNode {
        return this.getToken(STParser.RBRACK, 0)!;
    }
    public LBRACK(): antlr.TerminalNode {
        return this.getToken(STParser.LBRACK, 0)!;
    }
    public listElement(): ListElementContext[];
    public listElement(i: number): ListElementContext | null;
    public listElement(i?: number): ListElementContext[] | ListElementContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ListElementContext);
        }

        return this.getRuleContext(i, ListElementContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(STParser.COMMA);
    	} else {
    		return this.getToken(STParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return STParser.RULE_list;
    }
}


export class ListElementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public exprNoComma(): ExprNoCommaContext | null {
        return this.getRuleContext(0, ExprNoCommaContext);
    }
    public override get ruleIndex(): number {
        return STParser.RULE_listElement;
    }
}
