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
private templateToken!: Token;

public static create(input: antlr.TokenStream, errMgr: ErrorManager, templateToken: antlr.Token): STParser {
    const result = new STParser(input);
    result.errMgr = errMgr;
    result.templateToken = templateToken;

    return result;
}

/*
protected recoverFromMismatchedToken(input: antlr.IntStream, ttype: number, follow: antlr.BitSet): void {
	throw new antlr.NoViableAltException(this, input);
} */
}

@rulecatch {
   catch (re) { throw re; }
}

templateAndEOF:
    template EOF
;

template:
    element*
;

element:
    {this.inputStream.LT(1)!.column === 0}? INDENT? COMMENT NEWLINE /*-> // throw away */
    | INDENT singleElement /*-> ^(INDENTED_EXPR INDENT singleElement? )    // singleElement is optional to handle error returning nil*/
    | singleElement
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
    LDELIM expr (';' exprOptions)? RDELIM /*-> ^(EXPR[$LDELIM,"EXPR"] expr exprOptions? )*/
;

region
    @init {let indent: Token | null | undefined;}:
    i = INDENT? x = LDELIM '@' ID RDELIM {if (this.inputStream.LA(1) != STLexer.NEWLINE) indent=$i;} template INDENT? LDELIM '@end' RDELIM
    // kill \n for <@end> on line by itself if multi-line embedded region
    /*({$region.start.getLine()!=input.LT(1).getLine()}? => NEWLINE)? -> {indent!=null}? ^(INDENTED_EXPR $i ^(REGION[$x] ID template? )) -> ^(REGION[$x]
        ID template? )*/
;

subtemplate:
    lc = '{' (ids += ID ( ',' ids += ID)* '|')? template INDENT? '}'
    // ignore final INDENT before } as it's not part of outer indent
    /*-> ^(SUBTEMPLATE[$lc,"SUBTEMPLATE"] ^(ARGS $ids)* template? )*/
;

ifstat
    @init {let indent: Token | null | undefined;}:
    i = INDENT? LDELIM 'if' '(' c1 = conditional ')' RDELIM {if (this.inputStream.LA(1) != STLexer.NEWLINE) indent=$i;} t1 = template (
        INDENT? LDELIM 'elseif' '(' c2 += conditional ')' RDELIM t2 += template
    )* (INDENT? LDELIM 'else' RDELIM t3 = template)? INDENT? endif = LDELIM 'endif' RDELIM
    // kill \n for <endif> on line by itself if multi-line IF
    /*({$ifstat.start.getLine()!=input.LT(1).getLine()}? => NEWLINE)? -> {indent!=null}? ^(INDENTED_EXPR $i ^('if' $c1 $t1? ^('elseif' $c2 $t2)* ^(
        'else' $t3? )? )) -> ^('if' $c1 $t1? ^('elseif' $c2 $t2)* ^('else' $t3? )? )*/
;

conditional:
    andConditional ('||' /* ^ */ andConditional)*
;

andConditional:
    notConditional ('&&' /* ^ */ notConditional)*
;

notConditional:
    '!' /* ^ */ notConditional
    | memberExpr
;

notConditionalExpr:
    ID (
        p = '.' prop = ID /*-> ^(PROP[$p,"PROP"] $notConditionalExpr $prop)*/
        | p = '.' '(' mapExpr ')' /*-> ^(PROP_IND[$p,"PROP_IND"] $notConditionalExpr mapExpr)  */
    )*
;

exprOptions:
    option (',' option)* /* -> ^(OPTIONS option* ) */
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
        '=' exprNoComma /* -> {validOption}? ^('=' ID exprNoComma) -> */
        | {
			if (defVal == null) {
				this.errMgr.compileTimeError(ErrorType.NO_DEFAULT_VALUE, this.templateToken, $ID);
			}
		} /* -> {validOption&&defVal!=null}? ^(EQUALS["="] ID STRING[$ID,'"'+defVal+'"']) ->  */
    )
;

exprNoComma:
    memberExpr (':' mapTemplateRef /*-> ^(MAP memberExpr mapTemplateRef) */ | /* -> memberExpr */)
;

expr:
    mapExpr
;

// more complicated than necessary to avoid backtracking, which ruins
// error handling

mapExpr:
    memberExpr (
        (c = ',' memberExpr)+ col = ':' mapTemplateRef /* -> ^(ZIP[$col] ^(ELEMENTS memberExpr+ ) mapTemplateRef) */
        | /*-> memberExpr */
    ) (
        {if ($x!=null) $x.splice(0);} col = ':' x += mapTemplateRef (
            {$c === null}? ',' x += mapTemplateRef
        )* /*-> ^(MAP[$col] $mapExpr $x+ ) */
    )*
;

/**
expr:template(args)  apply template to expr
expr:{arg | ...}     apply subtemplate to expr
expr:(e)(args)       convert e to a string template name and apply to expr
*/

mapTemplateRef:
    qualifiedId '(' args ')' /* -> ^(INCLUDE qualifiedId args? ) */
    | subtemplate
    | lp = '(' mapExpr rp = ')' '(' argExprList? ')' /* -> ^(INCLUDE_IND mapExpr argExprList? ) */
;

memberExpr: (includeExpr /* -> includeExpr */) (
        p = '.' ID /* -> ^(PROP[$p,"PROP"] $memberExpr ID) */
        | p = '.' '(' mapExpr ')' /* -> ^(PROP_IND[$p,"PROP_IND"] $ memberExpr mapExpr) */
    )*
;

includeExpr:                                                  // prevent full LL(*), which fails, falling back on k=1; need k=2
    {Compiler.funcs.has(this.inputStream.LT(1)!.text ?? "")}? // predefined function
    ID '(' expr? ')' /* -> ^(EXEC_FUNC ID expr? ) */
    | 'super' '.' ID '(' args ')' /* -> ^(INCLUDE_SUPER ID args? ) */
    | qualifiedId '(' args ')' /* -> ^(INCLUDE qualifiedId args? ) */
    | '@' 'super' '.' ID '(' rp = ')' /* -> ^(INCLUDE_SUPER_REGION ID) */
    | '@' ID '(' rp = ')' /* -> ^(INCLUDE_REGION ID) */
    | primary
;

primary:
    ID
    | STRING
    | TRUE
    | FALSE
    | subtemplate
    | list
    | /* {$conditional.size()>0}? */ '(' /* ! */ conditional ')' /* ! */
    | /* {$conditional.size()==0}? */ lp = '(' expr ')' (
        '(' argExprList? ')' /* -> ^(INCLUDE_IND[$lp] expr argExprList? ) */
        | /* -> ^(TO_STR[$lp] expr) */
    )
;

qualifiedId: (ID /* -> ID */ | '/' ID /* -> ^('/' ID) */) (
        '/' r = ID /* -> ^('/' $qualifiedId $r) */
    )*
;

args:
    argExprList
    | namedArg ( ',' namedArg)* (',' '...')? /* -> namedArg+ '...'? */
    | '...'
    |
;

argExprList:
    arg (',' arg)* /* -> arg+ */
;

arg:
    exprNoComma
;

namedArg:
    ID '=' arg /* -> ^('=' ID arg) */
;

list:
    {this.inputStream.LA(2) == STLexer.RBRACK}? // hush warning; [] special case
    lb = '[' ']' /* -> LIST[$lb] */
    | lb = '[' listElement (',' listElement)* ']' /* -> ^(LIST[$lb] listElement* ) */
;

listElement:
    exprNoComma
    | /* -> NULL */
;
