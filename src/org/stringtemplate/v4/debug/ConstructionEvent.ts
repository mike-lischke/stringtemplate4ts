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

import { JavaObject, java, type int } from "jree";

type Throwable = java.lang.Throwable;
const Throwable = java.lang.Throwable;
type String = java.lang.String;
const String = java.lang.String;
type StackTraceElement = java.lang.StackTraceElement;
const StackTraceElement = java.lang.StackTraceElement;



/** An event that happens when building ST trees, adding attributes etc... */
export  class ConstructionEvent extends JavaObject {
    public  stack:  Throwable;
    public  constructor() { super();
this.stack = new  Throwable(); }

    public  getFileName():  String { return this.getSTEntryPoint().getFileName(); }
    public  getLine():  int { return this.getSTEntryPoint().getLineNumber(); }
    
    public  getSTEntryPoint():  StackTraceElement {
        let  trace = this.stack.getStackTrace();
        for (let e of trace) {
            let  name = e.toString();
            if ( !name.startsWith("org.stringtemplate.v4") ) {
 return e;
}

        }
        return trace[0];
    }
}
