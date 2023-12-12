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



import { java, type int, S } from "jree";
import { STMessage } from "./STMessage.js";
import { ErrorType } from "./ErrorType.js";

type String = java.lang.String;
const String = java.lang.String;
type Throwable = java.lang.Throwable;
const Throwable = java.lang.Throwable;



/** Used for semantic errors that occur at compile time not during
 *  interpretation. For ST parsing ONLY not group parsing.
 */
export  class STCompiletimeMessage extends STMessage {
    /** overall token pulled from group file */
    public  templateToken:  Token;
    /** token inside template */
    public  token:  Token;
    public  srcName:  String;

    public  constructor(error: ErrorType, srcName: String, templateToken: Token, t: Token);
    public  constructor(error: ErrorType, srcName: String, templateToken: Token, t: Token, cause: Throwable);
    public  constructor(error: ErrorType, srcName: String, templateToken: Token, t: Token,
                                cause: Throwable, arg: java.lang.Object);
    public  constructor(error: ErrorType, srcName: String, templateToken: Token,
                                t: Token, cause: Throwable, arg: java.lang.Object, arg2: java.lang.Object);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 4: {
				const [error, srcName, templateToken, t] = args as [ErrorType, String, Token, Token];


        this(error, srcName, templateToken, t, null);
    

				break;
			}

			case 5: {
				const [error, srcName, templateToken, t, cause] = args as [ErrorType, String, Token, Token, Throwable];


        this(error, srcName, templateToken, t, cause, null);
    

				break;
			}

			case 6: {
				const [error, srcName, templateToken, t, cause, arg] = args as [ErrorType, String, Token, Token, Throwable, java.lang.Object];


        this(error, srcName, templateToken, t, cause, arg, null);
    

				break;
			}

			case 7: {
				const [error, srcName, templateToken, t, cause, arg, arg2] = args as [ErrorType, String, Token, Token, Throwable, java.lang.Object, java.lang.Object];


        super(error, null, cause, arg, arg2);
        this.templateToken = templateToken;
        this.token = t;
        this.srcName = srcName;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    @Override
public override  toString():  String {
        let  line = 0;
        let  charPos = -1;
        if ( this.token!==null ) {
            line = this.token.getLine();
            charPos = this.token.getCharPositionInLine();
            // check the input streams - if different then token is embedded in templateToken and we need to adjust the offset
            if ( this.templateToken!==null && !this.templateToken.getInputStream().equals(this.token.getInputStream()) ) {
                let  templateDelimiterSize = 1;
                if ( this.templateToken.getType()=== GroupParser.BIGSTRING || this.templateToken.getType()=== GroupParser.BIGSTRING_NO_NL ) {
                    templateDelimiterSize = 2;
                }
                line += this.templateToken.getLine() - 1;
                charPos += this.templateToken.getCharPositionInLine() + templateDelimiterSize;
            }
        }
        let  filepos = line+":"+charPos;
        if ( this.srcName!==null ) {
            return this.srcName+" "+filepos+": "+String.format(this.error.message, this.arg, this.arg2);
        }
        return filepos+": "+String.format(this.error.message, this.arg, this.arg2);
    }
}
