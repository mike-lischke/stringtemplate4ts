/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/no-undefined-types, jsdoc/require-returns , jsdoc/require-param */

import { STWriter } from "./STWriter.js";
import { Writer } from "./support/Writer.js";

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
export class AutoIndentWriter implements STWriter {
    /**
     * Stack of indents. Use {@link List} as it's much faster than {@link Stack}. Grows
     *  from 0..n-1.
     */
    public indents = new Array<string | null>();

    /**
     * Stack of integer anchors (char positions in line); avoid {@link Integer}
     *  creation overhead.
     */
    public anchors: number[] = [];
    public anchors_sp = -1;

    /** {@code \n} or {@code \r\n}? */
    public newline: string;

    public out: Writer;
    public atStartOfLine = true;

    /**
     * Track char position in the line (later we can think about tabs). Indexed
     * from 0. We want to keep {@code charPosition <= }{@link #lineWidth}.
     * This is the position we are <em>about</em> to write, not the position
     * last written to.
     */
    public charPosition = 0;

    /** The absolute char index into the output of the next char to be written. */
    public charIndex = 0;

    public lineWidth = STWriter.NO_WRAP;

    public constructor(out: Writer, newline?: string) {
        this.out = out;
        this.indents.push(null);
        this.newline = newline ?? "\n";
    }

    public setLineWidth(lineWidth: number): void {
        this.lineWidth = lineWidth;
    }

    public pushIndentation(indent: string): void {
        this.indents.push(indent);
    }

    public popIndentation(): string | null {
        return this.indents.pop() ?? null;
    }

    public pushAnchorPoint(): void {
        this.anchors_sp++;
        this.anchors[this.anchors_sp] = this.charPosition;
    }

    public popAnchorPoint(): void {
        this.anchors_sp--;
    }

    public index(): number {
        return this.charIndex;
    }

    /**
     * Write out a string literal or attribute expression or expression element.
     * <p>
     * If doing line wrap, then check {@code wrap} before emitting {@code str}.
     * If at or beyond desired line width then emit a {@link #newline} and any
     * indentation before spitting out {@code str}.</p>
     */
    public write(str: string, wrap?: string): number {
        if (wrap) {
            const n = this.writeWrap(wrap);

            return n + this.write(str);
        }

        let n = 0;
        const nll = this.newline.length;
        const sl = str.length;
        for (let i = 0; i < sl; i++) {
            const c = str.charAt(i);
            // found \n or \r\n newline?
            if (c === "\r") {
                continue;
            }

            if (c === "\n") {
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
            if (this.atStartOfLine) {
                n += this.indent();
                this.atStartOfLine = false;
            }
            n++;
            this.out.write(c);
            this.charPosition++;
            this.charIndex++;
        }

        return n;
    }

    public writeSeparator(str: string): number {
        return this.write(str);
    }

    public writeWrap(wrap: string): number {
        let n = 0;
        // if want wrap and not already at start of line (last char was \n)
        // and we have hit or exceeded the threshold
        if (this.lineWidth !== STWriter.NO_WRAP && !this.atStartOfLine && this.charPosition >= this.lineWidth) {
            // ok to wrap
            // Walk wrap string and look for A\nB.  Spit out A\n
            // then spit indent or anchor, whichever is larger
            // then spit out B.
            for (let i = 0; i < wrap.length; i++) {
                const c = wrap.charAt(i);
                if (c === "\r") {
                    continue;
                } else {
                    if (c === "\n") {
                        this.out.write(this.newline);
                        n += this.newline.length;
                        this.charPosition = 0;
                        this.charIndex += this.newline.length;
                        n += this.indent();
                        // continue writing any chars out
                    } else {  // write A or B part
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

    public indent(): number {
        let n = 0;
        for (const ind of this.indents) {
            if (ind !== null) {
                n += ind.length;
                this.out.write(ind);
            }
        }

        // If current anchor is beyond current indent width, indent to anchor
        // *after* doing indents (might tabs in there or whatever)
        const indentWidth = n;
        if (this.anchors_sp >= 0 && this.anchors[this.anchors_sp] > indentWidth) {
            const remainder = this.anchors[this.anchors_sp] - indentWidth;
            for (let i = 1; i <= remainder; i++) {
                this.out.write(" ");
            }

            n += remainder;
        }

        this.charPosition += n;
        this.charIndex += n;

        return n;
    }
}
