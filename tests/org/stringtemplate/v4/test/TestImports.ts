/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { assertEquals, assertTrue } from "../../../../junit.js";
import { STGroupFile, STGroupDir, ErrorBuffer } from "../../../../../src/index.js";

import { Test } from "../../../../decorators.js";

export class TestImports extends BaseTest {
    @Test
    public testImportDir(): void {
        /*
        dir1
            g.stg has a() that imports dir2 with absolute path
        dir2
            a.st
            b.st
         */
        const dir1 = this.getRandomDir() + "/dir1";
        const dir2 = this.getRandomDir() + "/dir2";
        const gstr =
            "import \"" + dir2 + "\"\n" +
            "a() ::= <<dir1 a>>\n";
        TestImports.writeFile(dir1, "g.stg", gstr);

        const a = "a() ::= <<dir2 a>>\n";
        const b = "b() ::= <<dir2 b>>\n";
        TestImports.writeFile(dir2, "a.st", a);
        TestImports.writeFile(dir2, "b.st", b);

        const group = new STGroupFile(dir1 + "/g.stg");
        const st = group.getInstanceOf("b"); // visible only if import worked
        const expected = "dir2 b";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testImportRelativeDir(): void {
        /*
        dir
            g.stg has a() that imports subdir with relative path
            subdir
                a.st
                b.st
                c.st
         */
        const dir = this.getRandomDir();
        const gstr =
            "import \"subdir\"\n" + // finds subdir in dir
            "a() ::= <<dir1 a>>\n";
        TestImports.writeFile(dir, "g.stg", gstr);

        const a = "a() ::= <<subdir a>>\n";
        const b = "b() ::= <<subdir b>>\n";
        const c = "c() ::= <<subdir c>>\n";
        TestImports.writeFile(dir, "subdir/a.st", a);
        TestImports.writeFile(dir, "subdir/b.st", b);
        TestImports.writeFile(dir, "subdir/c.st", c);

        const group = new STGroupFile(dir + "/g.stg");
        let st = group.getInstanceOf("b"); // visible only if import worked
        let expected = "subdir b";
        let result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
        st = group.getInstanceOf("c");
        result = st?.render() ?? null;
        expected = "subdir c";
        assertEquals(expected, result);
    }

    @Test
    public testEmptyGroupImportGroupFileSameDir(): void {
        /*
        dir
            group1.stg      that imports group2.stg in same dir with just filename
            group2.stg      has c()
         */
        const dir = this.getRandomDir();
        let groupFile =
            "import \"group2.stg\"\n";
        TestImports.writeFile(dir, "group1.stg", groupFile);

        groupFile =
            "c() ::= \"g2 c\"\n";
        TestImports.writeFile(dir, "group2.stg", groupFile);

        const group1 = new STGroupFile(dir + "/group1.stg");
        const st = group1.getInstanceOf("c"); // should see c()
        const expected = "g2 c";
        const result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
    }

    @Test
    public testImportGroupFileSameDir(): void {
        /*
        dir
            group1.stg      that imports group2.stg in same dir with just filename
            group2.stg      has c()
         */
        const dir = this.getRandomDir();
        let groupFile =
            "import \"group2.stg\"\n" +
            "a() ::= \"g1 a\"\n" +
            "b() ::= \"<c()>\"\n";
        TestImports.writeFile(dir, "group1.stg", groupFile);

        groupFile =
            "c() ::= \"g2 c\"\n";
        TestImports.writeFile(dir, "group2.stg", groupFile);

        const group1 = new STGroupFile(dir + "/group1.stg");
        const st = group1.getInstanceOf("c"); // should see c()
        const expected = "g2 c";
        const result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
    }

    @Test
    public testImportRelativeGroupFile(): void {
        /*
        dir
            group1.stg      that imports group2.stg in same dir with just filename
            subdir
                group2.stg  has c()
         */
        const dir = this.getRandomDir();
        let groupFile =
            "import \"subdir/group2.stg\"\n" +
            "a() ::= \"g1 a\"\n" +
            "b() ::= \"<c()>\"\n";
        TestImports.writeFile(dir, "group1.stg", groupFile);

        groupFile =
            "c() ::= \"g2 c\"\n";
        TestImports.writeFile(dir, "subdir/group2.stg", groupFile);

        const group1 = new STGroupFile(dir + "/group1.stg");
        const st = group1.getInstanceOf("c"); // should see c()
        const expected = "g2 c";
        const result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
    }

    @Test
    public testImportTemplateFileSameDir(): void {
        /*
        dir
            group1.stg      (that imports c.st)
            c.st
         */
        const dir = this.getRandomDir();
        const groupFile =
            "import \"c.st\"\n" +
            "a() ::= \"g1 a\"\n" +
            "b() ::= \"<c()>\"\n";
        TestImports.writeFile(dir, "group1.stg", groupFile);
        TestImports.writeFile(dir, "c.st", "c() ::= \"c\"\n");

        const group1 = new STGroupFile(dir + "/group1.stg");
        const st = group1.getInstanceOf("c"); // should see c()
        const expected = "c";
        const result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
    }

    @Test
    public testImportRelativeTemplateFile(): void {
        /*
        dir
            group1.stg      that imports c.st
            subdir
                c.st
         */
        const dir = this.getRandomDir();
        const groupFile =
            "import \"subdir/c.st\"\n" +
            "a() ::= \"g1 a\"\n" +
            "b() ::= \"<c()>\"\n";
        TestImports.writeFile(dir, "group1.stg", groupFile);

        const stFile =
            "c() ::= \"c\"\n";
        TestImports.writeFile(dir, "subdir/c.st", stFile);

        const group1 = new STGroupFile(dir + "/group1.stg");
        const st = group1.getInstanceOf("c"); // should see c()
        const expected = "c";
        const result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
    }

    @Test
    public testImportTemplateFromAnotherGroupObject(): void {
        /*
        dir1
            a.st
            b.st
        dir2
            a.st
         */
        const dir1 = this.getRandomDir();
        let a = "a() ::= <<dir1 a>>\n";
        const b = "b() ::= <<dir1 b>>\n";
        TestImports.writeFile(dir1, "a.st", a);
        TestImports.writeFile(dir1, "b.st", b);
        const dir2 = this.getRandomDir();
        a = "a() ::= << <b()> >>\n";
        TestImports.writeFile(dir2, "a.st", a);

        const group1 = new STGroupDir(dir1);
        const group2 = new STGroupDir(dir2);
        group2.importTemplates(group1);
        let st = group2.getInstanceOf("b");
        let expected = "dir1 b";
        let result = st !== null ? st?.render() : null;
        assertEquals(expected, result);

        // do it again, but make a template ref imported template
        st = group2.getInstanceOf("a");
        expected = " dir1 b ";
        result = st?.render() ?? null;
        assertEquals(expected, result);
    }

    @Test
    public testImportTemplateInGroupFileFromDir(): void {
        /*
        dir
            x
                a.st
            y
                group.stg       has b, c
         */
        const dir = this.getRandomDir();
        TestImports.writeFile(dir, "x/a.st", "a() ::= << <b()> >>");

        const groupFile =
            "b() ::= \"group file b\"\n" +
            "c() ::= \"group file c\"\n";
        TestImports.writeFile(dir, "y/group.stg", groupFile);

        const group1 = new STGroupDir(dir + "/x");
        const group2 = new STGroupFile(dir + "/y/group.stg");
        group1.importTemplates(group2);
        const st = group1.getInstanceOf("a");
        const expected = " group file b ";
        const result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
    }

    @Test
    public testImportTemplateInGroupFileFromGroupFile(): void {
        const dir = this.getRandomDir();
        let groupFile =
            "a() ::= \"g1 a\"\n" +
            "b() ::= \"<c()>\"\n";
        TestImports.writeFile(dir, "x/group.stg", groupFile);

        groupFile =
            "b() ::= \"g2 b\"\n" +
            "c() ::= \"g2 c\"\n";
        TestImports.writeFile(dir, "y/group.stg", groupFile);

        const group1 = new STGroupFile(dir + "/x/group.stg");
        const group2 = new STGroupFile(dir + "/y/group.stg");
        group1.importTemplates(group2);
        const st = group1.getInstanceOf("b");
        const expected = "g2 c";
        const result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
    }

    @Test
    public testImportTemplateFromSubdir(): void {
        // /randomdir/x/subdir/a and /randomdir/y/subdir/b
        const dir = this.getRandomDir();
        TestImports.writeFile(dir, "x/subdir/a.st", "a() ::= << </subdir/b()> >>");
        TestImports.writeFile(dir, "y/subdir/b.st", "b() ::= <<x's subdir/b>>");

        const group1 = new STGroupDir(dir + "/x");
        const group2 = new STGroupDir(dir + "/y");
        group1.importTemplates(group2);
        const st = group1.getInstanceOf("/subdir/a");
        const expected = " x's subdir/b ";
        const result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
    }

    @Test
    public testImportTemplateFromGroupFile(): void {
        // /randomdir/x/subdir/a and /randomdir/y/subdir.stg which has a and b
        const dir = this.getRandomDir();
        TestImports.writeFile(dir, "x/subdir/a.st", "a() ::= << </subdir/b()> >>");

        const groupFile =
            "a() ::= \"group file: a\"\n" +
            "b() ::= \"group file: b\"\n";
        TestImports.writeFile(dir, "y/subdir.stg", groupFile);

        const group1 = new STGroupDir(dir + "/x");
        const group2 = new STGroupDir(dir + "/y");
        group1.importTemplates(group2);
        const st = group1.getInstanceOf("subdir/a");
        const expected = " group file: b ";
        const result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
    }

    @Test
    public testPolymorphicTemplateReference(): void {
        const dir1 = this.getRandomDir();
        let b = "b() ::= <<dir1 b>>\n";
        TestImports.writeFile(dir1, "b.st", b);
        const dir2 = this.getRandomDir();
        const a = "a() ::= << <b()> >>\n";
        b = "b() ::= <<dir2 b>>\n";
        TestImports.writeFile(dir2, "a.st", a);
        TestImports.writeFile(dir2, "b.st", b);

        const group1 = new STGroupDir(dir1);
        const group2 = new STGroupDir(dir2);
        group1.importTemplates(group2);

        // normal lookup; a created from dir2 calls dir2.b
        let st = group2.getInstanceOf("a");
        let expected = " dir2 b ";
        let result = st !== null ? st?.render() : null;
        assertEquals(expected, result);

        // polymorphic lookup; a created from dir1 calls dir2.a which calls dir1.b
        st = group1.getInstanceOf("a");
        expected = " dir1 b ";
        result = st?.render() ?? null;
        assertEquals(expected, result);
    }

    @Test
    public testSuper(): void {
        const dir1 = this.getRandomDir();
        let a = "a() ::= <<dir1 a>>\n";
        const b = "b() ::= <<dir1 b>>\n";
        TestImports.writeFile(dir1, "a.st", a);
        TestImports.writeFile(dir1, "b.st", b);
        const dir2 = this.getRandomDir();
        a = "a() ::= << [<super.a()>] >>\n";
        TestImports.writeFile(dir2, "a.st", a);

        const group1 = new STGroupDir(dir1);
        const group2 = new STGroupDir(dir2);
        group2.importTemplates(group1);
        const st = group2.getInstanceOf("a");
        const expected = " [dir1 a] ";
        const result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
    }

    @Test
    public testUnloadImportedTemplate(): void {
        const dir1 = this.getRandomDir();
        let a = "a() ::= <<dir1 a>>\n";
        const b = "b() ::= <<dir1 b>>\n";
        TestImports.writeFile(dir1, "a.st", a);
        TestImports.writeFile(dir1, "b.st", b);
        const dir2 = this.getRandomDir();
        a = "a() ::= << <b()> >>\n";
        TestImports.writeFile(dir2, "a.st", a);

        const group1 = new STGroupDir(dir1);
        const group2 = new STGroupDir(dir2);
        group2.importTemplates(group1);

        const st = group2.getInstanceOf("a");
        const st2 = group2.getInstanceOf("b");
        group1.unload(); // blast cache
        const st3 = group2.getInstanceOf("a");
        assertEquals(st === st3, false); // diff objects

        let expected = " dir1 b ";
        let result = st !== null ? st3?.render() : null;
        assertEquals(expected, result);

        const st4 = group2.getInstanceOf("b");
        assertEquals(st2 === st4, false); // diff objects
        result = st4?.render();
        expected = "dir1 b";
        assertEquals(expected, result);
    }

    @Test
    public testUnloadImportedTemplatedSpecifiedInGroupFile(): void {
        TestImports.writeFile(this.tmpdir, "t.stg",
            "import \"g1.stg\"\n\nmain() ::= <<\nv1-<f()>\n>>");
        TestImports.writeFile(this.tmpdir, "g1.stg", "f() ::= \"g1\"");
        TestImports.writeFile(this.tmpdir, "g2.stg", "f() ::= \"g2\"\nf2() ::= \"f2\"\n");
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        let st = group.getInstanceOf("main");
        assertEquals("v1-g1", st?.render());

        // Change the imports of group t.
        TestImports.writeFile(this.tmpdir, "t.stg",
            "import \"g2.stg\"\n\nmain() ::= <<\nv2-<f()>;<f2()>\n>>");
        group.unload(); // will also unload already imported groups
        st = group.getInstanceOf("main");
        assertEquals("v2-g2;f2", st?.render());
    }

    /**
      Cannot import from a group file unless it's the root.
     */
    @Test
    public testGroupFileInDirImportsAnotherGroupFile(): void {
        // /randomdir/group.stg with a() imports /randomdir/imported.stg with b()
        // can't have groupdir then groupfile inside that imports
        const dir = this.getRandomDir();
        const groupFile =
            "import \"imported.stg\"\n" +
            "a() ::= \"a: <b()>\"\n";
        TestImports.writeFile(dir, "group.stg", groupFile);
        const importedFile =
            "b() ::= \"b\"\n";
        TestImports.writeFile(dir, "imported.stg", importedFile);
        const errors = new ErrorBuffer();
        const group = new STGroupDir(dir);
        group.setListener(errors);
        group.getInstanceOf("/group/a");
        const result = errors.toString();
        const expecting =
            "import illegal in group files embedded in STGroupDirs; import \"imported.stg\" in STGroupDir";
        assertTrue(result.includes(expecting));
    }

    @Test
    public testGroupFileInDirImportsAGroupDir(): void {
        /*
        dir
            g.stg has a() that imports subdir with relative path
            subdir
                b.st
                c.st
         */
        const dir = this.getRandomDir();
        const gstr =
            "import \"subdir\"\n" + // finds subdir in dir
            "a() ::= \"a: <b()>\"\n";
        TestImports.writeFile(dir, "g.stg", gstr);

        TestImports.writeFile(dir, "subdir/b.st", "b() ::= \"b: <c()>\"\n");
        TestImports.writeFile(dir, "subdir/c.st", "c() ::= <<subdir c>>\n");

        const group = new STGroupFile(dir + "/g.stg");
        const st = group.getInstanceOf("a");
        const expected = "a: b: subdir c";
        const result = st !== null ? st?.render() : null;
        assertEquals(expected, result);
    }

    @Test
    public testImportUtfTemplateFileSameDir(): void {
        /*
        dir
            group.stg       (that imports c.st)
            c.st
         */
        const dir = this.getRandomDir();
        const groupFile =
            "import \"c.st\"\n" +
            "b() ::= \"foo\"\n";
        TestImports.writeFile(dir, "group.stg", groupFile);
        TestImports.writeFile(dir, "c.st", "c() ::= \"2∏r\"\n");

        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("c"); // should see c()
        const expected = "2∏r";
        const result = st?.render();
        assertEquals(expected, result);
    }
}
