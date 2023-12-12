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
import { AttributeRenderer } from "./AttributeRenderer.js";

type String = java.lang.String;
const String = java.lang.String;
type Locale = java.util.Locale;
const Locale = java.util.Locale;
type Formatter = java.util.Formatter;
const Formatter = java.util.Formatter;



/** Works with {@link Byte}, {@link Short}, {@link Integer}, {@link Long}, and {@link BigInteger} as well as
 *  {@link Float}, {@link Double}, and {@link BigDecimal}.  You pass in a format string suitable
 *  for {@link Formatter#format}.
 *  <p>
 *  For example, {@code %10d} emits a number as a decimal int padding to 10 char.
 *  This can even do {@code long} to {@code Date} conversions using the format string.</p>
 */
export  class NumberRenderer extends JavaObject implements AttributeRenderer<java.lang.Object> {
    @Override
public override  toString(value: java.lang.Object, formatString: String, locale: Locale):  String {
        if ( formatString===null ) {
 return value.toString();
}

        let  f = new  Formatter(locale);
        try {
            f.format(formatString, value);
            return f.toString();
        }
        finally {
            f.close();
        }
    }
}
