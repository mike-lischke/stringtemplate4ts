/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { assertEquals, assertNotNull } from "../../../../junit.js";

import { Test } from "../../../../decorators.js";
import { Misc, STRawGroupDir } from "../../../../../src/index.js";

export class TestSTRawGroupDir extends BaseTest {
    @Test
    public testSimpleGroup(): void {
        const dir = this.getRandomDir();
        TestSTRawGroupDir.writeFile(dir, "a.st", "foo");
        const group = new STRawGroupDir(dir, "$", "$");
        const st = group.getInstanceOf("a");
        const expected = "foo";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSimpleGroup2(): void {
        const dir = this.getRandomDir();
        TestSTRawGroupDir.writeFile(dir, "a.st", "foo");
        TestSTRawGroupDir.writeFile(dir, "b.st", "$name$");
        const group = new STRawGroupDir(dir, "$", "$");
        const st = group.getInstanceOf("a");
        const expected = "foo";
        const result = st?.render();
        assertEquals(expected, result);

        const b = group.getInstanceOf("b");
        b?.add("name", "Bob");
        assertEquals("Bob", b?.render());
    }

    @Test
    public testSimpleGroupAngleBrackets(): void {
        const dir = this.getRandomDir();
        TestSTRawGroupDir.writeFile(dir, "a.st", "foo");
        TestSTRawGroupDir.writeFile(dir, "b.st", "<name>");
        const group = new STRawGroupDir(dir);
        const st = group.getInstanceOf("a");
        const expected = "foo";
        const result = st?.render();
        assertEquals(expected, result);

        const b = group.getInstanceOf("b");
        b?.add("name", "Bob");
        assertEquals("Bob", b?.render());
    }

    @Test
    public testSTRawGroupDir(): void {
        const dir = this.getRandomDir();
        TestSTRawGroupDir.writeFile(dir, "template.st", "$values:{foo|[$foo$]}$");
        const group = new STRawGroupDir(dir, "$", "$");
        const template = group.getInstanceOf("template");
        const values = ["one", "two", "three"];
        template?.add("values", values);
        assertEquals("[one][two][three]", template?.render());
    }

    @Test
    public testMap(): void {
        const dir = this.getRandomDir();
        TestSTRawGroupDir.writeFile(dir, "a.st", "$names:bold()$");
        TestSTRawGroupDir.writeFile(dir, "bold.st", "<b>$it$</b>");
        const group = new STRawGroupDir(dir, "$", "$");
        const st = group.getInstanceOf("a");
        const names = ["parrt", "tombu"];
        st?.add("names", names);
        const expected = "<b>parrt</b><b>tombu</b>";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSuper(): void {
        const dir1 = this.getRandomDir();
        let a = "dir1 a";
        const b = "dir1 b";
        TestSTRawGroupDir.writeFile(dir1, "a.st", a);
        TestSTRawGroupDir.writeFile(dir1, "b.st", b);
        const dir2 = this.getRandomDir();
        a = "[<super.a()>]";
        TestSTRawGroupDir.writeFile(dir2, "a.st", a);

        const group1 = new STRawGroupDir(dir1);
        const group2 = new STRawGroupDir(dir2);
        group2.importTemplates(group1);
        const st = group2.getInstanceOf("a");
        const expected = "[dir1 a]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    /**
     * This is a regression test for antlr/stringtemplate4#70. "Argument
     * initialization for sub-template in template with STRawGroupDir doesn't
     * recognize valid parameters"
     * https://github.com/antlr/stringtemplate4/issues/70
     */
    @Test
    public testRawArgumentPassing(): void {
        const dir1 = this.getRandomDir();
        const mainRawTemplate = "Hello $name$" + Misc.newLine + "Then do the footer:" + Misc.newLine +
            "$footerRaw(lastLine=veryLastLineRaw())$" + Misc.newLine;
        const footerRawTemplate = "Simple footer. And now a last line:" + Misc.newLine + "$lastLine$";
        const veryLastLineTemplate = "That's the last line.";
        TestSTRawGroupDir.writeFile(dir1, "mainRaw.st", mainRawTemplate);
        TestSTRawGroupDir.writeFile(dir1, "footerRaw.st", footerRawTemplate);
        TestSTRawGroupDir.writeFile(dir1, "veryLastLineRaw.st", veryLastLineTemplate);

        const group = new STRawGroupDir(dir1, "$", "$");
        const st = group.getInstanceOf("mainRaw");
        assertNotNull(st);
        st?.add("name", "John");
        const result = st?.render();
        const expected =
            "Hello John" + Misc.newLine +
            "Then do the footer:" + Misc.newLine +
            "Simple footer. And now a last line:" + Misc.newLine +
            "That's the last line." + Misc.newLine;
        assertEquals(expected, result);
    }
}
