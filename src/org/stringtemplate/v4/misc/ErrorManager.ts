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



import { JavaObject, java, S } from "jree";
import { STRuntimeMessage } from "./STRuntimeMessage.js";
import { STMessage } from "./STMessage.js";
import { STLexerMessage } from "./STLexerMessage.js";
import { STGroupCompiletimeMessage } from "./STGroupCompiletimeMessage.js";
import { STCompiletimeMessage } from "./STCompiletimeMessage.js";
import { Misc } from "./Misc.js";
import { ErrorType } from "./ErrorType.js";
import { InstanceScope } from "../InstanceScope.js";
import { Interpreter } from "../Interpreter.js";
import { ST } from "../ST.js";
import { STErrorListener } from "../STErrorListener.js";

type System = java.lang.System;
const System = java.lang.System;
type String = java.lang.String;
const String = java.lang.String;
type Throwable = java.lang.Throwable;
const Throwable = java.lang.Throwable;



export  class ErrorManager extends JavaObject {
    public static  DEFAULT_ERROR_LISTENER =
        new  class extends JavaObject implements STErrorListener {
            @Override
public  compileTimeError(msg: STMessage):  void {
                System.err.println(msg);
            }

            @Override
public  runTimeError(msg: STMessage):  void {
                if ( msg.error !== ErrorType.NO_SUCH_PROPERTY ) { // ignore these
                    System.err.println(msg);
                }
            }

            @Override
public  IOError(msg: STMessage):  void {
                System.err.println(msg);
            }

            @Override
public  internalError(msg: STMessage):  void {
                System.err.println(msg);
                // throw new Error("internal error", msg.cause);
            }

            public  error(s: String):  void;
            public  error(s: String, e: Throwable):  void;
public error(...args: unknown[]):  void {
		switch (args.length) {
			case 1: {
				const [s] = args as [String];

 this.error(s, null); 

				break;
			}

			case 2: {
				const [s, e] = args as [String, Throwable];


                System.err.println(s);
                if ( e!==null ) {
                    e.printStackTrace(System.err);
                }
            

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}

        }();

    public readonly  listener:  STErrorListener;

    public  constructor();
    public  constructor(listener: STErrorListener);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {
 this(ErrorManager.DEFAULT_ERROR_LISTENER); 

				break;
			}

			case 1: {
				const [listener] = args as [STErrorListener];


        super();
this.listener = listener;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  compileTimeError(error: ErrorType, templateToken: Token, t: Token):  void;

    public  compileTimeError(error: ErrorType, templateToken: Token, t: Token, arg: java.lang.Object):  void;

    public  compileTimeError(error: ErrorType, templateToken: Token, t: Token, arg: java.lang.Object, arg2: java.lang.Object):  void;
public compileTimeError(...args: unknown[]):  void {
		switch (args.length) {
			case 3: {
				const [error, templateToken, t] = args as [ErrorType, Token, Token];


        let  srcName = this.sourceName(t);
        this.listener.compileTimeError(
            new  STCompiletimeMessage(error,srcName,templateToken,t,null,t.getText())
        );
    

				break;
			}

			case 4: {
				const [error, templateToken, t, arg] = args as [ErrorType, Token, Token, java.lang.Object];


        let  srcName = this.sourceName(t);
        this.listener.compileTimeError(
            new  STCompiletimeMessage(error,srcName,templateToken,t,null,arg)
        );
    

				break;
			}

			case 5: {
				const [error, templateToken, t, arg, arg2] = args as [ErrorType, Token, Token, java.lang.Object, java.lang.Object];


        let  srcName = this.sourceName(t);
        this.listener.compileTimeError(
            new  STCompiletimeMessage(error,srcName,templateToken,t,null,arg,arg2)
        );
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  lexerError(srcName: String, msg: String, templateToken: Token, e: RecognitionException):  void {
        if ( srcName!==null ) {
 srcName = Misc.getFileName(srcName);
}

        this.listener.compileTimeError(
            new  STLexerMessage(srcName, msg, templateToken, e)
        );
    }

    public  groupSyntaxError(error: ErrorType, srcName: String, e: RecognitionException, msg: String):  void {
        let  t = e.token;
        this.listener.compileTimeError(
            new  STGroupCompiletimeMessage(error,srcName,e.token,e,msg)
        );
    }

    public  groupLexerError(error: ErrorType, srcName: String, e: RecognitionException, msg: String):  void {
        this.listener.compileTimeError(
            new  STGroupCompiletimeMessage(error,srcName,e.token,e,msg)
        );
    }

    public  runTimeError(interp: Interpreter, scope: InstanceScope, error: ErrorType):  void;

    public  runTimeError(interp: Interpreter, scope: InstanceScope, error: ErrorType, arg: java.lang.Object):  void;

    public  runTimeError(interp: Interpreter, scope: InstanceScope, error: ErrorType, e: Throwable, arg: java.lang.Object):  void;

    public  runTimeError(interp: Interpreter, scope: InstanceScope, error: ErrorType, arg: java.lang.Object, arg2: java.lang.Object):  void;

    public  runTimeError(interp: Interpreter, scope: InstanceScope, error: ErrorType, arg: java.lang.Object, arg2: java.lang.Object, arg3: java.lang.Object):  void;
public runTimeError(...args: unknown[]):  void {
		switch (args.length) {
			case 3: {
				const [interp, scope, error] = args as [Interpreter, InstanceScope, ErrorType];


        this.listener.runTimeError(new  STRuntimeMessage(interp, error, scope !== null ? scope.ip : 0, scope));
    

				break;
			}

			case 4: {
				const [interp, scope, error, arg] = args as [Interpreter, InstanceScope, ErrorType, java.lang.Object];


        this.listener.runTimeError(new  STRuntimeMessage(interp, error, scope !== null ? scope.ip : 0, scope,arg));
    

				break;
			}

			case 5: {
				const [interp, scope, error, e, arg] = args as [Interpreter, InstanceScope, ErrorType, Throwable, java.lang.Object];


        this.listener.runTimeError(new  STRuntimeMessage(interp, error, scope !== null ? scope.ip : 0, scope,e,arg));
    

				break;
			}

			case 5: {
				const [interp, scope, error, arg, arg2] = args as [Interpreter, InstanceScope, ErrorType, java.lang.Object, java.lang.Object];


        this.listener.runTimeError(new  STRuntimeMessage(interp, error, scope !== null ? scope.ip : 0, scope,null,arg,arg2));
    

				break;
			}

			case 6: {
				const [interp, scope, error, arg, arg2, arg3] = args as [Interpreter, InstanceScope, ErrorType, java.lang.Object, java.lang.Object, java.lang.Object];


        this.listener.runTimeError(new  STRuntimeMessage(interp, error, scope !== null ? scope.ip : 0, scope,null,arg,arg2,arg3));
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  IOError(self: ST, error: ErrorType, e: Throwable):  void;

    public  IOError(self: ST, error: ErrorType, e: Throwable, arg: java.lang.Object):  void;
public IOError(...args: unknown[]):  void {
		switch (args.length) {
			case 3: {
				const [self, error, e] = args as [ST, ErrorType, Throwable];


        this.listener.IOError(new  STMessage(error, self, e));
    

				break;
			}

			case 4: {
				const [self, error, e, arg] = args as [ST, ErrorType, Throwable, java.lang.Object];


        this.listener.IOError(new  STMessage(error, self, e, arg));
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  internalError(self: ST, msg: String, e: Throwable):  void {
        this.listener.internalError(new  STMessage(ErrorType.INTERNAL_ERROR, self, e, msg));
    }

    private  sourceName(t: Token):  String {
        let  input = t.getInputStream();
        if ( input===null ) {
            return null;
        }
        let  srcName = input.getSourceName();
        if ( srcName!==null ) {
            srcName = Misc.getFileName(srcName);
        }
        return srcName;
    }
}
