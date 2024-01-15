/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { Assert, assertEquals } from "../../../../junit.js";
import { Misc, ST, STGroup, STGroupDir, STGroupFile, STGroupString } from "../../../../../src/index.js";

import { Test } from "../../../../decorators.js";

export class TestDollarDelimiters extends BaseTest {
    @Test
    public testAttr(): void {
        const template = "hi $name$!";
        const st = new ST(template, "$", "$");
        st?.add("name", "Ter");
        const expected = "hi Ter!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testParallelMap(): void {
        const group = new STGroup("$", "$");
        group.defineTemplate("test", "names,phones", "hi $names,phones:{n,p | $n$:$p$;}$");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        st?.add("phones", "x5001");
        st?.add("phones", "x5002");
        st?.add("phones", "x5003");
        const expected =
            "hi Ter:x5001;Tom:x5002;Sumana:x5003;";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testRefToAnotherTemplateInSameGroup(): void {
        const dir = this.getRandomDir();
        const a = "a() ::= << <$b()$> >>\n";
        const b = "b() ::= <<bar>>\n";
        TestDollarDelimiters.writeFile(dir, "a.st", a);
        TestDollarDelimiters.writeFile(dir, "b.st", b);
        const group = new STGroupDir(dir, "$", "$");
        const st = group.getInstanceOf("a");
        const expected = " <bar> ";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefaultArgument(): void {
        const templates =
            "method(name) ::= <<" + Misc.newLine +
            "$stat(name)$" + Misc.newLine +
            ">>" + Misc.newLine +
            "stat(name,value=\"99\") ::= \"x=$value$; // $name$\"" + Misc.newLine;
        TestDollarDelimiters.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg", "$", "$");
        const b = group.getInstanceOf("method");
        b?.add("name", "foo");
        const expecting = "x=99; // foo";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    /**
     * This is part of a regression test for antlr/stringtemplate4#46.
     * https://github.com/antlr/stringtemplate4/issues/46
     */
    @Test
    public testDelimitersClause(): void {
        const templates =
            "delimiters \"$\", \"$\"" + Misc.newLine +
            "method(name) ::= <<" + Misc.newLine +
            "$stat(name)$" + Misc.newLine +
            ">>" + Misc.newLine +
            "stat(name,value=\"99\") ::= \"x=$value$; // $name$\"" + Misc.newLine
            ;
        TestDollarDelimiters.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const b = group.getInstanceOf("method");
        b?.add("name", "foo");
        const expecting = "x=99; // foo";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    /**
     * This is part of a regression test for antlr/stringtemplate4#46.
     * https://github.com/antlr/stringtemplate4/issues/46
     */
    @Test
    public testDelimitersClauseInGroupString(): void {
        const templates =
            "delimiters \"$\", \"$\"" + Misc.newLine +
            "method(name) ::= <<" + Misc.newLine +
            "$stat(name)$" + Misc.newLine +
            ">>" + Misc.newLine +
            "stat(name,value=\"99\") ::= \"x=$value$; // $name$\"" + Misc.newLine
            ;
        const group = new STGroupString(templates);
        const b = group.getInstanceOf("method");
        b?.add("name", "foo");
        const expecting = "x=99; // foo";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    /**
     * This is part of a regression test for antlr/stringtemplate4#66.
     * https://github.com/antlr/stringtemplate4/issues/66
     */
    @Test
    public testImportTemplatePreservesDelimiters(): void {
        const groupFile =
            "group GenerateHtml;" + Misc.newLine +
            "import \"html.st\"" + Misc.newLine +
            "entry() ::= <<" + Misc.newLine +
            "$html()$" + Misc.newLine +
            ">>" + Misc.newLine;
        const htmlFile =
            "html() ::= <<" + Misc.newLine +
            "<table style=\"stuff\">" + Misc.newLine +
            ">>" + Misc.newLine;

        const dir = this.getRandomDir();
        TestDollarDelimiters.writeFile(dir, "GenerateHtml.stg", groupFile);
        TestDollarDelimiters.writeFile(dir, "html.st", htmlFile);

        const group = new STGroupFile(dir + "/GenerateHtml.stg", "$", "$");

        // test html template directly
        let st = group.getInstanceOf("html");
        Assert.assertNotNull(st);
        let expected = "<table style=\"stuff\">";
        let result = st?.render();
        assertEquals(expected, result);

        // test from entry template
        st = group.getInstanceOf("entry");
        Assert.assertNotNull(st);
        expected = "<table style=\"stuff\">";
        result = st?.render();
        assertEquals(expected, result);
    }

    /**
     * This is part of a regression test for antlr/stringtemplate4#66.
     * https://github.com/antlr/stringtemplate4/issues/66
     */
    @Test
    public testImportGroupPreservesDelimiters(): void {
        const groupFile =
            "group GenerateHtml;" + Misc.newLine +
            "import \"HtmlTemplates.stg\"" + Misc.newLine +
            "entry() ::= <<" + Misc.newLine +
            "$html()$" + Misc.newLine +
            ">>" + Misc.newLine;
        const htmlFile =
            "html() ::= <<" + Misc.newLine +
            "<table style=\"stuff\">" + Misc.newLine +
            ">>" + Misc.newLine;

        const dir = this.getRandomDir();
        TestDollarDelimiters.writeFile(dir, "GenerateHtml.stg", groupFile);
        TestDollarDelimiters.writeFile(dir, "HtmlTemplates.stg", htmlFile);

        const group = new STGroupFile(dir + "/GenerateHtml.stg", "$", "$");

        // test html template directly
        let st = group.getInstanceOf("html");
        Assert.assertNotNull(st);
        let expected = "<table style=\"stuff\">";
        let result = st?.render();
        assertEquals(expected, result);

        // test from entry template
        st = group.getInstanceOf("entry");
        Assert.assertNotNull(st);
        expected = "<table style=\"stuff\">";
        result = st?.render();
        assertEquals(expected, result);
    }

    /**
     * This is part of a regression test for antlr/stringtemplate4#66.
     * https://github.com/antlr/stringtemplate4/issues/66
     */
    @Test
    public testDelimitersClauseOverridesConstructorDelimiters(): void {
        const groupFile =
            "group GenerateHtml;" + Misc.newLine +
            "delimiters \"$\", \"$\"" + Misc.newLine +
            "import \"html.st\"" + Misc.newLine +
            "entry() ::= <<" + Misc.newLine +
            "$html()$" + Misc.newLine +
            ">>" + Misc.newLine;
        const htmlFile =
            "html() ::= <<" + Misc.newLine +
            "<table style=\"stuff\">" + Misc.newLine +
            ">>" + Misc.newLine;

        const dir = this.getRandomDir();
        TestDollarDelimiters.writeFile(dir, "GenerateHtml.stg", groupFile);
        TestDollarDelimiters.writeFile(dir, "html.st", htmlFile);

        const group = new STGroupFile(dir + "/GenerateHtml.stg", "<", ">");

        // test html template directly
        let st = group.getInstanceOf("html");
        Assert.assertNotNull(st);
        let expected = "<table style=\"stuff\">";
        let result = st?.render();
        assertEquals(expected, result);

        // test from entry template
        st = group.getInstanceOf("entry");
        Assert.assertNotNull(st);
        expected = "<table style=\"stuff\">";
        result = st?.render();
        assertEquals(expected, result);
    }

    /**
     * This is part of a regression test for antlr/stringtemplate4#66.
     * https://github.com/antlr/stringtemplate4/issues/66
     */
    @Test
    public testDelimitersClauseOverridesInheritedDelimiters(): void {
        const groupFile =
            "group GenerateHtml;" + Misc.newLine +
            "delimiters \"<\", \">\"" + Misc.newLine +
            "import \"HtmlTemplates.stg\"" + Misc.newLine +
            "entry() ::= <<" + Misc.newLine +
            "<html()>" + Misc.newLine +
            ">>" + Misc.newLine;
        const htmlFile =
            "delimiters \"$\", \"$\"" + Misc.newLine +
            "html() ::= <<" + Misc.newLine +
            "<table style=\"stuff\">" + Misc.newLine +
            ">>" + Misc.newLine;

        const dir = this.getRandomDir();
        TestDollarDelimiters.writeFile(dir, "GenerateHtml.stg", groupFile);
        TestDollarDelimiters.writeFile(dir, "HtmlTemplates.stg", htmlFile);

        const group = new STGroupFile(dir + "/GenerateHtml.stg");

        // test html template directly
        let st = group.getInstanceOf("html");
        Assert.assertNotNull(st);
        let expected = "<table style=\"stuff\">";
        let result = st?.render();
        assertEquals(expected, result);

        // test from entry template
        st = group.getInstanceOf("entry");
        Assert.assertNotNull(st);
        expected = "<table style=\"stuff\">";
        result = st?.render();
        assertEquals(expected, result);
    }
}
