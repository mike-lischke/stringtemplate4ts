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



import { type int, java, S } from "jree";
import { STMessage } from "./STMessage.js";
import { Misc } from "./Misc.js";
import { Interval } from "./Interval.js";
import { ErrorType } from "./ErrorType.js";
import { Coordinate } from "./Coordinate.js";
import { InstanceScope } from "../InstanceScope.js";
import { Interpreter } from "../Interpreter.js";



/** Used to track errors that occur in the ST interpreter. */
export  class STRuntimeMessage extends STMessage {
    /** Where error occurred in bytecode memory. */
    public readonly  ip:  int;
    public readonly  scope:  InstanceScope;
    /** Which interpreter was executing?  If {@code null}, can be IO error or
     *  bad URL etc...
     */
    protected readonly  interp:  Interpreter;
    //List<ST> enclosingStack;

    public  constructor(interp: Interpreter, error: ErrorType, ip: int);
    public  constructor(interp: Interpreter, error: ErrorType, ip: int, scope: InstanceScope);
    public  constructor(interp: Interpreter, error: ErrorType, ip: int, scope: InstanceScope, arg: Object);
    public  constructor(interp: Interpreter, error: ErrorType, ip: int, scope: InstanceScope, e: java.lang.Throwable, arg: Object);
    public  constructor(interp: Interpreter, error: ErrorType, ip: int, scope: InstanceScope, e: java.lang.Throwable, arg: Object, arg2: Object);
    public  constructor(interp: Interpreter, error: ErrorType, ip: int, scope: InstanceScope, e: java.lang.Throwable, arg: Object, arg2: Object, arg3: Object);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 3: {
				const [interp, error, ip] = args as [Interpreter, ErrorType, int];


        this(interp, error, ip, null);
    

				break;
			}

			case 4: {
				const [interp, error, ip, scope] = args as [Interpreter, ErrorType, int, InstanceScope];


        this(interp, error,ip,scope,null);
    

				break;
			}

			case 5: {
				const [interp, error, ip, scope, arg] = args as [Interpreter, ErrorType, int, InstanceScope, Object];


        this(interp, error, ip, scope, null, arg, null);
    

				break;
			}

			case 6: {
				const [interp, error, ip, scope, e, arg] = args as [Interpreter, ErrorType, int, InstanceScope, java.lang.Throwable, Object];


        this(interp, error, ip, scope, e, arg, null);
    

				break;
			}

			case 7: {
				const [interp, error, ip, scope, e, arg, arg2] = args as [Interpreter, ErrorType, int, InstanceScope, java.lang.Throwable, Object, Object];


        this(interp, error, ip, scope, e, arg, arg2, null);
    

				break;
			}

			case 8: {
				const [interp, error, ip, scope, e, arg, arg2, arg3] = args as [Interpreter, ErrorType, int, InstanceScope, java.lang.Throwable, Object, Object, Object];


        super(error, scope !== null ? scope.st : null, e, arg, arg2, arg3);
        this.interp = interp;
        this.ip = ip;
        this.scope = scope;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    /** Given an IP (code location), get it's range in source template then
     *  return it's template line:col.
     */
    public  getSourceLocation():  string {
        if ( this.ip<0 || this.self===null || this.self.impl===null ) {
 return null;
}

        let  I = this.self.impl.sourceMap[this.ip];
        if ( I===null ) {
 return null;
}

        // get left edge and get line/col
        let  i = I.a;
        let  loc = Misc.getLineCharPosition(this.self.impl.template, i);
        return loc.toString();
    }

    public override  toString():  string {
        let  buf = new  java.lang.StringBuilder();
        let  loc = null;
        if ( this.self!==null ) {
            loc = this.getSourceLocation();
            buf.append("context [");
            if ( this.interp!==null ) {
                buf.append( Interpreter.getEnclosingInstanceStackString(this.scope) );
            }
            buf.append("]");
        }
        if ( loc!==null ) {
 buf.append(" "+loc);
}

        buf.append(" "+super.toString());
        return buf.toString();
    }
}
