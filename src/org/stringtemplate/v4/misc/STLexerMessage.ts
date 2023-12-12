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




import { java, type int } from "jree";
import { STMessage } from "./STMessage.js";
import { ErrorType } from "./ErrorType.js";

type String = java.lang.String;
const String = java.lang.String;
type Throwable = java.lang.Throwable;
const Throwable = java.lang.Throwable;



/** */
export  class STLexerMessage extends STMessage {
    public  msg:  String;
    /** overall token pulled from group file */
    public  templateToken:  Token;
    public  srcName:  String;

    public  constructor(srcName: String, msg: String, templateToken: Token, cause: Throwable) {
        super(ErrorType.LEXER_ERROR, null, cause, null);
        this.msg = msg;
        this.templateToken = templateToken;
        this.srcName = srcName;
    }

    @Override
public override  toString():  String {
        let  re = this.cause as RecognitionException;
        let  line = re.line;
        let  charPos = re.charPositionInLine;
        if ( this.templateToken!==null ) {
            let  templateDelimiterSize = 1;
            if ( this.templateToken.getType()=== GroupParser.BIGSTRING ) {
                templateDelimiterSize = 2;
            }
            line += this.templateToken.getLine() - 1;
            charPos += this.templateToken.getCharPositionInLine() + templateDelimiterSize;
        }
        let  filepos = line+":"+charPos;
        if ( this.srcName!==null ) {
            return this.srcName+" "+filepos+": "+String.format(this.error.message, this.msg);
        }
        return filepos+": "+String.format(this.error.message, this.msg);
    }
}
