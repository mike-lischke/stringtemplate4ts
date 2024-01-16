/*
 * Copyright(c) Terence Parr.All rights reserved.
 * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
 */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { assertTrue } from "./junit.js";
import { ST } from "../src/index.js";

import { Test } from "./decorators.js";

export class TestAttributes extends BaseTest {
    @Test
    public testRedefOfKeyInClone(): void {
        const a = new ST("x");
        // a has no formal args

        const b = new ST(a);
        b.add("x", "foo");

        const c = new ST(a);
        c.add("x", "bar");
        assertTrue(true); // should not get exception
    }

    // See https://github.com/antlr/stringtemplate4/issues/72 and
    // https://github.com/antlr/stringtemplate4/issues/98
    @Test
    public testRedefOfKeyInCloneAfterAddingAttribute(): void {
        const a = new ST("x");
        a.add("y", "eh?");  // This forces formal def of "y" attribute

        const b = new ST(a);
        b.add("x", "foo");

        const c = new ST(a);
        c.add("x", "bar");
        assertTrue(true); // should not get exception
    }
}
