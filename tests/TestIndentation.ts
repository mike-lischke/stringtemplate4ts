/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

import { BaseTest } from "./BaseTest.js";
import { STGroup, STGroupFile, ST, Misc, ErrorManager } from "../src/index.js";
import { assertEquals } from "./junit.js";

import { Test } from "./decorators.js";

export class TestIndentation extends BaseTest {
    @Test
    public testIndentInFrontOfTwoExpr(): void {
        const templates =
            "list(a,b) ::= <<" +
            "  <a><b>" + Misc.newLine +
            ">>" + Misc.newLine;

        TestIndentation.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const t = group.getInstanceOf("list");
        // t?.impl?.dump();
        t?.add("a", "Terence");
        t?.add("b", "Jim");
        const expecting = "  TerenceJim";
        assertEquals(expecting, t?.render());
    }

    @Test
    public testSimpleIndentOfAttributeList(): void {
        const templates =
            "list(names) ::= <<" +
            "  <names; separator=\"\\n\">" + Misc.newLine +
            ">>" + Misc.newLine;

        TestIndentation.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const t = group.getInstanceOf("list");
        t?.add("names", "Terence");
        t?.add("names", "Jim");
        t?.add("names", "Sriram");
        const expecting =
            "  Terence" + Misc.newLine +
            "  Jim" + Misc.newLine +
            "  Sriram";
        assertEquals(expecting, t?.render());
    }

    @Test
    public testIndentOfMultilineAttributes(): void {
        const templates =
            "list(names) ::= <<" +
            "  <names; separator=\"\n\">" + Misc.newLine +
            ">>" + Misc.newLine;
        TestIndentation.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const t = group.getInstanceOf("list");
        t?.add("names", "Terence\nis\na\nmaniac");
        t?.add("names", "Jim");
        t?.add("names", "Sriram\nis\ncool");
        const expecting =
            "  Terence" + Misc.newLine +
            "  is" + Misc.newLine +
            "  a" + Misc.newLine +
            "  maniac" + Misc.newLine +
            "  Jim" + Misc.newLine +
            "  Sriram" + Misc.newLine +
            "  is" + Misc.newLine +
            "  cool";
        assertEquals(expecting, t?.render());
    }

    @Test
    public testIndentOfMultipleBlankLines(): void {
        const templates =
            "list(names) ::= <<" +
            "  <names>" + Misc.newLine +
            ">>" + Misc.newLine;
        TestIndentation.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const t = group.getInstanceOf("list");
        t?.add("names", "Terence\n\nis a maniac");
        const expecting =
            "  Terence" + Misc.newLine +
            "" + Misc.newLine + // no indent on blank line
            "  is a maniac";
        assertEquals(expecting, t?.render());
    }

    @Test
    public testIndentBetweenLeftJustifiedLiterals(): void {
        const templates =
            "list(names) ::= <<" +
            "Before:" + Misc.newLine +
            "  <names; separator=\"\\n\">" + Misc.newLine +
            "after" + Misc.newLine +
            ">>" + Misc.newLine;
        TestIndentation.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const t = group.getInstanceOf("list");
        t?.add("names", "Terence");
        t?.add("names", "Jim");
        t?.add("names", "Sriram");
        const expecting =
            "Before:" + Misc.newLine +
            "  Terence" + Misc.newLine +
            "  Jim" + Misc.newLine +
            "  Sriram" + Misc.newLine +
            "after";
        assertEquals(expecting, t?.render());
    }

    @Test
    public testNestedIndent(): void {
        const templates =
            "method(name,stats) ::= <<" +
            "void <name>() {" + Misc.newLine +
            "\t<stats; separator=\"\\n\">" + Misc.newLine +
            "}" + Misc.newLine +
            ">>" + Misc.newLine +
            "ifstat(expr,stats) ::= <<" + Misc.newLine +
            "if (<expr>) {" + Misc.newLine +
            "  <stats; separator=\"\\n\">" + Misc.newLine +
            "}" +
            ">>" + Misc.newLine +
            "assign(lhs,expr) ::= \"<lhs>=<expr>;\"" + Misc.newLine;
        TestIndentation.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const t = group.getInstanceOf("method");
        t?.add("name", "foo");
        const s1 = group.getInstanceOf("assign");
        s1?.add("lhs", "x");
        s1?.add("expr", "0");
        const s2 = group.getInstanceOf("ifstat");
        s2?.add("expr", "x>0");
        const s2a = group.getInstanceOf("assign");
        s2a?.add("lhs", "y");
        s2a?.add("expr", "x+y");
        const s2b = group.getInstanceOf("assign");
        s2b?.add("lhs", "z");
        s2b?.add("expr", "4");
        s2?.add("stats", s2a);
        s2?.add("stats", s2b);
        t?.add("stats", s1);
        t?.add("stats", s2);
        const expecting =
            "void foo() {" + Misc.newLine +
            "\tx=0;" + Misc.newLine +
            "\tif (x>0) {" + Misc.newLine +
            "\t  y=x+y;" + Misc.newLine +
            "\t  z=4;" + Misc.newLine +
            "\t}" + Misc.newLine +
            "}";
        assertEquals(expecting, t?.render());
    }

    @Test
    public testIndentedIFWithValueExpr(): void {
        const t = new ST(
            "begin" + Misc.newLine +
            "    <if(x)>foo<endif>" + Misc.newLine +
            "end" + Misc.newLine);
        t.add("x", "x");
        const expecting = "begin" + Misc.newLine + "    foo" + Misc.newLine + "end" + Misc.newLine;
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testIndentedIFWithElse(): void {
        const t = new ST(
            "begin" + Misc.newLine +
            "    <if(x)>foo<else>bar<endif>" + Misc.newLine +
            "end" + Misc.newLine);
        t.add("x", "x");
        const expecting = "begin" + Misc.newLine + "    foo" + Misc.newLine + "end" + Misc.newLine;
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testIndentedIFWithElse2(): void {
        const t = new ST(
            "begin" + Misc.newLine +
            "    <if(x)>foo<else>bar<endif>" + Misc.newLine +
            "end" + Misc.newLine);
        t.add("x", false);
        const expecting = "begin" + Misc.newLine + "    bar" + Misc.newLine + "end" + Misc.newLine;
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testIndentedIFWithNewlineBeforeText(): void {
        const group = new STGroup();
        group.defineTemplate("t", "x",
            "begin" + Misc.newLine +
            "    <if(x)>\n" +
            "foo\n" +  // no indent; ignore IF indent
            "    <endif>" + Misc.newLine +    // ignore indent on if-tags on line by themselves
            "end" + Misc.newLine);
        const t = group.getInstanceOf("t");
        t?.add("x", "x");
        const expecting = "begin" + Misc.newLine + "foo" + Misc.newLine + "end";
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testIndentedIFWithEndifNextLine(): void {
        const group = new STGroup();
        group.defineTemplate("t", "x",
            "begin" + Misc.newLine +
            "    <if(x)>foo\n" +      // use indent and keep newline
            "    <endif>" + Misc.newLine +    // ignore indent on if-tags on line by themselves
            "end" + Misc.newLine);
        const t = group.getInstanceOf("t");
        t?.add("x", "x");
        const expecting = "begin" + Misc.newLine + "    foo" + Misc.newLine + "end";
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testIFWithIndentOnMultipleLines(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;

        const t = new ST(
            "begin" + Misc.newLine +
            "   <if(x)>" + Misc.newLine +
            "   foo" + Misc.newLine +
            "   <else>" + Misc.newLine +
            "   bar" + Misc.newLine +
            "   <endif>" + Misc.newLine +
            "end" + Misc.newLine);
        const expecting = "begin" + Misc.newLine + "   bar" + Misc.newLine + "end" + Misc.newLine;
        const result = t?.render();
        assertEquals(expecting, result);

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testIFWithIndentAndExprOnMultipleLines(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;

        const t = new ST(
            "begin" + Misc.newLine +
            "   <if(x)>" + Misc.newLine +
            "   <x>" + Misc.newLine +
            "   <else>" + Misc.newLine +
            "   <y>" + Misc.newLine +
            "   <endif>" + Misc.newLine +
            "end" + Misc.newLine);
        t.add("y", "y");
        const expecting = "begin" + Misc.newLine + "   y" + Misc.newLine + "end" + Misc.newLine;
        const result = t?.render();
        assertEquals(expecting, result);

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testIFWithIndentAndExprWithIndentOnMultipleLines(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;

        const t = new ST(
            "begin" + Misc.newLine +
            "   <if(x)>" + Misc.newLine +
            "     <x>" + Misc.newLine +
            "   <else>" + Misc.newLine +
            "     <y>" + Misc.newLine +
            "   <endif>" + Misc.newLine +
            "end" + Misc.newLine);
        t.add("y", "y");
        const expecting = "begin" + Misc.newLine + "     y" + Misc.newLine + "end" + Misc.newLine;
        const result = t?.render();
        assertEquals(expecting, result);

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testNestedIFWithIndentOnMultipleLines(): void {
        const t = new ST(
            "begin" + Misc.newLine +
            "   <if(x)>" + Misc.newLine +
            "      <if(y)>" + Misc.newLine +
            "      foo" + Misc.newLine +
            "      <endif>" + Misc.newLine +
            "   <else>" + Misc.newLine +
            "      <if(z)>" + Misc.newLine +
            "      foo" + Misc.newLine +
            "      <endif>" + Misc.newLine +
            "   <endif>" + Misc.newLine +
            "end" + Misc.newLine);
        t.add("x", "x");
        t.add("y", "y");
        const expecting = "begin" + Misc.newLine + "      foo" + Misc.newLine + "end" + Misc.newLine; // no indent
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testIFInSubtemplate(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;

        const t = new ST(
            "<names:{n |" + Misc.newLine +
            "   <if(x)>" + Misc.newLine +
            "   <x>" + Misc.newLine +
            "   <else>" + Misc.newLine +
            "   <y>" + Misc.newLine +
            "   <endif>" + Misc.newLine +
            "}>" + Misc.newLine);
        t.add("names", "Ter");
        t.add("y", "y");
        const expecting = "   y" + Misc.newLine + Misc.newLine;
        const result = t?.render();
        assertEquals(expecting, result);

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

}
