/* java2ts: keep */

/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { STGroupFile, STGroupDir, ErrorBuffer, STGroupString, Misc } from "../../../../../src/index.js";
import { assertEquals } from "../../../../junit.js";

import { Test } from "../../../../decorators.js";

export class TestRegions extends BaseTest {
    @Test
    public testEmbeddedRegion(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "a() ::= <<\n" +
            "[<@r>bar<@end>]\n" +
            ">>\n";
        TestRegions.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("a");
        const expected = "[bar]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testRegion(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "a() ::= <<\n" +
            "[<@r()>]\n" +
            ">>\n";
        TestRegions.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("a");
        const expected = "[]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefineRegionInSubgroup(): void {
        const dir = this.getRandomDir();
        TestRegions.writeFile(dir, "g1.stg", "a() ::= <<[<@r()>]>>\n");
        TestRegions.writeFile(dir, "g2.stg", "@a.r() ::= <<foo>>\n");

        const group1 = new STGroupFile(dir + "/g1.stg");
        const group2 = new STGroupFile(dir + "/g2.stg");
        group2.importTemplates(group1); // define r in g2
        const st = group2.getInstanceOf("a");
        const expected = "[foo]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefineRegionInSubgroupOneInSubdir(): void {
        const dir = this.getRandomDir();
        TestRegions.writeFile(dir, "g1.stg", "a() ::= <<[<@r()>]>>\n");
        TestRegions.writeFile(dir + "/subdir", "g2.stg", "@a.r() ::= <<foo>>\n");

        const group1 = new STGroupFile(dir + "/g1.stg");
        const group2 = new STGroupFile(dir + "/subdir/g2.stg");
        group2.importTemplates(group1); // define r in g2
        const st = group2.getInstanceOf("a");
        const expected = "[foo]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefineRegionInSubgroupBothInSubdir(): void {
        const dir = this.getRandomDir();
        TestRegions.writeFile(dir + "/subdir", "g1.stg", "a() ::= <<[<@r()>]>>\n");
        TestRegions.writeFile(dir + "/subdir", "g2.stg", "@a.r() ::= <<foo>>\n");

        const group1 = new STGroupFile(dir + "/subdir/g1.stg");
        const group2 = new STGroupFile(dir + "/subdir/g2.stg");
        group2.importTemplates(group1); // define r in g2
        const st = group2.getInstanceOf("a");
        const expected = "[foo]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefineRegionInSubgroupThatRefsSuper(): void {
        const dir = this.getRandomDir();
        const g1 = "a() ::= <<[<@r>foo<@end>]>>\n";
        TestRegions.writeFile(dir, "g1.stg", g1);
        const g2 = "@a.r() ::= <<(<@super.r()>)>>\n";
        TestRegions.writeFile(dir, "g2.stg", g2);

        const group1 = new STGroupFile(dir + "/g1.stg");
        const group2 = new STGroupFile(dir + "/g2.stg");
        group2.importTemplates(group1); // define r in g2
        const st = group2.getInstanceOf("a");
        const expected = "[(foo)]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefineRegionInSubgroup2(): void {
        const dir = this.getRandomDir();
        const g1 = "a() ::= <<[<@r()>]>>\n";
        TestRegions.writeFile(dir, "g1.stg", g1);
        const g2 = "@a.r() ::= <<foo>>>\n";
        TestRegions.writeFile(dir, "g2.stg", g2);

        const group1 = new STGroupFile(dir + "/g1.stg");
        const group2 = new STGroupFile(dir + "/g2.stg");
        group1.importTemplates(group2); // opposite of previous; g1 imports g2
        const st = group1.getInstanceOf("a");
        const expected = "[]"; // @a.r implicitly defined in g1; can't see g2's
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefineRegionInSameGroup(): void {
        const dir = this.getRandomDir();
        const g = "a() ::= <<[<@r()>]>>\n" +
            "@a.r() ::= <<foo>>\n";
        TestRegions.writeFile(dir, "g.stg", g);

        const group = new STGroupFile(dir + "/g.stg");
        const st = group.getInstanceOf("a");
        const expected = "[foo]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testAnonymousTemplateInRegion(): void {
        const dir = this.getRandomDir();
        const g = "a() ::= <<[<@r()>]>>\n" +
            "@a.r() ::= <<\n" +
            "<[\"foo\"]:{x|<x>}>\n" +
            ">>\n";
        TestRegions.writeFile(dir, "g.stg", g);

        const group = new STGroupFile(dir + "/g.stg");
        const st = group.getInstanceOf("a");
        const expected = "[foo]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testAnonymousTemplateInRegionInSubdir(): void {
        //fails since it makes region name /region__/g/a/_r
        const dir = this.getRandomDir();
        const g = "a() ::= <<[<@r()>]>>\n" +
            "@a.r() ::= <<\n" +
            "<[\"foo\"]:{x|<x>}>\n" +
            ">>\n";
        TestRegions.writeFile(dir, "g.stg", g);

        //STGroup.verbose = true;
        const group = new STGroupDir(dir);
        const st = group.getInstanceOf("g/a");
        const expected = "[foo]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testCantDefineEmbeddedRegionAgain(): void {
        const dir = this.getRandomDir();
        const g = "a() ::= <<[<@r>foo<@end>]>>\n" +
            "@a.r() ::= <<bar>>\n"; // error; dup
        TestRegions.writeFile(dir, "g.stg", g);

        const group = new STGroupFile(dir + "/g.stg");
        const errors = new ErrorBuffer();
        group.setListener(errors);
        group.load();
        const expected = "[g.stg 2:3: region /a.r is embedded and thus already implicitly defined]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testCantDefineEmbeddedRegionAgainInTemplate(): void {
        const dir = this.getRandomDir();
        const g =
            "a() ::= <<\n" +
            "[\n" +
            "<@r>foo<@end>\n" +
            "<@r()>" +
            "]\n" +
            ">>\n"; // error; dup
        TestRegions.writeFile(dir, "g.stg", g);

        const group = new STGroupFile(dir + "/g.stg");
        const errors = new ErrorBuffer();
        group.setListener(errors);
        group.load();
        const expected = "[g.stg 3:2: redefinition of region /a.r]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testMissingRegionName(): void {
        const dir = this.getRandomDir();
        const g = "@t.() ::= \"\"\n";
        TestRegions.writeFile(dir, "g.stg", g);

        const group = new STGroupFile(dir + "/g.stg");
        const errors = new ErrorBuffer();
        group.setListener(errors);
        group.load();
        const expected = "[g.stg 1:3: missing ID at '(']";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testIndentBeforeRegionIsIgnored(): void {
        const dir = this.getRandomDir();
        const g = "a() ::= <<[\n" +
            "  <@r>\n" +
            "  foo\n" +
            "  <@end>\n" +
            "]>>\n";
        TestRegions.writeFile(dir, "g.stg", g);

        const group = new STGroupFile(dir + "/g.stg");
        const st = group.getInstanceOf("a");
        const expected = "[" + Misc.newLine +
            "  foo" + Misc.newLine +
            "]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testRegionOverrideStripsNewlines(): void {
        const dir = this.getRandomDir();
        const g =
            "a() ::= \"X<@r()>Y\"" +
            "@a.r() ::= <<\n" +
            "foo\n" +
            ">>\n";
        TestRegions.writeFile(dir, "g.stg", g);
        const group = new STGroupFile(dir + "/g.stg");

        const sub =
            "@a.r() ::= \"A<@super.r()>B\"" + Misc.newLine;
        TestRegions.writeFile(dir, "sub.stg", sub);
        const subGroup = new STGroupFile(dir + "/sub.stg");
        subGroup.importTemplates(group);

        const st = subGroup.getInstanceOf("a");
        const result = st?.render();
        const expecting = "XAfooBY";
        assertEquals(expecting, result);
    }

    @Test
    public testRegionOverrideRefSuperRegion(): void {
        const dir = this.getRandomDir();
        const g =
            "a() ::= \"X<@r()>Y\"" +
            "@a.r() ::= \"foo\"" + Misc.newLine;
        TestRegions.writeFile(dir, "g.stg", g);
        const group = new STGroupFile(dir + "/g.stg");

        const sub =
            "@a.r() ::= \"A<@super.r()>B\"" + Misc.newLine;
        TestRegions.writeFile(dir, "sub.stg", sub);
        const subGroup = new STGroupFile(dir + "/sub.stg");
        subGroup.importTemplates(group);

        const st = subGroup.getInstanceOf("a");
        const result = st?.render();
        const expecting = "XAfooBY";
        assertEquals(expecting, result);
    }

    @Test
    public testRegionOverrideRefSuperRegion2Levels(): void {
        const g =
            "a() ::= \"X<@r()>Y\"\n" +
            "@a.r() ::= \"foo\"\n";
        const group = new STGroupString(g);

        const sub = "@a.r() ::= \"<@super.r()>2\"\n";
        const subGroup = new STGroupString(sub);
        subGroup.importTemplates(group);

        const st = subGroup.getInstanceOf("a");

        const result = st?.render();
        const expecting = "Xfoo2Y";
        assertEquals(expecting, result);
    }

    @Test
    public testRegionOverrideRefSuperRegion3Levels(): void {
        const dir = this.getRandomDir();
        const g =
            "a() ::= \"X<@r()>Y\"" +
            "@a.r() ::= \"foo\"" + Misc.newLine;
        TestRegions.writeFile(dir, "g.stg", g);
        const group = new STGroupFile(dir + "/g.stg");

        const sub = "@a.r() ::= \"<@super.r()>2\"" + Misc.newLine;
        TestRegions.writeFile(dir, "sub.stg", sub);
        const subGroup = new STGroupFile(dir + "/sub.stg");
        subGroup.importTemplates(group);

        const subsub = "@a.r() ::= \"<@super.r()>3\"" + Misc.newLine;
        TestRegions.writeFile(dir, "subsub.stg", subsub);
        const subSubGroup = new STGroupFile(dir + "/subsub.stg");
        subSubGroup.importTemplates(subGroup);

        const st = subSubGroup.getInstanceOf("a");

        const result = st?.render();
        const expecting = "Xfoo23Y";
        assertEquals(expecting, result);
    }

    @Test
    public testRegionOverrideRefSuperImplicitRegion(): void {
        const dir = this.getRandomDir();
        const g = "a() ::= \"X<@r>foo<@end>Y\"" + Misc.newLine;
        TestRegions.writeFile(dir, "g.stg", g);
        const group = new STGroupFile(dir + "/g.stg");

        const sub = "@a.r() ::= \"A<@super.r()>\"" + Misc.newLine;
        TestRegions.writeFile(dir, "sub.stg", sub);
        const subGroup = new STGroupFile(dir + "/sub.stg");
        subGroup.importTemplates(group);

        const st = subGroup.getInstanceOf("a");
        const result = st?.render();
        const expecting = "XAfooY";
        assertEquals(expecting, result);
    }

    @Test
    public testUnknownRegionDefError(): void {
        const dir = this.getRandomDir();
        const g =
            "a() ::= <<\n" +
            "X<@r()>Y\n" +
            ">>\n" +
            "@a.q() ::= \"foo\"" + Misc.newLine;
        const errors = new ErrorBuffer();
        TestRegions.writeFile(dir, "g.stg", g);
        const group = new STGroupFile(dir + "/g.stg");
        group.setListener(errors);
        const st = group.getInstanceOf("a");
        st?.render();
        const result = errors.toString();
        const expecting = "[g.stg 4:3: template /a doesn't have a region called q]";
        assertEquals(expecting, result);
    }

    @Test
    public testSuperRegionRefMissingOk(): void {
        const dir = this.getRandomDir();
        const g =
            "a() ::= \"X<@r()>Y\"" +
            "@a.r() ::= \"foo\"" + Misc.newLine;
        TestRegions.writeFile(dir, "g.stg", g);
        const group = new STGroupFile(dir + "/g.stg");

        const sub = "@a.r() ::= \"A<@super.q()>B\"" + Misc.newLine; // allow this; trap at runtime
        const errors = new ErrorBuffer();
        group.setListener(errors);
        TestRegions.writeFile(dir, "sub.stg", sub);
        const subGroup = new STGroupFile(dir + "/sub.stg");
        subGroup.importTemplates(group);

        const st = subGroup.getInstanceOf("a");
        const result = st?.render();
        const expecting = "XABY";
        assertEquals(expecting, result);
    }

    @Test
    public testEmbeddedRegionOnOneLine(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "a() ::= <<\n" +
            "[\n" +
            "  <@r>bar<@end>\n" +
            "]\n" +
            ">>\n";
        TestRegions.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("a");
        //st.impl.dump();
        const expected = "[" + Misc.newLine + "  bar" + Misc.newLine + "]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testEmbeddedRegionTagsOnSeparateLines(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "a() ::= <<\n" +
            "[\n" +
            "  <@r>\n" +
            "  bar\n" +
            "  <@end>\n" +
            "]\n" +
            ">>\n";
        TestRegions.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("a");
        const expected = "[" + Misc.newLine + "  bar" + Misc.newLine + "]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    // @Ignore("will revisit the behavior of indented expressions spanning multiple lines for a future release")
    // @Test
    public testEmbeddedSubtemplate(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "a() ::= <<\n" +
            "[\n" +
            "  <{\n" +
            "  bar\n" +
            "  }>\n" +
            "]\n" +
            ">>\n";
        TestRegions.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("a");
        const expected = "[" + Misc.newLine + "  bar" + Misc.newLine + "]";
        const result = st?.render();
        assertEquals(expected, result);
    }
}
