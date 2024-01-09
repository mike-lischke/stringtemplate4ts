/* java2ts: keep */

/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import * as path from "path";

import { BaseTest } from "./BaseTest.js";
import { assertEquals } from "../../../../junit.js";
import { STGroupDir, Misc, ErrorBuffer, STGroupFile } from "../../../../../src/index.js";

import { Test } from "../../../../decorators.js";

export class TestTemplateNames extends BaseTest {
    @Test
    public testAbsoluteTemplateRefFromOutside(): void {
        // /randomdir/a and /randomdir/subdir/b
        const dir = this.getRandomDir();
        TestTemplateNames.writeFile(dir, "a.st", "a(x) ::= << </subdir/b()> >>\n");
        TestTemplateNames.writeFile(dir + "/subdir", "b.st", "b() ::= <<bar>>\n");
        const group = new STGroupDir(dir);
        assertEquals(" bar ", group.getInstanceOf("a")!.render());
        assertEquals(" bar ", group.getInstanceOf("/a")!.render());
        assertEquals("bar", group.getInstanceOf("/subdir/b")!.render());
    }

    @Test
    public testRelativeTemplateRefInExpr(): void {
        // /randomdir/a and /randomdir/subdir/b
        const dir = this.getRandomDir();
        TestTemplateNames.writeFile(dir, "a.st", "a(x) ::= << <subdir/b()> >>\n");
        TestTemplateNames.writeFile(dir + "/subdir", "b.st", "b() ::= <<bar>>\n");
        const group = new STGroupDir(dir);
        assertEquals(" bar ", group.getInstanceOf("a")!.render());
    }

    @Test
    public testAbsoluteTemplateRefInExpr(): void {
        // /randomdir/a and /randomdir/subdir/b
        const dir = this.getRandomDir();
        TestTemplateNames.writeFile(dir, "a.st", "a(x) ::= << </subdir/b()> >>\n");
        TestTemplateNames.writeFile(dir + "/subdir", "b.st", "b() ::= <<bar>>\n");
        const group = new STGroupDir(dir);
        assertEquals(" bar ", group.getInstanceOf("a")!.render());
    }

    @Test
    public testRefToAnotherTemplateInSameGroup(): void {
        const dir = this.getRandomDir();
        TestTemplateNames.writeFile(dir, "a.st", "a() ::= << <b()> >>\n");
        TestTemplateNames.writeFile(dir, "b.st", "b() ::= <<bar>>\n");
        const group = new STGroupDir(dir);
        const st = group.getInstanceOf("a")!;
        const expected = " bar ";
        const result = st.render();
        assertEquals(expected, result);
    }

    @Test
    public testRefToAnotherTemplateInSameSubdir(): void {
        // /randomdir/a and /randomdir/subdir/b
        const dir = this.getRandomDir();
        TestTemplateNames.writeFile(dir + "/subdir", "a.st", "a() ::= << <b()> >>\n");
        TestTemplateNames.writeFile(dir + "/subdir", "b.st", "b() ::= <<bar>>\n");
        const group = new STGroupDir(dir);
        // group.getInstanceOf("/subdir/a")!.impl!.dump();
        assertEquals(" bar ", group.getInstanceOf("/subdir/a")!.render());
    }

    @Test
    public testFullyQualifiedGetInstanceOf(): void {
        const dir = this.getRandomDir();
        TestTemplateNames.writeFile(dir, "a.st", "a(x) ::= <<foo>>");
        const group = new STGroupDir(dir);
        assertEquals("foo", group.getInstanceOf("a")!.render());
        assertEquals("foo", group.getInstanceOf("/a")!.render());
    }

    @Test
    public testFullyQualifiedTemplateRef(): void {
        // /randomdir/a and /randomdir/subdir/b
        const dir = this.getRandomDir();
        TestTemplateNames.writeFile(dir + "/subdir", "a.st", "a() ::= << </subdir/b()> >>\n");
        TestTemplateNames.writeFile(dir + "/subdir", "b.st", "b() ::= <<bar>>\n");
        const group = new STGroupDir(dir);
        assertEquals(" bar ", group.getInstanceOf("/subdir/a")!.render());
        assertEquals(" bar ", group.getInstanceOf("subdir/a")!.render());
    }

    @Test
    public testFullyQualifiedTemplateRef2(): void {
        // /randomdir/a and /randomdir/group.stg with b and c templates
        const dir = this.getRandomDir();
        TestTemplateNames.writeFile(dir, "a.st", "a() ::= << </group/b()> >>\n");
        const groupFile =
            "b() ::= \"bar\"\n" +
            "c() ::= \"</a()>\"\n";
        TestTemplateNames.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupDir(dir);
        const st1 = group.getInstanceOf("/a");
        const st2 = group.getInstanceOf("/group/c"); // invokes /a
        const expected = " bar  bar ";
        const result = st1!.render() + st2!.render();
        assertEquals(expected, result);
    }

    @Test
    public testRelativeInSubdir(): void {
        // /randomdir/a and /randomdir/subdir/b
        const dir = this.getRandomDir();
        TestTemplateNames.writeFile(dir, "a.st", "a(x) ::= << </subdir/c()> >>\n");
        TestTemplateNames.writeFile(dir + "/subdir", "b.st", "b() ::= <<bar>>\n");
        TestTemplateNames.writeFile(dir + "/subdir", "c.st", "c() ::= << <b()> >>\n");
        const group = new STGroupDir(dir);
        assertEquals("  bar  ", group.getInstanceOf("a")!.render());
    }

    /**
     * This is a regression test for antlr/stringtemplate4#94.
     */
    @Test
    public testIdWithHyphens(): void {
        const templates =
            "template-a(x-1) ::= \"[<x-1>]\"" + Misc.newLine +
            "template-b(x-2) ::= <<" + Misc.newLine +
            "<template-a(x-2)>" + Misc.newLine +
            ">>" + Misc.newLine +
            "t-entry(x-3) ::= <<[<template-b(x-3)>]>>" + Misc.newLine;

        TestTemplateNames.writeFile(this.tmpdir, "t.stg", templates);
        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const template = group.getInstanceOf("t-entry")!;
        template.add("x-3", "x");
        const expected = "[[x]]";
        const result = template.render();
        assertEquals(expected, result);

        assertEquals("[]", errors.toString());
    }

    // TODO: test <a/b()> is RELATIVE NOT ABSOLUTE
}
