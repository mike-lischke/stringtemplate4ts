/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import path from "path";

import { BaseTest } from "./BaseTest.js";
import { assertEquals } from "../../../../junit.js";

import { Test } from "../../../../decorators.js";
import { ErrorBuffer, ErrorManager, STGroupFile } from "../../../../../src/index.js";

export class TestScopes extends BaseTest {
    @Test
    public testSeesEnclosingAttr(): void {
        const templates =
            "t(x,y) ::= \"<u()>\"\n" +
            "u() ::= \"<x><y>\"";
        const errors = new ErrorBuffer();
        TestScopes.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        st?.add("x", "x");
        st?.add("y", "y");
        const result = st?.render();

        assertEquals("[]", errors.toString());

        const expected = "xy";
        assertEquals(expected, result);
    }

    @Test
    public testMissingArg(): void {
        const templates =
            "t() ::= \"<u()>\"\n" +
            "u(z) ::= \"\"";
        const errors = new ErrorBuffer();
        TestScopes.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        st?.render();

        const expectedError = "[context [/t] 1:1 passed 0 arg(s) to template /u with 1 declared arg(s)]";
        assertEquals(expectedError, errors.toString());
    }

    @Test
    public testUnknownAttr(): void {
        const templates = "t() ::= \"<x>\"\n";
        const errors = new ErrorBuffer();
        TestScopes.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        st?.render();

        const expectedError = "[context [/t] 1:1 attribute x isn't defined]";
        assertEquals(expectedError, errors.toString());
    }

    @Test
    public testArgWithSameNameAsEnclosing(): void {
        const templates =
            "t(x,y) ::= \"<u(x)>\"\n" +
            "u(y) ::= \"<x><y>\"";
        const errors = new ErrorBuffer();
        TestScopes.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        st?.add("x", "x");
        st?.add("y", "y");
        const result = st?.render();

        assertEquals("[]", errors.toString());

        const expected = "xx";
        assertEquals(expected, result);
        group.setListener(ErrorManager.DEFAULT_ERROR_LISTENER);
    }

    @Test
    public testIndexAttrVisibleLocallyOnly(): void {
        const templates =
            "t(names) ::= \"<names:{n | <u(n)>}>\"\n" +
            "u(x) ::= \"<i>:<x>\"";
        const errors = new ErrorBuffer();
        TestScopes.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        st?.add("names", "Ter");
        const result = st?.render();
        //group.getInstanceOf("u").impl.dump();

        const expectedError = "[t.stg 2:11: implicitly-defined attribute i not visible]";
        assertEquals(expectedError, errors.toString());

        const expected = ":Ter";
        assertEquals(expected, result);
        group.setListener(ErrorManager.DEFAULT_ERROR_LISTENER);
    }

}
