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
import { STWriter } from "./STWriter.js";

type List<E> = java.util.List<E>;
type String = java.lang.String;
const String = java.lang.String;
type ArrayList<E> = java.util.ArrayList<E>;
const ArrayList = java.util.ArrayList;
type Writer = java.io.Writer;
const Writer = java.io.Writer;
type System = java.lang.System;
const System = java.lang.System;



/**
 * Essentially a char filter that knows how to auto-indent output by maintaining
 * a stack of indent levels.
 * <p>
 * The indent stack is a stack of strings so we can repeat original indent not
 * just the same number of columns (don't have to worry about tabs vs spaces
 * then). Anchors are char positions (tabs won't work) that indicate where all
 * future wraps should justify to. The wrap position is actually the larger of
 * either the last anchor or the indentation level.</p>
 * <p>
 * This is a filter on a {@link Writer}.</p>
 * <p>
 * {@code \n} is the proper way to say newline for options and templates.
 * Templates can mix {@code \r\n} and {@code \n} them, but use {@code \n} in
 * options like {@code wrap="\n"}. This writer will render newline characters
 * according to {@link #newline}. The default value is taken from the
 * {@code line.separator} system property, and can be overridden by passing in a
 * {@code String} to the appropriate constructor.</p>
 */
export  class AutoIndentWriter extends JavaObject implements STWriter {
    /** Stack of indents. Use {@link List} as it's much faster than {@link Stack}. Grows
     *  from 0..n-1.
     */
    public  indents = new  ArrayList<String>();

    /** Stack of integer anchors (char positions in line); avoid {@link Integer}
     *  creation overhead.
     */
    public  anchors = new  Int32Array(10);
    public  anchors_sp = -1;

    /** {@code \n} or {@code \r\n}? */
    public  newline:  String;

    public  out = null;
    public  atStartOfLine = true;

    /**
     * Track char position in the line (later we can think about tabs). Indexed
     * from 0. We want to keep {@code charPosition <= }{@link #lineWidth}.
     * This is the position we are <em>about</em> to write, not the position
     * last written to.
     */
    public  charPosition = 0;

    /** The absolute char index into the output of the next char to be written. */
    public  charIndex = 0;

    public  lineWidth = STWriter.NO_WRAP;

    public  constructor(out: Writer);

    public  constructor(out: Writer, newline: String);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 1: {
				const [out] = args as [Writer];


        this(out, System.getProperty("line.separator"));
    

				break;
			}

			case 2: {
				const [out, newline] = args as [Writer, String];


        super();
this.out = out;
        this.indents.add(null); // s oftart with no indent
        this.newline = newline;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    @Override
public  setLineWidth(lineWidth: int):  void {
        this.lineWidth = lineWidth;
    }

    @Override
public  pushIndentation(indent: String):  void {
        this.indents.add(indent);
    }

    @Override
public  popIndentation():  String {
        return this.indents.remove(this.indents.size()-1);
    }

    @Override
public  pushAnchorPoint():  void {
        if ( (this.anchors_sp +1)>=this.anchors.length ) {
            let  a = new  Int32Array(this.anchors.length*2);
            System.arraycopy(this.anchors, 0, a, 0, this.anchors.length-1);
            this.anchors = a;
        }
        this.anchors_sp++;
        this.anchors[this.anchors_sp] = this.charPosition;
    }

    @Override
public  popAnchorPoint():  void {
        this.anchors_sp--;
    }

    @Override
public  index():  int { return this.charIndex; }

    /** Write out a string literal or attribute expression or expression element. */
    @Override
public  write(str: String):  int;

    /**
     * Write out a string literal or attribute expression or expression element.
     * <p>
     * If doing line wrap, then check {@code wrap} before emitting {@code str}.
     * If at or beyond desired line width then emit a {@link #newline} and any
     * indentation before spitting out {@code str}.</p>
     */
    @Override
public  write(str: String, wrap: String):  int;
public write(...args: unknown[]):  int {
		switch (args.length) {
			case 1: {
				const [str] = args as [String];


        let  n = 0;
        let  nll = this.newline.length();
        let  sl = str.length();
        for (let  i=0; i<sl; i++) {
            let  c = str.charAt(i);
            // found \n or \r\n newline?
            if ( c==='\r' ) {
 continue;
}

            if ( c==='\n' ) {
                this.atStartOfLine = true;
                this.charPosition = -nll; // set so the write below sets to 0
                this.out.write(this.newline);
                n += nll;
                this.charIndex += nll;
                this.charPosition += n; // wrote n more char
                continue;
            }
            // normal character
            // check to see if we are at the start of a line; need indent if so
            if ( this.atStartOfLine ) {
                n+=this.indent();
                this.atStartOfLine = false;
            }
            n++;
            this.out.write(c);
            this.charPosition++;
            this.charIndex++;
        }
        return n;
    

				break;
			}

			case 2: {
				const [str, wrap] = args as [String, String];


        let  n = this.writeWrap(wrap);
        return n + this.write(str);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    @Override
public  writeSeparator(str: String):  int {
        return this.write(str);
    }

    @Override
public  writeWrap(wrap: String):  int {
        let  n = 0;
        // if want wrap and not already at start of line (last char was \n)
        // and we have hit or exceeded the threshold
        if ( this.lineWidth!==STWriter.NO_WRAP && wrap!==null && !this.atStartOfLine &&
             this.charPosition >= this.lineWidth )
        {
            // ok to wrap
            // Walk wrap string and look for A\nB.  Spit out A\n
            // then spit indent or anchor, whichever is larger
            // then spit out B.
            for (let  i=0; i<wrap.length(); i++) {
                let  c = wrap.charAt(i);
                if ( c==='\r' ) {
                    continue;
                } else {
 if ( c==='\n' ) {
                    this.out.write(this.newline);
                    n += this.newline.length();
                    this.charPosition = 0;
                    this.charIndex += this.newline.length();
                    n += this.indent();
                    // continue writing any chars out
                }
                else {  // write A or B part
                    n++;
                    this.out.write(c);
                    this.charPosition++;
                    this.charIndex++;
                }
}

            }
        }
        return n;
    }

    public  indent():  int {
        let  n = 0;
        for (let ind of this.indents) {
            if (ind !== null) {
                n += ind.length();
                this.out.write(ind);
            }
        }

        // If current anchor is beyond current indent width, indent to anchor
        // *after* doing indents (might tabs in there or whatever)
        let  indentWidth = n;
        if ( this.anchors_sp>=0 && this.anchors[this.anchors_sp]>indentWidth ) {
            let  remainder = this.anchors[this.anchors_sp]-indentWidth;
            for (let  i=1; i<=remainder; i++) {
 this.out.write(' ');
}

            n += remainder;
        }

        this.charPosition += n;
        this.charIndex += n;
        return n;
    }
}
