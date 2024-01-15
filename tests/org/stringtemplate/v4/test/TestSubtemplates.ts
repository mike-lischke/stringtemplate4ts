/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { TestCoreBasics } from "./TestCoreBasics.js";
import { BaseTest } from "./BaseTest.js";
import { STGroup, ST, STGroupFile, ErrorBuffer, Misc } from "../../../../../src/index.js";
import { assertEquals } from "../../../../junit.js";

import { Test } from "../../../../decorators.js";

export class TestSubtemplates extends BaseTest {

    @Test
    public testSimpleIteration(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "<names:{n|<n>}>!");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        const expected = "TerTomSumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testMapIterationIsByKeys(): void {
        const group = new STGroup();
        group.defineTemplate("test", "emails", "<emails:{n|<n>}>!");
        const st = group.getInstanceOf("test");
        const emails = new Map<string, string>();
        emails.set("parrt", "Ter");
        emails.set("tombu", "Tom");
        emails.set("dmose", "Dan");
        st?.add("emails", emails);
        const expected = "parrttombudmose!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSimpleIterationWithArg(): void {
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
    public testNestedIterationWithArg(): void {
        const group = new STGroup();
        group.defineTemplate("test", "users", "<users:{u | <u.id:{id | <id>=}><u.name>}>!");
        const st = group.getInstanceOf("test");
        st?.add("users", new TestCoreBasics.User(1, "parrt"));
        st?.add("users", new TestCoreBasics.User(2, "tombu"));
        st?.add("users", new TestCoreBasics.User(3, "sri"));
        const expected = "1=parrt2=tombu3=sri!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSubtemplateAsDefaultArg(): void {
        const templates =
            "t(x,y={<x:{s|<s><s>}>}) ::= <<\n" +
            "x: <x>\n" +
            "y: <y>\n" +
            ">>" + Misc.newLine
            ;
        TestSubtemplates.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const b = group.getInstanceOf("t");
        b?.add("x", "a");
        const expecting =
            "x: a" + Misc.newLine +
            "y: aa";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testParallelAttributeIteration(): void {
        const e = new ST(
            "<names,phones,salaries:{n,p,s | <n>@<p>: <s>\n}>",
        );
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("phones", "1");
        e.add("phones", "2");
        e.add("salaries", "big");
        e.add("salaries", "huge");
        const expecting = "Ter@1: big" + Misc.newLine + "Tom@2: huge" + Misc.newLine;
        assertEquals(expecting, e.render());
    }

    @Test
    public testParallelAttributeIterationWithNullValue(): void {
        const e = new ST(
            "<names,phones,salaries:{n,p,s | <n>@<p>: <s>\n}>",
        );
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("names", "Sriram");
        e.add("phones", ["1", null, "3"]);
        e.add("salaries", "big");
        e.add("salaries", "huge");
        e.add("salaries", "enormous");
        const expecting = "Ter@1: big" + Misc.newLine +
            "Tom@: huge" + Misc.newLine +
            "Sriram@3: enormous" + Misc.newLine;
        assertEquals(expecting, e.render());
    }

    @Test
    public testParallelAttributeIterationHasI(): void {
        const e = new ST("<names,phones,salaries:{n,p,s | <i0>. <n>@<p>: <s>\n}>");
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("phones", "1");
        e.add("phones", "2");
        e.add("salaries", "big");
        e.add("salaries", "huge");
        const expecting =
            "0. Ter@1: big" + Misc.newLine +
            "1. Tom@2: huge" + Misc.newLine;
        assertEquals(expecting, e.render());
    }

    @Test
    public testParallelAttributeIterationWithDifferentSizes(): void {
        const e = new ST("<names,phones,salaries:{n,p,s | <n>@<p>: <s>}; separator=\", \">");
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("names", "Sriram");
        e.add("phones", "1");
        e.add("phones", "2");
        e.add("salaries", "big");
        const expecting = "Ter@1: big, Tom@2: , Sriram@: ";
        assertEquals(expecting, e.render());
    }

    @Test
    public testParallelAttributeIterationWithSingletons(): void {
        const e = new ST("<names,phones,salaries:{n,p,s | <n>@<p>: <s>}; separator=\", \">");
        e.add("names", "Ter");
        e.add("phones", "1");
        e.add("salaries", "big");
        const expecting = "Ter@1: big";
        assertEquals(expecting, e.render());
    }

    @Test
    public testParallelAttributeIterationWithDifferentSizesTemplateRefInsideToo(): void {
        const templates =
            "page(names,phones,salaries) ::= " + Misc.newLine +
            "   << <names,phones,salaries:{n,p,s | <value(n)>@<value(p)>: <value(s)>}; separator=\", \"> >>" +
            Misc.newLine +
            "value(x) ::= \"<if(!x)>n/a<else><x><endif>\"" + Misc.newLine;
        TestSubtemplates.writeFile(this.tmpdir, "g.stg", templates);

        const group = new STGroupFile(this.tmpdir + "/g.stg");
        const p = group.getInstanceOf("page");
        p?.add("names", "Ter");
        p?.add("names", "Tom");
        p?.add("names", "Sriram");
        p?.add("phones", "1");
        p?.add("phones", "2");
        p?.add("salaries", "big");
        const expecting = " Ter@1: big, Tom@2: n/a, Sriram@n/a: n/a ";
        assertEquals(expecting, p?.render());
    }

    @Test
    public testEvalSTIteratingSubtemplateInSTFromAnotherGroup(): void {
        const errors = new ErrorBuffer();
        const innerGroup = new STGroup();
        innerGroup.setListener(errors);
        innerGroup.defineTemplate("test", "m", "<m:samegroup()>");
        innerGroup.defineTemplate("samegroup", "x", "hi ");
        const st = innerGroup.getInstanceOf("test");
        st?.add("m", [1, 2, 3]);

        const outerGroup = new STGroup();
        outerGroup.defineTemplate("errorMessage", "x", "<x>");
        const outerST = outerGroup.getInstanceOf("errorMessage");
        outerST?.add("x", st);

        const expected = "hi hi hi ";
        const result = outerST?.render();

        assertEquals(errors.size, 0); // ignores no such prop errors

        assertEquals(expected, result);
    }

    @Test
    public testEvalSTIteratingSubtemplateInSTFromAnotherGroupSingleValue(): void {
        const errors = new ErrorBuffer();
        const innerGroup = new STGroup();
        innerGroup.setListener(errors);
        innerGroup.defineTemplate("test", "m", "<m:samegroup()>");
        innerGroup.defineTemplate("samegroup", "x", "hi ");
        const st = innerGroup.getInstanceOf("test");
        st?.add("m", 10);

        const outerGroup = new STGroup();
        outerGroup.defineTemplate("errorMessage", "x", "<x>");
        const outerST = outerGroup.getInstanceOf("errorMessage");
        outerST?.add("x", st);

        const expected = "hi ";
        const result = outerST?.render();

        assertEquals(errors.size, 0); // ignores no such prop errors

        assertEquals(expected, result);
    }

    @Test
    public testEvalSTFromAnotherGroup(): void {
        const errors = new ErrorBuffer();
        const innerGroup = new STGroup();
        innerGroup.setListener(errors);
        innerGroup.defineTemplate("bob", "inner");
        const st = innerGroup.getInstanceOf("bob");

        const outerGroup = new STGroup();
        outerGroup.setListener(errors);
        outerGroup.defineTemplate("errorMessage", "x", "<x>");
        outerGroup.defineTemplate("bob", "outer"); // should not be visible to test() in innerGroup
        const outerST = outerGroup.getInstanceOf("errorMessage");
        outerST?.add("x", st);

        const expected = "inner";
        const result = outerST?.render();

        assertEquals(errors.size, 0); // ignores no such prop errors

        assertEquals(expected, result);
    }

}
