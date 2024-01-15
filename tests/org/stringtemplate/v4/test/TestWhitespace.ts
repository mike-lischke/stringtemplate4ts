/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import {
    STGroup, ST, STGroupString, AutoIndentWriter, Misc, StringWriter, ErrorManager,
} from "../../../../../src/index.js";
import { assertEquals } from "../../../../junit.js";

import { AfterAll, BeforeAll, Ignore, Test } from "../../../../decorators.js";

export class TestWhitespace extends BaseTest {
    @BeforeAll
    public override setUp(): void {
        // Many of the tests produce errors on purpose. We don't want to see them.
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;
    }

    @AfterAll
    public restore(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testTrimmedSubtemplates(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "<names:{n | <n>}>!");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        const expected = "TerTomSumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testTrimmedNewlinesBeforeAfterInTemplate(): void {
        const templates =
            "a(x) ::= <<" + Misc.newLine +
            "foo" + Misc.newLine +
            ">>" + Misc.newLine;
        const group = new STGroupString(templates);
        const st = group.getInstanceOf("a");
        const expected = "foo";
        const result = st?.render();
        assertEquals(expected, result);
    }

    /**
     * This is a regression test for antlr/stringtemplate4#93.
     */
    @Test
    public testNoTrimmedNewlinesBeforeAfterInCodedTemplate(): void {
        const st = new ST(Misc.newLine + "foo" + Misc.newLine);
        const expected = Misc.newLine + "foo" + Misc.newLine;
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDontTrimJustSpaceBeforeAfterInTemplate(): void {
        const templates = "a(x) ::= << foo >>\n";
        const group = new STGroupString(templates);
        const st = group.getInstanceOf("a");
        const expected = " foo ";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testTrimmedSubtemplatesNoArgs(): void {
        const group = new STGroup();
        group.defineTemplate("test", "[<foo({ foo })>]");
        group.defineTemplate("foo", "x", "<x>");
        const st = group.getInstanceOf("test");
        const expected = "[ foo ]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testTrimmedSubtemplatesArgs(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "<names:{x|  foo }>");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        const expected = " foo  foo  foo ";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testTrimJustOneWSInSubtemplates(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "<names:{n |  <n> }>!");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        const expected = " Ter  Tom  Sumana !";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testTrimNewlineInSubtemplates(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "<names:{n |\n<n>}>!");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        const expected = "TerTomSumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testLeaveNewlineOnEndInSubtemplates(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "<names:{n |\n<n>\n}>!");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        const expected = "Ter" + Misc.newLine + "Tom" + Misc.newLine + "Sumana" + Misc.newLine + "!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Ignore("will revisit the behavior of indented expressions spanning multiple lines for a future release")

    @Test
    public testTabBeforeEndInSubtemplates(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "  <names:{n |\n" +
            "    <n>\n" +
            "  }>!");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        const expected = "    Ter" + Misc.newLine + "    Tom" + Misc.newLine + "    Sumana" + Misc.newLine + "!";
        const result = st?.render();
        //st.impl.dump();
        assertEquals(expected, result);
    }

    @Test
    public testEmptyExprAsFirstLineGetsNoOutput(): void {
        const t = new ST("<users>\nend\n");
        const expecting = "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testEmptyLineWithIndent(): void {
        const t = new ST(
            "begin\n" +
            "    \n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testEmptyLine(): void {
        const t = new ST(
            "begin\n" +
            "\n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testSizeZeroOnLineByItselfGetsNoOutput(): void {
        const t = new ST(
            "begin\n" +
            "<name>\n" +
            "<users>\n" +
            "<users>\n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testSizeZeroOnLineWithIndentGetsNoOutput(): void {
        const t = new ST(
            "begin\n" +
            "  <name>\n" +
            "   <users>\n" +
            "   <users>\n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testSizeZeroOnLineWithMultipleExpr(): void {
        const t = new ST(
            "begin\n" +
            "  <name>\n" +
            "   <users><users>\n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testIFExpr(): void {
        const t = new ST(
            "begin\n" +
            "<if(x)><endif>\n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testIndentedIFExpr(): void {
        const t = new ST(
            "begin\n" +
            "    <if(x)><endif>\n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testIFElseExprOnSingleLine(): void {
        const t = new ST(
            "begin\n" +
            "<if(users)><else><endif>\n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testIFOnMultipleLines(): void {
        const t = new ST(
            "begin\n" +
            "<if(users)>\n" +
            "foo\n" +
            "<else>\n" +
            "bar\n" +
            "<endif>\n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + "bar" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testEndifNotOnLineAlone(): void {
        const t = new ST(
            "begin\n" +
            "  <if(users)>\n" +
            "  foo\n" +
            "  <else>\n" +
            "  bar\n" +
            "  <endif>end\n");
        const expecting = "begin" + Misc.newLine + "  bar" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testElseIFOnMultipleLines(): void {
        const t = new ST(
            "begin\n" +
            "<if(a)>\n" +
            "foo\n" +
            "<elseif(b)>\n" +
            "bar\n" +
            "<endif>\n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testElseIFOnMultipleLines2(): void {
        const t = new ST(
            "begin\n" +
            "<if(a)>\n" +
            "foo\n" +
            "<elseif(b)>\n" +
            "bar\n" +
            "<endif>\n" +
            "end\n");
        t.add("b", true);
        const expecting = "begin" + Misc.newLine + "bar" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testElseIFOnMultipleLines3(): void {
        const t = new ST(
            "begin\n" +
            "  <if(a)>\n" +
            "  foo\n" +
            "  <elseif(b)>\n" +
            "  bar\n" +
            "  <endif>\n" +
            "end\n");
        t.add("a", true);
        const expecting = "begin" + Misc.newLine + "  foo" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testNestedIFOnMultipleLines(): void {
        const t = new ST(
            "begin\n" +
            "<if(x)>\n" +
            "<if(y)>\n" +
            "foo\n" +
            "<else>\n" +
            "bar\n" +
            "<endif>\n" +
            "<endif>\n" +
            "end\n");
        t.add("x", "x");
        const expecting = "begin" + Misc.newLine + "bar" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testLineBreak(): void {
        const st = new ST(
            "Foo <\\\\>" + Misc.newLine +
            "  \t  bar" + Misc.newLine,
        );
        const sw = new StringWriter();
        st.write(new AutoIndentWriter(sw, "\n")); // force \n as newline
        const result = sw.toString();
        const expecting = "Foo bar\n";     // expect \n in output
        assertEquals(expecting, result);
    }

    @Test
    public testLineBreak2(): void {
        const st = new ST(
            "Foo <\\\\>       " + Misc.newLine +
            "  \t  bar" + Misc.newLine,
        );
        const sw = new StringWriter();
        st.write(new AutoIndentWriter(sw, "\n")); // force \n as newline
        const result = sw.toString();
        const expecting = "Foo bar\n";
        assertEquals(expecting, result);
    }

    @Test
    public testLineBreakNoWhiteSpace(): void {
        const st = new ST(
            "Foo <\\\\>" + Misc.newLine +
            "bar\n",
        );
        const sw = new StringWriter();
        st.write(new AutoIndentWriter(sw, "\n")); // force \n as newline
        const result = sw.toString();
        const expecting = "Foo bar\n";
        assertEquals(expecting, result);
    }

    @Test
    public testNewlineNormalizationInTemplateString(): void {
        const st = new ST(
            "Foo\r\n" +
            "Bar\n",
        );
        const sw = new StringWriter();
        st.write(new AutoIndentWriter(sw, "\n")); // force \n as newline
        const result = sw.toString();
        const expecting = "Foo\nBar\n";     // expect \n in output
        assertEquals(expecting, result);
    }

    @Test
    public testNewlineNormalizationInTemplateStringPC(): void {
        const st = new ST(
            "Foo\r\n" +
            "Bar\n",
        );
        const sw = new StringWriter();
        st.write(new AutoIndentWriter(sw, "\r\n")); // force \r\n as newline
        const result = sw.toString();
        const expecting = "Foo\r\nBar\r\n";     // expect \r\n in output
        assertEquals(expecting, result);
    }

    @Test
    public testNewlineNormalizationInAttribute(): void {
        const st = new ST(
            "Foo\r\n" +
            "<name>\n",
        );
        st?.add("name", "a\nb\r\nc");
        const sw = new StringWriter();
        st.write(new AutoIndentWriter(sw, "\n")); // force \n as newline
        const result = sw.toString();
        const expecting = "Foo\na\nb\nc\n";     // expect \n in output
        assertEquals(expecting, result);
    }

    @Test
    public testCommentOnlyLineGivesNoOutput(): void {
        const t = new ST(
            "begin\n" +
            "<! ignore !>\n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

    @Test
    public testCommentOnlyLineGivesNoOutput2(): void {
        const t = new ST(
            "begin\n" +
            "    <! ignore !>\n" +
            "end\n");
        const expecting = "begin" + Misc.newLine + "end" + Misc.newLine;
        const result = t.render();
        assertEquals(expecting, result);
    }

}
