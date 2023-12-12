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



import { java, JavaObject, type int } from "jree";

type LinkedHashMap<K,​V> = java.util.LinkedHashMap<K,​V>;
const LinkedHashMap = java.util.LinkedHashMap;
type String = java.lang.String;
const String = java.lang.String;
type Integer = java.lang.Integer;
const Integer = java.lang.Integer;



/** A unique set of strings where we can get a string's index.
 *  We can also get them back out in original order. 
 */
export  class StringTable extends JavaObject {
    protected  table = new  LinkedHashMap<String,Integer>();
    protected  i = -1;

    public  add(s: String):  int {
        let  I = this.table.get(s);
        if ( I!==null ) {
 return I;
}

        this.i++;
        this.table.put(s, this.i);
        return this.i;
    }

    public  toArray():  String[] {
        let  a = new  Array<String>(this.table.size());
        let  i = 0;
        for (let s of this.table.keySet()) {
 a[i++] = s;
}

        return a;
    }
}
