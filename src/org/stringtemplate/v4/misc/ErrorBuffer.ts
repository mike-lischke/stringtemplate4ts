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



import { java, JavaObject } from "jree";
import { STMessage } from "./STMessage.js";
import { Misc } from "./Misc.js";
import { ErrorType } from "./ErrorType.js";
import { STErrorListener } from "../STErrorListener.js";

type List<E> = java.util.List<E>;
type ArrayList<E> = java.util.ArrayList<E>;
const ArrayList = java.util.ArrayList;
type String = java.lang.String;
const String = java.lang.String;
type StringBuilder = java.lang.StringBuilder;
const StringBuilder = java.lang.StringBuilder;



/** Used during tests to track all errors. */
export  class ErrorBuffer extends JavaObject implements STErrorListener {
    public  errors = new  ArrayList<STMessage>();

    @Override
public  compileTimeError(msg: STMessage):  void {
        this.errors.add(msg);
    }

    @Override
public  runTimeError(msg: STMessage):  void {
        if ( msg.error !== ErrorType.NO_SUCH_PROPERTY ) { // ignore these
            this.errors.add(msg);
        }
    }

    @Override
public  IOError(msg: STMessage):  void {
        this.errors.add(msg);
    }

    @Override
public  internalError(msg: STMessage):  void {
        this.errors.add(msg);
    }
    @Override
public override  toString():  String {
        let  buf = new  StringBuilder();
        for (let m of this.errors) {
            buf.append(m.toString()+Misc.newline);
        }
        return buf.toString();
    }
}
