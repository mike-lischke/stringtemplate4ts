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



import { java, JavaObject, type int, type char } from "jree";
import { Coordinate } from "./Coordinate.js";

type String = java.lang.String;
const String = java.lang.String;
type System = java.lang.System;
const System = java.lang.System;
type Iterator<E> = java.util.Iterator<E>;
type StringBuilder = java.lang.StringBuilder;
const StringBuilder = java.lang.StringBuilder;
type File = java.io.File;
const File = java.io.File;
type URL = java.net.URL;
const URL = java.net.URL;
type URLConnection = java.net.URLConnection;
const URLConnection = java.net.URLConnection;
type InputStream = java.io.InputStream;
const InputStream = java.io.InputStream;
type Throwable = java.lang.Throwable;
const Throwable = java.lang.Throwable;
type IOException = java.io.IOException;
const IOException = java.io.IOException;



export  class Misc extends JavaObject {
    public static readonly  newline = System.getProperty("line.separator");

    /** Makes it clear when a comparison is intended as reference equality.
     */
    public static  referenceEquals(x: java.lang.Object, y: java.lang.Object):  boolean {
        return x === y;
    }

    // Seriously: why isn't this built in to java?
    public static  join(iter: Iterator<unknown>, separator: String):  String {
        let  buf = new  StringBuilder();
        while ( iter.hasNext() ) {
            buf.append(iter.next());
            if ( iter.hasNext() ) {
                buf.append(separator);
            }
        }
        return buf.toString();
    }

//    public static String join(Object[] a, String separator, int start, int stop) {
//        StringBuilder buf = new StringBuilder();
//        for (int i = start; i < stop; i++) {
//            if ( i>start ) buf.append(separator);
//            buf.append(a[i].toString());
//        }
//        return buf.toString();
//    }

    public static  strip(s: String, n: int):  String {
        return s.substring(n, s.length()-n);
    }

//    public static String stripRight(String s, int n) {
//        return s.substring(0, s.length()-n);
//    }

    /** Strip a single newline character from the front of {@code s}. */
    public static  trimOneStartingNewline(s: String):  String {
        if ( s.startsWith("\r\n") ) {
 s = s.substring(2);
}

        else {
 if ( s.startsWith("\n") ) {
 s = s.substring(1);
}

}

        return s;
    }

    /** Strip a single newline character from the end of {@code s}. */
    public static  trimOneTrailingNewline(s: String):  String {
        if ( s.endsWith("\r\n") ) {
 s = s.substring(0, s.length()-2);
}

        else {
 if ( s.endsWith("\n") ) {
 s = s.substring(0, s.length()-1);
}

}

        return s;
    }

    /** Given, say, {@code file:/tmp/test.jar!/org/foo/templates/main.stg}
     *  convert to {@code file:/tmp/test.jar!/org/foo/templates}
     */
    public static  stripLastPathElement(f: String):  String {
        let  slash = f.lastIndexOf('/');
        if ( slash<0 ) {
 return f;
}

        return f.substring(0, slash);
    }

    public static  getFileNameNoSuffix(f: String):  String {
        if (f===null) {
 return null;
}

        f = Misc.getFileName(f);
        return f.substring(0,f.lastIndexOf('.'));
    }

    public static  getFileName(fullFileName: String):  String {
        if (fullFileName===null) {
 return null;
}

        let  f = new  File(fullFileName); // strip to simple name
        return f.getName();
    }

    public static  getParent(name: String):  String {
        //System.out.println("getParent("+name+")="+p);
        if (name===null) {
 return null;
}

        let  lastSlash=name.lastIndexOf('/');
        if (lastSlash>0) {
 return name.substring(0, lastSlash);
}

        if (lastSlash===0) {
 return "/";
}

        //System.out.println("getParent("+name+")="+p);
        return "";
    }

    public static  getPrefix(name: String):  String {
        if (name===null) {
 return "/";
}

        let  parent = Misc.getParent(name);
        let  prefix = parent;
        if ( !parent.endsWith("/") ) {
 prefix += '/';
}

        return prefix;
    }

    public static  replaceEscapes(s: String):  String {
        s = s.replaceAll("\n", "\\\\n");
        s = s.replaceAll("\r", "\\\\r");
        s = s.replaceAll("\t", "\\\\t");
        return s;
    }

    /**
     * Replace &gt;\&gt; with &gt;&gt; in s.
     * <p>
     * Replace \&gt; with &gt; in s, unless prefix of \&gt;&gt;&gt;.
     * <p>
     * Do NOT replace if it's &lt;\\&gt;
     */
    public static  replaceEscapedRightAngle(s: String):  String {
        let  buf = new  StringBuilder();
        let  i = 0;
        while ( i<s.length() ) {
            let  c = s.charAt(i);
            if ( c==='<' && s.startsWith("<\\\\>", i) ) {
                buf.append("<\\\\>");
                i += "<\\\\>".length();
                continue;
            }
            if ( c==='>' && s.startsWith(">\\>", i) ) {
                buf.append(">>");
                i += ">\\>".length();
                continue;
            }
            if ( c==='\\' && s.startsWith("\\>", i) &&
                !s.startsWith("\\>>>", i) )
            {
                buf.append(">");
                i += "\\>".length();
                continue;
            }
            buf.append(c);
            i++;
        }
        return buf.toString();
    }


    public static  urlExists(url: URL):  boolean {
        try {
            // In Spring Boot context the URL can be like this:
            // jar:file:/path/to/myapp.jar!/BOOT-INF/lib/mylib.jar!/org/foo/templates/g.stg
            // This url cannot be processed using standard URLClassLoader
            let  con = url.openConnection();
            let  is = con.getInputStream();
            try {
                is.close();
            } catch (e) {
if (e instanceof Throwable) {
                // Closing the input stream may throw an exception. See bug below. Most probably it was
                // the true reason for this commit: 
                // https://github.com/antlr/stringtemplate4/commit/21484ed46f1b20b2cdaec49f9d5a626fb26a493c             
                // https://bugs.openjdk.java.net/browse/JDK-8080094
//              e.printStackTrace();
            } else {
	throw e;
	}
}
            return true;
        } catch (ioe) {
if (ioe instanceof IOException) {
            return false;
        } else {
	throw ioe;
	}
}
    }

    /**
     * Given {@code index} into string {@code s}, compute the line and char
     * position in line.
     */
    public static  getLineCharPosition(s: String, index: int):  Coordinate {
        let  line = 1;
        let  charPos = 0;
        let  p = 0;
        while ( p < index ) { // don't care about s[index] itself; count before
            if ( s.charAt(p)==='\n' ) { line++; charPos=0; }
            else {
 charPos++;
}

            p++;
        }

        return new  Coordinate(line,charPos);
    }
}