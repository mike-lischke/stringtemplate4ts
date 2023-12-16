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



import { java, JavaObject, type int, type char, S } from "jree";
import { AttributeRenderer } from "./AttributeRenderer.js";



/** This render knows to perform a few format operations on {@link String} objects:
 * <ul>
 *  <li>{@code upper}: Convert to upper case.</li>
 *  <li>{@code lower}: Convert to lower case.</li>
 *  <li>{@code cap}: Convert first character to upper case.</li>
 *  <li>{@code url-encode}:</li>
 *  <li>{@code xml-encode}:</li>
 * </ul>
 */
export  class StringRenderer extends JavaObject implements AttributeRenderer<Object> {

    public static  escapeHTML(s: string):  string {
        if ( s===null ) {
            return null;
        }
        let  buf = new  java.lang.StringBuilder( s.length() );
        let  len = s.length();
        for (let  i=0; i<len;) {
            let  c = s.codePointAt(i);
            switch ( c ) {
                case '&' :{
                    buf.append("&amp;");
                    break;
}

                case '<' :{
                    buf.append("&lt;");
                    break;
}

                case '>' :{
                    buf.append("&gt;");
                    break;
}

                case '\r':
                case '\n':
                case '\t':{
                    buf.append(c as char);
                    break;
}

                default:{
                    let  control = c < ' '; // 32
                    let  aboveASCII = c > 126;
                    if ( control || aboveASCII ) {
                        buf.append("&#");
                        buf.append(c);
                        buf.append(";");
                    }
                    else {
                        buf.append(c as char);
                    }
}

            }
            i += java.lang.Character.charCount(c);
        }
        return buf.toString();
    }
    // accepts Object for backward compatibility,
    // but fails when value is not a String at runtime

    public override  toString(value: Object, formatString: string, locale: Intl.Locale):  string;

    // trim(s) and strlen(s) built-in funcs; these are format options
    public override  toString(value: string, formatString: string, locale: Intl.Locale):  string;
public override toString(...args: unknown[]):  string {
		switch (args.length) {
			case 3: {
				const [value, formatString, locale] = args as [Object, string, Intl.Locale];


        return this.toString(String( value), formatString, locale);
    

				break;
			}

			case 3: {
				const [value, formatString, locale] = args as [string, string, Intl.Locale];


        if ( formatString===null ) {
 return value;
}

        if ( formatString.equals("upper") ) {
 return value.toUpperCase(locale);
}

        if ( formatString.equals("lower") ) {
 return value.toLowerCase(locale);
}

        if ( formatString.equals("cap") ) {
            return (value.length() > 0) ? java.lang.Character.toUpperCase(value.charAt(0))+value.substring(1) : value;
        }
        if ( formatString.equals("url-encode") ) {
            try {
                return java.net.URLEncoder.encode(value, "UTF-8");
            } catch (ex) {
if (ex instanceof java.io.UnsupportedEncodingException) {
                // UTF-8 is standard, should always be available
            } else {
	throw ex;
	}
}
        }
        if ( formatString.equals("xml-encode") ) {
            return StringRenderer.escapeHTML(value);
        }
        return string.format(locale, formatString, value);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}

}
