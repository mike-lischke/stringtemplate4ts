// Generated from src/org/stringtemplate/v4/compiler/Group.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

// cspell: disable

import { basename } from "path";

import { GroupLexer } from "./GroupLexer.js";
import { STGroup } from "../../STGroup.js";
import { ErrorType } from "../../misc/ErrorType.js";
import { FormalArgument } from "../FormalArgument.js";
import { Misc } from "../../misc/Misc.js";


export class GroupParser extends antlr.Parser {
    public static readonly T__0 = 1;
    public static readonly T__1 = 2;
    public static readonly T__2 = 3;
    public static readonly T__3 = 4;
    public static readonly T__4 = 5;
    public static readonly T__5 = 6;
    public static readonly T__6 = 7;
    public static readonly T__7 = 8;
    public static readonly T__8 = 9;
    public static readonly T__9 = 10;
    public static readonly T__10 = 11;
    public static readonly T__11 = 12;
    public static readonly T__12 = 13;
    public static readonly T__13 = 14;
    public static readonly TRUE = 15;
    public static readonly FALSE = 16;
    public static readonly LBRACK = 17;
    public static readonly RBRACK = 18;
    public static readonly ID = 19;
    public static readonly STRING = 20;
    public static readonly BIGSTRING_NO_NL = 21;
    public static readonly BIGSTRING = 22;
    public static readonly ANONYMOUS_TEMPLATE = 23;
    public static readonly COMMENT = 24;
    public static readonly LINE_COMMENT = 25;
    public static readonly WS = 26;
    public static readonly RULE_group = 0;
    public static readonly RULE_oldStyleHeader = 1;
    public static readonly RULE_groupName = 2;
    public static readonly RULE_delimiters = 3;
    public static readonly RULE_def = 4;
    public static readonly RULE_templateDef = 5;
    public static readonly RULE_formalArgs = 6;
    public static readonly RULE_formalArg = 7;
    public static readonly RULE_dictDef = 8;
    public static readonly RULE_dict = 9;
    public static readonly RULE_dictPairs = 10;
    public static readonly RULE_defaultValuePair = 11;
    public static readonly RULE_keyValuePair = 12;
    public static readonly RULE_keyValue = 13;

    public static readonly literalNames = [
        null, "'import'", "'.'", "'group'", "':'", "'implements'", "','", 
        "';'", "'delimiters'", "'@'", "'('", "')'", "'::='", "'='", "'default'", 
        "'true'", "'false'", "'['", "']'", null, null, null, null, "'{'"
    ];

    public static readonly symbolicNames = [
        null, null, null, null, null, null, null, null, null, null, null, 
        null, null, null, null, "TRUE", "FALSE", "LBRACK", "RBRACK", "ID", 
        "STRING", "BIGSTRING_NO_NL", "BIGSTRING", "ANONYMOUS_TEMPLATE", 
        "COMMENT", "LINE_COMMENT", "WS"
    ];
    public static readonly ruleNames = [
        "group", "oldStyleHeader", "groupName", "delimiters", "def", "templateDef", 
        "formalArgs", "formalArg", "dictDef", "dict", "dictPairs", "defaultValuePair", 
        "keyValuePair", "keyValue",
    ];

    public get grammarFileName(): string { return "Group.g4"; }
    public get literalNames(): (string | null)[] { return GroupParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return GroupParser.symbolicNames; }
    public get ruleNames(): string[] { return GroupParser.ruleNames; }
    public get serializedATN(): number[] { return GroupParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }


    public currentGroup!: STGroup;

    public displayRecognitionError(tokenNames: string[],  e: antlr.RecognitionException): void {
        const msg = e.message;
        this.currentGroup.errMgr.groupSyntaxError(ErrorType.SYNTAX_ERROR, this.getSourceName(), e, msg);
    }

    public override getSourceName(): string {
        const fullFileName = super.getSourceName();
        return basename(fullFileName); // strip to simple name
    }

    public error(msg: string): void {
        const e = new antlr.NoViableAltException(this, this.inputStream);
            this.currentGroup.errMgr.groupSyntaxError(ErrorType.SYNTAX_ERROR, this.getSourceName(), e, msg);
        //this.recover(this.inputStream, null);
        this.errorHandler.recover(this, e);
    }

    public addArgument(args: FormalArgument[] , t: Token, defaultValueToken?: Token): void {
        const name = t.text!;
        for (const arg of args) {
            if (arg.name === name) {
                this.currentGroup.errMgr.compileTimeError(ErrorType.PARAMETER_REDEFINITION, undefined, t, name);

                return;
            }
        }

        args.push(new FormalArgument(name, defaultValueToken));
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, GroupParser._ATN, GroupParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public group(aGroup: STGroup, prefix: string): GroupContext {
        let localContext = new GroupContext(this.context, this.state, aGroup, prefix);
        this.enterRule(localContext, 0, GroupParser.RULE_group);

        const lexer = this.inputStream.getTokenSource() as GroupLexer;
        this.currentGroup = lexer.currentGroup = localContext.aGroup;

        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 29;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 3) {
                {
                this.state = 28;
                this.oldStyleHeader();
                }
            }

            this.state = 32;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 8) {
                {
                this.state = 31;
                this.delimiters();
                }
            }

            this.state = 49;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 1) {
                {
                this.state = 47;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 3, this.context) ) {
                case 1:
                    {
                    this.state = 34;
                    this.match(GroupParser.T__0);
                    this.state = 35;
                    localContext._STRING = this.match(GroupParser.STRING);
                    this.currentGroup.importTemplates(localContext?._STRING);
                    }
                    break;
                case 2:
                    {
                    this.state = 37;
                    this.match(GroupParser.T__0);

                    const e = new antlr.NoViableAltException(this, this.inputStream);
                    this.errorHandler.reportError(this, e);
                            
                    this.state = 39;
                    this.match(GroupParser.ID);
                    this.state = 44;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    while (_la === 2) {
                        {
                        {
                        this.state = 40;
                        this.match(GroupParser.T__1);
                        this.state = 41;
                        this.match(GroupParser.ID);
                        }
                        }
                        this.state = 46;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                    }
                    }
                    break;
                }
                }
                this.state = 51;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 55;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 9 || _la === 19) {
                {
                {
                this.state = 52;
                this.def(prefix);
                }
                }
                this.state = 57;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 58;
            this.match(GroupParser.EOF);
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
    public oldStyleHeader(): OldStyleHeaderContext {
        let localContext = new OldStyleHeaderContext(this.context, this.state);
        this.enterRule(localContext, 2, GroupParser.RULE_oldStyleHeader);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 60;
            this.match(GroupParser.T__2);
            this.state = 61;
            this.match(GroupParser.ID);
            this.state = 64;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 4) {
                {
                this.state = 62;
                this.match(GroupParser.T__3);
                this.state = 63;
                this.match(GroupParser.ID);
                }
            }

            this.state = 75;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 5) {
                {
                this.state = 66;
                this.match(GroupParser.T__4);
                this.state = 67;
                this.match(GroupParser.ID);
                this.state = 72;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 6) {
                    {
                    {
                    this.state = 68;
                    this.match(GroupParser.T__5);
                    this.state = 69;
                    this.match(GroupParser.ID);
                    }
                    }
                    this.state = 74;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 77;
            this.match(GroupParser.T__6);
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
    public groupName(): GroupNameContext {
        let localContext = new GroupNameContext(this.context, this.state);
        this.enterRule(localContext, 4, GroupParser.RULE_groupName);
        let buf = "";
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 79;
            localContext._a = this.match(GroupParser.ID);
            buf += (localContext._a?.text ?? '');
            this.state = 86;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 2) {
                {
                {
                this.state = 81;
                this.match(GroupParser.T__1);
                this.state = 82;
                localContext._a = this.match(GroupParser.ID);
                buf += (localContext._a?.text ?? '');
                }
                }
                this.state = 88;
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
    public delimiters(): DelimitersContext {
        let localContext = new DelimitersContext(this.context, this.state);
        this.enterRule(localContext, 6, GroupParser.RULE_delimiters);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 89;
            this.match(GroupParser.T__7);
            this.state = 90;
            localContext._a = this.match(GroupParser.STRING);
            this.state = 91;
            this.match(GroupParser.T__5);
            this.state = 92;
            localContext._b = this.match(GroupParser.STRING);

                    let supported = true;
                    const textA = (localContext._a?.text ?? '');
                    const startCharacter = textA.length === 0 ? ">" : textA[1];
                    if (STGroup.isReservedCharacter(startCharacter)) {
                        this.currentGroup.errMgr.compileTimeError(ErrorType.UNSUPPORTED_DELIMITER, undefined, localContext?._a, startCharacter);
                        supported = false;
                    }

                    const textB = (localContext._b?.text ?? '');
                    const stopCharacter = textB.length === 0 ? ">" : textB[1];
                    if (STGroup.isReservedCharacter(stopCharacter)) {
                        this.currentGroup.errMgr.compileTimeError(ErrorType.UNSUPPORTED_DELIMITER, undefined, localContext?._b, stopCharacter);
                        supported = false;
                    }

                    if (supported) {
                        this.currentGroup.delimiterStartChar = startCharacter;
                        this.currentGroup.delimiterStopChar = stopCharacter;
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
    public def(prefix: string): DefContext {
        let localContext = new DefContext(this.context, this.state, prefix);
        this.enterRule(localContext, 8, GroupParser.RULE_def);
        try {
            this.state = 97;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 10, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 95;
                this.templateDef(prefix);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 96;
                this.dictDef();
                }
                break;
            }
        }
        catch (re) {

            // pretend we already saw an error here
            // this.state.lastErrorIndex = this.inputStream.index;
            this.error("garbled template definition starting at '" + this.inputStream.LT(1)!.text + "'");

        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public templateDef(prefix: string): TemplateDefContext {
        let localContext = new TemplateDefContext(this.context, this.state, prefix);
        this.enterRule(localContext, 10, GroupParser.RULE_templateDef);

            let template = "";
            let n = 0; // num char to strip from left, right of template def

        try {
            this.state = 128;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 13, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 110;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case GroupParser.T__8:
                    {
                    this.state = 99;
                    this.match(GroupParser.T__8);
                    this.state = 100;
                    localContext._enclosing = this.match(GroupParser.ID);
                    this.state = 101;
                    this.match(GroupParser.T__1);
                    this.state = 102;
                    localContext._name = this.match(GroupParser.ID);
                    this.state = 103;
                    this.match(GroupParser.T__9);
                    this.state = 104;
                    this.match(GroupParser.T__10);
                    }
                    break;
                case GroupParser.ID:
                    {
                    this.state = 105;
                    localContext._name = this.match(GroupParser.ID);
                    this.state = 106;
                    this.match(GroupParser.T__9);
                    this.state = 107;
                    localContext._formalArgs = this.formalArgs();
                    this.state = 108;
                    this.match(GroupParser.T__10);
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 112;
                this.match(GroupParser.T__11);
                const templateToken = this.inputStream.LT(1)!;
                        
                this.state = 121;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case GroupParser.STRING:
                    {
                    this.state = 114;
                    localContext._STRING = this.match(GroupParser.STRING);
                    template = (localContext._STRING?.text ?? ''); n=1;
                    }
                    break;
                case GroupParser.BIGSTRING:
                    {
                    this.state = 116;
                    localContext._BIGSTRING = this.match(GroupParser.BIGSTRING);
                    template = (localContext._BIGSTRING?.text ?? ''); n=2;
                    }
                    break;
                case GroupParser.BIGSTRING_NO_NL:
                    {
                    this.state = 118;
                    localContext._BIGSTRING_NO_NL = this.match(GroupParser.BIGSTRING_NO_NL);
                    template = (localContext._BIGSTRING_NO_NL?.text ?? ''); n=2;
                    }
                    break;
                case GroupParser.EOF:
                case GroupParser.T__8:
                case GroupParser.ID:
                    {

                    template = "";
                    const msg = "missing template at '" + this.inputStream.LT(1)!.text + "'";
                    const e = new antlr.NoViableAltException(this, this.inputStream);
                    this.currentGroup.errMgr.groupSyntaxError(ErrorType.SYNTAX_ERROR, this.getSourceName(), e, msg);

                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }

                if ((localContext._name?.tokenIndex ?? 0) >= 0) { // if ID missing
                    template = Misc.strip(template, n);
                    let templateName = (localContext._name?.text ?? '');
                    if (prefix.length > 0 ) {
                        templateName = prefix + (localContext._name?.text ?? '');
                    }

                    let enclosingTemplateName = (localContext._enclosing?.text ?? '');
                    if (enclosingTemplateName != null && enclosingTemplateName.length > 0 && prefix.length > 0) {
                        enclosingTemplateName = prefix + enclosingTemplateName;
                    }

                    // @ts-ignore, because ST4 doesn't allow a non-null assertion with attribute references.
                    const formalArgs = localContext._formalArgs.args;
                    this.currentGroup.defineTemplateOrRegion(templateName, enclosingTemplateName, templateToken,
                                                    template, localContext?._name, formalArgs);
                }

                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 124;
                localContext._alias = this.match(GroupParser.ID);
                this.state = 125;
                this.match(GroupParser.T__11);
                this.state = 126;
                localContext._target = this.match(GroupParser.ID);
                this.currentGroup.defineTemplateAlias(localContext?._alias, localContext?._target);
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
    public formalArgs(): FormalArgsContext {
        let localContext = new FormalArgsContext(this.context, this.state);
        this.enterRule(localContext, 12, GroupParser.RULE_formalArgs);
         (this.getInvokingContext(6) as FormalArgsContext).hasOptionalParameter =  false; 
        let _la: number;
        try {
            this.state = 139;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case GroupParser.ID:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 130;
                this.formalArg(localContext.args);
                this.state = 135;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 6) {
                    {
                    {
                    this.state = 131;
                    this.match(GroupParser.T__5);
                    this.state = 132;
                    this.formalArg(localContext.args);
                    }
                    }
                    this.state = 137;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
                break;
            case GroupParser.T__10:
                this.enterOuterAlt(localContext, 2);
                // tslint:disable-next-line:no-empty
                {
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
    public formalArg(args: FormalArgument[]): FormalArgContext {
        let localContext = new FormalArgContext(this.context, this.state, args);
        this.enterRule(localContext, 14, GroupParser.RULE_formalArg);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 141;
            localContext._ID = this.match(GroupParser.ID);
            this.state = 150;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 16, this.context) ) {
            case 1:
                {
                this.state = 142;
                this.match(GroupParser.T__12);
                this.state = 143;
                localContext._a = this.tokenStream.LT(1);
                _la = this.tokenStream.LA(1);
                if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 9535488) !== 0))) {
                    localContext._a = this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                (this.getInvokingContext(6) as FormalArgsContext).hasOptionalParameter =  true;
                }
                break;
            case 2:
                {
                this.state = 145;
                this.match(GroupParser.T__12);
                this.state = 146;
                localContext._a = this.match(GroupParser.LBRACK);
                this.state = 147;
                this.match(GroupParser.RBRACK);
                (this.getInvokingContext(6) as FormalArgsContext).hasOptionalParameter =  true;
                }
                break;
            case 3:
                {

                    if ((this.getInvokingContext(6) as FormalArgsContext).hasOptionalParameter) {
                            this.currentGroup.errMgr.compileTimeError(ErrorType.REQUIRED_PARAMETER_AFTER_OPTIONAL, undefined, localContext?._ID);
                    }

                }
                break;
            }
            this.addArgument(localContext.args, localContext?._ID, localContext?._a ?? undefined);
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
    public dictDef(): DictDefContext {
        let localContext = new DictDefContext(this.context, this.state);
        this.enterRule(localContext, 16, GroupParser.RULE_dictDef);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 154;
            localContext._ID = this.match(GroupParser.ID);
            this.state = 155;
            this.match(GroupParser.T__11);
            this.state = 156;
            localContext._dict = this.dict();

            if ( this.currentGroup.rawGetDictionary((localContext._ID?.text ?? ''))!=null ) {
                this.currentGroup.errMgr.compileTimeError(ErrorType.MAP_REDEFINITION, undefined, localContext?._ID);
            } else if ( this.currentGroup.rawGetTemplate((localContext._ID?.text ?? ''))!=null ) {
                this.currentGroup.errMgr.compileTimeError(ErrorType.TEMPLATE_REDEFINITION_AS_MAP, undefined, localContext?._ID);
            } else {
                this.currentGroup.defineDictionary((localContext._ID?.text ?? ''), localContext._dict.mapping!);
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
    public dict(): DictContext {
        let localContext = new DictContext(this.context, this.state);
        this.enterRule(localContext, 18, GroupParser.RULE_dict);
        const mapping = new Map<string, unknown>();
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 159;
            this.match(GroupParser.LBRACK);
            this.state = 160;
            this.dictPairs(mapping);
            this.state = 161;
            this.match(GroupParser.RBRACK);
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
    public dictPairs(mapping: Map<string, unknown>): DictPairsContext {
        let localContext = new DictPairsContext(this.context, this.state, mapping);
        this.enterRule(localContext, 20, GroupParser.RULE_dictPairs);
        let _la: number;
        try {
            let alternative: number;
            this.state = 176;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case GroupParser.STRING:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 163;
                this.keyValuePair(mapping);
                this.state = 168;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 17, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 164;
                        this.match(GroupParser.T__5);
                        this.state = 165;
                        this.keyValuePair(mapping);
                        }
                        }
                    }
                    this.state = 170;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 17, this.context);
                }
                this.state = 173;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 6) {
                    {
                    this.state = 171;
                    this.match(GroupParser.T__5);
                    this.state = 172;
                    this.defaultValuePair(mapping);
                    }
                }

                }
                break;
            case GroupParser.T__13:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 175;
                this.defaultValuePair(mapping);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {

                this.error("missing dictionary entry at '" + this.inputStream.LT(1)!.text + "'");


        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public defaultValuePair(mapping: Map<string, unknown>): DefaultValuePairContext {
        let localContext = new DefaultValuePairContext(this.context, this.state, mapping);
        this.enterRule(localContext, 22, GroupParser.RULE_defaultValuePair);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 178;
            this.match(GroupParser.T__13);
            this.state = 179;
            this.match(GroupParser.T__3);
            this.state = 180;
            localContext._keyValue = this.keyValue();
            mapping.set(STGroup.DEFAULT_KEY, localContext._keyValue.value);
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
    public keyValuePair(mapping: Map<string, unknown>): KeyValuePairContext {
        let localContext = new KeyValuePairContext(this.context, this.state, mapping);
        this.enterRule(localContext, 24, GroupParser.RULE_keyValuePair);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 183;
            localContext._STRING = this.match(GroupParser.STRING);
            this.state = 184;
            this.match(GroupParser.T__3);
            this.state = 185;
            localContext._keyValue = this.keyValue();
            mapping.set(Misc.replaceEscapes(Misc.strip((localContext._STRING?.text ?? ''), 1)), localContext._keyValue.value);
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
    public keyValue(): KeyValueContext {
        let localContext = new KeyValueContext(this.context, this.state);
        this.enterRule(localContext, 26, GroupParser.RULE_keyValue);
        try {
            this.state = 205;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case GroupParser.BIGSTRING:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 188;
                localContext._BIGSTRING = this.match(GroupParser.BIGSTRING);
                localContext!.value =  this.currentGroup.createSingleton(localContext?._BIGSTRING);
                }
                break;
            case GroupParser.BIGSTRING_NO_NL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 190;
                localContext._BIGSTRING_NO_NL = this.match(GroupParser.BIGSTRING_NO_NL);
                localContext!.value =  this.currentGroup.createSingleton(localContext?._BIGSTRING_NO_NL);
                }
                break;
            case GroupParser.ANONYMOUS_TEMPLATE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 192;
                localContext._ANONYMOUS_TEMPLATE = this.match(GroupParser.ANONYMOUS_TEMPLATE);
                localContext!.value =  this.currentGroup.createSingleton(localContext?._ANONYMOUS_TEMPLATE);
                }
                break;
            case GroupParser.STRING:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 194;
                localContext._STRING = this.match(GroupParser.STRING);
                localContext!.value =  Misc.replaceEscapes(Misc.strip((localContext._STRING?.text ?? ''), 1));
                }
                break;
            case GroupParser.TRUE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 196;
                this.match(GroupParser.TRUE);
                localContext!.value =  true;
                }
                break;
            case GroupParser.FALSE:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 198;
                this.match(GroupParser.FALSE);
                localContext!.value =  false;
                }
                break;
            case GroupParser.LBRACK:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 200;
                this.match(GroupParser.LBRACK);
                this.state = 201;
                this.match(GroupParser.RBRACK);
                localContext!.value =  [];
                }
                break;
            case GroupParser.ID:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 203;
                this.match(GroupParser.ID);
                localContext!.value =  STGroup.DICT_KEY;
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {

            this.error("missing value for key at '" + this.inputStream.LT(1)!.text + "'");

        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public static readonly _serializedATN: number[] = [
        4,1,26,208,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        1,0,3,0,30,8,0,1,0,3,0,33,8,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,5,
        0,43,8,0,10,0,12,0,46,9,0,5,0,48,8,0,10,0,12,0,51,9,0,1,0,5,0,54,
        8,0,10,0,12,0,57,9,0,1,0,1,0,1,1,1,1,1,1,1,1,3,1,65,8,1,1,1,1,1,
        1,1,1,1,5,1,71,8,1,10,1,12,1,74,9,1,3,1,76,8,1,1,1,1,1,1,2,1,2,1,
        2,1,2,1,2,5,2,85,8,2,10,2,12,2,88,9,2,1,3,1,3,1,3,1,3,1,3,1,3,1,
        4,1,4,3,4,98,8,4,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,3,5,
        111,8,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,3,5,122,8,5,1,5,1,5,
        1,5,1,5,1,5,3,5,129,8,5,1,6,1,6,1,6,5,6,134,8,6,10,6,12,6,137,9,
        6,1,6,3,6,140,8,6,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,3,7,151,8,
        7,1,7,1,7,1,8,1,8,1,8,1,8,1,8,1,9,1,9,1,9,1,9,1,10,1,10,1,10,5,10,
        167,8,10,10,10,12,10,170,9,10,1,10,1,10,3,10,174,8,10,1,10,3,10,
        177,8,10,1,11,1,11,1,11,1,11,1,11,1,12,1,12,1,12,1,12,1,12,1,13,
        1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,
        1,13,1,13,1,13,3,13,206,8,13,1,13,0,0,14,0,2,4,6,8,10,12,14,16,18,
        20,22,24,26,0,1,3,0,15,16,20,20,23,23,223,0,29,1,0,0,0,2,60,1,0,
        0,0,4,79,1,0,0,0,6,89,1,0,0,0,8,97,1,0,0,0,10,128,1,0,0,0,12,139,
        1,0,0,0,14,141,1,0,0,0,16,154,1,0,0,0,18,159,1,0,0,0,20,176,1,0,
        0,0,22,178,1,0,0,0,24,183,1,0,0,0,26,205,1,0,0,0,28,30,3,2,1,0,29,
        28,1,0,0,0,29,30,1,0,0,0,30,32,1,0,0,0,31,33,3,6,3,0,32,31,1,0,0,
        0,32,33,1,0,0,0,33,49,1,0,0,0,34,35,5,1,0,0,35,36,5,20,0,0,36,48,
        6,0,-1,0,37,38,5,1,0,0,38,39,6,0,-1,0,39,44,5,19,0,0,40,41,5,2,0,
        0,41,43,5,19,0,0,42,40,1,0,0,0,43,46,1,0,0,0,44,42,1,0,0,0,44,45,
        1,0,0,0,45,48,1,0,0,0,46,44,1,0,0,0,47,34,1,0,0,0,47,37,1,0,0,0,
        48,51,1,0,0,0,49,47,1,0,0,0,49,50,1,0,0,0,50,55,1,0,0,0,51,49,1,
        0,0,0,52,54,3,8,4,0,53,52,1,0,0,0,54,57,1,0,0,0,55,53,1,0,0,0,55,
        56,1,0,0,0,56,58,1,0,0,0,57,55,1,0,0,0,58,59,5,0,0,1,59,1,1,0,0,
        0,60,61,5,3,0,0,61,64,5,19,0,0,62,63,5,4,0,0,63,65,5,19,0,0,64,62,
        1,0,0,0,64,65,1,0,0,0,65,75,1,0,0,0,66,67,5,5,0,0,67,72,5,19,0,0,
        68,69,5,6,0,0,69,71,5,19,0,0,70,68,1,0,0,0,71,74,1,0,0,0,72,70,1,
        0,0,0,72,73,1,0,0,0,73,76,1,0,0,0,74,72,1,0,0,0,75,66,1,0,0,0,75,
        76,1,0,0,0,76,77,1,0,0,0,77,78,5,7,0,0,78,3,1,0,0,0,79,80,5,19,0,
        0,80,86,6,2,-1,0,81,82,5,2,0,0,82,83,5,19,0,0,83,85,6,2,-1,0,84,
        81,1,0,0,0,85,88,1,0,0,0,86,84,1,0,0,0,86,87,1,0,0,0,87,5,1,0,0,
        0,88,86,1,0,0,0,89,90,5,8,0,0,90,91,5,20,0,0,91,92,5,6,0,0,92,93,
        5,20,0,0,93,94,6,3,-1,0,94,7,1,0,0,0,95,98,3,10,5,0,96,98,3,16,8,
        0,97,95,1,0,0,0,97,96,1,0,0,0,98,9,1,0,0,0,99,100,5,9,0,0,100,101,
        5,19,0,0,101,102,5,2,0,0,102,103,5,19,0,0,103,104,5,10,0,0,104,111,
        5,11,0,0,105,106,5,19,0,0,106,107,5,10,0,0,107,108,3,12,6,0,108,
        109,5,11,0,0,109,111,1,0,0,0,110,99,1,0,0,0,110,105,1,0,0,0,111,
        112,1,0,0,0,112,113,5,12,0,0,113,121,6,5,-1,0,114,115,5,20,0,0,115,
        122,6,5,-1,0,116,117,5,22,0,0,117,122,6,5,-1,0,118,119,5,21,0,0,
        119,122,6,5,-1,0,120,122,6,5,-1,0,121,114,1,0,0,0,121,116,1,0,0,
        0,121,118,1,0,0,0,121,120,1,0,0,0,122,123,1,0,0,0,123,129,6,5,-1,
        0,124,125,5,19,0,0,125,126,5,12,0,0,126,127,5,19,0,0,127,129,6,5,
        -1,0,128,110,1,0,0,0,128,124,1,0,0,0,129,11,1,0,0,0,130,135,3,14,
        7,0,131,132,5,6,0,0,132,134,3,14,7,0,133,131,1,0,0,0,134,137,1,0,
        0,0,135,133,1,0,0,0,135,136,1,0,0,0,136,140,1,0,0,0,137,135,1,0,
        0,0,138,140,1,0,0,0,139,130,1,0,0,0,139,138,1,0,0,0,140,13,1,0,0,
        0,141,150,5,19,0,0,142,143,5,13,0,0,143,144,7,0,0,0,144,151,6,7,
        -1,0,145,146,5,13,0,0,146,147,5,17,0,0,147,148,5,18,0,0,148,151,
        6,7,-1,0,149,151,6,7,-1,0,150,142,1,0,0,0,150,145,1,0,0,0,150,149,
        1,0,0,0,151,152,1,0,0,0,152,153,6,7,-1,0,153,15,1,0,0,0,154,155,
        5,19,0,0,155,156,5,12,0,0,156,157,3,18,9,0,157,158,6,8,-1,0,158,
        17,1,0,0,0,159,160,5,17,0,0,160,161,3,20,10,0,161,162,5,18,0,0,162,
        19,1,0,0,0,163,168,3,24,12,0,164,165,5,6,0,0,165,167,3,24,12,0,166,
        164,1,0,0,0,167,170,1,0,0,0,168,166,1,0,0,0,168,169,1,0,0,0,169,
        173,1,0,0,0,170,168,1,0,0,0,171,172,5,6,0,0,172,174,3,22,11,0,173,
        171,1,0,0,0,173,174,1,0,0,0,174,177,1,0,0,0,175,177,3,22,11,0,176,
        163,1,0,0,0,176,175,1,0,0,0,177,21,1,0,0,0,178,179,5,14,0,0,179,
        180,5,4,0,0,180,181,3,26,13,0,181,182,6,11,-1,0,182,23,1,0,0,0,183,
        184,5,20,0,0,184,185,5,4,0,0,185,186,3,26,13,0,186,187,6,12,-1,0,
        187,25,1,0,0,0,188,189,5,22,0,0,189,206,6,13,-1,0,190,191,5,21,0,
        0,191,206,6,13,-1,0,192,193,5,23,0,0,193,206,6,13,-1,0,194,195,5,
        20,0,0,195,206,6,13,-1,0,196,197,5,15,0,0,197,206,6,13,-1,0,198,
        199,5,16,0,0,199,206,6,13,-1,0,200,201,5,17,0,0,201,202,5,18,0,0,
        202,206,6,13,-1,0,203,204,5,19,0,0,204,206,6,13,-1,0,205,188,1,0,
        0,0,205,190,1,0,0,0,205,192,1,0,0,0,205,194,1,0,0,0,205,196,1,0,
        0,0,205,198,1,0,0,0,205,200,1,0,0,0,205,203,1,0,0,0,206,27,1,0,0,
        0,21,29,32,44,47,49,55,64,72,75,86,97,110,121,128,135,139,150,168,
        173,176,205
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!GroupParser.__ATN) {
            GroupParser.__ATN = new antlr.ATNDeserializer().deserialize(GroupParser._serializedATN);
        }

        return GroupParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(GroupParser.literalNames, GroupParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return GroupParser.vocabulary;
    }

    private static readonly decisionsToDFA = GroupParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class GroupContext extends antlr.ParserRuleContext {
    public aGroup: STGroup;
    public prefix: string;
    public _STRING?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number, aGroup: STGroup, prefix: string) {
        super(parent, invokingState);
        this.aGroup = aGroup;
        this.prefix = prefix;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(GroupParser.EOF, 0)!;
    }
    public oldStyleHeader(): OldStyleHeaderContext | null {
        return this.getRuleContext(0, OldStyleHeaderContext);
    }
    public delimiters(): DelimitersContext | null {
        return this.getRuleContext(0, DelimitersContext);
    }
    public STRING(): antlr.TerminalNode[];
    public STRING(i: number): antlr.TerminalNode | null;
    public STRING(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(GroupParser.STRING);
    	} else {
    		return this.getToken(GroupParser.STRING, i);
    	}
    }
    public ID(): antlr.TerminalNode[];
    public ID(i: number): antlr.TerminalNode | null;
    public ID(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(GroupParser.ID);
    	} else {
    		return this.getToken(GroupParser.ID, i);
    	}
    }
    public def(): DefContext[];
    public def(i: number): DefContext | null;
    public def(i?: number): DefContext[] | DefContext | null {
        if (i === undefined) {
            return this.getRuleContexts(DefContext);
        }

        return this.getRuleContext(i, DefContext);
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_group;
    }
}


export class OldStyleHeaderContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ID(): antlr.TerminalNode[];
    public ID(i: number): antlr.TerminalNode | null;
    public ID(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(GroupParser.ID);
    	} else {
    		return this.getToken(GroupParser.ID, i);
    	}
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_oldStyleHeader;
    }
}


export class GroupNameContext extends antlr.ParserRuleContext {
    public _a?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ID(): antlr.TerminalNode[];
    public ID(i: number): antlr.TerminalNode | null;
    public ID(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(GroupParser.ID);
    	} else {
    		return this.getToken(GroupParser.ID, i);
    	}
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_groupName;
    }
}


export class DelimitersContext extends antlr.ParserRuleContext {
    public _a?: Token | null;
    public _b?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public STRING(): antlr.TerminalNode[];
    public STRING(i: number): antlr.TerminalNode | null;
    public STRING(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(GroupParser.STRING);
    	} else {
    		return this.getToken(GroupParser.STRING, i);
    	}
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_delimiters;
    }
}


export class DefContext extends antlr.ParserRuleContext {
    public prefix: string;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number, prefix: string) {
        super(parent, invokingState);
        this.prefix = prefix;
    }
    public templateDef(): TemplateDefContext | null {
        return this.getRuleContext(0, TemplateDefContext);
    }
    public dictDef(): DictDefContext | null {
        return this.getRuleContext(0, DictDefContext);
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_def;
    }
}


export class TemplateDefContext extends antlr.ParserRuleContext {
    public prefix: string;
    public _enclosing?: Token | null;
    public _name?: Token | null;
    public _formalArgs?: FormalArgsContext;
    public _STRING?: Token | null;
    public _BIGSTRING?: Token | null;
    public _BIGSTRING_NO_NL?: Token | null;
    public _alias?: Token | null;
    public _target?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number, prefix: string) {
        super(parent, invokingState);
        this.prefix = prefix;
    }
    public formalArgs(): FormalArgsContext | null {
        return this.getRuleContext(0, FormalArgsContext);
    }
    public STRING(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.STRING, 0);
    }
    public BIGSTRING(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.BIGSTRING, 0);
    }
    public BIGSTRING_NO_NL(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.BIGSTRING_NO_NL, 0);
    }
    public ID(): antlr.TerminalNode[];
    public ID(i: number): antlr.TerminalNode | null;
    public ID(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(GroupParser.ID);
    	} else {
    		return this.getToken(GroupParser.ID, i);
    	}
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_templateDef;
    }
}


export class FormalArgsContext extends antlr.ParserRuleContext {
    public args: FormalArgument[] = [];
    public hasOptionalParameter: boolean = false;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public formalArg(): FormalArgContext[];
    public formalArg(i: number): FormalArgContext | null;
    public formalArg(i?: number): FormalArgContext[] | FormalArgContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FormalArgContext);
        }

        return this.getRuleContext(i, FormalArgContext);
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_formalArgs;
    }
}


export class FormalArgContext extends antlr.ParserRuleContext {
    public args: FormalArgument[];
    public _ID?: Token | null;
    public _a?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number, args: FormalArgument[]) {
        super(parent, invokingState);
        this.args = args;
    }
    public ID(): antlr.TerminalNode {
        return this.getToken(GroupParser.ID, 0)!;
    }
    public RBRACK(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.RBRACK, 0);
    }
    public LBRACK(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.LBRACK, 0);
    }
    public STRING(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.STRING, 0);
    }
    public ANONYMOUS_TEMPLATE(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.ANONYMOUS_TEMPLATE, 0);
    }
    public TRUE(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.TRUE, 0);
    }
    public FALSE(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.FALSE, 0);
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_formalArg;
    }
}


export class DictDefContext extends antlr.ParserRuleContext {
    public _ID?: Token | null;
    public _dict?: DictContext;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ID(): antlr.TerminalNode {
        return this.getToken(GroupParser.ID, 0)!;
    }
    public dict(): DictContext {
        return this.getRuleContext(0, DictContext)!;
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_dictDef;
    }
}


export class DictContext extends antlr.ParserRuleContext {
    public mapping: Map<string, unknown> | undefined;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACK(): antlr.TerminalNode {
        return this.getToken(GroupParser.LBRACK, 0)!;
    }
    public dictPairs(): DictPairsContext {
        return this.getRuleContext(0, DictPairsContext)!;
    }
    public RBRACK(): antlr.TerminalNode {
        return this.getToken(GroupParser.RBRACK, 0)!;
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_dict;
    }
}


export class DictPairsContext extends antlr.ParserRuleContext {
    public mapping: Map<string, unknown>;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number, mapping: Map<string, unknown>) {
        super(parent, invokingState);
        this.mapping = mapping;
    }
    public keyValuePair(): KeyValuePairContext[];
    public keyValuePair(i: number): KeyValuePairContext | null;
    public keyValuePair(i?: number): KeyValuePairContext[] | KeyValuePairContext | null {
        if (i === undefined) {
            return this.getRuleContexts(KeyValuePairContext);
        }

        return this.getRuleContext(i, KeyValuePairContext);
    }
    public defaultValuePair(): DefaultValuePairContext | null {
        return this.getRuleContext(0, DefaultValuePairContext);
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_dictPairs;
    }
}


export class DefaultValuePairContext extends antlr.ParserRuleContext {
    public mapping: Map<string, unknown>;
    public _keyValue?: KeyValueContext;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number, mapping: Map<string, unknown>) {
        super(parent, invokingState);
        this.mapping = mapping;
    }
    public keyValue(): KeyValueContext {
        return this.getRuleContext(0, KeyValueContext)!;
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_defaultValuePair;
    }
}


export class KeyValuePairContext extends antlr.ParserRuleContext {
    public mapping: Map<string, unknown>;
    public _STRING?: Token | null;
    public _keyValue?: KeyValueContext;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number, mapping: Map<string, unknown>) {
        super(parent, invokingState);
        this.mapping = mapping;
    }
    public STRING(): antlr.TerminalNode {
        return this.getToken(GroupParser.STRING, 0)!;
    }
    public keyValue(): KeyValueContext {
        return this.getRuleContext(0, KeyValueContext)!;
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_keyValuePair;
    }
}


export class KeyValueContext extends antlr.ParserRuleContext {
    public value: unknown;
    public _BIGSTRING?: Token | null;
    public _BIGSTRING_NO_NL?: Token | null;
    public _ANONYMOUS_TEMPLATE?: Token | null;
    public _STRING?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public BIGSTRING(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.BIGSTRING, 0);
    }
    public BIGSTRING_NO_NL(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.BIGSTRING_NO_NL, 0);
    }
    public ANONYMOUS_TEMPLATE(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.ANONYMOUS_TEMPLATE, 0);
    }
    public STRING(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.STRING, 0);
    }
    public TRUE(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.TRUE, 0);
    }
    public FALSE(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.FALSE, 0);
    }
    public LBRACK(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.LBRACK, 0);
    }
    public RBRACK(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.RBRACK, 0);
    }
    public ID(): antlr.TerminalNode | null {
        return this.getToken(GroupParser.ID, 0);
    }
    public override get ruleIndex(): number {
        return GroupParser.RULE_keyValue;
    }
}
