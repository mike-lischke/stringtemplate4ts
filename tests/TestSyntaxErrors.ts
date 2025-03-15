/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

import { BaseTest } from "./BaseTest.js";
import { assertEquals } from "./junit.js";
import { STGroup, ErrorBuffer, STException, STGroupFile, Misc } from "../src/index.js";

import { Test } from "./decorators.js";

export class TestSyntaxErrors extends BaseTest {
    @Test
    public testEmptyExpr(): void {
        const template = " <> ";
        const group = new STGroup();
        const errors = new ErrorBuffer();
        group.setListener(errors);
        try {
            group.defineTemplate("test", template);
        } catch (se) {
            if (se instanceof STException) {
                /* assert false; */
            } else {
                throw se;
            }
        }
        const result = errors.toString();
        const expected = "[test 1:0: this doesn't look like a template]";
        assertEquals(expected, result);
    }

    @Test
    public testEmptyExpr2(): void {
        const template = "hi <> ";
        const group = new STGroup();
        const errors = new ErrorBuffer();
        group.setListener(errors);
        try {
            group.defineTemplate("test", template);
        } catch (se) {
            if (se instanceof STException) {
                /* assert false; */
            } else {
                throw se;
            }
        }
        const result = errors.toString();
        const expected = "[test 1:3: doesn't look like an expression]";
        assertEquals(expected, result);
    }

    @Test
    public testUnterminatedExpr(): void {
        const template = "hi <t()$";
        const group = new STGroup();
        const errors = new ErrorBuffer();
        group.setListener(errors);
        try {
            group.defineTemplate("test", template);
        } catch (se) {
            if (se instanceof STException) {
                /* assert false; */
            } else {
                throw se;
            }
        }
        const result = errors.toString();
        const expected = "[test 1:7: invalid character '$', test 1:8: invalid character '<EOF>', test 1:7: " +
            "premature EOF]";
        assertEquals(expected, result);
    }

    @Test
    public testWeirdChar(): void {
        const template = "   <*>";
        const group = new STGroup();
        const errors = new ErrorBuffer();
        group.setListener(errors);
        try {
            group.defineTemplate("test", template);
        } catch (se) {
            if (se instanceof STException) {
                /* assert false; */
            } else {
                throw se;
            }
        }
        const result = errors.toString();
        const expected = "[test 1:4: invalid character '*', test 1:0: this doesn't look like a template]";
        assertEquals(expected, result);
    }

    @Test
    public testWeirdChar2(): void {
        const template = "\n<\\\n";
        const group = new STGroup();
        const errors = new ErrorBuffer();
        group.setListener(errors);
        try {
            group.defineTemplate("test", template);
        } catch (se) {
            if (se instanceof STException) {
                /* assert false; */
            } else {
                throw se;
            }
        }
        const result = errors.toString();
        const expected = "[test 1:2: invalid escaped char: '<EOF>', test 1:3: expecting '>', found '<EOF>']";
        assertEquals(expected, result);
    }

    @Test
    public testValidButOutOfPlaceChar(): void {
        const templates = "foo() ::= <<hi <.> mom>>\n";
        TestSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:15: doesn't look like an expression]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testValidButOutOfPlaceCharOnDifferentLine(): void {
        const templates = "foo() ::= \"hi <" + Misc.newLine + ".> mom\"\n";
        TestSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 2:7: \\n in string, t.stg 1:14: doesn't look like an expression]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testErrorInNestedTemplate(): void {
        const templates = "foo() ::= \"hi <name:{[<aaa.bb!>]}> mom\"\n";
        TestSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:29: '!' came as a complete surprise to me]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testEOFInExpr(): void {
        const templates = "foo() ::= \"hi <name\"";
        TestSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:19: premature EOF]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testEOFInExpr2(): void {
        const templates = "foo() ::= \"hi <name:{x|[<aaa.bb>]}\"\n";
        TestSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:34: premature EOF]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testEOFInString(): void {
        const templates = "foo() ::= << <f(\"foo>>\n";
        TestSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:20: EOF in string, t.stg 1:21: premature EOF]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testNonterminatedComment(): void {
        const templates = "foo() ::= << <!foo> >>";
        TestSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:20: Non-terminated comment starting at 1:1: '!>' missing]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testMissingRPAREN(): void {
        const templates = "foo() ::= \"hi <foo(>\"\n";
        TestSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:19: '>' came as a complete surprise to me]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testRotPar(): void {
        const templates = "foo() ::= \"<a,b:t(),u()>\"\n";
        TestSyntaxErrors.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        group.load(); // force load
        const expected = "[t.stg 1:19: mismatched input ',' expecting {';', RDELIM}]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

}
