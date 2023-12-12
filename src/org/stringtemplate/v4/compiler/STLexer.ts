/*
 * [The "BSD license"]
 *  Copyright (c) 2011 Terence Parr
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



import { java, JavaObject, type char, type int, S } from "jree";
import { STGroup } from "../STGroup.js";
import { Misc } from "../misc/Misc.js";

type String = java.lang.String;
const String = java.lang.String;
type List<E> = java.util.List<E>;
type ArrayList<E> = java.util.ArrayList<E>;
const ArrayList = java.util.ArrayList;
type Integer = java.lang.Integer;
const Integer = java.lang.Integer;
type StringBuilder = java.lang.StringBuilder;
const StringBuilder = java.lang.StringBuilder;



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
export  class STLexer extends JavaObject implements TokenSource {
    public static readonly  EOF = -1 as char;            // EOF char
    public static readonly  EOF_TYPE = CharStream.EOF;  // EOF token type

    /** We build {@code STToken} tokens instead of relying on {@link CommonToken}
     *  so we can override {@link #toString()}. It just converts token types to
     *  token names like 23 to {@code "LDELIM"}.
     */
    public static STToken =  class STToken extends CommonToken {
        public  constructor(type: int, text: String);
        public  constructor(input: CharStream, type: int, start: int, stop: int);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 2: {
				const [type, text] = args as [int, String];

 super(type, text); 

				break;
			}

			case 4: {
				const [input, type, start, stop] = args as [CharStream, int, int, int];


            super(input, type, DEFAULT_CHANNEL, start, stop);
        

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


        @Override
public  toString():  String {
            let  channelStr = "";
            if ( java.nio.channels.FileLock.channel>0 ) {
                channelStr=",channel="+java.nio.channels.FileLock.channel;
            }
            let  txt = java.text.BreakIterator.getText();
            if ( txt!==null ) {
 txt = Misc.replaceEscapes(txt);
}

            else {
 txt = "<no text>";
}

            let  tokenName: String;
            if ( java.lang.invoke.CallSite.type===STLexer.EOF_TYPE ) {
 tokenName = "EOF";
}

            else {
 tokenName = STParser.tokenNames[java.lang.invoke.CallSite.type];
}

            return "[@"+getTokenIndex()+","+java.lang.ProcessBuilder.start+":"+java.lang.Thread.stop+"='"+txt+"',<"+ tokenName +">"+channelStr+","+Misc.getLineCharPosition.#block#.line+":"+getCharPositionInLine()+"]";
        }
    };


    public static readonly  SKIP = new  STLexer.STToken(-1, "<skip>");

    // must follow STLexer.tokens file that STParser.g loads
    public static readonly  RBRACK=17;
    public static readonly  LBRACK=16;
    public static readonly  ELSE=5;
    public static readonly  ELLIPSIS=11;
    public static readonly  LCURLY=20;
    public static readonly  BANG=10;
    public static readonly  EQUALS=12;
    public static readonly  TEXT=22;
    public static readonly  ID=25;
    public static readonly  SEMI=9;
    public static readonly  LPAREN=14;
    public static readonly  IF=4;
    public static readonly  ELSEIF=6;
    public static readonly  COLON=13;
    public static readonly  RPAREN=15;
    public static readonly  COMMA=18;
    public static readonly  RCURLY=21;
    public static readonly  ENDIF=7;
    public static readonly  RDELIM=24;
    public static readonly  SUPER=8;
    public static readonly  DOT=19;
    public static readonly  LDELIM=23;
    public static readonly  STRING=26;
    public static readonly  PIPE=28;
    public static readonly  OR=29;
    public static readonly  AND=30;
    public static readonly  INDENT=31;
    public static readonly  NEWLINE=32;
    public static readonly  AT=33;
    public static readonly  REGION_END=34;
    public static readonly  TRUE=35;
    public static readonly  FALSE=36;
    public static readonly  COMMENT=37;
    public static readonly  SLASH=38;

    /** To be able to properly track the inside/outside mode, we need to
     *  track how deeply nested we are in some templates. Otherwise, we
     *  know whether a <code>'}'</code> and the outermost subtemplate to send this
     *  back to outside mode.
     */
    public  subtemplateDepth = 0;


    /** The char which delimits the start of an expression. */
    protected  delimiterStartChar = '<';
    /** The char which delimits the end of an expression. */
    protected  delimiterStopChar = '>';

    /**
     * This keeps track of the current mode of the lexer. Are we inside or
     * outside an ST expression?
     */
    protected  scanningInsideExpr = false; // start out *not* in a {...} subtemplate

    protected  errMgr: java.util.logging.ErrorManager;

    /** template embedded in a group file? this is the template */
    protected  templateToken: Token;

    protected  input: CharStream;
    /** current character */
    protected  c: char;

    /** When we started token, track initial coordinates so we can properly
     *  build token objects.
     */
    protected  startCharIndex: int;
    protected  startLine: int;
    protected  startCharPositionInLine: int;

    /** Our lexer routines might have to emit more than a single token. We
     *  buffer everything through this list.
     */
    protected  tokens = new  ArrayList<Token>();

    public  constructor(input: CharStream);

    public  constructor(errMgr: java.util.logging.ErrorManager, input: CharStream, templateToken: Token);

    public  constructor(errMgr: java.util.logging.ErrorManager,
                   input: CharStream,
                   templateToken: Token,
                   delimiterStartChar: char,
                   delimiterStopChar: char);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 1: {
				const [input] = args as [CharStream];

 this(STGroup.DEFAULT_ERR_MGR, input, null, '<', '>'); 

				break;
			}

			case 3: {
				const [errMgr, input, templateToken] = args as [java.util.logging.ErrorManager, CharStream, Token];


        this(errMgr, input, templateToken, '<', '>');
    

				break;
			}

			case 5: {
				const [errMgr, input, templateToken, delimiterStartChar, delimiterStopChar] = args as [java.util.logging.ErrorManager, CharStream, Token, char, char];


        super();
this.errMgr = errMgr;
        this.input = input;
        this.c = input.LA(1) as char; // prime lookahead
        this.templateToken = templateToken;
        this.delimiterStartChar = delimiterStartChar;
        this.delimiterStopChar = delimiterStopChar;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public static  isIDStartLetter(c: char):  boolean { return STLexer.isIDLetter(c); }
    public static  isIDLetter(c: char):  boolean { return c>='a'&&c<='z' || c>='A'&&c<='Z' || c>='0'&&c<='9' || c==='-' || c==='_'; }
    public static  isWS(c: char):  boolean { return c===' ' || c==='\t' || c==='\n' || c==='\r'; }
    public static  isUnicodeLetter(c: char):  boolean { return c>='a'&&c<='f' || c>='A'&&c<='F' || c>='0'&&c<='9'; }

    public static  str(c: int):  String {
        if ( c===STLexer.EOF ) {
 return "<EOF>";
}

        return String.valueOf(c as char);
    }

    @Override
public  nextToken():  Token {
        let  t: Token;
        if ( this.tokens.size()>0 ) { t = this.tokens.remove(0); }
        else {
 t = this._nextToken();
}

//      System.out.println(t);
        return t;
    }

    /** Consume if {@code x} is next character on the input stream.
     */
    public  match(x: char):  void {
        if ( this.c !== x ) {
            let  e = new  NoViableAltException("",0,0,this.input);
            this.errMgr.lexerError(this.input.getSourceName(), "expecting '"+x+"', found '"+STLexer.str(this.c)+"'", this.templateToken, e);
        }
        this.consume();
    }

    public  emit(token: Token):  void { this.tokens.add(token); }

    public  _nextToken():  Token {
        //System.out.println("nextToken: c="+(char)c+"@"+input.index());
        while ( true ) { // lets us avoid recursion when skipping stuff
            this.startCharIndex = this.input.index();
            this.startLine = this.input.getLine();
            this.startCharPositionInLine = this.input.getCharPositionInLine();

            if ( this.c===STLexer.EOF ) {
 return this.newToken(STLexer.EOF_TYPE);
}

            let  t: Token;
            if ( this.scanningInsideExpr ) {
 t = this.inside();
}

            else {
 t = this.outside();
}

            if ( t!==STLexer.SKIP ) {
 return t;
}

        }
    }

    public  newToken(ttype: int):  Token;

    public  newToken(ttype: int, text: String):  Token;

    public  newToken(ttype: int, text: String, pos: int):  Token;
public newToken(...args: unknown[]):  Token {
		switch (args.length) {
			case 1: {
				const [ttype] = args as [int];


        let  t = new  STLexer.STToken(this.input, ttype, this.startCharIndex, this.input.index()-1);
        t.setLine(this.startLine);
        t.setCharPositionInLine(this.startCharPositionInLine);
        return t;
    

				break;
			}

			case 2: {
				const [ttype, text] = args as [int, String];


        let  t = new  STLexer.STToken(ttype, text);
        t.setStartIndex(this.startCharIndex);
        t.setStopIndex(this.input.index()-1);
        t.setLine(this.startLine);
        t.setCharPositionInLine(this.startCharPositionInLine);
        return t;
    

				break;
			}

			case 3: {
				const [ttype, text, pos] = args as [int, String, int];


        let  t = new  STLexer.STToken(ttype, text);
        t.setStartIndex(this.startCharIndex);
        t.setStopIndex(this.input.index()-1);
        t.setLine(this.input.getLine());
        t.setCharPositionInLine(pos);
        return t;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  newTokenFromPreviousChar(ttype: int):  Token {
        let  t = new  STLexer.STToken(this.input, ttype, this.input.index()-1, this.input.index()-1);
        t.setLine(this.input.getLine());
        t.setCharPositionInLine(this.input.getCharPositionInLine()-1);
        return t;
    }

//    public String getErrorHeader() {
//        return startLine+":"+startCharPositionInLine;
//    }
//
    @Override
public  getSourceName():  String {
        return "no idea";
    }

    protected  consume():  void {
        this.input.consume();
        this.c = this.input.LA(1) as char;
    }

    protected  outside():  Token {
        if ( this.input.getCharPositionInLine()===0 && (this.c===' '||this.c==='\t') ) {
            while ( this.c===' ' || this.c==='\t' ) this.consume(); // scarf indent
            if ( this.c!==STLexer.EOF ) {
 return this.newToken(STLexer.INDENT);
}

            return this.newToken(STLexer.TEXT);
        }
        if ( this.c===this.delimiterStartChar ) {
            this.consume();
            if ( this.c==='!' ) {
 return STLexer.COMMENT();
}

            if ( this.c==='\\' ) {
 return this.ESCAPE();
}
 // <\\> <\uFFFF> <\n> etc...
            this.scanningInsideExpr = true;
            return this.newToken(STLexer.LDELIM);
        }
        if ( this.c==='\r' ) { this.consume(); this.consume(); return this.newToken(STLexer.NEWLINE); } // \r\n -> \n
        if ( this.c==='\n') { this.consume(); return this.newToken(STLexer.NEWLINE); }
        if ( this.c==='}' && this.subtemplateDepth>0 ) {
            this.scanningInsideExpr = true;
            this.subtemplateDepth--;
            this.consume();
            return this.newTokenFromPreviousChar(STLexer.RCURLY);
        }
        return this.mTEXT();
    }

    protected  inside():  Token {
        while ( true ) {
            switch ( this.c ) {
                case ' ': case '\t': case '\n': case '\r':{
                    this.consume();
                    return STLexer.SKIP;
}

                case '.' :{
                    this.consume();
                    if ( this.input.LA(1)==='.' && this.input.LA(2)==='.' ) {
                        this.consume();
                        this.match('.');
                        return this.newToken(STLexer.ELLIPSIS);
                    }
                    return this.newToken(STLexer.DOT);
}

                case ',' :{ this.consume(); return this.newToken(STLexer.COMMA);
}

                case ':' :{ this.consume(); return this.newToken(STLexer.COLON);
}

                case ';' :{ this.consume(); return this.newToken(STLexer.SEMI);
}

                case '(' :{ this.consume(); return this.newToken(STLexer.LPAREN);
}

                case ')' :{ this.consume(); return this.newToken(STLexer.RPAREN);
}

                case '[' :{ this.consume(); return this.newToken(STLexer.LBRACK);
}

                case ']' :{ this.consume(); return this.newToken(STLexer.RBRACK);
}

                case '=' :{ this.consume(); return this.newToken(STLexer.EQUALS);
}

                case '!' :{ this.consume(); return this.newToken(STLexer.BANG);
}

                case '/' :{ this.consume(); return this.newToken(STLexer.SLASH);
}

                case '@' :{
                    this.consume();
                    if ( this.c==='e' && this.input.LA(2)==='n' && this.input.LA(3)==='d' ) {
                        this.consume(); this.consume(); this.consume();
                        return this.newToken(STLexer.REGION_END);
                    }
                    return this.newToken(STLexer.AT);
}

                case '"' :{ return this.mSTRING();
}

                case '&' :{ this.consume(); this.match('&'); return this.newToken(STLexer.AND);
}
 // &&
                case '|' :{ this.consume(); this.match('|'); return this.newToken(STLexer.OR);
}
 // ||
                case '{' :{ return this.subTemplate();
}

                default:{
                    if ( this.c===this.delimiterStopChar ) {
                        this.consume();
                        this.scanningInsideExpr =false;
                        return this.newToken(STLexer.RDELIM);
                    }
                    if ( STLexer.isIDStartLetter(this.c) ) {
                        let  id = this.mID();
                        let  name = id.getText();
                        if ( name.equals("if") ) {
 return this.newToken(STLexer.IF);
}

                        else {
 if ( name.equals("endif") ) {
 return this.newToken(STLexer.ENDIF);
}

                        else {
 if ( name.equals("else") ) {
 return this.newToken(STLexer.ELSE);
}

                        else {
 if ( name.equals("elseif") ) {
 return this.newToken(STLexer.ELSEIF);
}

                        else {
 if ( name.equals("super") ) {
 return this.newToken(STLexer.SUPER);
}

                        else {
 if ( name.equals("true") ) {
 return this.newToken(STLexer.TRUE);
}

                        else {
 if ( name.equals("false") ) {
 return this.newToken(STLexer.FALSE);
}

}

}

}

}

}

}

                        return id;
                    }
                    let  re =
                        new  NoViableAltException("",0,0,this.input);
                    re.line = this.startLine;
                    re.charPositionInLine = this.startCharPositionInLine;
                    this.errMgr.lexerError(this.input.getSourceName(), "invalid character '"+STLexer.str(this.c)+"'", this.templateToken, re);
                    if (this.c===STLexer.EOF) {
                        return this.newToken(STLexer.EOF_TYPE);
                    }
                    this.consume();
}

            }
        }
    }

    protected  subTemplate(): Token {
        // look for "{ args ID (',' ID)* '|' ..."
        this.subtemplateDepth++;
        let  m = this.input.mark();
        let  curlyStartChar = this.startCharIndex;
        let  curlyLine = this.startLine;
        let  curlyPos = this.startCharPositionInLine;
        let  argTokens = new  ArrayList<Token>();
        this.consume();
        let  curly = this.newTokenFromPreviousChar(STLexer.LCURLY);
        this.WS();
        argTokens.add( this.mID() );
        this.WS();
        while ( this.c===',' ) {
            this.consume();
            argTokens.add( this.newTokenFromPreviousChar(STLexer.COMMA) );
            this.WS();
            argTokens.add( this.mID() );
            this.WS();
        }
        this.WS();
        if ( this.c==='|' ) {
            this.consume();
            argTokens.add( this.newTokenFromPreviousChar(STLexer.PIPE) );
            if ( STLexer.isWS(this.c) ) {
 this.consume();
}
 // ignore a single whitespace after |
            //System.out.println("matched args: "+argTokens);
            for (let t of argTokens) {
 this.emit(t);
}

            this.input.release(m);
            this.scanningInsideExpr = false;
            this.startCharIndex = curlyStartChar; // reset state
            this.startLine = curlyLine;
            this.startCharPositionInLine = curlyPos;
            return curly;
        }
        this.input.rewind(m);
        this.startCharIndex = curlyStartChar; // reset state
        this.startLine = curlyLine;
        this.startCharPositionInLine = curlyPos;
        this.consume();
        this.scanningInsideExpr = false;
        return curly;
    }

    protected  ESCAPE(): Token {
        this.startCharIndex = this.input.index();
        this.startCharPositionInLine = this.input.getCharPositionInLine();
        this.consume(); // kill \\
        if ( this.c==='u') {
 return this.UNICODE();
}

        let  text: String;
        switch ( this.c ) {
            case '\\' :{ this.LINEBREAK(); return STLexer.SKIP;
}

            case 'n'  :{ text = "\n"; break;
}

            case 't'  :{ text = "\t"; break;
}

            case ' '  :{ text = " "; break;
}

            default :{
                let  e = new  NoViableAltException("",0,0,this.input);
                this.errMgr.lexerError(this.input.getSourceName(), "invalid escaped char: '"+STLexer.str(this.c)+"'", this.templateToken, e);
                this.consume();
                this.match(this.delimiterStopChar);
                return STLexer.SKIP;
}

        }
        this.consume();
        let  t = this.newToken(STLexer.TEXT, text, this.input.getCharPositionInLine()-2);
        this.match(this.delimiterStopChar);
        return t;
    }

    protected  UNICODE(): Token {
        this.consume();
        let  chars = new  Uint16Array(4);
        if ( !STLexer.isUnicodeLetter(this.c) ) {
            let  e = new  NoViableAltException("",0,0,this.input);
            this.errMgr.lexerError(this.input.getSourceName(), "invalid unicode char: '"+STLexer.str(this.c)+"'", this.templateToken, e);
        }
        chars[0] = this.c;
        this.consume();
        if ( !STLexer.isUnicodeLetter(this.c) ) {
            let  e = new  NoViableAltException("",0,0,this.input);
            this.errMgr.lexerError(this.input.getSourceName(), "invalid unicode char: '"+STLexer.str(this.c)+"'", this.templateToken, e);
        }
        chars[1] = this.c;
        this.consume();
        if ( !STLexer.isUnicodeLetter(this.c) ) {
            let  e = new  NoViableAltException("",0,0,this.input);
            this.errMgr.lexerError(this.input.getSourceName(), "invalid unicode char: '"+STLexer.str(this.c)+"'", this.templateToken, e);
        }
        chars[2] = this.c;
        this.consume();
        if ( !STLexer.isUnicodeLetter(this.c) ) {
            let  e = new  NoViableAltException("",0,0,this.input);
            this.errMgr.lexerError(this.input.getSourceName(), "invalid unicode char: '"+STLexer.str(this.c)+"'", this.templateToken, e);
        }
        chars[3] = this.c;
        // ESCAPE kills >
        let  uc = Integer.parseInt(new  String(chars), 16) as char;
        let  t = this.newToken(STLexer.TEXT, String.valueOf(uc), this.input.getCharPositionInLine()-6);
        this.consume();
        this.match(this.delimiterStopChar);
        return t;
    }

    protected  mTEXT(): Token {
        let  modifiedText = false;
        let  buf = new  StringBuilder();
        while ( this.c !== STLexer.EOF && this.c !== this.delimiterStartChar ) {
            if ( this.c==='\r' || this.c==='\n') {
 break;
}

            if ( this.c==='}' && this.subtemplateDepth>0 ) {
 break;
}

            if ( this.c==='\\' ) {
                if ( this.input.LA(2)==='\\' ) { // convert \\ to \
                    this.consume(); this.consume(); buf.append('\\');
                    modifiedText = true;
                    continue;
                }
                if ( this.input.LA(2)===this.delimiterStartChar ||
                     this.input.LA(2)==='}' )
                {
                    modifiedText = true;
                    this.consume(); // toss out \ char
                    buf.append(this.c); this.consume();
                }
                else {
                    buf.append(this.c);
                    this.consume();
                }
                continue;
            }
            buf.append(this.c);
            this.consume();
        }
        if ( modifiedText ) {
 return this.newToken(STLexer.TEXT, buf.toString());
}

        else {
 return this.newToken(STLexer.TEXT);
}

    }

    /** <pre>
     *  ID  : ('a'..'z'|'A'..'Z'|'_'|'/')
     *        ('a'..'z'|'A'..'Z'|'0'..'9'|'_'|'/')*
     *      ;
     *  </pre>
     */
    protected  mID(): Token {
        // called from subTemplate; so keep resetting position during speculation
        this.startCharIndex = this.input.index();
        this.startLine = this.input.getLine();
        this.startCharPositionInLine = this.input.getCharPositionInLine();
        this.consume();
        while ( STLexer.isIDLetter(this.c) ) {
            this.consume();
        }
        return this.newToken(STLexer.ID);
    }

    /** <pre>
     *  STRING : '"'
     *           (   '\\' '"'
     *           |   '\\' ~'"'
     *           |   ~('\\'|'"')
     *           )*
     *           '"'
     *         ;
     * </pre>
     */
    protected  mSTRING(): Token {
        //{setText(getText().substring(1, getText().length()-1));}
        let  sawEscape = false;
        let  buf = new  StringBuilder();
        buf.append(this.c); this.consume();
        while ( this.c !== '"' ) {
            if ( this.c==='\\' ) {
                sawEscape = true;
                this.consume();
                switch ( this.c ) {
                    case 'n' :{ buf.append('\n'); break;
}

                    case 'r' :{ buf.append('\r'); break;
}

                    case 't' :{ buf.append('\t'); break;
}

                    default :{ buf.append(this.c); break;
}

                }
                this.consume();
                continue;
            }
            buf.append(this.c);
            this.consume();
            if ( this.c===STLexer.EOF ) {
                let  re =
                    new  MismatchedTokenException('"' as int, this.input);
                re.line = this.input.getLine();
                re.charPositionInLine = this.input.getCharPositionInLine();
                this.errMgr.lexerError(this.input.getSourceName(), "EOF in string", this.templateToken, re);
                break;
            }
        }
        buf.append(this.c);
        this.consume();
        if ( sawEscape ) {
 return this.newToken(STLexer.STRING, buf.toString());
}

        else {
 return this.newToken(STLexer.STRING);
}

    }

    protected  WS(): void {
        while ( this.c===' ' || this.c==='\t' || this.c==='\n' || this.c==='\r' ) this.consume();
    }

    protected  COMMENT(): Token {
        this.match('!');
        while ( !(this.c==='!' && this.input.LA(2)===this.delimiterStopChar) ) {
            if (this.c===STLexer.EOF) {
                let  re =
                    new  MismatchedTokenException('!' as int, this.input);
                re.line = this.input.getLine();
                re.charPositionInLine = this.input.getCharPositionInLine();
                this.errMgr.lexerError(this.input.getSourceName(), "Nonterminated comment starting at " +
                    this.startLine+":"+this.startCharPositionInLine+": '!"+
                    this.delimiterStopChar+"' missing", this.templateToken, re);
                break;
            }
            this.consume();
        }
        this.consume(); this.consume(); // grab !>
        return this.newToken(STLexer.COMMENT);
    }

    protected  LINEBREAK(): void {
        this.match('\\'); // only kill 2nd \ as ESCAPE() kills first one
        this.match(this.delimiterStopChar);
        while ( this.c===' ' || this.c==='\t' ) this.consume(); // scarf WS after <\\>
        if ( this.c===STLexer.EOF ) {
            let  re = new  RecognitionException(this.input);
            re.line = this.input.getLine();
            re.charPositionInLine = this.input.getCharPositionInLine();
            this.errMgr.lexerError(this.input.getSourceName(), "Missing newline after newline escape <\\\\>",
                              this.templateToken, re);
            return;
        }
        if ( this.c==='\r' ) {
 this.consume();
}

        this.match('\n');
        while ( this.c===' ' || this.c==='\t' ) this.consume(); // scarf any indent
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace STLexer {
	export type STToken = InstanceType<typeof STLexer.STToken>;
}


