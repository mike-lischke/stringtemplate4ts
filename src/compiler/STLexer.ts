/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-param */

import {
    ATNConfigSet, CharStream, CommonToken, CommonTokenFactory, Lexer, LexerNoViableAltException, Token, TokenFactory,
    TokenSource,
} from "antlr4ng";

import { STGroup } from "../STGroup.js";
import { Misc } from "../misc/Misc.js";
import { ErrorManager } from "../misc/ErrorManager.js";
import { STParser } from "./generated/STParser.js";

/**
 * This class represents the tokenizer for templates. It operates in two modes:
 * inside and outside of expressions. It implements the {@link TokenSource}
 * interface so it can be used with ANTLR parsers. Outside of expressions, we
 * can return these token types: {@link #TEXT}, {@link #INDENT}, {@link #LDELIM}
 * (start of expression), {@link #RCURLY} (end of subtemplate), and
 * {@link #NEWLINE}. Inside of an expression, this lexer returns all of the
 * tokens needed by {@link STParser}. From the parser's point of view, it can
 * treat a template as a simple stream of elements.
 * <p>
 * This class defines the token types and communicates these values to
 * {@code STParser.g} via {@code STLexer.tokens} file (which must remain
 * consistent).</p>
 */
export class STLexer implements TokenSource {
    /**
     * We build {@code STToken} tokens instead of relying on {@link CommonToken}
     *  so we can override {@link #toString()}. It just converts token types to
     *  token names like 23 to {@code "LDELIM"}.
     */
    public static STToken = class STToken extends CommonToken {
        public constructor(type: number, text: string);
        public constructor(tokenSource: TokenSource, input: CharStream, type: number, start: number, stop: number);
        public constructor(...args: unknown[]) {
            switch (args.length) {
                case 2: {
                    const [type, text] = args as [number, string];

                    super([null, null], type, Token.DEFAULT_CHANNEL, -1, -1);
                    this.text = text;

                    break;
                }

                case 5: {
                    const [source, input, type, start, stop]
                        = args as [TokenSource, CharStream, number, number, number];

                    super([source, input], type, Token.DEFAULT_CHANNEL, start, stop);

                    break;
                }

                default: {
                    throw new Error("Invalid number of arguments");
                }
            }
        }

        public override toString(): string {
            let channelStr = "";
            if (this.channel > 0) {
                channelStr = ",channel=" + this.channel;
            }

            let txt = this.text;
            if (txt !== null) {
                txt = Misc.replaceEscapes(txt);
            } else {
                txt = "<no text>";
            }

            let tokenName: string;
            if (this.type === Token.EOF) {
                tokenName = "EOF";
            } else {
                tokenName = STParser.symbolicNames[this.type] ?? "Unknown";
            }

            return "[@" + this.tokenIndex + "," + this.start + ":" + this.stop + "='" + txt + "',<" + tokenName + ">"
                + channelStr + "," + this.line + ":" + this.column + "]";
        }
    };

    public static readonly SKIP = new STLexer.STToken(-1, "<skip>");

    // must follow STLexer.tokens file that STParser.g4 loads
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
    public static readonly REGION_END = 34;
    public static readonly TRUE = 35;
    public static readonly FALSE = 36;
    public static readonly COMMENT = 37;
    public static readonly SLASH = 38;

    /**
     * To be able to properly track the inside/outside mode, we need to
     *  track how deeply nested we are in some templates. Otherwise, we
     *  know whether a <code>'}'</code> and the outermost subtemplate to send this
     *  back to outside mode.
     */
    public subtemplateDepth = 0;

    // Line of the current token.
    public line = 1;

    // Column of the current token.
    public _tokenStartColumn = 0;

    public sourceName = "";

    // Not used yet.
    public tokenFactory: TokenFactory<Token> = CommonTokenFactory.DEFAULT;

    public inputStream: CharStream;

    /** The char which delimits the start of an expression. */
    protected delimiterStartChar = "<".codePointAt(0)!;

    /** The char which delimits the end of an expression. */
    protected delimiterStopChar = ">".codePointAt(0)!;

    /**
     * This keeps track of the current mode of the lexer. Are we inside or
     * outside an ST expression?
     */
    protected scanningInsideExpr = false; // start out *not* in a {...} subtemplate

    protected errMgr: ErrorManager;

    /** template embedded in a group file? this is the template */
    protected templateToken: Token | null;

    /** current character */
    protected c: number;

    /**
     * When we started token, track initial coordinates so we can properly
     * build token objects.
     */
    protected startCharIndex = -1;

    /**
     * Our lexer routines might have to emit more than a single token. We
     *  buffer everything through this list.
     */
    protected tokens = new Array<Token>();

    // Updated column while consuming input.
    #currentColumn = 0;

    // Updated line while consuming input.
    #currentLine = 1;

    #currentIndex = 0;

    public constructor(inputOrErrMgr: ErrorManager | CharStream, input?: CharStream, templateToken?: Token,
        delimiterStartChar?: string, delimiterStopChar?: string) {
        this.inputStream = inputOrErrMgr instanceof ErrorManager ? input! : inputOrErrMgr;
        this.errMgr = inputOrErrMgr instanceof ErrorManager ? inputOrErrMgr : STGroup.DEFAULT_ERR_MGR;

        this.sourceName = this.inputStream.getSourceName();
        this.c = this.inputStream.LA(1); // prime lookahead
        this.templateToken = templateToken ?? null;

        if (delimiterStartChar) {
            this.delimiterStartChar = delimiterStartChar.codePointAt(0)!;
        }

        if (delimiterStopChar) {
            this.delimiterStopChar = delimiterStopChar.codePointAt(0)!;
        }
    }

    public nextToken(): Token {
        let t: Token;
        if (this.tokens.length > 0) {
            t = this.tokens.shift()!;
        } else {
            t = this._nextToken();
        }

        return t;
    }

    /**
      Consume if {@code x} is next character on the input stream.
     */
    public match(x: number | string): void {
        const code = (typeof x === "string") ? x.codePointAt(0)! : x;
        if (this.c !== code) {
            // Create a fake token for the error message. Note: the current position hasn't been updated yet.
            // So we do that manually here.
            const token = this.newToken(STLexer.TEXT);
            token.column = this.#currentColumn;
            this.lexerError(token, "expecting '" + String.fromCodePoint(code) + "', found '" +
                this.currentCharToString() + "'");
        }
        this.consume();
    }

    public emit(token: Token): void {
        this.tokens.push(token);
    }

    public _nextToken(): Token {
        while (true) { // lets us avoid recursion when skipping stuff
            this.startCharIndex = this.inputStream.index;
            this.line = this.#currentLine;
            this._tokenStartColumn = this.#currentColumn;

            if (this.c === Token.EOF) {
                return this.newToken(Token.EOF);
            }

            let t: Token;
            if (this.scanningInsideExpr) {
                t = this.inside();
            } else {
                t = this.outside();
            }

            if (t !== STLexer.SKIP) {
                return t;
            }
        }
    }

    public newToken(tokenType: number, text?: string, pos?: number): Token {
        let t;

        if (!text) {
            t = new STLexer.STToken(this, this.inputStream, tokenType, this.startCharIndex,
                this.inputStream.index - 1);
        } else {
            t = new STLexer.STToken(tokenType, text);
            t.column = pos ?? this._tokenStartColumn;
            t.start = this.startCharIndex;
            t.stop = this.inputStream.index - 1;
            t.line = this.line;
        }

        t.tokenIndex = this.#currentIndex++;

        return t;
    }

    public newTokenFromPreviousChar(tokenType: number): Token {
        this._tokenStartColumn = this.#currentColumn - 1;
        const t = new STLexer.STToken(this, this.inputStream, tokenType, this.inputStream.index - 1,
            this.inputStream.index - 1);

        t.tokenIndex = this.#currentIndex++;

        return t;
    }

    protected consume(): void {
        if (this.c === 0x0A) { // \n
            this.#currentLine += 1;
            this.#currentColumn = 0;
        } else {
            this.#currentColumn += 1;
        }

        if (this.c !== Token.EOF) {
            this.inputStream.consume();
            this.c = this.inputStream.LA(1);
        }
    }

    protected outside(): Token {
        if (this.#currentColumn === 0 && this.currentCharMatchesOneOf(" ", "\t")) {
            while (this.currentCharMatchesOneOf(" ", "\t")) {
                this.consume();
            } // scarf indent

            if (this.c !== Token.EOF) {
                return this.newToken(STLexer.INDENT);
            }

            return this.newToken(STLexer.TEXT);
        }

        if (this.c === this.delimiterStartChar) {
            this.consume();
            if (this.currentCharMatchesOneOf("!")) {
                return this.matchCOMMENT();
            }

            if (this.currentCharMatchesOneOf("\\")) {
                return this.matchESCAPE();
            } // <\\> <\uFFFF> <\n> etc...

            this.scanningInsideExpr = true;

            return this.newToken(STLexer.LDELIM);
        }

        if (this.currentCharMatchesOneOf("\r")) {
            this.consume();
            this.consume();

            return this.newToken(STLexer.NEWLINE);
        } // \r\n -> \n

        if (this.currentCharMatchesOneOf("\n")) {
            this.consume();

            return this.newToken(STLexer.NEWLINE);
        }
        if (this.currentCharMatchesOneOf("}") && this.subtemplateDepth > 0) {
            this.scanningInsideExpr = true;
            this.subtemplateDepth--;
            this.consume();

            return this.newTokenFromPreviousChar(STLexer.RCURLY);
        }

        return this.matchTEXT();
    }

    protected inside(): Token {
        while (true) {
            switch (this.c) {
                case 0x20: // space
                case 0x09: // tab
                case 0x0A: // \n
                case 0x0D: { // \r
                    this.consume();

                    return STLexer.SKIP;
                }

                case 0x2E: { // .
                    const dot = this.c;
                    this.consume();

                    if (this.inputStream.LA(1) === dot && this.inputStream.LA(2) === dot) {
                        this.consume();
                        this.match(".");

                        return this.newToken(STLexer.ELLIPSIS);
                    }

                    return this.newToken(STLexer.DOT);
                }

                case 0x2C: { // ,
                    this.consume();

                    return this.newToken(STLexer.COMMA);
                }

                case 0x3A: { // :
                    this.consume();

                    return this.newToken(STLexer.COLON);
                }

                case 0x3B: { // ;
                    this.consume();

                    return this.newToken(STLexer.SEMI);
                }

                case 0x28: { // (
                    this.consume();

                    return this.newToken(STLexer.LPAREN);
                }

                case 0x29: { // )
                    this.consume();

                    return this.newToken(STLexer.RPAREN);
                }

                case 0x5B: { // [
                    this.consume();

                    return this.newToken(STLexer.LBRACK);
                }

                case 0x5D: { // ]
                    this.consume();

                    return this.newToken(STLexer.RBRACK);
                }

                case 0x3D: { // =
                    this.consume();

                    return this.newToken(STLexer.EQUALS);
                }

                case 0x21: { // !
                    this.consume();

                    return this.newToken(STLexer.BANG);
                }

                case 0x2F: { // /
                    this.consume();

                    return this.newToken(STLexer.SLASH);
                }

                case 0x40: { // @
                    this.consume();
                    if (this.c === "e".codePointAt(0)
                        && this.inputStream.LA(2) === "n".codePointAt(0)
                        && this.inputStream.LA(3) === "d".codePointAt(0)) {
                        this.consume();
                        this.consume();
                        this.consume();

                        return this.newToken(STLexer.REGION_END);
                    }

                    return this.newToken(STLexer.AT);
                }

                case 0x22: { // "
                    return this.mSTRING();
                }

                case 0x26: { // &
                    this.consume();
                    this.match("&");

                    return this.newToken(STLexer.AND);
                }

                // &&
                case 0x7C: { // |
                    this.consume();
                    this.match("|");

                    return this.newToken(STLexer.OR);
                }

                // ||
                case 0x7B: { // {
                    return this.subTemplate();
                }

                default: {
                    if (this.c === this.delimiterStopChar) {
                        this.consume();
                        this.scanningInsideExpr = false;

                        return this.newToken(STLexer.RDELIM);
                    }

                    if (this.currentCharIsIDStartLetter()) {
                        const id = this.mID();
                        const name = id.text!;
                        switch (name) {
                            case "if": {
                                return this.newToken(STLexer.IF);
                            }

                            case "endif": {
                                return this.newToken(STLexer.ENDIF);
                            }

                            case "else": {
                                return this.newToken(STLexer.ELSE);
                            }

                            case "elseif": {
                                return this.newToken(STLexer.ELSEIF);
                            }

                            case "super": {
                                return this.newToken(STLexer.SUPER);
                            }

                            case "true": {
                                return this.newToken(STLexer.TRUE);
                            }

                            case "false": {
                                return this.newToken(STLexer.FALSE);
                            }

                            default: {
                                return id;
                            }
                        }
                    }

                    const token = this.newToken(STLexer.TEXT);
                    token.column = this.#currentColumn;
                    this.lexerError(token, "invalid character '" + this.currentCharToString() + "'");
                    if (this.c === Token.EOF) {
                        return this.newToken(Token.EOF);
                    }
                    this.consume();
                }
            }
        }
    }

    protected subTemplate(): Token {
        // Keep current input stream state, in case we need to backtrack.
        const currentStreamIndex = this.inputStream.index;
        const currentLine = this.#currentLine;
        const currentColumn = this.#currentColumn;

        // look for "{ args ID (',' ID)* '|' ..."
        this.subtemplateDepth++;
        const curlyStartChar = this.startCharIndex;
        const curlyLine = this.line;
        const curlyPos = this._tokenStartColumn;
        const argTokens = new Array<Token>();
        this.consume();

        const curly = this.newTokenFromPreviousChar(STLexer.LCURLY);

        this.matchWS();
        argTokens.push(this.mID());
        this.matchWS();
        while (this.c === ",".codePointAt(0)) {
            this.consume();
            argTokens.push(this.newTokenFromPreviousChar(STLexer.COMMA));
            this.matchWS();
            argTokens.push(this.mID());
            this.matchWS();
        }

        this.matchWS();
        if (this.currentCharMatchesOneOf("|")) {
            this.consume();
            argTokens.push(this.newTokenFromPreviousChar(STLexer.PIPE));
            if (this.currentCharMatchesOneOf(" ", "\t", "\n", "\r")) {
                this.consume();
            }

            // ignore a single whitespace after |
            //System.out.println("matched args: "+argTokens);
            for (const t of argTokens) {
                this.emit(t);
            }

            this.scanningInsideExpr = false;
            this.startCharIndex = curlyStartChar; // reset state
            this.line = curlyLine;
            this._tokenStartColumn = curlyPos;

            return curly;
        }

        // Reset the input stream to where it was before we tried to match.
        this.inputStream.index = currentStreamIndex;
        this.#currentLine = currentLine;
        this.#currentColumn = currentColumn;

        // Reset the state of the lexer.
        this.startCharIndex = curlyStartChar;
        this.line = curlyLine;
        this._tokenStartColumn = curlyPos;
        this.consume();
        this.scanningInsideExpr = false;

        return curly;
    }

    protected matchESCAPE(): Token {
        this.startCharIndex = this.inputStream.index;
        this._tokenStartColumn = this.#currentColumn;
        this.consume(); // jump over \
        if (this.currentCharMatchesOneOf("u")) {
            return this.matchHexNumber();
        }

        let text: string;
        switch (this.c) {
            case 0x5C: { // \
                this.matchLINEBREAK();

                return STLexer.SKIP;
            }

            case 0x6E: { // n
                text = "\n";
                break;
            }

            case 0x74: { // t
                text = "\t";
                break;
            }

            case 0x20: {
                text = " ";
                break;
            }

            default: {
                const token = this.newToken(STLexer.TEXT);
                token.column = this.#currentColumn;
                this.lexerError(token, "invalid escaped char: '" + this.currentCharToString() + "'");
                this.consume();
                this.match(this.delimiterStopChar);

                return STLexer.SKIP;
            }

        }

        this.consume();
        const t = this.newToken(STLexer.TEXT, text, this._tokenStartColumn - 2);
        this.match(this.delimiterStopChar);

        return t;
    }

    protected matchHexNumber(): Token {
        this.consume();

        const convertCharCodeToNumber = (): number => {
            if (this.c >= 0x30 && this.c <= 0x39) {
                return this.c - 0x30;
            }

            if (this.c >= 0x41 && this.c <= 0x46) {
                return this.c - 0x37;
            }

            if (this.c >= 0x61 && this.c <= 0x66) {
                return this.c - 0x57;
            }

            return -1;
        };

        let codePoint = 0;
        if (!this.currentCharIsHexDigit()) {
            const token = this.newToken(STLexer.TEXT);
            token.column = this.#currentColumn;
            this.lexerError(token, "invalid hex digit: '" + this.currentCharToString() + "'");
        }

        codePoint = convertCharCodeToNumber();

        this.consume();
        if (!this.currentCharIsHexDigit()) {
            const token = this.newToken(STLexer.TEXT);
            token.column = this.#currentColumn;
            this.lexerError(token, "invalid hex digit: '" + this.currentCharToString() + "'");
        }

        codePoint = (codePoint << 4) + convertCharCodeToNumber();

        this.consume();
        if (!this.currentCharIsHexDigit()) {
            const token = this.newToken(STLexer.TEXT);
            token.column = this.#currentColumn;
            this.lexerError(token, "invalid hex digit: '" + this.currentCharToString() + "'");
        }

        codePoint = (codePoint << 4) + convertCharCodeToNumber();

        this.consume();
        if (!this.currentCharIsHexDigit()) {
            const token = this.newToken(STLexer.TEXT);
            token.column = this.#currentColumn;
            this.lexerError(token, "invalid hex digit: '" + this.currentCharToString() + "'");
        }

        codePoint = (codePoint << 4) + convertCharCodeToNumber();

        // ESCAPE kills >
        const uc = String.fromCodePoint(codePoint);
        const t = this.newToken(STLexer.TEXT, uc, this._tokenStartColumn - 6);

        this.consume();
        this.match(this.delimiterStopChar);

        return t;
    }

    protected matchTEXT(): Token {
        let modifiedText = false;
        let buf = "";
        while (this.c !== Token.EOF && this.c !== this.delimiterStartChar) {
            if (this.currentCharMatchesOneOf("\r", "\n")) {
                break;
            }

            if (this.currentCharMatchesOneOf("}") && this.subtemplateDepth > 0) {
                break;
            }

            if (this.currentCharMatchesOneOf("\\")) {
                if (this.inputStream.LA(2) === "\\".codePointAt(0)) { // convert \\ to \
                    this.consume();
                    this.consume();
                    buf += "\\";
                    modifiedText = true;
                    continue;
                }

                if (this.inputStream.LA(2) === this.delimiterStartChar ||
                    this.inputStream.LA(2) === "}".codePointAt(0)) {
                    modifiedText = true;
                    this.consume(); // toss out \ char
                    buf += this.currentCharToString();
                    this.consume();
                } else {
                    buf += this.currentCharToString();
                    this.consume();
                }
                continue;
            }

            buf += this.currentCharToString();
            this.consume();
        }

        if (modifiedText) {
            return this.newToken(STLexer.TEXT, buf.toString());
        } else {
            return this.newToken(STLexer.TEXT);
        }

    }

    /**
     * <pre>
     *  ID  : ('a'..'z'|'A'..'Z'|'_'|'/')
     *        ('a'..'z'|'A'..'Z'|'0'..'9'|'_'|'/')*
     *      ;
     *  </pre>
     *
     * @returns A token representing the matched ID.
     */
    protected mID(): Token {
        // called from subTemplate; so keep resetting position during speculation
        this.startCharIndex = this.inputStream.index;
        this.line = this.#currentLine;
        this._tokenStartColumn = this.#currentColumn;
        this.consume();

        while (this.currentCharIsIDLetter()) {
            this.consume();
        }

        return this.newToken(STLexer.ID);
    }

    /**
     * <pre>
     *  STRING : '"'
     *           (   '\\' '"'
     *           |   '\\' ~'"'
     *           |   ~('\\'|'"')
     *           )*
     *           '"'
     *         ;
     * </pre>
     *
     * @returns A token representing the matched string.
     */
    protected mSTRING(): Token {
        let sawEscape = false;
        let buf = this.currentCharToString();
        this.consume();

        while (!this.currentCharMatchesOneOf('"')) {
            if (this.currentCharMatchesOneOf("\\")) {
                sawEscape = true;
                this.consume();

                switch (String.fromCodePoint(this.c)) {
                    case "n": {
                        buf += "\n";
                        break;
                    }

                    case "r": {
                        buf += "\r";
                        break;
                    }

                    case "t": {
                        buf += "\t";
                        break;
                    }

                    default: {
                        buf += this.currentCharToString(); break;
                    }

                }
                this.consume();
                continue;
            }

            buf += this.currentCharToString();
            this.consume();

            if (this.c === Token.EOF) {
                const token = this.newToken(Token.EOF);
                token.column = this.#currentColumn;
                this.lexerError(token, "EOF in string");
                break;
            }
        }

        buf += this.currentCharToString();
        this.consume();

        if (sawEscape) {
            return this.newToken(STLexer.STRING, buf);
        } else {
            return this.newToken(STLexer.STRING);
        }

    }

    protected matchWS(): void {
        while (this.currentCharMatchesOneOf(" ", "\t", "\n", "\r")) {
            this.consume();
        }
    }

    protected matchCOMMENT(): Token {
        this.match("!");
        while (!(this.currentCharMatchesOneOf("!") && this.inputStream.LA(2) === this.delimiterStopChar)) {
            if (this.c === Token.EOF) {
                const token = this.newToken(Token.EOF);
                token.column = this.#currentColumn;
                this.lexerError(token, "Non-terminated comment starting at " + this.line + ":" +
                    this._tokenStartColumn + ": '!" + String.fromCodePoint(this.delimiterStopChar) + "' missing");
                break;
            }
            this.consume();
        }

        // grab !>
        this.consume();
        this.consume();

        return this.newToken(STLexer.COMMENT);
    }

    protected matchLINEBREAK(): void {
        this.match("\\"); // only kill 2nd \ as ESCAPE() kills first one
        this.match(this.delimiterStopChar);
        while (this.currentCharMatchesOneOf(" ", "\t")) {
            this.consume();
        } // scarf WS after <\\>

        if (this.c === Token.EOF) {
            const token = this.newToken(STLexer.NEWLINE);
            token.column = this.#currentColumn;
            this.lexerError(token, "Missing newline after newline escape <\\\\>");

            return;
        }

        if (this.currentCharMatchesOneOf("\r")) {
            this.consume();
        }

        this.match("\n");
        while (this.currentCharMatchesOneOf(" ", "\t")) {
            this.consume();
        } // scarf any indent
    }

    /**
     * @returns `true` if the current char matches any of the given alternatives
     */
    private currentCharMatchesOneOf(...alts: string[]): boolean {
        for (const alt of alts) {
            if (this.c === alt.codePointAt(0)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @returns `true` if the current char is a hex digit
     */
    private currentCharIsHexDigit(): boolean {
        return (this.c >= 0x30 && this.c <= 0x39) // 0-9
            || (this.c >= 0x41 && this.c <= 0x46) // A-F
            || (this.c >= 0x61 && this.c <= 0x66); // a-f
    }

    /**
     * @returns `true` if the current char can be used as first letter for an identifier.
     */
    private currentCharIsIDStartLetter(): boolean {
        return (this.c >= 0x30 && this.c <= 0x39) // 0-9
            || (this.c >= 0x41 && this.c <= 0x5a) // A-Z
            || (this.c >= 0x61 && this.c <= 0x7a) // a-z
            || this.c === 0x5f; // underscore
    }

    /**
     * @returns `true` if the current char can be used in an identifier.
     */
    private currentCharIsIDLetter(): boolean {
        return this.currentCharIsIDStartLetter() || this.c === 0x2d; // minus
    }

    /**
     * @returns A string representation of the current char.
     */
    private currentCharToString(): string {
        if (this.c === Token.EOF) {
            return "<EOF>";
        }

        return String.fromCodePoint(this.c);
    }

    private lexerError(token: Token, message: string): void {
        const e = new LexerNoViableAltException(null as unknown as Lexer, this.inputStream, 0, new ATNConfigSet());
        e.offendingToken = token;
        this.errMgr.lexerError(this.sourceName, message, this.templateToken, e);
    }
}
