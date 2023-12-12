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
import { AttributeRenderer } from "./AttributeRenderer.js";

type String = java.lang.String;
const String = java.lang.String;
type Integer = java.lang.Integer;
const Integer = java.lang.Integer;
type DateFormat = java.text.DateFormat;
const DateFormat = java.text.DateFormat;
type SimpleDateFormat = java.text.SimpleDateFormat;
const SimpleDateFormat = java.text.SimpleDateFormat;



/**
 * A renderer for {@link Date} and {@link Calendar} objects. It understands a
 * variety of format names as shown in {@link #formatToInt} field. By default it
 * assumes {@code "short"} format. A prefix of {@code "date:"} or
 * {@code "time:"} shows only those components of the time object.
 */
// using <Object> because this can handle Date and Calendar objects, which don't have a common supertype.
export  class DateRenderer extends JavaObject implements AttributeRenderer<java.lang.Object> {
    public static readonly  formatToInt:  java.util.Map<String, Integer>;

    @Override
public override  toString(value: java.lang.Object, formatString: String, locale: java.util.Locale):  String {
        let  d: java.util.Date;
        if ( formatString===null ) {
 formatString = "short";
}

        if ( value instanceof java.util.Calendar ) {
 d = (value as java.util.Calendar).getTime();
}

        else {
 d = value as java.util.Date;
}

        let  styleI = DateRenderer.formatToInt.get(formatString);
        let  f: DateFormat;
        if ( styleI===null ) {
 f = new  SimpleDateFormat(formatString, locale);
}

        else {
            let  style = styleI.intValue();
            if ( formatString.startsWith("date:") ) {
 f = DateFormat.getDateInstance(style, locale);
}

            else {
 if ( formatString.startsWith("time:") ) {
 f = DateFormat.getTimeInstance(style, locale);
}

            else {
 f = DateFormat.getDateTimeInstance(style, style, locale);
}

}

        }
        return f.format(d);
    }

     static {
         let  map = new  java.util.HashMap<String, Integer>();

        map.put("short", DateFormat.SHORT);
        map.put("medium", DateFormat.MEDIUM);
        map.put("long", DateFormat.LONG);
        map.put("full", DateFormat.FULL);

        map.put("date:short", DateFormat.SHORT);
        map.put("date:medium", DateFormat.MEDIUM);
        map.put("date:long", DateFormat.LONG);
        map.put("date:full", DateFormat.FULL);

        map.put("time:short", DateFormat.SHORT);
        map.put("time:medium", DateFormat.MEDIUM);
        map.put("time:long", DateFormat.LONG);
        map.put("time:full", DateFormat.FULL);

        DateRenderer.formatToInt = java.util.Collections.unmodifiableMap(map);
    }
}
