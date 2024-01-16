/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/** Build an AST from a single StringTemplate template */
parser grammar STParser;

options {
    language = TypeScript;
    tokenVocab = STLexer;
}

tokens {
    EXPR,
    OPTIONS,
    PROP,
    PROP_IND,
    INCLUDE,
    INCLUDE_IND,
    EXEC_FUNC,
    INCLUDE_SUPER,
    INCLUDE_SUPER_REGION,
    INCLUDE_REGION,
    TO_STR,
    LIST,
    MAP,
    ZIP,
    SUBTEMPLATE,
    ARGS,
    ELEMENTS,
    REGION,
    NULL,
    INDENTED_EXPR
}

@header {
// cspell: disable

import { ErrorManager } from "../../misc/ErrorManager.js";
import { STLexer } from "../STLexer.js";
import { Compiler } from "../Compiler.js";
import { Interpreter } from "../../Interpreter.js";
import { ErrorType } from "../../misc/ErrorType.js";
}

@members {
private errMgr!: ErrorManager;
private templateToken?: Token;

public static create(input: antlr.TokenStream, errMgr: ErrorManager, templateToken?: antlr.Token): STParser {
    const result = new STParser(input);
    result.errMgr = errMgr;
    result.templateToken = templateToken;

    return result;
}
}

templateAndEOF:
    template EOF
;

template:
    element*
;

element:
    {this.inputStream.LT(1)!.column === 0}? INDENT? COMMENT NEWLINE
    | INDENT? singleElement
    | compoundElement
;

singleElement:
    exprTag
    | TEXT
    | NEWLINE
    | COMMENT
;

compoundElement:
    ifstat
    | region
;

exprTag:
    LDELIM expr (';' exprOptions)? RDELIM
;

region:
    indent = INDENT? x = LDELIM '@' ID RDELIM {if (this.inputStream.LA(1) === STLexer.NEWLINE) localContext._indent = undefined;} template INDENT?
        LDELIM '@end' RDELIM

    // kill \n for <@end> on line by itself if multi-line embedded region
    {if (localContext?.start!.line != this.inputStream.LT(1)!.line && this.inputStream.LA(1) === STLexer.NEWLINE) {
        this.inputStream.consume()
    }}
;

subtemplate:
    lc = '{' (ids += ID ( ',' ids += ID)* '|')? template INDENT? '}'
;

ifstat:
    indent = INDENT? LDELIM 'if' '(' c1 = conditional ')' RDELIM {if (this.inputStream.LA(1) === STLexer.NEWLINE) localContext._indent = undefined;}
        t1 = template (INDENT? LDELIM 'elseif' '(' c2 += conditional ')' RDELIM t2 += template)* (
        INDENT? LDELIM 'else' RDELIM t3 = template
    )? INDENT? endif = LDELIM 'endif' RDELIM

    // kill \n for <endif> on line by itself if multi-line IF
    {if (localContext?.start!.line != this.inputStream.LT(1)!.line && this.inputStream.LA(1) === STLexer.NEWLINE) {
        this.inputStream.consume()
    }}
;

conditional:
    andConditional ('||' andConditional)*
;

andConditional:
    notConditional ('&&' notConditional)*
;

notConditional:
    '!'* memberExpr
;

notConditionalExpr:
    ID (p = '.' prop = ID | p = '.' '(' mapExpr ')')*
;

exprOptions:
    option (',' option)*
;

option
    @init {
	const id = this.inputStream.LT(1)!.text!;
	const defVal = Compiler.defaultOptionValues.get(id);
	const validOption = Interpreter.supportedOptions.get(id) != null;
}:
    ID {
		if (!validOption) {
            this.errMgr.compileTimeError(ErrorType.NO_SUCH_OPTION, this.templateToken, $ID, $ID.text);
		}
		} (
        '=' exprNoComma
        | {
			if (defVal == null) {
				this.errMgr.compileTimeError(ErrorType.NO_DEFAULT_VALUE, this.templateToken, $ID);
			}
		}
    )
;

exprNoComma:
    memberExpr (':' mapTemplateRef |)
;

expr:
    mapExpr
;

// more complicated than necessary to avoid backtracking, which ruins
// error handling

mapExpr:
    memberExpr ((c = ',' memberExpr)+ col = ':' mapTemplateRef |) (
        {$x.splice(0);} // don't keep queueing x; new list for each iteration
        col = ':' x += mapTemplateRef (
            // In the origional grammar this part used a syntactic predicate to stop parsing if we already saw a comma.
            ',' x += mapTemplateRef
        )*
    )*
;

/**
expr:template(args)  apply template to expr
expr:{arg | ...}     apply subtemplate to expr
expr:(e)(args)       convert e to a string template name and apply to expr
*/

mapTemplateRef:
    qualifiedId '(' args ')'
    | subtemplate
    | lp = '(' mapExpr rp = ')' '(' argExprList? ')'
;

memberExpr:
    (includeExpr) (p = '.' ID | p = '.' '(' mapExpr ')')*
;

includeExpr:
    {Compiler.funcs.has(this.inputStream.LT(1)!.text ?? "")}? // predefined function
    ID '(' expr? ')'
    | 'super' '.' ID '(' args ')'
    | qualifiedId '(' args ')'
    | '@' 'super' '.' ID '(' rp = ')'
    | '@' ID '(' rp = ')'
    | primary
;

primary:
    ID
    | STRING
    | TRUE
    | FALSE
    | subtemplate
    | list
    | lp = '(' expr ')' ( '(' argExprList? ')' |)
    | '(' conditional ')'
;

qualifiedId: (ID | '/' ID) ('/' r = ID)*
;

args:
    argExprList
    | namedArg ( ',' namedArg)* (',' '...')?
    | '...'
    |
;

argExprList:
    arg (',' arg)*
;

arg:
    exprNoComma
;

namedArg:
    ID '=' arg
;

list:
    {this.inputStream.LA(2) == STLexer.RBRACK}? // hush warning; [] special case
    lb = '[' ']'
    | lb = '[' listElement (',' listElement)* ']'
;

listElement:
    exprNoComma
    |
;
