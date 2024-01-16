/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import path from "path";

import { BaseTest } from "./BaseTest.js";
import { assertEquals } from "./junit.js";
import { ErrorBuffer, Misc, STGroupFile } from "../src/index.js";

import { Test } from "./decorators.js";

export class TestGroupSyntaxErrors extends BaseTest {
    @Test
    public testMissingImportString(): void {
        const templates =
            "import\n" +
            "foo() ::= <<>>\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 2:0: mismatched input 'foo' expecting {ID, STRING}, t.stg 2:3: mismatched input '(' " +
            "expecting {<EOF>, '@', '.', 'import', ID}]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testImportNotString(): void {
        const templates =
            "import Super.stg\n" +
            "foo() ::= <<>>\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:7: mismatched input 'Super' expecting {ID, STRING}]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testMissingTemplate(): void {
        const templates = "foo() ::= \n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 2:0: missing template at '<EOF>']";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testUnclosedTemplate(): void {
        const templates = "foo() ::= {";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:0: missing final '}' in {...} anonymous template, " +
            "t.stg 1:10: no viable alternative at input '{']";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testParen(): void {
        const templates = "foo( ::= << >>\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:5: no viable alternative at input '::=']";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testNewlineInString(): void {
        const templates = "foo() ::= \"\nfoo\"\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 2:4: \\n in string]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testParen2(): void {
        const templates =
            "foo) ::= << >>\n" +
            "bar() ::= <<bar>>\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:3: garbled template definition starting at 'foo']";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testArg(): void {
        const templates = "foo(a,) ::= << >>\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:6: missing ID at ')']";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testArg2(): void {
        const templates = "foo(a,,) ::= << >>\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected =
            "[t.stg 1:6: missing ID at ',', " +
            "t.stg 1:7: missing ID at ')', " +
            "t.stg 1:7: redefinition of parameter <missing ID>]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testArg3(): void {
        const templates = "foo(a b) ::= << >>\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:6: extraneous input 'b' expecting ')']";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testDefaultArgsOutOfOrder(): void {
        const templates = "foo(a={hi}, b) ::= << >>\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load

        const expected = "[t.stg 1:9: required parameters (b) must appear before optional parameters]";

        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testArgumentRedefinition(): void {
        const templates = "foo(a,b,a) ::= << >>\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:8: redefinition of parameter a]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testArgumentRedefinitionInSubtemplate(): void {
        const templates =
            "foo(names) ::= <<" + Misc.newLine +
            "<names, names, names:{a,b,a|}>" + Misc.newLine +
            ">>" + Misc.newLine;
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected =
            "[t.stg 1:43: redefinition of parameter a, " +
            "t.stg 1:38: anonymous template has 2 arg(s) but mapped across 3 value(s)]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testErrorWithinTemplate(): void {
        const templates = "foo(a) ::= \"<a b>\"\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:15: 'b' came as a complete surprise to me]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testMap(): void {
        const templates = "d ::= []\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:7: missing dictionary entry at ']']";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testMap2(): void {
        const templates = "d ::= [\"k\":]\n";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:11: mismatched input ']' expecting {'true', 'false', '[', ID, STRING, " +
            "BIGSTRING_NO_NL, BIGSTRING, '{'}]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testMap3(): void {
        const templates = "d ::= [\"k\":{dfkj}}]\n"; // extra }
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:12: token recognition error at: '}']";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testUnterminatedString(): void {
        const templates = "f() ::= \"";
        TestGroupSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:8: token recognition error at: '\"', t.stg 1:9: missing template at '<EOF>']";
        const result = errors.toString();
        assertEquals(expected, result);
    }
}
