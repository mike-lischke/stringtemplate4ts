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



import { type int, java } from "jree";
import { InterpEvent } from "./InterpEvent.js";
import { InstanceScope } from "../InstanceScope.js";

type String = java.lang.String;
const String = java.lang.String;



export  class EvalExprEvent extends InterpEvent {
    /** Index of first char in template. */
    public readonly  exprStartChar:  int;
    /** Index of last char in template (inclusive). */
    public readonly  exprStopChar:  int;
    public readonly  expr:  String;
    public  constructor(scope: InstanceScope, start: int, stop: int,
                         exprStartChar: int, exprStopChar: int)
    {
        super(scope, start, stop);
        this.exprStartChar = exprStartChar;
        this.exprStopChar = exprStopChar;
        if ( exprStartChar >=0 && exprStopChar >=0 ) {
            this.expr = scope.st.impl.template.substring(exprStartChar, exprStopChar +1);
        }
        else {
            this.expr = "";
        }
    }

    @Override
public override  toString():  String {
        return $outer.getClass().getSimpleName()+"{" +
               "self=" + this.scope.st +
               ", expr='" + this.expr + '\'' +
               ", exprStartChar=" + this.exprStartChar +
               ", exprStopChar=" + this.exprStopChar +
               ", start=" + this.outputStartChar +
               ", stop=" + this.outputStopChar +
               '}';
    }

}
