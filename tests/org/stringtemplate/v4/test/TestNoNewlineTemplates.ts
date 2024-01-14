/* java2ts: keep */

/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { assertEquals } from "../../../../junit.js";
import { STGroupString, STGroupFile } from "../../../../../src/index.js";

import { Test } from "../../../../decorators.js";

export class TestNoNewlineTemplates extends BaseTest {
    @Test
    public testNoNewlineTemplate(): void {
        const template =
            "t(x) ::= <%\n" +
            "[  <if(!x)>" +
            "<else>" +
            "<x>\n" +
            "<endif>" +
            "\n" +
            "\n" +
            "]\n" +
            "\n" +
            "%>\n";
        const g = new STGroupString(template);
        const st = g.getInstanceOf("t");
        st?.add("x", 99);
        const expected = "[  99]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testWSNoNewlineTemplate(): void {
        const template =
            "t(x) ::= <%\n" +
            "\n" +
            "%>\n";
        const g = new STGroupString(template);
        const st = g.getInstanceOf("t");
        st?.add("x", 99);
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testEmptyNoNewlineTemplate(): void {
        const template = "t(x) ::= <%%>\n";
        const g = new STGroupString(template);
        const st = g.getInstanceOf("t");
        st?.add("x", 99);
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testIgnoreIndent(): void {
        const template =
            "t(x) ::= <%\n" +
            "   foo\n" +
            "   <x>\n" +
            "%>\n";
        const g = new STGroupString(template);
        const st = g.getInstanceOf("t");
        st?.add("x", 99);
        const expected = "foo99";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testIgnoreIndentInIF(): void {
        const template =
            "t(x) ::= <%\n" +
            "   <if(x)>\n" +
            "       foo\n" +
            "   <endif>\n" +
            "   <x>\n" +
            "%>\n";
        const g = new STGroupString(template);
        const st = g.getInstanceOf("t");
        st?.add("x", 99);
        const expected = "foo99";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testKeepWS(): void {
        const template =
            "t(x) ::= <%\n" +
            "   <x> <x> hi\n" +
            "%>\n";
        const g = new STGroupString(template);
        const st = g.getInstanceOf("t");
        st?.add("x", 99);
        const expected = "99 99 hi";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testRegion(): void {
        const template =
            "t(x) ::= <%\n" +
            "<@r>\n" +
            "   Ignore\n" +
            "   newlines and indents\n" +
            "<x>\n\n\n" +
            "<@end>\n" +
            "%>\n";
        const g = new STGroupString(template);
        const st = g.getInstanceOf("t");
        st?.add("x", 99);
        const expected = "Ignorenewlines and indents99";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefineRegionInSubgroup(): void {
        const dir = this.getRandomDir();
        const g1 = "a() ::= <<[<@r()>]>>\n";
        TestNoNewlineTemplates.writeFile(dir, "g1.stg", g1);
        const g2 = "@a.r() ::= <%\n" +
            "   foo\n\n\n" +
            "%>\n";
        TestNoNewlineTemplates.writeFile(dir, "g2.stg", g2);

        const group1 = new STGroupFile(dir + "/g1.stg");
        const group2 = new STGroupFile(dir + "/g2.stg");
        group2.importTemplates(group1); // define r in g2
        const st = group2.getInstanceOf("a");
        const expected = "[foo]";
        const result = st?.render();
        assertEquals(expected, result);
    }

}
