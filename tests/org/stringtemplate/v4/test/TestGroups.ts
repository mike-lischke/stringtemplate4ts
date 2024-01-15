/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

/* eslint-disable max-classes-per-file */

import path from "path";

import { BaseTest } from "./BaseTest.js";
import { Assert, assertEquals, assertNull, assertTrue } from "../../../../junit.js";
import { STGroupDir, STGroupString, ErrorBuffer, STGroupFile, Misc } from "../../../../../src/index.js";

import { Test } from "../../../../decorators.js";

class Field {
    public name = "parrt";
    public n = 0;

    public toString(): string {
        return "Field";
    }
}

class Counter {
    public n = 0;

    public toString(): string {
        return String(this.n++);
    }
}

export class TestGroups extends BaseTest {
    @Test
    public testSimpleGroup(): void {
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= <<foo>>");
        const group = new STGroupDir(dir);
        const st = group.getInstanceOf("a");
        const expected = "foo";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testEscapeOneRightAngle(): void {
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= << > >>");
        const group = new STGroupDir(dir);
        const st = group.getInstanceOf("a");
        st?.add("x", "parrt");
        const expected = " > ";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testEscapeOneRightAngle2(): void {
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= << \\> >>");
        const group = new STGroupDir(dir);
        const st = group.getInstanceOf("a");
        st?.add("x", "parrt");
        const expected = " > ";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testEscapeJavaRightShift(): void {
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= << \\>> >>");
        const group = new STGroupDir(dir);
        const st = group.getInstanceOf("a");
        st?.add("x", "parrt");
        const expected = " >> ";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testEscapeJavaRightShift2(): void {
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= << >\\> >>");
        const group = new STGroupDir(dir);
        const st = group.getInstanceOf("a");
        st?.add("x", "parrt");
        const expected = " >> ";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testEscapeJavaRightShiftAtRightEdge(): void {
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= <<\\>>>"); // <<\>>>
        const group = new STGroupDir(dir);
        const st = group.getInstanceOf("a");
        st?.add("x", "parrt");
        const expected = "\\>";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testEscapeJavaRightShiftAtRightEdge2(): void {
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= <<>\\>>>");
        const group = new STGroupDir(dir);
        const st = group.getInstanceOf("a");
        st?.add("x", "parrt");
        const expected = ">>";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSimpleGroupFromString(): void {
        const g =
            "a(x) ::= <<foo>>\n" +
            "b() ::= <<bar>>\n";
        const group = new STGroupString(g);
        const st = group.getInstanceOf("a");
        const expected = "foo";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testGroupWithTwoTemplates(): void {
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= <<foo>>");
        TestGroups.writeFile(dir, "b.st", "b() ::= \"bar\"");
        const group = new STGroupDir(dir);
        const st1 = group.getInstanceOf("a");
        const st2 = group.getInstanceOf("b");
        const expected = "foobar";
        const result = st1!.render() + st2!.render();
        assertEquals(expected, result);
    }

    @Test
    public testSubdir(): void {
        // /randomdir/a and /randomdir/subdir/b
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= <<foo>>");
        TestGroups.writeFile(dir + "/subdir", "b.st", "b() ::= \"bar\"");
        const group = new STGroupDir(dir);
        assertEquals("foo", group.getInstanceOf("a")?.render());
        assertEquals("bar", group.getInstanceOf("/subdir/b")?.render());
        assertEquals("bar", group.getInstanceOf("subdir/b")?.render());
    }

    @Test
    public testSubdirWithSubtemplate(): void {
        // /randomdir/a and /randomdir/subdir/b
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir + "/subdir", "a.st", "a(x) ::= \"<x:{y|<y>}>\"");
        const group = new STGroupDir(dir);
        const st = group.getInstanceOf("/subdir/a");
        st?.add("x", ["a", "b"]);
        assertEquals("ab", st?.render());
    }

    @Test
    public testGroupFileInDir(): void {
        // /randomdir/a and /randomdir/group.stg with b and c templates
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= <<foo>>");
        const groupFile =
            "b() ::= \"bar\"\n" +
            "c() ::= \"duh\"\n";
        TestGroups.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupDir(dir);
        assertEquals("foo", group.getInstanceOf("a")?.render());
        assertEquals("bar", group.getInstanceOf("/group/b")?.render());
        assertEquals("duh", group.getInstanceOf("/group/c")?.render());
    }

    @Test
    public testSubSubdir(): void {
        // /randomdir/a and /randomdir/subdir/b
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= <<foo>>");
        TestGroups.writeFile(dir + "/sub1/sub2", "b.st", "b() ::= \"bar\"");
        const group = new STGroupDir(dir);
        const st1 = group.getInstanceOf("a");
        const st2 = group.getInstanceOf("/sub1/sub2/b");
        const expected = "foobar";
        const result = st1!.render() + st2!.render();
        assertEquals(expected, result);
    }

    @Test
    public testGroupFileInSubDir(): void {
        // /randomdir/a and /randomdir/group.stg with b and c templates
        const dir = this.getRandomDir();
        TestGroups.writeFile(dir, "a.st", "a(x) ::= <<foo>>");
        const groupFile =
            "b() ::= \"bar\"\n" +
            "c() ::= \"duh\"\n";
        TestGroups.writeFile(dir, "subdir/group.stg", groupFile);
        const group = new STGroupDir(dir);
        const st1 = group.getInstanceOf("a");
        const st2 = group.getInstanceOf("subdir/group/b");
        const st3 = group.getInstanceOf("subdir/group/c");
        const expected = "foobarduh";
        const result = st1!.render() + st2!.render() + st3!.render();
        assertEquals(expected, result);
    }

    @Test
    public testDupDef(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "b() ::= \"bar\"\n" +
            "b() ::= \"duh\"\n";
        TestGroups.writeFile(dir, "group.stg", groupFile);
        const errors = new ErrorBuffer();
        const group = new STGroupFile(dir + "/group.stg");
        group.setListener(errors);
        group.load();
        const expected = "[group.stg 2:0: redefinition of template b]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testAlias(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "a() ::= \"bar\"\n" +
            "b ::= a\n";
        TestGroups.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("b");
        const expected = "bar";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testAliasWithArgs(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "a(x,y) ::= \"<x><y>\"\n" +
            "b ::= a\n";
        TestGroups.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("b");
        st?.add("x", 1);
        st?.add("y", 2);
        const expected = "12";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSimpleDefaultArg(): void {
        const dir = this.getRandomDir();
        const a = "a() ::= << <b()> >>\n";
        const b = "b(x=\"foo\") ::= \"<x>\"\n";
        TestGroups.writeFile(dir, "a.st", a);
        TestGroups.writeFile(dir, "b.st", b);
        const group = new STGroupDir(dir);
        const st = group.getInstanceOf("a");
        const expected = " foo ";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDefaultArgument(): void {
        const templates =
            "method(name) ::= <<" + Misc.newLine +
            "<stat(name)>" + Misc.newLine +
            ">>" + Misc.newLine +
            "stat(name,value=\"99\") ::= \"x=<value>; // <name>\"" + Misc.newLine;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const b = group.getInstanceOf("method");
        b?.add("name", "foo");
        const expecting = "x=99; // foo";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testBooleanDefaultArguments(): void {
        const templates =
            "method(name) ::= <<" + Misc.newLine +
            "<stat(name)>" + Misc.newLine +
            ">>" + Misc.newLine +
            "stat(name,x=true,y=false) ::= \"<name>; <x> <y>\"" + Misc.newLine;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const b = group.getInstanceOf("method");
        b?.add("name", "foo");
        const expecting = "foo; true false";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDefaultArgument2(): void {
        const templates = "stat(name,value=\"99\") ::= \"x=<value>; // <name>\"" + Misc.newLine;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const b = group.getInstanceOf("stat");
        b?.add("name", "foo");
        const expecting = "x=99; // foo";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testSubtemplateAsDefaultArgSeesOtherArgs(): void {
        const templates =
            "t(x,y={<x:{s|<s><z>}>},z=\"foo\") ::= <<\n" +
            "x: <x>\n" +
            "y: <y>\n" +
            ">>" + Misc.newLine;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const b = group.getInstanceOf("t");
        b?.add("x", "a");
        const expecting =
            "x: a" + Misc.newLine +
            "y: afoo";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testEarlyEvalOfDefaultArgs(): void {
        const templates = "s(x,y={<(x)>}) ::= \"<x><y>\"\n"; // should see x in def arg
        const group = new STGroupString(templates);
        const b = group.getInstanceOf("s");
        b?.add("x", "a");
        const expecting = "aa";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDefaultArgumentAsSimpleTemplate(): void {
        const templates = "stat(name,value={99}) ::= \"x=<value>; // <name>\"" + Misc.newLine;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const b = group.getInstanceOf("stat");
        b?.add("name", "foo");
        const expecting = "x=99; // foo";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDefaultArgumentManuallySet(): void {
        // set arg f manually for stat(f=f)
        const templates =
            "method(fields) ::= <<" + Misc.newLine +
            "<fields:{f | <stat(f)>}>" + Misc.newLine +
            ">>" + Misc.newLine +
            "stat(f,value={<f.name>}) ::= \"x=<value>; // <f.name>\"" + Misc.newLine
            ;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const m = group.getInstanceOf("method");
        m?.add("fields", new Field());
        const expecting = "x=parrt; // parrt";
        const result = m?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDefaultArgumentSeesVarFromDynamicScoping(): void {
        const templates =
            "method(fields) ::= <<" + Misc.newLine +
            "<fields:{f | <stat()>}>" + Misc.newLine +
            ">>" + Misc.newLine +
            "stat(value={<f.name>}) ::= \"x=<value>; // <f.name>\"" + Misc.newLine
            ;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const m = group.getInstanceOf("method");
        m?.add("fields", new Field());
        const expecting = "x=parrt; // parrt";
        const result = m?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDefaultArgumentImplicitlySet2(): void {
        // f of stat is implicit first arg
        const templates =
            "method(fields) ::= <<" + Misc.newLine +
            "<fields:{f | <f:stat()>}>" + Misc.newLine +
            ">>" + Misc.newLine +
            "stat(f,value={<f.name>}) ::= \"x=<value>; // <f.name>\"" + Misc.newLine
            ;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const m = group.getInstanceOf("method");
        m?.add("fields", new Field());
        const expecting = "x=parrt; // parrt";
        const result = m?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDefaultArgumentAsTemplate(): void {
        const templates =
            "method(name,size) ::= <<" + Misc.newLine +
            "<stat(name)>" + Misc.newLine +
            ">>" + Misc.newLine +
            "stat(name,value={<name>}) ::= \"x=<value>; // <name>\"" + Misc.newLine
            ;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const b = group.getInstanceOf("method");
        b?.add("name", "foo");
        b?.add("size", "2");
        const expecting = "x=foo; // foo";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDefaultArgumentAsTemplate2(): void {
        const templates =
            "method(name,size) ::= <<" + Misc.newLine +
            "<stat(name)>" + Misc.newLine +
            ">>" + Misc.newLine +
            "stat(name,value={ [<name>] }) ::= \"x=<value>; // <name>\"" + Misc.newLine;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const b = group.getInstanceOf("method");
        b?.add("name", "foo");
        b?.add("size", "2");
        const expecting = "x=[foo] ; // foo"; // won't see ' ' after '=' since it's an indent not simple string
        const result = b?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDoNotUseDefaultArgument(): void {
        const templates =
            "method(name) ::= <<" + Misc.newLine +
            "<stat(name,\"34\")>" + Misc.newLine +
            ">>" + Misc.newLine +
            "stat(name,value=\"99\") ::= \"x=<value>; // <name>\"" + Misc.newLine
            ;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const b = group.getInstanceOf("method");
        b?.add("name", "foo");
        const expecting = "x=34; // foo";
        const result = b?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDefaultArgumentInParensToEvalEarly(): void {
        const templates =
            "A(x) ::= \"<B()>\"" + Misc.newLine +
            "B(y={<(x)>}) ::= \"<y> <x> <x> <y>\"" + Misc.newLine;
        TestGroups.writeFile(this.tmpdir, "group.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/group.stg");
        const a = group.getInstanceOf("A");
        a?.add("x", new Counter());
        const expecting = "0 1 2 0"; // trace must be false to get these numbers
        const result = a?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testTrueFalseArgs(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "f(x,y) ::= \"<x><y>\"\n" +
            "g() ::= \"<f(true,{a})>\"";
        TestGroups.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("g");
        const expected = "truea";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testNamedArgsInOrder(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "f(x,y) ::= \"<x><y>\"\n" +
            "g() ::= \"<f(x={a},y={b})>\"";
        TestGroups.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("g");
        const expected = "ab";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testNamedArgsOutOfOrder(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "f(x,y) ::= \"<x><y>\"\n" +
            "g() ::= \"<f(y={b},x={a})>\"";
        TestGroups.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("g");
        const expected = "ab";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testUnknownNamedArg(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "f(x,y) ::= \"<x><y>\"\n" +
            "g() ::= \"<f(x={a},z={b})>\"";
        //012345678901234567

        TestGroups.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const errors = new ErrorBuffer();
        group.setListener(errors);
        const st = group.getInstanceOf("g");
        st?.render();
        const expected = "[context [/g] 1:1 attribute z isn't defined]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testMissingNamedArg(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "f(x,y) ::= \"<x><y>\"\n" +
            "g() ::= \"<f(x={a},{b})>\"";
        //01234567890123456789

        TestGroups.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const errors = new ErrorBuffer();
        group.setListener(errors);
        group.load();
        const expected = "[group.stg 2:18: '{' came as a complete surprise to me]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testNamedArgsNotAllowInIndirectInclude(): void {
        const dir = this.getRandomDir();
        const groupFile =
            "f(x,y) ::= \"<x><y>\"\n" +
            //01234567890 1234567 8 9
            "g(name) ::= \"<(name)(x={a},y={b})>\"";
        //012345678901 2345678901234567890123 4
        TestGroups.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const errors = new ErrorBuffer();
        group.setListener(errors);
        group.load();
        const expected = "[group.stg 2:22: '=' came as a complete surprise to me]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testCantSeeGroupDirIfGroupFileOfSameName(): void {
        const dir = this.getRandomDir();
        const a = "a() ::= <<dir1 a>>\n";
        TestGroups.writeFile(dir, "group/a.st", a); // can't see this file

        const groupFile = "b() ::= \"group file b\"\n";
        TestGroups.writeFile(dir, "group.stg", groupFile);

        const group1 = new STGroupDir(dir);
        const st = group1.getInstanceOf("group/a"); // can't see
        assertNull(st);
    }

    @Test
    public testUnloadingSimpleGroup(): void {
        const dir = this.getRandomDir();
        const a = "a(x) ::= <<foo>>\n";
        const b = "b() ::= <<bar>>\n";
        TestGroups.writeFile(dir, "a.st", a);
        TestGroups.writeFile(dir, "b.st", b);
        const group = new STGroupDir(dir);
        group.load(); // force load
        let st1 = group.getInstanceOf("a");
        group.unload(); // blast cache
        const st2 = group.getInstanceOf("a");
        assertEquals(st1 === st2, false); // diff objects

        let expected = "foo";
        let result = st1?.render();
        assertEquals(expected, result);

        st1 = group.getInstanceOf("b");
        expected = "bar";
        result = st1?.render();
        assertEquals(expected, result);
    }

    @Test
    public testUnloadingGroupFile(): void {
        const dir = this.getRandomDir();
        const a =
            "a(x) ::= <<foo>>\n" +
            "b() ::= <<bar>>\n";
        TestGroups.writeFile(dir, "a.stg", a);
        const group = new STGroupFile(dir + "/a.stg");
        group.load(); // force load
        let st1 = group.getInstanceOf("a");
        group.unload(); // blast cache
        const st2 = group.getInstanceOf("a");
        assertEquals(st1 === st2, false); // diff objects

        let expected = "foo";
        let result = st1?.render();
        assertEquals(expected, result);
        st1 = group.getInstanceOf("b");
        expected = "bar";
        result = st1?.render();
        assertEquals(expected, result);
    }

    @Test
    public testGroupFileImport(): void {
        // /randomdir/group1.stg (a template) and /randomdir/group2.stg with b.
        // group1 imports group2, a includes b
        const dir = this.getRandomDir();
        const groupFile1 =
            "import \"group2.stg\"\n" +
            "a(x) ::= <<\n" +
            "foo<b()>\n" +
            ">>\n";
        TestGroups.writeFile(dir, "group1.stg", groupFile1);
        const groupFile2 =
            "b() ::= \"bar\"\n";
        TestGroups.writeFile(dir, "group2.stg", groupFile2);
        const group1 = new STGroupFile(dir + "/group1.stg");

        // Is the imported template b found?
        const stb = group1.getInstanceOf("b");
        assertEquals("bar", stb?.render());

        // Is the include of b() resolved?
        const sta = group1.getInstanceOf("a");
        assertEquals("foobar", sta?.render());

        // Are the correct "ThatCreatedThisInstance" groups assigned
        assertEquals("group1", sta?.groupThatCreatedThisInstance.getName());
        assertEquals("group1", stb?.groupThatCreatedThisInstance.getName());

        // Are the correct (native) groups assigned for the templates
        assertEquals("group1", sta?.impl?.nativeGroup.getName());
        assertEquals("group2", stb?.impl?.nativeGroup.getName());
    }

    @Test
    public testGetTemplateNames(): void {
        const templates =
            "t() ::= \"foo\"\n" +
            "main() ::= \"<t()>\"";
        TestGroups.writeFile(this.tmpdir, "t.stg", templates);

        const group = new STGroupFile(this.tmpdir + "/t.stg");
        // try to get an undefined template.
        // This will add an entry to the "templates" field in STGroup, however
        // this should not be returned.
        group.lookupTemplate("t2");

        const names = group.getTemplateNames();

        // Should only contain "t" and "main" (not "t2")
        assertEquals(2, names.size);
        assertTrue(names.has("/t"));
        assertTrue(names.has("/main"));
    }

    @Test
    public testUnloadWithImports(): void {
        TestGroups.writeFile(this.tmpdir, "t.stg",
            "import \"g1.stg\"\n\nmain() ::= <<\nv1-<f()>\n>>");
        TestGroups.writeFile(this.tmpdir, "g1.stg", "f() ::= \"g1\"");
        TestGroups.writeFile(this.tmpdir, "g2.stg", "f() ::= \"g2\"\nf2() ::= \"f2\"\n");
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        let st = group.getInstanceOf("main");
        Assert.assertEquals("v1-g1", st?.render());

        // Change the text of group t, including the imports.
        TestGroups.writeFile(this.tmpdir, "t.stg",
            "import \"g2.stg\"\n\nmain() ::= <<\nv2-<f()>;<f2()>\n>>");
        group.unload();
        st = group.getInstanceOf("main");
        Assert.assertEquals("v2-g2;f2", st?.render());
    }

    @Test
    public testLineBreakInGroup(): void {
        const templates =
            "t() ::= <<" + Misc.newLine +
            "Foo <\\\\>" + Misc.newLine +
            "  \t  bar" + Misc.newLine +
            ">>" + Misc.newLine;
        TestGroups.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("t");
        Assert.assertNotNull(st);
        const expecting = "Foo bar";
        Assert.assertEquals(expecting, st?.render());
    }

    @Test
    public testLineBreakInGroup2(): void {
        const templates =
            "t() ::= <<" + Misc.newLine +
            "Foo <\\\\>       " + Misc.newLine +
            "  \t  bar" + Misc.newLine +
            ">>" + Misc.newLine;
        TestGroups.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("t");
        Assert.assertNotNull(st);
        const expecting = "Foo bar";
        Assert.assertEquals(expecting, st?.render());
    }

    @Test
    public testLineBreakMissingTrailingNewline(): void {
        TestGroups.writeFile(this.tmpdir, "t.stg", "a(x) ::= <<<\\\\>\r\n>>"); // that is <<<\\>>> not an escaped >>
        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("a");
        assertEquals("[t.stg 1:15: Missing newline after newline escape <\\\\>]", errors.toString());

        st?.add("x", "parrt");
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testLineBreakWithScarfedTrailingNewline(): void {
        TestGroups.writeFile(this.tmpdir, "t.stg", "a(x) ::= <<<\\\\>\r\n>>"); // \r\n removed as trailing whitespace
        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("a");
        assertEquals("[t.stg 1:15: Missing newline after newline escape <\\\\>]", errors.toString());

        st?.add("x", "parrt");
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    }
}
