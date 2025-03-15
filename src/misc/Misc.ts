/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-param, jsdoc/require-returns */

import * as os from "os";

import { Coordinate } from "./Coordinate.js";
import { basename, extname } from "../support/helpers.js";

export class Misc {
    public static readonly newLine = os.EOL;

    /**
      Makes it clear when a comparison is intended as reference equality.
     */
    public static referenceEquals(x: unknown, y: unknown): boolean {
        return x === y;
    }

    /**
     * Strip a single newline character from the front of {@code s}.
     */
    public static trimOneStartingNewline(s: string): string {
        if (s.startsWith("\r\n")) {
            s = s.substring(2);
        }

        else {
            if (s.startsWith("\n")) {
                s = s.substring(1);
            }

        }

        return s;
    }

    /**
     * Strip a single newline character from the end of {@code s}.
     */
    public static trimOneTrailingNewline(s: string): string {
        if (s.endsWith("\r\n")) {
            s = s.substring(0, s.length - 2);
        } else {
            if (s.endsWith("\n")) {
                s = s.substring(0, s.length - 1);
            }
        }

        return s;
    }

    /**
     * Given, say, {@code file:/tmp/test.jar!/org/foo/templates/main.stg}
     *  convert to {@code file:/tmp/test.jar!/org/foo/templates}
     */
    public static stripLastPathElement(f: string): string {
        const slash = f.lastIndexOf("/");
        if (slash < 0) {
            return f;
        }

        return f.substring(0, slash);
    }

    public static getFileNameNoSuffix(f: string): string {
        return basename(f, extname(f));
    }

    public static getFileName(fullFileName: string): string {
        return basename(fullFileName);
    }

    public static getParent(name?: string): string | undefined {
        if (!name) {
            return undefined;
        }

        const lastSlash = name.lastIndexOf("/");
        if (lastSlash > 0) {
            return name.substring(0, lastSlash);
        }

        if (lastSlash === 0) {
            return "/";
        }

        return "";
    }

    public static getPrefix(name?: string): string {
        if (!name) {
            return "/";
        }

        const parent = Misc.getParent(name);
        let prefix = parent ?? "";
        if (!parent?.endsWith("/")) {
            prefix += "/";
        }

        return prefix;
    }

    public static replaceEscapes(s: string): string {
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
    public static replaceEscapedRightAngle(s: string): string {
        let buf = "";
        let i = 0;
        while (i < s.length) {
            const c = s.charAt(i);
            if (c === "<" && s.startsWith("<\\\\>", i)) {
                buf += "<\\\\>";
                i += "<\\\\>".length;
                continue;
            }

            if (c === ">" && s.startsWith(">\\>", i)) {
                buf += ">>";
                i += ">\\>".length;
                continue;
            }

            if (c === "\\" && s.startsWith("\\>", i) &&
                !s.startsWith("\\>>>", i)) {
                buf += ">";
                i += "\\>".length;
                continue;
            }

            buf += c;
            i++;
        }

        return buf;
    }

    /**
     * Given {@code index} into string {@code s}, compute the line and char
     * position in line.
     */
    public static getLineCharPosition(s: string, index: number): Coordinate {
        let line = 1;
        let charPos = 0;
        let p = 0;
        while (p < index) { // don't care about s[index] itself; count before
            if (s.charAt(p) === "\n") {
                line++; charPos = 0;
            } else {
                charPos++;
            }

            p++;
        }

        return new Coordinate(line, charPos);
    }

    public static strip(s: string | undefined | null, n: number): string {
        if (!s) {
            return "";
        }

        return s.substring(n, s.length - n);
    }
}
