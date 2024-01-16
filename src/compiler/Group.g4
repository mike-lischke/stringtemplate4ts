/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

// $antlr-format alignTrailingComments on, columnLimit 130, minEmptyLines 1, maxEmptyLinesToKeep 1, reflowComments off
// $antlr-format useTab off, allowShortRulesOnASingleLine off, allowShortBlocksOnASingleLine on, alignSemicolons ownLine

grammar Group;

options {
    language = TypeScript;
}

@parser::header {
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
}

@lexer::header {
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
}

@parser::members {
public currentGroup!: STGroup;

public override getSourceName(): string {
    const fullFileName = super.getSourceName();
    return basename(fullFileName); // strip to simple name
}

public error(msg: string, re: antlr.RecognitionException): void {
    const token = re.offendingToken;
    this.currentGroup.errMgr.groupSyntaxError(ErrorType.SYNTAX_ERROR, this.getSourceName(), token?.line ?? 0,
        token?.column ?? 0, msg);
    this.errorHandler.recover(this, re);
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
}

@lexer::members {
public currentGroup!: STGroup;

public getSourceName(): string {
    const fullFileName = this.sourceName;
    return basename(fullFileName); // strip to simple name
}
}

group[aGroup: STGroup, prefix: string]
    @init {
const lexer = this.inputStream.getTokenSource() as GroupLexer;
this.currentGroup = lexer.currentGroup = $aGroup;
}:
    oldStyleHeader? delimiters? (
        IMPORT (
            STRING {this.currentGroup.importTemplates($STRING);}
            | // common error: name not in string
            {
const e = new antlr.InputMismatchException(this);
this.errorHandler.reportError(this, e);
} ID (DOT ID)* // might be a.b.c.d
        )
    )* def[prefix]* EOF
;

oldStyleHeader: // ignore but lets us use this parser in AW for both v3 and v4
    GROUP ID (COLON ID)? (IMPLEMENTS ID (COMMA ID)*)? SEMICOLON
;

groupName
    @init {let buf = "";}:
    a = ID {buf += $a.text;} (DOT a = ID {buf += $a.text;})*
;

delimiters:
    DELIMITERS a = STRING COMMA b = STRING {
        let supported = true;
        const textA = $a.text;
        const startCharacter = textA.length === 0 ? ">" : textA[1];
        if (STGroup.isReservedCharacter(startCharacter)) {
            this.currentGroup.errMgr.compileTimeError(ErrorType.UNSUPPORTED_DELIMITER, undefined, $a, startCharacter);
            supported = false;
        }

        const textB = $b.text;
        const stopCharacter = textB.length === 0 ? ">" : textB[1];
        if (STGroup.isReservedCharacter(stopCharacter)) {
            this.currentGroup.errMgr.compileTimeError(ErrorType.UNSUPPORTED_DELIMITER, undefined, $b, stopCharacter);
            supported = false;
        }

        if (supported) {
            this.currentGroup.delimiterStartChar = startCharacter;
            this.currentGroup.delimiterStopChar = stopCharacter;
        }
    }
;

/**
 * Match template and dictionary defs outside of (...)+ loop in group.
 * The key is catching while still in the loop; must keep prediction of
 * elements separate from "stay in loop" prediction.
 */
def[prefix: string]:
    templateDef[prefix]
    | dictDef
;
catch[re] {
if (re instanceof antlr.RecognitionException) {
    localContext.exception = re;
    if (!this.errorHandler.inErrorRecoveryMode(this)) {
        this.error("garbled template definition starting at '" + this.inputStream.LT(1)!.text + "'", re);
    }

    // Manually start error recovery mode (which is usually done by the original exception code).
    this.errorHandler.beginErrorCondition(this);
    this.errorHandler.recover(this, re);
} else {
    throw re;
}
}

templateDef[prefix: string]
    @init {
    let template = "";
    let n = 0; // num char to strip from left, right of template def
}:
    (
        AT enclosing = ID DOT name = ID LPAREN RPAREN
        | name = ID LPAREN formalArgs RPAREN
    ) ASSIGN {const templateToken = this.inputStream.LT(1)!;
        } (
        STRING {template = $STRING.text; n=1;}
        | BIGSTRING {template = $BIGSTRING.text; n=2;}
        | BIGSTRING_NO_NL {template = $BIGSTRING_NO_NL.text; n=2;}
        | {
template = "";
const msg = "missing template at '" + this.inputStream.LT(1)!.text + "'";
const e = new antlr.NoViableAltException(this, this.inputStream);
this.error(msg, e);
}
    ) {
if ($name.index >= 0) { // if ID missing
    template = Misc.strip(template, n);
    let templateName = $name.text;
    if (prefix.length > 0 ) {
        templateName = prefix + $name.text;
    }

    let enclosingTemplateName = $enclosing.text;
    if (enclosingTemplateName != null && enclosingTemplateName.length > 0 && prefix.length > 0) {
        enclosingTemplateName = prefix + enclosingTemplateName;
    }

    // @ts-ignore, because ANTLR4 doesn't allow a non-null assertion with attribute references.
    let formalArgs; try { formalArgs = $formalArgs.args; } catch { }
    this.currentGroup.defineTemplateOrRegion(templateName, enclosingTemplateName, templateToken,
        template, $name, formalArgs);
}
}
    | alias = ID ASSIGN target = ID {this.currentGroup.defineTemplateAlias($alias, $target);}
;

formalArgs
    returns[args: FormalArgument[] = []]
    locals[hasOptionalParameter: boolean = false]
    @init { $formalArgs::hasOptionalParameter = false; }:
    formalArg[$args] (COMMA formalArg[$args])*
    |
;

formalArg[args: FormalArgument[]]:
    ID (
        EQUAL a = (STRING | ANONYMOUS_TEMPLATE | TRUE | FALSE) {$formalArgs::hasOptionalParameter = true;}
        | EQUAL a = LBRACK RBRACK {$formalArgs::hasOptionalParameter = true;}
        | {
    if ($formalArgs::hasOptionalParameter) {
            this.currentGroup.errMgr.compileTimeError(ErrorType.REQUIRED_PARAMETER_AFTER_OPTIONAL, undefined, $ID);
    }
}
    ) {this.addArgument($args, $ID, $a ?? undefined);}
;

dictDef:
    ID ASSIGN dict {
if ( this.currentGroup.rawGetDictionary($ID.text)) {
    this.currentGroup.errMgr.compileTimeError(ErrorType.MAP_REDEFINITION, undefined, $ID);
} else if ( this.currentGroup.rawGetTemplate($ID.text)) {
    this.currentGroup.errMgr.compileTimeError(ErrorType.TEMPLATE_REDEFINITION_AS_MAP, undefined, $ID);
} else {
    this.currentGroup.defineDictionary($ID.text, $dict.mapping!);
}}
;

dict
    returns[mapping: Map<string, unknown> | undefined]
    @init {$mapping = new Map<string, unknown>();}:
    LBRACK dictPairs[$mapping] RBRACK
;

dictPairs[mapping: Map<string, unknown>]:
    (keyValuePair[mapping] COMMA?)+ (defaultValuePair[mapping] COMMA?)?
    | defaultValuePair[mapping] COMMA?
;
catch[re] {
    this.error("missing dictionary entry at '" + this.inputStream.LT(1)!.text + "'", re);

}

defaultValuePair[mapping: Map<string, unknown>]:
    DEFAULT COLON keyValue {mapping.set(STGroup.DEFAULT_KEY, $keyValue.value);}
;

keyValuePair[Map<string, unknown> mapping]:
    STRING COLON keyValue {
    // @ts-ignore, because ANTLR4 doesn't allow a non-null assertion with attribute references.
    let value; try { value = $keyValue.value; } catch { }
    mapping.set(Misc.replaceEscapes(Misc.strip($STRING.text, 1)), value);
}
;

keyValue
    returns[value: unknown]:
    BIGSTRING {$value = this.currentGroup.createSingleton($BIGSTRING);}
    | BIGSTRING_NO_NL {$value = this.currentGroup.createSingleton($BIGSTRING_NO_NL);}
    | ANONYMOUS_TEMPLATE {$value = this.currentGroup.createSingleton($ANONYMOUS_TEMPLATE);}
    | STRING {$value = Misc.replaceEscapes(Misc.strip($STRING.text, 1));}
    | TRUE {$value = true;}
    | FALSE {$value = false;}
    | LBRACK RBRACK {$value = [];}
    | {this.inputStream.LT(1)!.text === "key" }? ID {$value = STGroup.DICT_KEY;}
;

// $antlr-format reset
// $antlr-format alignTrailingComments on, columnLimit 150, maxEmptyLinesToKeep 1, reflowComments off, useTab off
// $antlr-format allowShortRulesOnASingleLine on, alignSemicolons ownLine

TRUE: 'true';
FALSE: 'false';
LBRACK: '[';
RBRACK: ']';
AT: '@';
DOT: '.';
COLON: ':';
SEMICOLON: ';';
COMMA: ',';
LPAREN: '(';
RPAREN: ')';
ASSIGN: '::=';
EQUAL: '=';

IMPORT: 'import';
GROUP: 'group';
IMPLEMENTS: 'implements';
DELIMITERS: 'delimiters';
DEFAULT: 'default';

ID: ('a' ..'z' | 'A' ..'Z' | '_') ( 'a' ..'z' | 'A' ..'Z' | '0' ..'9' | '-' | '_')*;

STRING:
    '"' (
        '\\' '"'
        | '\\' ~'"'
        | {
const msg = "\\n in string";
this.currentGroup.errMgr.groupLexerError(ErrorType.SYNTAX_ERROR, this.getSourceName(), this.line, this.column, msg);
} '\n'
        | ~('\\' | '"' | '\n')
    )* '"' {
this.text = this.text.replace(/\\\"/g,"\"");
    }
;

BIGSTRING_NO_NL: // same as BIGSTRING but means ignore newlines later
    '<%' .*? '%>'
    // %\> is the escape to avoid end of string
    { this.text = this.text.replace(/%\\>/g,"\%>"); }
;

/** Match <<...>> but also allow <<..<x>>> so we can have tag on end.
    Escapes: >\> means >> inside of <<...>>.
    Escapes: \>> means >> inside of <<...>> unless at end like <<...\>>>>.
    In that case, use <%..>>%> instead.
 */
BIGSTRING:
    '<<' (
        '\\' '>'    // \> escape
        | '\\' ~'>' // allow this but don't collapse in action
        | ~'\\'
    )*? '>>'
    // replace \> with > unless <\\>
    { this.text = Misc.replaceEscapedRightAngle(this.text); }
;

ANONYMOUS_TEMPLATE:
    '{' {
const templateToken = new antlr.CommonToken([this, this.inputStream], GroupLexer.ANONYMOUS_TEMPLATE, 0, this.getCharIndex(), this.getCharIndex());
const lexer = new STLexer(this.currentGroup.errMgr, this.inputStream, templateToken, this.currentGroup.delimiterStartChar, this.currentGroup.delimiterStopChar);
lexer.subtemplateDepth = 1;
let t = lexer.nextToken();
while (lexer.subtemplateDepth >= 1 || t.type !== STLexer.RCURLY) {
    if (t.type === Token.EOF) {
        const msg = "missing final '}' in {...} anonymous template";
        this.currentGroup.errMgr.groupLexerError(ErrorType.SYNTAX_ERROR, this.getSourceName(), t.line, t.column, msg);

        break;
    }
    t = lexer.nextToken();
}
    }
    // don't match '}' here; our little {...} scanner loop matches it
    // to terminate.
;

COMMENT: '/*' .*? '*/' -> skip;

LINE_COMMENT: '//' ~('\n' | '\r')* '\r'? '\n' -> skip;

WS: (' ' | '\r' | '\t' | '\n') -> skip;
