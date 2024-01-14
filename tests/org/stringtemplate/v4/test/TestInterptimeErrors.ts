/* java2ts: keep */

/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import path from "path";

import { BaseTest } from "./BaseTest.js";
import { assertEquals } from "../../../../junit.js";

import { Test } from "../../../../decorators.js";
import { ErrorBuffer, Misc, ST, STGroup, STGroupFile } from "../../../../../src/index.js";

export class TestInterptimeErrors extends BaseTest {
    private static UserHiddenName = class UserHiddenName {
        protected name: string;
        public constructor(name: string) {
            this.name = name;
        }
        protected getName(): string { return this.name; }
    };

    private static UserHiddenNameField = class UserHiddenNameField {
        protected name: string;
        public constructor(name: string) {
            this.name = name;
        }
    };

    //@Test
    public testMissingEmbeddedTemplate(): void {
        const errors = new ErrorBuffer();

        const templates = "t() ::= \"<foo()>\"" + Misc.newLine;

        TestInterptimeErrors.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        st?.render();
        const expected = "[context [/t] 1:1 no such template: /foo]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testMissingSuperTemplate(): void {
        const errors = new ErrorBuffer();
        const templates = "t() ::= \"<super.t()>\"" + Misc.newLine;

        TestInterptimeErrors.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const templates2 = "u() ::= \"blech\"" + Misc.newLine;

        TestInterptimeErrors.writeFile(this.tmpdir, "t2.stg", templates2);
        const group2 = new STGroupFile(path.join(this.tmpdir, "t2.stg"));
        group.importTemplates(group2);
        const st = group.getInstanceOf("t");
        st?.render();
        const expected = "[context [/t] 1:1 no such template: super.t]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testNoPropertyNotError(): void {
        const errors = new ErrorBuffer();
        const templates = "t(u) ::= \"<u.x>\"" + Misc.newLine;

        TestInterptimeErrors.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        st?.add("u", new BaseTest.User(32, "parrt"));
        st?.render();
        const result = errors.toString();
        assertEquals("[]", result);
    }

    @Test
    public testHiddenPropertyNotError(): void {
        const errors = new ErrorBuffer();

        const templates = "t(u) ::= \"<u.name>\"" + Misc.newLine;

        TestInterptimeErrors.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        st?.add("u", new TestInterptimeErrors.UserHiddenName("parrt"));
        st?.render();
        const result = errors.toString();
        assertEquals("[]", result);
    }

    @Test
    public testHiddenFieldNotError(): void {
        const errors = new ErrorBuffer();
        const templates = "t(u) ::= \"<u.name>\"" + Misc.newLine;

        TestInterptimeErrors.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        st?.add("u", new TestInterptimeErrors.UserHiddenNameField("parrt"));
        st?.render();
        const result = errors.toString();
        assertEquals("[]", result);
    }

    @Test
    public testSoleArg(): void {
        const errors = new ErrorBuffer();
        const templates =
            "t() ::= \"<u({9})>\"\n" +
            "u(x,y) ::= \"<x>\"\n";

        TestInterptimeErrors.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        st?.render();
        const expected = "[context [/t] 1:1 passed 1 arg(s) to template /u with 2 declared arg(s)]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testSoleArgUsingApplySyntax(): void {
        const errors = new ErrorBuffer();
        const templates =
            "t() ::= \"<{9}:u()>\"\n" +
            "u(x,y) ::= \"<x>\"\n";

        TestInterptimeErrors.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        let expected = "9";
        let result = st?.render();
        assertEquals(expected, result);

        expected = "[context [/t] 1:5 passed 1 arg(s) to template /u with 2 declared arg(s)]";
        result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testUndefinedAttr(): void {
        const errors = new ErrorBuffer();
        const templates =
            "t() ::= \"<u()>\"\n" +
            "u() ::= \"<x>\"\n";

        TestInterptimeErrors.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        st?.render();
        const expected = "[context [/t /u] 1:1 attribute x isn't defined]";
        const result = errors.toString();
        assertEquals(expected, result);
    }

    @Test
    public testParallelAttributeIterationWithMissingArgs(): void {
        const errors = new ErrorBuffer();
        const group = new STGroup();
        group.setListener(errors);
        const e = new ST(group, "<names,phones,salaries:{n,p | <n>@<p>}; separator=\", \">");
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("phones", "1");
        e.add("phones", "2");
        e.add("salaries", "big");
        e.render();
        const errorExpecting =
            "[1:23: anonymous template has 2 arg(s) but mapped across 3 value(s), " +
            "context [anonymous] 1:23 passed 3 arg(s) to template /_sub1 with 2 declared arg(s), " +
            "context [anonymous] 1:1 iterating through 3 values in zip map but template has 2 declared arguments]";
        assertEquals(errorExpecting, errors.toString());
        const expecting = "Ter@1, Tom@2";
        assertEquals(expecting, e.render());
    }

    @Test
    public testStringTypeMismatch(): void {
        const errors = new ErrorBuffer();
        const group = new STGroup();
        group.setListener(errors);
        const e = new ST(group, "<trim(s)>");
        e.add("s", 34);
        e.render(); // generate the error
        const errorExpecting = "[context [anonymous] 1:1 function trim expects a string not a number]";
        assertEquals(errorExpecting, errors.toString());
    }

    @Test
    public testStringTypeMismatch2(): void {
        const errors = new ErrorBuffer();
        const group = new STGroup();
        group.setListener(errors);
        const e = new ST(group, "<strlen(s)>");
        e.add("s", 34);
        e.render(); // generate the error
        const errorExpecting = "[context [anonymous] 1:1 function strlen expects a string not a number]";
        assertEquals(errorExpecting, errors.toString());
    }
}
