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



import { java, JavaObject, S } from "jree";
import { ErrorType } from "./ErrorType.js";
import { ST } from "../ST.js";

type Throwable = java.lang.Throwable;
const Throwable = java.lang.Throwable;
type String = java.lang.String;
const String = java.lang.String;
type StringWriter = java.io.StringWriter;
const StringWriter = java.io.StringWriter;
type PrintWriter = java.io.PrintWriter;
const PrintWriter = java.io.PrintWriter;



/** Upon error, ST creates an {@link STMessage} or subclass instance and notifies
 *  the listener.  This root class is used for IO and internal errors.
 *
 *  @see STRuntimeMessage
 *  @see STCompiletimeMessage
 */
export  class STMessage extends JavaObject {
    /** if in debug mode, has created instance, add attr events and eval
     *  template events.
     */
    public  self:  ST;
    public  error:  ErrorType;
    public  arg:  java.lang.Object;
    public  arg2:  java.lang.Object;
    public  arg3:  java.lang.Object;
    public  cause:  Throwable;

    public  constructor(error: ErrorType);
    public  constructor(error: ErrorType, self: ST);
    public  constructor(error: ErrorType, self: ST, cause: Throwable);
    public  constructor(error: ErrorType, self: ST, cause: Throwable, arg: java.lang.Object);
    @SuppressWarnings("ChainingConstructorIgnoresParameter")
public  constructor(error: ErrorType, self: ST, cause: Throwable, where: Token, arg: java.lang.Object);
    public  constructor(error: ErrorType, self: ST, cause: Throwable, arg: java.lang.Object, arg2: java.lang.Object);
    public  constructor(error: ErrorType, self: ST, cause: Throwable, arg: java.lang.Object, arg2: java.lang.Object, arg3: java.lang.Object);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 1: {
				const [error] = args as [ErrorType];


        super();
this.error = error;
    

				break;
			}

			case 2: {
				const [error, self] = args as [ErrorType, ST];


        this(error);
        this.self = self;
    

				break;
			}

			case 3: {
				const [error, self, cause] = args as [ErrorType, ST, Throwable];


        this(error,self);
        this.cause = cause;
    

				break;
			}

			case 4: {
				const [error, self, cause, arg] = args as [ErrorType, ST, Throwable, java.lang.Object];


        this(error,self,cause);
        this.arg = arg;
    

				break;
			}

			case 5: {
				const [error, self, cause, where, arg] = args as [ErrorType, ST, Throwable, Token, java.lang.Object];


        this(error,self,cause,where);
        this.arg = arg;
    

				break;
			}

			case 5: {
				const [error, self, cause, arg, arg2] = args as [ErrorType, ST, Throwable, java.lang.Object, java.lang.Object];


        this(error,self,cause,arg);
        this.arg2 = arg2;
    

				break;
			}

			case 6: {
				const [error, self, cause, arg, arg2, arg3] = args as [ErrorType, ST, Throwable, java.lang.Object, java.lang.Object, java.lang.Object];


        this(error,self,cause,arg,arg2);
        this.arg3 = arg3;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    @Override
public override  toString():  String {
        let  sw = new  StringWriter();
        let  pw = new  PrintWriter(sw);
        let  msg = String.format(this.error.message, this.arg, this.arg2, this.arg3);
        pw.print(msg);
        if ( this.cause!==null ) {
            pw.print("\nCaused by: ");
            this.cause.printStackTrace(pw);
        }
        return sw.toString();
    }
}
