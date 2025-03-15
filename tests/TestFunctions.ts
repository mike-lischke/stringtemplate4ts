/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

import { BaseTest } from "./BaseTest.js";
import { ErrorManager, Misc, ST, STGroupFile } from "../src/index.js";
import { assertEquals } from "./junit.js";

import { Test } from "./decorators.js";

export class TestFunctions extends BaseTest {
    @Test
    public testFirst(): void {
        const template = "<first(names)>";
        const st = new ST(template);
        const names = ["Ter", "Tom"];
        st.add("names", names);
        const expected = "Ter";
        const result = st.render();
        assertEquals(expected, result);
    }

    @Test
    public testLength(): void {
        const template = "<length(names)>";
        const st = new ST(template);
        const names = ["Ter", "Tom"];
        st.add("names", names);
        const expected = "2";
        const result = st.render();
        assertEquals(expected, result);
    }

    @Test
    public testLengthWithNullValues(): void {
        const template = "<length(names)>";
        const st = new ST(template);
        const names = ["Ter", null, "Tom", null];
        st.add("names", names);
        const expected = "4";
        const result = st.render();
        assertEquals(expected, result);
    }

    @Test
    public testFirstOp(): void {
        const e = new ST("<first(names)>");
        e?.add("names", "Ter");
        e?.add("names", "Tom");
        e?.add("names", "Sriram");
        const expecting = "Ter";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testFirstOpArray(): void {
        const e = new ST("<first(names)>");
        e?.add("names", ["Ter", "Tom", "Sriram"]);
        const expecting = "Ter";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testFirstOpPrimitiveArray(): void {
        const e = new ST("<first(names)>");
        e?.add("names", [0, 1, 2]);
        const expecting = "0";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testTruncOp(): void {
        const e = new ST("<trunc(names); separator=\", \">");
        e?.add("names", "Ter");
        e?.add("names", "Tom");
        e?.add("names", "Sriram");
        const expecting = "Ter, Tom";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testTruncOpArray(): void {
        const e = new ST("<trunc(names); separator=\", \">");
        e?.add("names", ["Ter", "Tom", "Sriram"]);
        const expecting = "Ter, Tom";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testTruncOpPrimitiveArray(): void {
        const e = new ST("<trunc(names); separator=\", \">");
        e?.add("names", [0, 1, 2]);
        const expecting = "0, 1";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRestOp(): void {
        const e = new ST("<rest(names); separator=\", \">");
        e?.add("names", "Ter");
        e?.add("names", "Tom");
        e?.add("names", "Sriram");
        const expecting = "Tom, Sriram";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRestOpArray(): void {
        const e = new ST("<rest(names); separator=\", \">");
        e?.add("names", ["Ter", "Tom", "Sriram"]);
        const expecting = "Tom, Sriram";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRestOpPrimitiveArray(): void {
        const e = new ST("<rest(names); separator=\", \">");
        e?.add("names", [0, 1, 2]);
        const expecting = "1, 2";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRestOpEmptyList(): void {
        const e = new ST("<rest(names); separator=\", \">");
        e?.add("names", new Array<Object>());
        const expecting = "";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRestOpEmptyArray(): void {
        const e = new ST("<rest(names); separator=\", \">");
        e?.add("names", new Array<string>(0));
        const expecting = "";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRestOpEmptyPrimitiveArray(): void {
        const e = new ST("<rest(names); separator=\", \">");
        e?.add("names", new Int32Array(0));
        const expecting = "";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testReUseOfRestResult(): void {
        const templates =
            "a(names) ::= \"<b(rest(names))>\"" + Misc.newLine +
            "b(x) ::= \"<x>, <x>\"" + Misc.newLine;
        TestFunctions.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const e = group.getInstanceOf("a");
        const names = ["Ter", "Tom"];
        e?.add("names", names);
        const expecting = "Tom, Tom";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testReUseOfRestPrimitiveArrayResult(): void {
        const templates =
            "a(names) ::= \"<b(rest(names))>\"" + Misc.newLine +
            "b(x) ::= \"<x>, <x>\"" + Misc.newLine;
        TestFunctions.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const e = group.getInstanceOf("a");
        e?.add("names", [0, 1]);
        const expecting = "1, 1";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testLastOp(): void {
        const e = new ST("<last(names)>");
        e?.add("names", "Ter");
        e?.add("names", "Tom");
        e?.add("names", "Sriram");
        const expecting = "Sriram";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testLastOpList(): void {
        const e = new ST("<last(names)>");
        e?.add("names", ["Ter", "Tom", "Sriram"]);
        const expecting = "Sriram";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testLastOpArray(): void {
        const e = new ST("<last(names)>");
        e?.add("names", ["Ter", "Tom", "Sriram"]);
        const expecting = "Sriram";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testLastOpPrimitiveArray(): void {
        const e = new ST("<last(names)>");
        e?.add("names", [0, 1, 2]);
        const expecting = "2";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testStripOp(): void {
        const e = new ST("<strip(names); null=\"n/a\">");
        e?.add("names", null);
        e?.add("names", "Tom");
        e?.add("names", null);
        e?.add("names", null);
        e?.add("names", "Sriram");
        e?.add("names", null);
        const expecting = "TomSriram";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testStripOpList(): void {
        const e = new ST("<strip(names); null=\"n/a\">");
        e?.add("names", [null, "Tom", null, null, "Sriram", null]);
        const expecting = "TomSriram";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testStripOpArray(): void {
        const e = new ST(
            "<strip(names); null=\"n/a\">",
        );
        e?.add("names", [null, "Tom", null, null, "Sriram", null]);
        const expecting = "TomSriram";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testLengthStrip(): void {
        const e = new ST(
            "<length(strip(names))>",
        );
        e?.add("names", null);
        e?.add("names", "Tom");
        e?.add("names", null);
        e?.add("names", null);
        e?.add("names", "Sriram");
        e?.add("names", null);
        const expecting = "2";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testLengthStripList(): void {
        const e = new ST(
            "<length(strip(names))>",
        );
        e?.add("names", [null, "Tom", null, null, "Sriram", null]);
        const expecting = "2";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testLengthStripArray(): void {
        const e = new ST("<length(strip(names))>");
        e?.add("names", [null, "Tom", null, null, "Sriram", null]);
        const expecting = "2";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testCombinedOp(): void {
        // replace first of yours with first of mine
        const e = new ST("<[first(mine),rest(yours)]; separator=\", \">");
        e?.add("mine", "1");
        e?.add("mine", "2");
        e?.add("mine", "3");
        e?.add("yours", "a");
        e?.add("yours", "b");
        const expecting = "1, b";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testCombinedOpList(): void {
        // replace first of yours with first of mine
        const e = new ST("<[first(mine),rest(yours)]; separator=\", \">");
        e?.add("mine", ["1", "2", "3"]);
        e?.add("yours", "a");
        e?.add("yours", "b");
        const expecting = "1, b";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testCombinedOpArray(): void {
        // replace first of yours with first of mine
        const e = new ST("<[first(mine),rest(yours)]; separator=\", \">");
        e?.add("mine", ["1", "2", "3"]);
        e?.add("yours", "a");
        e?.add("yours", "b");
        const expecting = "1, b";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testCombinedOpPrimitiveArray(): void {
        // replace first of yours with first of mine
        const e = new ST("<[first(mine),rest(yours)]; separator=\", \">");
        e?.add("mine", [1, 2, 3]);
        e?.add("yours", "a");
        e?.add("yours", "b");
        const expecting = "1, b";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testCatListAndSingleAttribute(): void {
        // replace first of yours with first of mine
        const e = new ST("<[mine,yours]; separator=\", \">");
        e?.add("mine", "1");
        e?.add("mine", "2");
        e?.add("mine", "3");
        e?.add("yours", "a");
        const expecting = "1, 2, 3, a";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testCatListAndSingleAttribute2(): void {
        // replace first of yours with first of mine
        const e = new ST("<[mine,yours]; separator=\", \">");
        e?.add("mine", ["1", "2", "3"]);
        e?.add("yours", "a");
        const expecting = "1, 2, 3, a";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testCatArrayAndSingleAttribute(): void {
        // replace first of yours with first of mine
        const e = new ST("<[mine,yours]; separator=\", \">");
        e?.add("mine", ["1", "2", "3"]);
        e?.add("yours", "a");
        const expecting = "1, 2, 3, a";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testCatPrimitiveArrayAndSingleAttribute(): void {
        // replace first of yours with first of mine
        const e = new ST("<[mine,yours]; separator=\", \">");
        e?.add("mine", [1, 2, 3]);
        e?.add("yours", "a");
        const expecting = "1, 2, 3, a";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testReUseOfCat(): void {
        const templates =
            "a(mine,yours) ::= \"<b([mine,yours])>\"" + Misc.newLine +
            "b(x) ::= \"<x>, <x>\"" + Misc.newLine;
        TestFunctions.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const e = group.getInstanceOf("a");
        const mine = ["Ter", "Tom"];
        e?.add("mine", mine);
        const yours = ["Foo"];
        e?.add("yours", yours);
        const expecting = "TerTomFoo, TerTomFoo";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testCatListAndEmptyAttributes(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true; // Expecting an error about x.

        // + is overloaded to be cat strings and cat lists so the
        // two operands (from left to right) determine which way it
        // goes.  In this case, x+mine is a list so everything from their
        // to the right becomes list cat.
        const e = new ST("<[x,mine,y,yours,z]; separator=\", \">");
        e?.add("mine", "1");
        e?.add("mine", "2");
        e?.add("mine", "3");
        e?.add("yours", "a");
        const expecting = "1, 2, 3, a";
        assertEquals(expecting, e?.render());

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testCatListAndEmptyAttributes2(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true; // Expecting an error about x.

        // + is overloaded to be cat strings and cat lists so the
        // two operands (from left to right) determine which way it
        // goes.  In this case, x+mine is a list so everything from their
        // to the right becomes list cat.
        const e = new ST("<[x,mine,y,yours,z]; separator=\", \">");
        e?.add("mine", ["1", "2", "3"]);
        e?.add("yours", "a");
        const expecting = "1, 2, 3, a";
        assertEquals(expecting, e?.render());

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testCatArrayAndEmptyAttributes2(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true; // Expecting an error about x.

        // + is overloaded to be cat strings and cat lists so the
        // two operands (from left to right) determine which way it
        // goes.  In this case, x+mine is a list so everything from their
        // to the right becomes list cat.
        const e = new ST("<[x,mine,y,yours,z]; separator=\", \">");
        e?.add("mine", ["1", "2", "3"]);
        e?.add("yours", "a");
        const expecting = "1, 2, 3, a";
        assertEquals(expecting, e?.render());

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testCatPrimitiveArrayAndEmptyAttributes(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true; // Expecting an error about x.

        // + is overloaded to be cat strings and cat lists so the
        // two operands (from left to right) determine which way it
        // goes.  In this case, x+mine is a list so everything from their
        // to the right becomes list cat.
        const e = new ST("<[x,mine,y,yours,z]; separator=\", \">");
        e?.add("mine", [1, 2, 3]);
        e?.add("yours", "a");
        const expecting = "1, 2, 3, a";
        assertEquals(expecting, e?.render());

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testNestedOp(): void {
        const e = new ST("<first(rest(names))>"); // gets 2nd element
        e?.add("names", "Ter");
        e?.add("names", "Tom");
        e?.add("names", "Sriram");
        const expecting = "Tom";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testNestedOpList(): void {
        const e = new ST("<first(rest(names))>"); // gets 2nd element
        e?.add("names", ["Ter", "Tom", "Sriram"]);
        const expecting = "Tom";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testNestedOpArray(): void {
        const e = new ST("<first(rest(names))>"); // gets 2nd element
        e?.add("names", ["Ter", "Tom", "Sriram"]);
        const expecting = "Tom";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testNestedOpPrimitiveArray(): void {
        const e = new ST("<first(rest(names))>"); // gets 2nd element
        e?.add("names", [0, 1, 2]);
        const expecting = "1";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testFirstWithOneAttributeOp(): void {
        const e = new ST("<first(names)>");
        e?.add("names", "Ter");
        const expecting = "Ter";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testLastWithOneAttributeOp(): void {
        const e = new ST("<last(names)>");
        e?.add("names", "Ter");
        const expecting = "Ter";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testLastWithLengthOneListAttributeOp(): void {
        const e = new ST("<last(names)>");
        e?.add("names", ["Ter"]);
        const expecting = "Ter";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testLastWithLengthOneArrayAttributeOp(): void {
        const e = new ST("<last(names)>");
        e?.add("names", ["Ter"]);
        const expecting = "Ter";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testLastWithLengthOnePrimitiveArrayAttributeOp(): void {
        const e = new ST("<last(names)>");
        e?.add("names", [0]);
        const expecting = "0";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRestWithOneAttributeOp(): void {
        const e = new ST("<rest(names)>");
        e?.add("names", "Ter");
        const expecting = "";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRestWithLengthOneArrayAttributeOp(): void {
        const e = new ST("<rest(names)>");
        e?.add("names", ["Ter"]);
        const expecting = "";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRestWithLengthOnePrimitiveArrayAttributeOp(): void {
        const e = new ST("<rest(names)>");
        e?.add("names", [0]);
        const expecting = "";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRepeatedRestOp(): void {
        const e = new ST("<rest(names)>, <rest(names)>"); // gets 2nd element
        e?.add("names", "Ter");
        e?.add("names", "Tom");
        const expecting = "Tom, Tom";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRepeatedRestOpArray(): void {
        const e = new ST("<rest(names)>, <rest(names)>"); // gets 2nd element
        e?.add("names", ["Ter", "Tom"]);
        const expecting = "Tom, Tom";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testRepeatedRestOpPrimitiveArray(): void {
        const e = new ST("<rest(names)>, <rest(names)>"); // gets 2nd element
        e?.add("names", [0, 1]);
        const expecting = "1, 1";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testIncomingLists(): void {
        const e = new ST("<rest(names)>, <rest(names)>"); // gets 2nd element
        e?.add("names", "Ter");
        e?.add("names", "Tom");
        const expecting = "Tom, Tom";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testFirstWithCatAttribute(): void {
        const e = new ST("<first([names,phones])>");
        e?.add("names", "Ter");
        e?.add("names", "Tom");
        e?.add("phones", "1");
        e?.add("phones", "2");
        const expecting = "Ter";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testFirstWithListOfMaps(): void {
        const e = new ST("<first(maps).Ter>");
        const m1 = new Map<string, string>();
        const m2 = new Map<string, string>();
        m1.set("Ter", "x5707");
        e?.add("maps", m1);
        m2.set("Tom", "x5332");
        e?.add("maps", m2);
        let expecting = "x5707";
        assertEquals(expecting, e?.render());

        const list = [m1, m2];
        e?.add("maps", list);
        expecting = "x5707";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testFirstWithListOfMaps2(): void {
        const e = new ST("<first(maps):{ m | <m>!}>");
        const m1 = new Map<string, string>();
        const m2 = new Map<string, string>();
        m1.set("Ter", "x5707");
        e?.add("maps", m1);
        m2.set("Tom", "x5332");
        e?.add("maps", m2);
        let expecting = "Ter!";
        assertEquals(expecting, e?.render());

        const list = [m1, m2];
        e?.add("maps", list);
        expecting = "Ter!";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testTrim(): void {
        const e = new ST("<trim(name)>");
        e?.add("name", " Ter  \n");
        const expecting = "Ter";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testStrlen(): void {
        const e = new ST("<strlen(name)>");
        e?.add("name", "012345");
        const expecting = "6";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testReverse(): void {
        const e = new ST("<reverse(names); separator=\", \">");
        e?.add("names", "Ter");
        e?.add("names", "Tom");
        e?.add("names", "Sriram");
        const expecting = "Sriram, Tom, Ter";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testReverseArray(): void {
        const e = new ST(
            "<reverse(names); separator=\", \">",
        );
        e?.add("names", ["Ter", "Tom", "Sriram"]);
        const expecting = "Sriram, Tom, Ter";
        assertEquals(expecting, e?.render());
    }

    @Test
    public testReversePrimitiveArray(): void {
        const e = new ST(
            "<reverse(names); separator=\", \">",
        );
        e?.add("names", [0, 1, 2]);
        const expecting = "2, 1, 0";
        assertEquals(expecting, e?.render());
    }

}
