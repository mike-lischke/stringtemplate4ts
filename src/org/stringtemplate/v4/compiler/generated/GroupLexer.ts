// Generated from src/org/stringtemplate/v4/compiler/Group.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";


/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

// cspell: disable

import { basename } from "path";

import { STGroup } from "../../STGroup.js";
import { ErrorType } from "../../misc/ErrorType.js";
import { Misc } from "../../misc/Misc.js";
import { STLexer } from "../STLexer.js";


export class GroupLexer extends antlr.Lexer {
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

    public static readonly channelNames = [
        "DEFAULT_TOKEN_CHANNEL", "HIDDEN"
    ];

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

    public static readonly modeNames = [
        "DEFAULT_MODE",
    ];

    public static readonly ruleNames = [
        "T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "T__7", 
        "T__8", "T__9", "T__10", "T__11", "T__12", "T__13", "TRUE", "FALSE", 
        "LBRACK", "RBRACK", "ID", "STRING", "BIGSTRING_NO_NL", "BIGSTRING", 
        "ANONYMOUS_TEMPLATE", "COMMENT", "LINE_COMMENT", "WS",
    ];


    public currentGroup: STGroup;

    public reportError(e: antlr.RecognitionException): void {
        let msg: string;
        if (e instanceof antlr.NoViableAltException) {
            msg = "invalid character '" + String.fromCodePoint(this.inputStream.LA(1)) + "'";
        } else if (e instanceof antlr.LexerNoViableAltException) {
            msg = "unterminated string";
        } else {
            msg = e.message;
        }
        this.currentGroup.errMgr.groupSyntaxError(ErrorType.SYNTAX_ERROR, this.getSourceName(), e, msg);
    }

    public getSourceName(): string {
        const fullFileName = this.sourceName;
        return basename(fullFileName); // strip to simple name
    }


    public constructor(input: antlr.CharStream) {
        super(input);
        this.interpreter = new antlr.LexerATNSimulator(this, GroupLexer._ATN, GroupLexer.decisionsToDFA, new antlr.PredictionContextCache());
    }

    public get grammarFileName(): string { return "Group.g4"; }

    public get literalNames(): (string | null)[] { return GroupLexer.literalNames; }
    public get symbolicNames(): (string | null)[] { return GroupLexer.symbolicNames; }
    public get ruleNames(): string[] { return GroupLexer.ruleNames; }

    public get serializedATN(): number[] { return GroupLexer._serializedATN; }

    public get channelNames(): string[] { return GroupLexer.channelNames; }

    public get modeNames(): string[] { return GroupLexer.modeNames; }

    public override action(localContext: antlr.RuleContext | null, ruleIndex: number, actionIndex: number): void {
        switch (ruleIndex) {
        case 19:
            this.STRING_action(localContext, actionIndex);
            break;
        case 20:
            this.BIGSTRING_NO_NL_action(localContext, actionIndex);
            break;
        case 21:
            this.BIGSTRING_action(localContext, actionIndex);
            break;
        case 22:
            this.ANONYMOUS_TEMPLATE_action(localContext, actionIndex);
            break;
        }
    }
    private STRING_action(localContext: antlr.RuleContext | null, actionIndex: number): void {
        switch (actionIndex) {
        case 0:

            const msg = "\\n in string";
            const e = new antlr.LexerNoViableAltException(this, this.inputStream, 0, new antlr.ATNConfigSet());
            this.currentGroup.errMgr.groupLexerError(ErrorType.SYNTAX_ERROR, this.getSourceName(), e, msg);

            break;
        case 1:

            this.text = this.text.replace(/\\\\\"/g,"\"");
                
            break;
        }
    }
    private BIGSTRING_NO_NL_action(localContext: antlr.RuleContext | null, actionIndex: number): void {
        switch (actionIndex) {
        case 2:
             this.text = this.text.replace(/\%\\\\>/g,"\%>"); 
            break;
        }
    }
    private BIGSTRING_action(localContext: antlr.RuleContext | null, actionIndex: number): void {
        switch (actionIndex) {
        case 3:
             this.text = Misc.replaceEscapedRightAngle(this.text); 
            break;
        }
    }
    private ANONYMOUS_TEMPLATE_action(localContext: antlr.RuleContext | null, actionIndex: number): void {
        switch (actionIndex) {
        case 4:

            const templateToken = new antlr.CommonToken([this, this.inputStream], GroupLexer.ANONYMOUS_TEMPLATE, 0, this.getCharIndex(), this.getCharIndex());
            const lexer = new STLexer(this.currentGroup.errMgr, this.inputStream, templateToken, this.currentGroup.delimiterStartChar, this.currentGroup.delimiterStopChar);
            lexer.subtemplateDepth = 1;
            let t = lexer.nextToken();
            while (lexer.subtemplateDepth >= 1 || t.type !== STLexer.RCURLY) {
                if (t.type === Token.EOF) {
                    const e = new antlr.LexerNoViableAltException(this, this.inputStream, 0, new antlr.ATNConfigSet());
                    const msg = "missing final '}' in {...} anonymous template";
                    this.currentGroup.errMgr.groupLexerError(ErrorType.SYNTAX_ERROR, this.getSourceName(), e, msg);

                    break;
                }
                t = lexer.nextToken();
            }
                
            break;
        }
    }

    public static readonly _serializedATN: number[] = [
        4,0,26,223,6,-1,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,
        2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,
        13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,
        19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,1,
        0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,2,1,2,1,2,1,2,1,2,1,2,1,3,1,
        3,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,5,1,5,1,6,1,6,1,
        7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,8,1,8,1,9,1,9,1,10,1,
        10,1,11,1,11,1,11,1,11,1,12,1,12,1,13,1,13,1,13,1,13,1,13,1,13,1,
        13,1,13,1,14,1,14,1,14,1,14,1,14,1,15,1,15,1,15,1,15,1,15,1,15,1,
        16,1,16,1,17,1,17,1,18,1,18,5,18,134,8,18,10,18,12,18,137,9,18,1,
        19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,5,19,147,8,19,10,19,12,19,
        150,9,19,1,19,1,19,1,19,1,20,1,20,1,20,1,20,5,20,159,8,20,10,20,
        12,20,162,9,20,1,20,1,20,1,20,1,20,1,20,1,21,1,21,1,21,1,21,1,21,
        1,21,1,21,1,21,5,21,177,8,21,10,21,12,21,180,9,21,1,21,1,21,1,21,
        1,21,1,21,1,22,1,22,1,22,1,23,1,23,1,23,1,23,5,23,194,8,23,10,23,
        12,23,197,9,23,1,23,1,23,1,23,1,23,1,23,1,24,1,24,1,24,1,24,5,24,
        208,8,24,10,24,12,24,211,9,24,1,24,3,24,214,8,24,1,24,1,24,1,24,
        1,24,1,25,1,25,1,25,1,25,3,160,178,195,0,26,1,1,3,2,5,3,7,4,9,5,
        11,6,13,7,15,8,17,9,19,10,21,11,23,12,25,13,27,14,29,15,31,16,33,
        17,35,18,37,19,39,20,41,21,43,22,45,23,47,24,49,25,51,26,1,0,8,3,
        0,65,90,95,95,97,122,5,0,45,45,48,57,65,90,95,95,97,122,1,0,34,34,
        3,0,10,10,34,34,92,92,1,0,62,62,1,0,92,92,2,0,10,10,13,13,3,0,9,
        10,13,13,32,32,234,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,
        0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,
        0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,
        0,0,29,1,0,0,0,0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,1,0,0,
        0,0,39,1,0,0,0,0,41,1,0,0,0,0,43,1,0,0,0,0,45,1,0,0,0,0,47,1,0,0,
        0,0,49,1,0,0,0,0,51,1,0,0,0,1,53,1,0,0,0,3,60,1,0,0,0,5,62,1,0,0,
        0,7,68,1,0,0,0,9,70,1,0,0,0,11,81,1,0,0,0,13,83,1,0,0,0,15,85,1,
        0,0,0,17,96,1,0,0,0,19,98,1,0,0,0,21,100,1,0,0,0,23,102,1,0,0,0,
        25,106,1,0,0,0,27,108,1,0,0,0,29,116,1,0,0,0,31,121,1,0,0,0,33,127,
        1,0,0,0,35,129,1,0,0,0,37,131,1,0,0,0,39,138,1,0,0,0,41,154,1,0,
        0,0,43,168,1,0,0,0,45,186,1,0,0,0,47,189,1,0,0,0,49,203,1,0,0,0,
        51,219,1,0,0,0,53,54,5,105,0,0,54,55,5,109,0,0,55,56,5,112,0,0,56,
        57,5,111,0,0,57,58,5,114,0,0,58,59,5,116,0,0,59,2,1,0,0,0,60,61,
        5,46,0,0,61,4,1,0,0,0,62,63,5,103,0,0,63,64,5,114,0,0,64,65,5,111,
        0,0,65,66,5,117,0,0,66,67,5,112,0,0,67,6,1,0,0,0,68,69,5,58,0,0,
        69,8,1,0,0,0,70,71,5,105,0,0,71,72,5,109,0,0,72,73,5,112,0,0,73,
        74,5,108,0,0,74,75,5,101,0,0,75,76,5,109,0,0,76,77,5,101,0,0,77,
        78,5,110,0,0,78,79,5,116,0,0,79,80,5,115,0,0,80,10,1,0,0,0,81,82,
        5,44,0,0,82,12,1,0,0,0,83,84,5,59,0,0,84,14,1,0,0,0,85,86,5,100,
        0,0,86,87,5,101,0,0,87,88,5,108,0,0,88,89,5,105,0,0,89,90,5,109,
        0,0,90,91,5,105,0,0,91,92,5,116,0,0,92,93,5,101,0,0,93,94,5,114,
        0,0,94,95,5,115,0,0,95,16,1,0,0,0,96,97,5,64,0,0,97,18,1,0,0,0,98,
        99,5,40,0,0,99,20,1,0,0,0,100,101,5,41,0,0,101,22,1,0,0,0,102,103,
        5,58,0,0,103,104,5,58,0,0,104,105,5,61,0,0,105,24,1,0,0,0,106,107,
        5,61,0,0,107,26,1,0,0,0,108,109,5,100,0,0,109,110,5,101,0,0,110,
        111,5,102,0,0,111,112,5,97,0,0,112,113,5,117,0,0,113,114,5,108,0,
        0,114,115,5,116,0,0,115,28,1,0,0,0,116,117,5,116,0,0,117,118,5,114,
        0,0,118,119,5,117,0,0,119,120,5,101,0,0,120,30,1,0,0,0,121,122,5,
        102,0,0,122,123,5,97,0,0,123,124,5,108,0,0,124,125,5,115,0,0,125,
        126,5,101,0,0,126,32,1,0,0,0,127,128,5,91,0,0,128,34,1,0,0,0,129,
        130,5,93,0,0,130,36,1,0,0,0,131,135,7,0,0,0,132,134,7,1,0,0,133,
        132,1,0,0,0,134,137,1,0,0,0,135,133,1,0,0,0,135,136,1,0,0,0,136,
        38,1,0,0,0,137,135,1,0,0,0,138,148,5,34,0,0,139,140,5,92,0,0,140,
        147,5,34,0,0,141,142,5,92,0,0,142,147,8,2,0,0,143,144,6,19,0,0,144,
        147,5,10,0,0,145,147,8,3,0,0,146,139,1,0,0,0,146,141,1,0,0,0,146,
        143,1,0,0,0,146,145,1,0,0,0,147,150,1,0,0,0,148,146,1,0,0,0,148,
        149,1,0,0,0,149,151,1,0,0,0,150,148,1,0,0,0,151,152,5,34,0,0,152,
        153,6,19,1,0,153,40,1,0,0,0,154,155,5,60,0,0,155,156,5,37,0,0,156,
        160,1,0,0,0,157,159,9,0,0,0,158,157,1,0,0,0,159,162,1,0,0,0,160,
        161,1,0,0,0,160,158,1,0,0,0,161,163,1,0,0,0,162,160,1,0,0,0,163,
        164,5,37,0,0,164,165,5,62,0,0,165,166,1,0,0,0,166,167,6,20,2,0,167,
        42,1,0,0,0,168,169,5,60,0,0,169,170,5,60,0,0,170,178,1,0,0,0,171,
        172,5,92,0,0,172,177,5,62,0,0,173,174,5,92,0,0,174,177,8,4,0,0,175,
        177,8,5,0,0,176,171,1,0,0,0,176,173,1,0,0,0,176,175,1,0,0,0,177,
        180,1,0,0,0,178,179,1,0,0,0,178,176,1,0,0,0,179,181,1,0,0,0,180,
        178,1,0,0,0,181,182,5,62,0,0,182,183,5,62,0,0,183,184,1,0,0,0,184,
        185,6,21,3,0,185,44,1,0,0,0,186,187,5,123,0,0,187,188,6,22,4,0,188,
        46,1,0,0,0,189,190,5,47,0,0,190,191,5,42,0,0,191,195,1,0,0,0,192,
        194,9,0,0,0,193,192,1,0,0,0,194,197,1,0,0,0,195,196,1,0,0,0,195,
        193,1,0,0,0,196,198,1,0,0,0,197,195,1,0,0,0,198,199,5,42,0,0,199,
        200,5,47,0,0,200,201,1,0,0,0,201,202,6,23,5,0,202,48,1,0,0,0,203,
        204,5,47,0,0,204,205,5,47,0,0,205,209,1,0,0,0,206,208,8,6,0,0,207,
        206,1,0,0,0,208,211,1,0,0,0,209,207,1,0,0,0,209,210,1,0,0,0,210,
        213,1,0,0,0,211,209,1,0,0,0,212,214,5,13,0,0,213,212,1,0,0,0,213,
        214,1,0,0,0,214,215,1,0,0,0,215,216,5,10,0,0,216,217,1,0,0,0,217,
        218,6,24,5,0,218,50,1,0,0,0,219,220,7,7,0,0,220,221,1,0,0,0,221,
        222,6,25,5,0,222,52,1,0,0,0,10,0,135,146,148,160,176,178,195,209,
        213,6,1,19,0,1,19,1,1,20,2,1,21,3,1,22,4,6,0,0
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!GroupLexer.__ATN) {
            GroupLexer.__ATN = new antlr.ATNDeserializer().deserialize(GroupLexer._serializedATN);
        }

        return GroupLexer.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(GroupLexer.literalNames, GroupLexer.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return GroupLexer.vocabulary;
    }

    private static readonly decisionsToDFA = GroupLexer._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}