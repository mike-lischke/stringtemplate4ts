/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import path from "path";

import { BaseTest } from "./BaseTest.js";
import { assertEquals, assertNotNull } from "./junit.js";
import { Misc, STGroupFile, ErrorBuffer, STGroupString } from "../src/index.js";

import { Test } from "./decorators.js";

export class TestGroupSyntax extends BaseTest {
    @Test
    public testSimpleGroup(): void {
        const templates = "t() ::= <<foo>>" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const expected =
            "t() ::= <<" + Misc.newLine +
            "foo" + Misc.newLine +
            ">>" + Misc.newLine;
        const result = group.show();
        assertEquals(expected, result);
    }

    @Test
    public testEscapedQuote(): void {
        // setTest(ranges) ::= "<ranges; separator=\"||\">"
        // has to unescape the strings.
        const templates = "setTest(ranges) ::= \"<ranges; separator=\\\"||\\\">\"" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const expected =
            "setTest(ranges) ::= <<" + Misc.newLine +
            "<ranges; separator=\"||\">" + Misc.newLine +
            ">>" + Misc.newLine;
        const result = group.show();
        assertEquals(expected, result);
    }

    @Test
    public testMultiTemplates(): void {
        const templates =
            "ta(x) ::= \"[<x>]\"" + Misc.newLine +
            "duh() ::= <<hi there>>" + Misc.newLine +
            "wow() ::= <<last>>" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const expected =
            "ta(x) ::= <<" + Misc.newLine +
            "[<x>]" + Misc.newLine +
            ">>" + Misc.newLine +
            "duh() ::= <<" + Misc.newLine +
            "hi there" + Misc.newLine +
            ">>" + Misc.newLine +
            "wow() ::= <<" + Misc.newLine +
            "last" + Misc.newLine +
            ">>" + Misc.newLine;
        const result = group.show();
        assertEquals(expected, result);
    }

    @Test
    public testSetDefaultDelimiters(): void {
        const templates =
            "delimiters \"<\", \">\"" + Misc.newLine +
            "ta(x) ::= \"[<x>]\"" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        const st = group.getInstanceOf("ta");
        st?.add("x", "hi");
        const expected = "[hi]";
        const result = st?.render();
        assertEquals(expected, result);

        assertEquals("[]", errors.toString());
    }

    /**
     * This is a regression test for antlr/stringtemplate4#131.
     */
    @Test
    public testSetDefaultDelimitersSTGroupString(): void {
        const templates =
            "delimiters \"<\", \">\"" + Misc.newLine +
            "chapter(title) ::= <<" + Misc.newLine +
            "chapter <title>" + Misc.newLine +
            ">>" + Misc.newLine;

        const errors = new ErrorBuffer();
        const group = new STGroupString(templates);
        group.setListener(errors);
        const st = group.getInstanceOf("chapter");
        st?.add("title", "hi");
        const expected = "chapter hi";
        const result = st?.render();
        assertEquals(expected, result);

        assertEquals("[]", errors.toString());
    }

    @Test
    public testSetNonDefaultDelimiters(): void {
        const templates =
            "delimiters \"%\", \"%\"" + Misc.newLine +
            "ta(x) ::= \"[%x%]\"" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("ta");
        st?.add("x", "hi");
        const expected = "[hi]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    /**
     * This is a regression test for antlr/stringtemplate4#84.
     */
    @Test
    public testSetUnsupportedDelimitersAt(): void {
        const templates =
            "delimiters \"@\", \"@\"" + Misc.newLine +
            "ta(x) ::= \"[<x>]\"" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        const st = group.getInstanceOf("ta");
        st?.add("x", "hi");
        const expected = "[hi]";
        const result = st?.render();
        assertEquals(expected, result);

        const expectedErrors = "[t.stg 1:11: unsupported delimiter character: @, "
            + "t.stg 1:16: unsupported delimiter character: @]";
        const resultErrors = errors.toString();
        assertEquals(expectedErrors, resultErrors);
    }

    @Test
    public testSingleTemplateWithArgs(): void {
        const templates = "t(a,b) ::= \"[<a>]\"" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const expected =
            "t(a,b) ::= <<" + Misc.newLine +
            "[<a>]" + Misc.newLine +
            ">>" + Misc.newLine;
        const result = group.show();
        assertEquals(expected, result);
    }

    @Test
    public testDefaultValues(): void {
        const templates = "t(a={def1},b=\"def2\") ::= \"[<a>]\"" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const expected =
            "t(a={def1},b=\"def2\") ::= <<" + Misc.newLine +
            "[<a>]" + Misc.newLine +
            ">>" + Misc.newLine;
        const result = group.show();
        assertEquals(expected, result);
    }

    @Test
    public testDefaultValues2(): void {
        const templates = "t(x, y, a={def1}, b=\"def2\") ::= \"[<a>]\"" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const expected =
            "t(x,y,a={def1},b=\"def2\") ::= <<" + Misc.newLine +
            "[<a>]" + Misc.newLine +
            ">>" + Misc.newLine;
        const result = group.show();
        assertEquals(expected, result);
    }

    @Test
    public testDefaultValueTemplateWithArg(): void {
        const templates = "t(a={x | 2*<x>}) ::= \"[<a>]\"" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const expected =
            "t(a={x | 2*<x>}) ::= <<" + Misc.newLine +
            "[<a>]" + Misc.newLine +
            ">>" + Misc.newLine;
        const result = group.show();
        assertEquals(expected, result);
    }

    @Test
    public testDefaultValueBehaviorTrue(): void {
        const templates =
            "t(a=true) ::= <<\n" +
            "<a><if(a)>+<else>-<endif>\n" +
            ">>\n";

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("t");
        const expected = "true+";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefaultValueBehaviorFalse(): void {
        const templates =
            "t(a=false) ::= <<\n" +
            "<a><if(a)>+<else>-<endif>\n" +
            ">>\n";

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("t");
        const expected = "false-";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefaultValueBehaviorEmptyTemplate(): void {
        const templates =
            "t(a={}) ::= <<\n" +
            "<a><if(a)>+<else>-<endif>\n" +
            ">>\n";

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("t");
        const expected = "+";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefaultValueBehaviorEmptyList(): void {
        const templates =
            "t(a=[]) ::= <<\n" +
            "<a><if(a)>+<else>-<endif>\n" +
            ">>\n";

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("t");
        const expected = "-";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testNestedTemplateInGroupFile(): void {
        const templates =
            "t(a) ::= \"<a:{x | <x:{y | <y>}>}>\"" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const expected =
            "t(a) ::= <<" + Misc.newLine +
            "<a:{x | <x:{y | <y>}>}>" + Misc.newLine +
            ">>" + Misc.newLine;
        const result = group.show();
        assertEquals(expected, result);
    }

    @Test
    public testNestedDefaultValueTemplate(): void {
        const templates =
            "t(a={x | <x:{y|<y>}>}) ::= \"ick\"" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.load();
        const expected =
            "t(a={x | <x:{y|<y>}>}) ::= <<" + Misc.newLine +
            "ick" + Misc.newLine +
            ">>" + Misc.newLine;
        const result = group.show();
        assertEquals(expected, result);
    }

    @Test
    public testNestedDefaultValueTemplateWithEscapes(): void {
        const templates = "t(a={x | \\< <x:{y|<y>\\}}>}) ::= \"[<a>]\"" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const expected =
            "t(a={x | \\< <x:{y|<y>\\}}>}) ::= <<" + Misc.newLine +
            "[<a>]" + Misc.newLine +
            ">>" + Misc.newLine;
        const result = group.show();
        assertEquals(expected, result);
    }

    @Test
    public testMessedUpTemplateDoesntCauseRuntimeError(): void {
        const templates =
            "main(p) ::= <<\n" +
            "<f(x=\"abc\")>\n" +
            ">>\n" +
            "\n" +
            "f() ::= <<\n" +
            "<x>\n" +
            ">>\n";
        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        const st = group.getInstanceOf("main");
        st?.render();

        const expected = "[context [/main] 1:1 attribute x isn't defined," +
            " context [/main] 1:1 passed 1 arg(s) to template /f with 0 declared arg(s)," +
            " context [/main /f] 1:1 attribute x isn't defined]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    /**
     * This is a regression test for antlr/stringtemplate4#138.
     */
    @Test
    public testIndentedComment(): void {
        const templates =
            "t() ::= <<" + Misc.newLine +
            "  <! a comment !>" + Misc.newLine +
            ">>" + Misc.newLine;

        TestGroupSyntax.writeFile(this.tmpdir, "t.stg", templates);
        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        const template = group.getInstanceOf("t");

        assertEquals("[]", errors.toString());
        assertNotNull(template);

        const expected = "";
        const result = template?.render();
        assertEquals(expected, result);

        assertEquals("[]", errors.toString());
    }
}
