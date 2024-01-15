/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { ErrorBuffer, STGroupFile } from "../../../../../src/index.js";

import { Test } from "../../../../decorators.js";
import { assertEquals } from "../../../../junit.js";

export class TestBuggyDefaultValueRaisesNPETest extends BaseTest {
    /**
     * When the anonymous template specified as a default value for a formalArg
     * contains a syntax error ST 4.0.2 emits a NullPointerException error
     * (after the syntax error)
     *
     * @throws Exception
     */
    @Test
    public testHandleBuggyDefaultArgument(): void {
        const templates = "main(a={(<\"\")>}) ::= \"\"";
        BaseTest.writeFile(this.tmpdir, "t.stg", templates);

        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);

        const _st = group.getInstanceOf("main");
        //const s = st.render();

        // Check the errors. This contained an "NullPointerException" before
        assertEquals("[t.stg 1:12: extraneous input ')' expecting {';', RDELIM}]", errors.toString());
    }
}
