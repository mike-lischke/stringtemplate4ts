/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-returns, jsdoc/require-param */

import {
    BaseErrorListener, CharStream, CommonTokenStream, NoViableAltException, RecognitionException, Token, TokenStream,
} from "antlr4ng";

import { STLexer } from "./STLexer.js";
import { STException } from "./STException.js";
import { CompiledST } from "./CompiledST.js";
import { Bytecode } from "./Bytecode.js";
import { STGroup } from "../STGroup.js";
import { ErrorType } from "../misc/ErrorType.js";
import { GroupParser } from "./generated/GroupParser.js";
import { STParser } from "./generated/STParser.js";
import { CodeGenerator } from "./CodeGenerator.js";
import { ICompilerParameters, RegionType } from "./common.js";

/** A compiler for a single template. */
export class Compiler {
    public static readonly SUBTEMPLATE_PREFIX = "_sub";
    public static readonly TEMPLATE_INITIAL_CODE_SIZE = 15;

    public static readonly defaultOptionValues = new Map<string, string>([
        ["anchor", "true"],
        ["wrap", "\n"],
    ]);

    public static funcs = new Map<string, number>([
        ["first", Bytecode.INSTR_FIRST],
        ["last", Bytecode.INSTR_LAST],
        ["rest", Bytecode.INSTR_REST],
        ["trunc", Bytecode.INSTR_TRUNC],
        ["strip", Bytecode.INSTR_STRIP],
        ["trim", Bytecode.INSTR_TRIM],
        ["length", Bytecode.INSTR_LENGTH],
        ["strlen", Bytecode.INSTR_STRLEN],
        ["reverse", Bytecode.INSTR_REVERSE],

    ]);

    /** Name sub templates {@code _sub1}, {@code _sub2}, ... */
    public static subtemplateCount = 0;

    public group: STGroup;

    public constructor(group?: STGroup) {
        this.group = group ?? STGroup.defaultGroup;
    }

    public static defineBlankRegion(outermostImpl: CompiledST, nameToken?: Token): CompiledST {
        const outermostTemplateName = outermostImpl.name!;
        const mangled = STGroup.getMangledRegionName(outermostTemplateName, nameToken?.text ?? "");

        const blank = new CompiledST();
        blank.isRegion = true;
        blank.templateDefStartToken = nameToken;
        blank.regionDefType = RegionType.IMPLICIT;
        blank.name = mangled;
        outermostImpl.addImplicitlyDefinedTemplate(blank);

        return blank;
    }

    public static getNewSubtemplateName(): string {
        const count = ++Compiler.subtemplateCount;

        return Compiler.SUBTEMPLATE_PREFIX + count;
    }

    /** Compile full template with known or unknown formal arguments. */
    public compile(values: ICompilerParameters): CompiledST | undefined {
        const is = CharStream.fromString(values.template);
        is.name = values.srcName ?? values.name ?? "";

        let lexer: STLexer;
        if (values.templateToken?.type === GroupParser.BIGSTRING_NO_NL) {
            lexer = new class extends STLexer {
                /** Throw out \n and indentation tokens inside BIGSTRING_NO_NL */
                public override nextToken(): Token {
                    let t = super.nextToken();
                    while (t.type === STLexer.NEWLINE || t.type === STLexer.INDENT) {
                        t = super.nextToken();
                    }

                    return t;
                }
            }(this.group.errMgr, is, values.templateToken, this.group.delimiterStartChar, this.group.delimiterStopChar);
        } else {
            lexer = new STLexer(this.group.errMgr, is, values.templateToken,
                this.group.delimiterStartChar, this.group.delimiterStopChar);
        }

        const tokens = new CommonTokenStream(lexer);
        const p = STParser.create(tokens, this.group.errMgr, values.templateToken);
        p.removeErrorListeners();

        // Redirection of syntax errors to STException
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const host = this;
        p.addErrorListener(
            new class extends BaseErrorListener {
                public override syntaxError(_recognizer: unknown,
                    offendingSymbol: Token | null, line: number, column: number, msg: string,
                    e: RecognitionException | null): void {
                    host.reportMessageAndThrowSTException(tokens, values.templateToken, offendingSymbol, e, msg);
                }
            }(),
        );

        let r;
        try {
            r = p.templateAndEOF();
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.reportMessageAndThrowSTException(tokens, values.templateToken, null, re, re.message);
            } else {
                throw re;
            }
        }

        //console.log(r.toStringTree(p.ruleNames, p));
        if (p.numberOfSyntaxErrors > 0) {
            const impl = new CompiledST();
            impl.defineFormalArgs(values.args);

            return impl;
        }

        const gen = new CodeGenerator(tokens, this.group.errMgr, values.name, values.template, values.templateToken);

        let impl;
        try {
            impl = gen.template(r.template(), values.name, values.args);
            impl.nativeGroup = this.group;
            impl.template = values.template;

            impl.tree = r;
            impl.tokens = tokens;
        } catch (re) {
            if (re instanceof RecognitionException) {
                this.group.errMgr.internalError(undefined, "bad tree structure", re);
            } else {
                throw re;
            }
        }

        if (!values.args && impl) {
            impl.hasFormalArgs = false;
        }

        return impl;
    }

    protected reportMessageAndThrowSTException(tokens: TokenStream, templateToken: Token | undefined,
        offendingToken: Token | null, re: RecognitionException | null, message: string): never {
        offendingToken ??= re?.offendingToken ?? null;
        if (offendingToken?.type === Token.EOF) {
            const msg = "premature EOF";
            this.group.errMgr.compileTimeError(ErrorType.SYNTAX_ERROR, templateToken, offendingToken, msg);
        } else {
            if (re instanceof NoViableAltException) {
                const msg = "'" + re.offendingToken?.text + "' came as a complete surprise to me";
                this.group.errMgr.compileTimeError(ErrorType.SYNTAX_ERROR, templateToken,
                    re.offendingToken ?? undefined, msg);
            } else {
                if (tokens.index === 0) { // couldn't parse anything
                    const msg = "this doesn't look like a template";
                    this.group.errMgr.compileTimeError(ErrorType.SYNTAX_ERROR, templateToken,
                        offendingToken ?? undefined, msg);
                } else {
                    if (tokens.LA(1) === STLexer.LDELIM) { // couldn't parse expr
                        const msg = "doesn't look like an expression";
                        this.group.errMgr.compileTimeError(ErrorType.SYNTAX_ERROR, templateToken,
                            offendingToken ?? undefined, msg);
                    } else {
                        this.group.errMgr.compileTimeError(ErrorType.SYNTAX_ERROR, templateToken,
                            offendingToken ?? undefined, message);
                    }
                }

            }

        }

        throw new STException(); // we have reported the error, so just blast out
    }
}
