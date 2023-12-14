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



/** */
export  class STGroupCompiletimeMessage extends STMessage {
    /** token inside group file */
    public  token:  Token;
    public  srcName:  string;

    public  constructor(error: ErrorType, srcName: string, t: Token, cause: java.lang.Throwable);
    public  constructor(error: ErrorType, srcName: string, t: Token,
                                     cause: java.lang.Throwable, arg: Object);
    public  constructor(error: ErrorType, srcName: string,
                                     t: Token, cause: java.lang.Throwable, arg: Object, arg2: Object);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 4: {
				const [error, srcName, t, cause] = args as [ErrorType, string, Token, java.lang.Throwable];


        this(error, srcName, t, cause, null);
    

				break;
			}

			case 5: {
				const [error, srcName, t, cause, arg] = args as [ErrorType, string, Token, java.lang.Throwable, Object];


        this(error, srcName, t, cause, arg, null);
    

				break;
			}

			case 6: {
				const [error, srcName, t, cause, arg, arg2] = args as [ErrorType, string, Token, java.lang.Throwable, Object, Object];


        super(error, null, cause, arg, arg2);
        this.token = t;
        this.srcName = srcName;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public override  toString():  string {
        let  re = this.cause as RecognitionException;
        let  line = 0;
        let  charPos = -1;
        if ( this.token!==null ) {
            line = this.token.getLine();
            charPos = this.token.getCharPositionInLine();
        }
        else {
 if ( re!==null ) {
            line = re.line;
            charPos = re.charPositionInLine;
        }
}

        let  filepos = line+":"+charPos;
        if ( this.srcName!==null ) {
            return this.srcName+" "+filepos+": "+string.format(this.error.message, this.arg, this.arg2);
        }
        return filepos+": "+string.format(this.error.message, this.arg, this.arg2);
    }
}
