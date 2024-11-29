/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import path from "path";

import { BaseTest } from "./BaseTest.js";
import { assertEquals } from "./junit.js";

import { AutoIndentWriter, Misc, ST, STGroupFile, StringWriter } from "../src/index.js";
import { Test } from "./decorators.js";

export class TestLineWrap extends BaseTest {
    @Test
    public testLineWrap(): void {
        const templates = "array(values) ::= <<int[] a = { <values; wrap=\"\\n\", separator=\",\"> };>>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("array");
        a?.add("values",
            [3, 9, 20, 2, 1, 4, 6, 32, 5, 6, 77, 888, 2, 1, 6, 32, 5, 6, 77,
                4, 9, 20, 2, 1, 4, 63, 9, 20, 2, 1, 4, 6, 32, 5, 6, 77, 6, 32, 5, 6, 77,
                3, 9, 20, 2, 1, 4, 6, 32, 5, 6, 77, 888, 1, 6, 32, 5]);
        const expecting =
            "int[] a = { 3,9,20,2,1,4,6,32,5,6,77,888," + Misc.newLine +
            "2,1,6,32,5,6,77,4,9,20,2,1,4,63,9,20,2,1," + Misc.newLine +
            "4,6,32,5,6,77,6,32,5,6,77,3,9,20,2,1,4,6," + Misc.newLine +
            "32,5,6,77,888,1,6,32,5 };";

        const sw = new StringWriter();
        const stw = new AutoIndentWriter(sw, Misc.newLine); // force \n as newline
        stw.setLineWidth(40);
        a?.write(stw);
        const result = sw.toString();
        assertEquals(expecting, result);
    }

    @Test
    public testLineWrapAnchored(): void {
        const templates = "array(values) ::= <<int[] a = { <values; anchor, wrap, separator=\",\"> };>>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("array");
        a?.add("values",
            [3, 9, 20, 2, 1, 4, 6, 32, 5, 6, 77, 888, 2, 1, 6, 32, 5, 6, 77,
                4, 9, 20, 2, 1, 4, 63, 9, 20, 2, 1, 4, 6, 32, 5, 6, 77, 6, 32, 5, 6, 77,
                3, 9, 20, 2, 1, 4, 6, 32, 5, 6, 77, 888, 1, 6, 32, 5]);
        const expecting =
            "int[] a = { 3,9,20,2,1,4,6,32,5,6,77,888," + Misc.newLine +
            "            2,1,6,32,5,6,77,4,9,20,2,1,4," + Misc.newLine +
            "            63,9,20,2,1,4,6,32,5,6,77,6," + Misc.newLine +
            "            32,5,6,77,3,9,20,2,1,4,6,32," + Misc.newLine +
            "            5,6,77,888,1,6,32,5 };";
        assertEquals(expecting, a?.render(40));
    }

    @Test
    public testSubtemplatesAnchorToo(): void {
        const templates =
            "array(values) ::= <<{ <values; anchor, separator=\", \"> }>>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const x = new ST("<\\n>{ <stuff; anchor, separator=\",\\n\"> }<\\n>");
        x.groupThatCreatedThisInstance = group;
        x.add("stuff", "1");
        x.add("stuff", "2");
        x.add("stuff", "3");
        const a = group.getInstanceOf("array");
        a?.add("values", ["a", x, "b"]);

        const expecting =
            "{ a, " + Misc.newLine +
            "  { 1," + Misc.newLine +
            "    2," + Misc.newLine +
            "    3 }" + Misc.newLine +
            "  , b }";
        assertEquals(expecting, a?.render(40));
    }

    @Test
    public testFortranLineWrap(): void {
        const templates =
            "func(args) ::= <<       FUNCTION line( <args; wrap=\"\\n      c\", separator=\",\"> )>>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("func");
        a?.add("args",
            ["a", "b", "c", "d", "e", "f"]);
        const expecting =
            "       FUNCTION line( a,b,c,d," + Misc.newLine +
            "      ce,f )";
        assertEquals(expecting, a?.render(30));
    };

    @Test
    public testLineWrapWithDiffAnchor(): void {
        const templates =
            "array(values) ::= <<int[] a = { <{1,9,2,<values; wrap, separator=\",\">}; anchor> };>>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("array");
        a?.add("values",
            [3, 9, 20, 2, 1, 4, 6, 32, 5, 6, 77, 888, 2, 1, 6, 32, 5, 6, 77, 4, 9, 20, 2, 1, 4, 63, 9, 20, 2, 1, 4, 6]);
        const expecting =
            "int[] a = { 1,9,2,3,9,20,2,1,4," + Misc.newLine +
            "            6,32,5,6,77,888,2," + Misc.newLine +
            "            1,6,32,5,6,77,4,9," + Misc.newLine +
            "            20,2,1,4,63,9,20,2," + Misc.newLine +
            "            1,4,6 };";
        assertEquals(expecting, a?.render(30));
    };

    @Test
    public testLineWrapEdgeCase(): void {
        const templates = "duh(chars) ::= \"<chars; wrap={<\\n>}>\"" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("duh");
        a?.add("chars", ["a", "b", "c", "d", "e"]);
        // lineWidth==3 implies that we can have 3 characters at most
        const expecting =
            "abc" + Misc.newLine +
            "de";
        assertEquals(expecting, a?.render(3));
    };

    @Test
    public testLineWrapLastCharIsNewline(): void {
        const templates =
            "duh(chars) ::= <<" + Misc.newLine +
            "<chars; wrap=\"\\n\"\\>" + Misc.newLine +
            ">>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("duh");
        a?.add("chars", ["a", "b", Misc.newLine, "d", "e"]);
        // don't do \n if it's last element anyway
        const expecting =
            "ab" + Misc.newLine +
            "de";
        assertEquals(expecting, a?.render(3));
    };

    @Test
    public testLineWrapCharAfterWrapIsNewline(): void {
        const templates =
            "duh(chars) ::= <<" + Misc.newLine +
            "<chars; wrap=\"\\n\"\\>" + Misc.newLine +
            ">>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("duh");
        a?.add("chars", ["a", "b", "c", Misc.newLine, "d", "e"]);
        // Once we wrap, we must dump chars as we see them.  A newline right
        // after a wrap is just an "unfortunate" event.  People will expect
        // a newline if it's in the data.
        const expecting =
            "abc" + Misc.newLine +
            "" + Misc.newLine +
            "de";
        assertEquals(expecting, a?.render(3));
    };

    @Test
    public testLineWrapForList(): void {
        const templates = "duh(data) ::= <<!<data; wrap>!>>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("duh");
        a?.add("data", [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const expecting =
            "!123" + Misc.newLine +
            "4567" + Misc.newLine +
            "89!";
        assertEquals(expecting, a?.render(4));
    };

    @Test
    public testLineWrapForAnonTemplate(): void {
        const templates = "duh(data) ::= <<!<data:{v|[<v>]}; wrap>!>>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("duh");
        a?.add("data", [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const expecting =
            "![1][2][3]" + Misc.newLine + // width=9 is the 3 char; don't break til after ]
            "[4][5][6]" + Misc.newLine +
            "[7][8][9]!";
        assertEquals(expecting, a?.render(9));
    };

    @Test
    public testLineWrapForAnonTemplateAnchored(): void {
        const templates = "duh(data) ::= <<!<data:{v|[<v>]}; anchor, wrap>!>>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("duh");
        a?.add("data", [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const expecting =
            "![1][2][3]" + Misc.newLine +
            " [4][5][6]" + Misc.newLine +
            " [7][8][9]!";
        assertEquals(expecting, a?.render(9));
    };

    @Test
    public testLineWrapForAnonTemplateComplicatedWrap(): void {
        const templates =
            "top(s) ::= <<  <s>.>>" +
            "str(data) ::= <<!<data:{v|[<v>]}; wrap=\"!+\\n!\">!>>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const t = group.getInstanceOf("top");
        const s = group.getInstanceOf("str");
        s?.add("data", [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        t?.add("s", s);
        const expecting =
            "  ![1][2]!+" + Misc.newLine +
            "  ![3][4]!+" + Misc.newLine +
            "  ![5][6]!+" + Misc.newLine +
            "  ![7][8]!+" + Misc.newLine +
            "  ![9]!.";
        assertEquals(expecting, t?.render(9));
    };

    @Test
    public testIndentBeyondLineWidth(): void {
        const templates =
            "duh(chars) ::= <<" + Misc.newLine +
            "    <chars; wrap=\"\\n\">" + Misc.newLine +
            ">>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("duh");
        a?.add("chars", ["a", "b", "c", "d", "e"]);
        //
        const expecting =
            "    a" + Misc.newLine +
            "    b" + Misc.newLine +
            "    c" + Misc.newLine +
            "    d" + Misc.newLine +
            "    e";
        assertEquals(expecting, a?.render(2));
    };

    @Test
    public testIndentedExpr(): void {
        const templates =
            "duh(chars) ::= <<" + Misc.newLine +
            "    <chars; wrap=\"\\n\">" + Misc.newLine +
            ">>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("duh");
        a?.add("chars", ["a", "b", "c", "d", "e"]);
        //
        const expecting =
            "    ab" + Misc.newLine +
            "    cd" + Misc.newLine +
            "    e";
        // width=4 spaces + 2 char.
        assertEquals(expecting, a?.render(6));
    };

    @Test
    public testNestedIndentedExpr(): void {
        const templates =
            "top(d) ::= <<  <d>!>>" + Misc.newLine +
            "duh(chars) ::= <<" + Misc.newLine +
            "  <chars; wrap=\"\\n\">" + Misc.newLine +
            ">>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const top = group.getInstanceOf("top");
        const duh = group.getInstanceOf("duh");
        duh?.add("chars", ["a", "b", "c", "d", "e"]);
        top?.add("d", duh);
        const expecting =
            "    ab" + Misc.newLine +
            "    cd" + Misc.newLine +
            "    e!";
        // width=4 spaces + 2 char.
        assertEquals(expecting, top?.render(6));
    };

    @Test
    public testNestedWithIndentAndTrackStartOfExpr(): void {
        const templates =
            "top(d) ::= <<  <d>!>>" + Misc.newLine +
            "duh(chars) ::= <<" + Misc.newLine +
            "x: <chars; anchor, wrap=\"\\n\">" + Misc.newLine +
            ">>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const top = group.getInstanceOf("top");
        const duh = group.getInstanceOf("duh");
        duh?.add("chars", ["a", "b", "c", "d", "e"]);
        top?.add("d", duh);
        //
        const expecting =
            "  x: ab" + Misc.newLine +
            "     cd" + Misc.newLine +
            "     e!";
        assertEquals(expecting, top?.render(7));
    };

    @Test
    public testLineDoesNotWrapDueToLiteral(): void {
        const templates = "m(args,body) ::= <<@Test public voidfoo(<args; wrap=\"\\n\",separator=\", \">) throws " +
            "Ick { <body> }>>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const a = group.getInstanceOf("m");
        a?.add("args",
            ["a", "b", "c"]);
        a?.add("body", "i=3;");
        // make it wrap because of ") throws Ick { " literal
        const n = "@Test public voidfoo(a, b, c".length;
        const expecting = "@Test public voidfoo(a, b, c) throws Ick { i=3; }";
        assertEquals(expecting, a?.render(n));
    };

    @Test
    public testSingleValueWrap(): void {
        const templates = "m(args,body) ::= <<{ <body; anchor, wrap=\"\\n\"> }>>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const m = group.getInstanceOf("m");
        m?.add("body", "i=3;");
        // make it wrap because of ") throws Ick { " literal
        const expecting =
            "{ " + Misc.newLine +
            "  i=3; }";
        assertEquals(expecting, m?.render(2));
    };

    @Test
    public testLineWrapInNestedExpr(): void {
        const templates =
            "top(arrays) ::= <<Arrays: <arrays>done>>" + Misc.newLine +
            "array(values) ::= <%int[] a = { <values; anchor, wrap=\"\\n\", separator=\",\"> };<\\n>%>" + Misc.newLine;
        TestLineWrap.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        const top = group.getInstanceOf("top");
        const a = group.getInstanceOf("array");
        a?.add("values",
            [3, 9, 20, 2, 1, 4, 6, 32, 5, 6, 77, 888, 2, 1, 6, 32, 5, 6, 77,
                4, 9, 20, 2, 1, 4, 63, 9, 20, 2, 1, 4, 6, 32, 5, 6, 77, 6, 32, 5, 6, 77,
                3, 9, 20, 2, 1, 4, 6, 32, 5, 6, 77, 888, 1, 6, 32, 5]);
        top?.add("arrays", a);
        top?.add("arrays", a); // add twice
        const expecting =
            "Arrays: int[] a = { 3,9,20,2,1,4,6,32,5," + Misc.newLine +
            "                    6,77,888,2,1,6,32,5," + Misc.newLine +
            "                    6,77,4,9,20,2,1,4,63," + Misc.newLine +
            "                    9,20,2,1,4,6,32,5,6," + Misc.newLine +
            "                    77,6,32,5,6,77,3,9,20," + Misc.newLine +
            "                    2,1,4,6,32,5,6,77,888," + Misc.newLine +
            "                    1,6,32,5 };" + Misc.newLine +
            "int[] a = { 3,9,20,2,1,4,6,32,5,6,77,888," + Misc.newLine +
            "            2,1,6,32,5,6,77,4,9,20,2,1,4," + Misc.newLine +
            "            63,9,20,2,1,4,6,32,5,6,77,6," + Misc.newLine +
            "            32,5,6,77,3,9,20,2,1,4,6,32," + Misc.newLine +
            "            5,6,77,888,1,6,32,5 };" + Misc.newLine +
            "done";
        assertEquals(expecting, top?.render(40));
    }
}
