/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

// cspell: disable

import { Misc, ST, STGroupString } from "../../../../../src/index.js";
import { assertEquals } from "../../../../junit.js";
import { BaseTest } from "./BaseTest.js";

import { Test } from "../../../../decorators.js";

/** */
export class TestAggregates extends BaseTest {

    private static Decl = class Decl {
        protected name: string;
        protected type: string;
        public constructor(name: string, type: string) {
            this.name = name; this.type = type;
        }

        public getName(): string { return this.name; }
        public getType(): string { return this.type; }
    };

    @Test
    public simpleTemplate(): void {
        const hello = new ST("Hello, <name>");
        hello.add("name", "World");
        assertEquals("Hello, World", hello.render());
    }

    @Test
    public testApplyAnonymousTemplateToAggregateAttribute(): void {
        const st = new ST("<items:{it|<it.id>: <it.lastName>, <it.firstName>\n}>");
        // also testing wacky spaces in aggregate spec
        st.addAggr("items.{ firstName ,lastName, id }", "Ter", "Parr", 99);
        st.addAggr("items.{firstName, lastName ,id}", "Tom", "Burns", 34);
        const expecting =
            "99: Parr, Ter" + Misc.newLine +
            "34: Burns, Tom" + Misc.newLine;
        assertEquals(expecting, st.render());
    }

    @Test
    public testComplicatedIndirectTemplateApplication(): void {
        const templates =
            "group Java;" + Misc.newLine +
            "" + Misc.newLine +
            "file(variables) ::= <<\n" +
            "<variables:{ v | <v.decl:(v.format)()>}; separator=\"\\n\">" + Misc.newLine +
            ">>" + Misc.newLine +
            "intdecl(decl) ::= \"int <decl.name> = 0;\"" + Misc.newLine +
            "intarray(decl) ::= \"int[] <decl.name> = null;\"" + Misc.newLine
            ;
        const group = new STGroupString(templates);
        const f = group.getInstanceOf("file")!;
        f.addAggr("variables.{ decl,format }", new TestAggregates.Decl("i", "int"), "intdecl");
        f.addAggr("variables.{decl ,  format}", new TestAggregates.Decl("a", "int-array"), "intarray");

        const expecting = "int i = 0;" + Misc.newLine + "int[] a = null;";
        assertEquals(expecting, f.render());
    }

}
