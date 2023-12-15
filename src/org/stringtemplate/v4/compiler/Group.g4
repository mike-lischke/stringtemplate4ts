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
public currentGroup: STGroup;

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

public addArgument(args: FormalArgument[] , t: Token, defaultValueToken?: Token | null): void {
    const name = t.text!;
    for (const arg of args) {
        if (arg.name === name) {
            this.currentGroup.errMgr.compileTimeError(ErrorType.PARAMETER_REDEFINITION, null, t, name);

            return;
        }
    }

    args.push(new FormalArgument(name, defaultValueToken));
}
}

@lexer::members {
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
}

group[aGroup: STGroup, prefix: string]
    @init {
const lexer = this.inputStream.getTokenSource() as GroupLexer;
this.currentGroup = lexer.currentGroup = $aGroup;
}:
    oldStyleHeader? delimiters? (
        'import' STRING {this.currentGroup.importTemplates($STRING);}
        | 'import' // common error: name not in string
        {
const e = new antlr.NoViableAltException(this, this.inputStream);
this.errorHandler.reportError(this, e);
        } ID ('.' ID)* // might be a.b.c.d
    )* def[prefix]* EOF
;

oldStyleHeader: // ignore but lets us use this parser in AW for both v3 and v4
    'group' ID (':' ID)? ('implements' ID (',' ID)*)? ';'
;

groupName
    returns[name: string]
    @init {
let buf = "";
}:
    a = ID {buf += $a.text;} ('.' a = ID {buf += $a.text;})*
;

delimiters:
    'delimiters' a = STRING ',' b = STRING {
        let supported = true;
        const startCharacter = $a.text.charAt(1);
        if (STGroup.isReservedCharacter(startCharacter)) {
            this.currentGroup.errMgr.compileTimeError(ErrorType.UNSUPPORTED_DELIMITER, null, $a, startCharacter);
            supported = false;
        }

        const stopCharacter = $b.text.charAt(1);
        if (STGroup.isReservedCharacter(stopCharacter)) {
            this.currentGroup.errMgr.compileTimeError(ErrorType.UNSUPPORTED_DELIMITER, null, $b, stopCharacter);
            supported = false;
        }

        if (supported) {
            this.currentGroup.delimiterStartChar=$a.text.charAt(1);
            this.currentGroup.delimiterStopChar=$b.text.charAt(1);
        }
    }
;

/**
 * Match template and dictionary defs outside of (...)+ loop in this.currentGroup.
 * The key is catching while still in the loop; must keep prediction of
 * elements separate from "stay in loop" prediction.
 */
def[prefix: string]:
    templateDef[prefix]
    | dictDef
;
catch[re] {
// pretend we already saw an error here
// this.state.lastErrorIndex = this.inputStream.index;
this.error("garbled template definition starting at '" + this.inputStream.LT(1)!.text + "'");
}

templateDef[prefix: string]
    @init {
    let template = "";
    let n = 0; // num char to strip from left, right of template def
}:
    ('@' enclosing = ID '.' name = ID '(' ')' | name = ID '(' formalArgs ')') '::=' {const templateToken = this.inputStream.LT(1)!;
        } (
        STRING {template = $STRING.text; n=1;}
        | BIGSTRING {template = $BIGSTRING.text; n=2;}
        | BIGSTRING_NO_NL {template = $BIGSTRING_NO_NL.text; n=2;}
        | {
template = "";
const msg = "missing template at '" + this.inputStream.LT(1)!.text + "'";
const e = new antlr.NoViableAltException(this, this.inputStream);
this.currentGroup.errMgr.groupSyntaxError(ErrorType.SYNTAX_ERROR, this.getSourceName(), e, msg);
}
    ) {
if ($name.index >= 0) { // if ID missing
    template = Misc.strip(template, n);
    let templateName = $name.text;
    if (prefix.length > 0 ) {
        templateName = prefix+$name.text;
    }

    let enclosingTemplateName = $enclosing.text;
    if (enclosingTemplateName != null && enclosingTemplateName.length > 0 && prefix.length > 0) {
        enclosingTemplateName = prefix + enclosingTemplateName;
    }

    // @ts-ignore, because ANTLR4 doesn't allow a non-null assertion with attribute references.
    const formalArgs = $formalArgs.args;
    this.currentGroup.defineTemplateOrRegion(templateName, enclosingTemplateName, templateToken,
                                    template, $name, formalArgs);
}
}
    | alias = ID '::=' target = ID {this.currentGroup.defineTemplateAlias($alias, $target);}
;

formalArgs
    returns[args: FormalArgument[] = []]
    locals[hasOptionalParameter: boolean;]
    @init { $formalArgs::hasOptionalParameter = false; }:
    formalArg[$args] (',' formalArg[$args])*
    |
;

formalArg[args: FormalArgument[]]:
    ID (
        '=' a = (STRING | ANONYMOUS_TEMPLATE | 'true' | 'false') {$formalArgs::hasOptionalParameter = true;}
        | '=' a = '[' ']' {$formalArgs::hasOptionalParameter = true;}
        | {
    if ($formalArgs::hasOptionalParameter) {
        this.currentGroup.errMgr.compileTimeError(ErrorType.REQUIRED_PARAMETER_AFTER_OPTIONAL, null, $ID);
    }
}
    ) {this.addArgument($args, $ID, $a);}
;

dictDef:
    ID '::=' dict {
if ( this.currentGroup.rawGetDictionary($ID.text)!=null ) {
    this.currentGroup.errMgr.compileTimeError(ErrorType.MAP_REDEFINITION, null, $ID);
} else if ( this.currentGroup.rawGetTemplate($ID.text)!=null ) {
    this.currentGroup.errMgr.compileTimeError(ErrorType.TEMPLATE_REDEFINITION_AS_MAP, null, $ID);
} else {
    this.currentGroup.defineDictionary($ID.text, $dict.mapping);
}
}
;

dict
    returns[mapping: Map<string, unknown>]
    @init {const mapping = new Map<string, unknown>();}:
    '[' dictPairs[mapping] ']'
;

dictPairs[mapping: Map<string, unknown>]:
    keyValuePair[mapping] (',' keyValuePair[mapping])* (
        ',' defaultValuePair[mapping]
    )?
    | defaultValuePair[mapping]
;
catch[re] {
    this.error("missing dictionary entry at '" + this.inputStream.LT(1)!.text + "'");

}

defaultValuePair[mapping: Map<string, unknown>]:
    'default' ':' keyValue {mapping.set(STGroup.DEFAULT_KEY, $keyValue.value);}
;

keyValuePair[Map<string, unknown> mapping]:
    STRING ':' keyValue {mapping.set(Misc.replaceEscapes(Misc.strip($STRING.text, 1)), $keyValue.value);}
;

keyValue
    returns[value: unknown]:
    BIGSTRING {$value = this.currentGroup.createSingleton($BIGSTRING);}
    | BIGSTRING_NO_NL {$value = this.currentGroup.createSingleton($BIGSTRING_NO_NL);}
    | ANONYMOUS_TEMPLATE {$value = this.currentGroup.createSingleton($ANONYMOUS_TEMPLATE);}
    | STRING {$value = Misc.replaceEscapes(Misc.strip($STRING.text, 1));}
    | TRUE {$value = true;}
    | FALSE {$value = false;}
    | '[' ']' {$value = [];}
    | ID {$value = STGroup.DICT_KEY;}
;
catch[re] {
this.error("missing value for key at '" + this.inputStream.LT(1)!.text + "'");
}

// $antlr-format reset
// $antlr-format alignTrailingComments on, columnLimit 150, maxEmptyLinesToKeep 1, reflowComments off, useTab off
// $antlr-format allowShortRulesOnASingleLine on, alignSemicolons ownLine

TRUE: 'true';
FALSE: 'false';
LBRACK: '[';
RBRACK: ']';

ID: ('a' ..'z' | 'A' ..'Z' | '_') ( 'a' ..'z' | 'A' ..'Z' | '0' ..'9' | '-' | '_')*;

STRING:
    '"' (
        '\\' '"'
        | '\\' ~'"'
        | {
const msg = "\\n in string";
const e = new antlr.LexerNoViableAltException(this, this.inputStream, 0, new antlr.ATNConfigSet());
this.currentGroup.errMgr.groupLexerError(ErrorType.SYNTAX_ERROR, this.getSourceName(), e, msg);
} '\n'
        | ~('\\' | '"' | '\n')
    )* '"' {
this.text = this.text.replace(/\\\\\"/g,"\"");
    }
;

BIGSTRING_NO_NL: // same as BIGSTRING but means ignore newlines later
    '<%' .*? '%>'
    // %\> is the escape to avoid end of string
    { this.text = this.text.replace(/\%\\\\>/g,"\%>"); }
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
        const e = new antlr.LexerNoViableAltException(this, this.inputStream, 0, new antlr.ATNConfigSet());
        const msg = "missing final '}' in {...} anonymous template";
        this.currentGroup.errMgr.groupLexerError(ErrorType.SYNTAX_ERROR, this.getSourceName(), e, msg);

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
