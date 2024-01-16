/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { STGroup, ErrorBuffer } from "../src/index.js";
import { assertEquals } from "./junit.js";

import { Test } from "./decorators.js";

export class TestOptions extends BaseTest {
    @Test
    public testSeparator(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "hi <name; separator=\", \">!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "hi Ter, Tom, Sumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSeparatorWithSpaces(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "hi <name; separator= \", \">!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "hi Ter, Tom, Sumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testAttrSeparator(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name,sep", "hi <name; separator=sep>!");
        const st = group.getInstanceOf("test");
        st?.add("sep", ", ");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "hi Ter, Tom, Sumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testIncludeSeparator(): void {
        const group = new STGroup();
        group.defineTemplate("foo", "|");
        group.defineTemplate("test", "name,sep", "hi <name; separator=foo()>!");
        const st = group.getInstanceOf("test");
        st?.add("sep", ", ");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "hi Ter|Tom|Sumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSubtemplateSeparator(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name,sep", "hi <name; separator={<sep> _}>!");
        const st = group.getInstanceOf("test");
        st?.add("sep", ",");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "hi Ter, _Tom, _Sumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSeparatorWithNullFirstValueAndNullOption(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "hi <name; null=\"n/a\", separator=\", \">!");
        const st = group.getInstanceOf("test");
        st?.add("name", null);
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "hi n/a, Tom, Sumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSeparatorWithNull2ndValueAndNullOption(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "hi <name; null=\"n/a\", separator=\", \">!");
        const st = group.getInstanceOf("test");
        //st.impl.dump();
        st?.add("name", "Ter");
        st?.add("name", null);
        st?.add("name", "Sumana");
        const expected = "hi Ter, n/a, Sumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testNullValueAndNullOption(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "<name; null=\"n/a\">");
        const st = group.getInstanceOf("test");
        st?.add("name", null);
        const expected = "n/a";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testListApplyWithNullValueAndNullOption(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "<name:{n | <n>}; null=\"n/a\">");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", null);
        st?.add("name", "Sumana");
        const expected = "Tern/aSumana";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDoubleListApplyWithNullValueAndNullOption(): void {
        // first apply sends [ST, null, ST] to second apply, which puts [] around
        // the value.  This verifies that null not blank comes out of first apply
        // since we don't get [null].
        const group = new STGroup();
        group.defineTemplate("test", "name", "<name:{n | <n>}:{n | [<n>]}; null=\"n/a\">");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", null);
        st?.add("name", "Sumana");
        const expected = "[Ter]n/a[Sumana]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testMissingValueAndNullOption(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "<name; null=\"n/a\">");
        const st = group.getInstanceOf("test");
        const expected = "n/a";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testOptionDoesntApplyToNestedTemplate(): void {
        const group = new STGroup();
        group.defineTemplate("foo", "<zippo>");
        group.defineTemplate("test", "zippo", "<foo(); null=\"n/a\">");
        const st = group.getInstanceOf("test");
        st?.add("zippo", null);
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testIllegalOption(): void {
        const errors = new ErrorBuffer();
        const group = new STGroup();
        group.setListener(errors);
        group.defineTemplate("test", "name", "<name; bad=\"ugly\">");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        let expected = "Ter";
        const result = st?.render();
        assertEquals(expected, result);

        expected = "[test 1:7: no such option: bad]";
        assertEquals(expected, errors.toString());
    }
}
