/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { TestCoreBasics } from "./TestCoreBasics.js";
import { BaseTest } from "./BaseTest.js";
import { assertEquals, assertNull } from "./junit.js";
import { ST, STGroup, STGroupFile, ErrorBuffer } from "../src/index.js";

import { Test } from "./decorators.js";

export class TestIndirectionAndEarlyEval extends BaseTest {
    @Test
    public testEarlyEval(): void {
        const template = "<(name)>";
        const st = new ST(template);
        st.add("name", "Ter");
        const expected = "Ter";
        const result = st.render();
        assertEquals(expected, result);
    }

    @Test
    public testIndirectTemplateInclude(): void {
        const group = new STGroup();
        group.defineTemplate("foo", "bar");
        const template = "<(name)()>";
        group.defineTemplate("test", "name", template);
        const st = group.getInstanceOf("test");
        st?.add("name", "foo");
        const expected = "bar";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testIndirectTemplateIncludeWithArgs(): void {
        const group = new STGroup();
        group.defineTemplate("foo", "x,y", "<x><y>");
        const template = "<(name)({1},{2})>";
        group.defineTemplate("test", "name", template);
        const st = group.getInstanceOf("test");
        st?.add("name", "foo");
        const expected = "12";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testIndirectCallWithPassThru(): void {
        // pass-through for dynamic template invocation is not supported by the
        // bytecode representation
        BaseTest.writeFile(this.tmpdir, "t.stg",
            "t1(x) ::= \"<x>\"\n" +
            "main(x=\"hello\",t=\"t1\") ::= <<\n" +
            "<(t)(...)>\n" +
            ">>");
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const errors = new ErrorBuffer();
        group.setListener(errors);
        const st = group.getInstanceOf("main");
        assertEquals("[t.stg 2:34: extraneous input '...' expecting {'super', '(', ')', '[', '{', ID, STRING, '@', " +
            "TRUE, FALSE, '/'}]", errors.toString());
        assertNull(st);
    }

    @Test
    public testIndirectTemplateIncludeViaTemplate(): void {
        const group = new STGroup();
        group.defineTemplate("foo", "bar");
        group.defineTemplate("tname", "foo");
        const template = "<(tname())()>";
        group.defineTemplate("test", "name", template);
        const st = group.getInstanceOf("test");
        const expected = "bar";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testIndirectProp(): void {
        const template = "<u.(propname)>: <u.name>";
        const st = new ST(template);
        st?.add("u", new TestCoreBasics.User(1, "parrt"));
        st?.add("propname", "id");
        const expected = "1: parrt";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testIndirectMap(): void {
        const group = new STGroup();
        group.defineTemplate("a", "x", "[<x>]");
        group.defineTemplate("test", "names,templateName", "hi <names:(templateName)()>!");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        st?.add("templateName", "a");
        const expected =
            "hi [Ter][Tom][Sumana]!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testNonStringDictLookup(): void {
        const template = "<m.(intkey)>";
        const st = new ST(template);
        const m = new Map<number, string>();
        m.set(36, "foo");
        st?.add("m", m);
        st?.add("intkey", 36);
        const expected = "foo";
        const result = st?.render();
        assertEquals(expected, result);
    }
}
