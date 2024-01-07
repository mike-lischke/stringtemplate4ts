/* java2ts: keep */

/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { assertEquals } from "../../../../junit.js";

import { Test } from "../../../../decorators.js";
import { Misc, STGroupFile, STGroupString } from "../../../../../src/index.js";

export class TestDebugEvents extends BaseTest {
    @Test
    public testString(): void {
        const templates = "t() ::= <<foo>>" + Misc.newLine;

        TestDebugEvents.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("t");
        const events = st?.getEvents();
        const expected =
            "EvalExprEvent{self=/t(), expr='foo', exprStartChar=0, exprStopChar=2, start=0, stop=2}," +
            " EvalTemplateEvent{self=/t(), start=0, stop=2}";
        const result = events?.join(", ");
        assertEquals(expected, result);
    }

    @Test
    public testAttribute(): void {
        const templates =
            "t(x) ::= << <x> >>" + Misc.newLine;

        TestDebugEvents.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("t");
        const events = st?.getEvents();
        const expected =
            "IndentEvent{self=/t(), expr=' ', exprStartChar=0, exprStopChar=0, start=0, stop=0}," +

            // Have to exclude the <> from the exprStartChar and exprStopChar (and the expression itself)
            // because the tag information is not available in the event anymore (as we switched from ANTLR v3 to v4).
            //" EvalExprEvent{self=/t(), expr='<x>', exprStartChar=1, exprStopChar=3, start=0, stop=-1}," +
            " EvalExprEvent{self=/t(), expr='x', exprStartChar=2, exprStopChar=2, start=0, stop=-1}," +
            " EvalExprEvent{self=/t(), expr=' ', exprStartChar=4, exprStopChar=4, start=0, stop=0}," +
            " EvalTemplateEvent{self=/t(), start=0, stop=0}";
        const result = events?.join(", ");
        assertEquals(expected, result);
    }

    @Test
    public testTemplateCall(): void {
        const templates =
            "t(x) ::= <<[<u()>]>>\n" +
            "u() ::= << <x> >>\n";

        TestDebugEvents.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("t");
        //group.getInstanceOf("u")?.impl?.dump();
        const events = st?.getEvents();
        const expected =
            "EvalExprEvent{self=/t(), expr='[', exprStartChar=0, exprStopChar=0, start=0, stop=0}," +
            " IndentEvent{self=/u(), expr=' ', exprStartChar=0, exprStopChar=0, start=1, stop=1}," +
            //" EvalExprEvent{self=/u(), expr='<x>', exprStartChar=1, exprStopChar=3, start=1, stop=0}," +
            " EvalExprEvent{self=/u(), expr='x', exprStartChar=2, exprStopChar=2, start=1, stop=0}," +
            " EvalExprEvent{self=/u(), expr=' ', exprStartChar=4, exprStopChar=4, start=1, stop=1}," +
            " EvalTemplateEvent{self=/u(), start=1, stop=1}," +
            //" EvalExprEvent{self=/t(), expr='<u()>', exprStartChar=1, exprStopChar=5, start=1, stop=1}," +
            " EvalExprEvent{self=/t(), expr='u()', exprStartChar=2, exprStopChar=4, start=1, stop=1}," +
            " EvalExprEvent{self=/t(), expr=']'," +
            " exprStartChar=6, exprStopChar=6, start=2, stop=2}," +
            " EvalTemplateEvent{self=/t(), start=0, stop=2}";
        const result = events?.join(", ");
        assertEquals(expected, result);
    }

    @Test
    public testEvalExprEventForSpecialCharacter(): void {
        const templates = "t() ::= <<[<\\n>]>>\n";
        //                            012 345
        // Rendering t() emits: "[\n]"  or  "[\r\n]" (depends on line.separator)
        //                       01 2        01 2 3
        const g = new STGroupString(templates);
        const st = g.getInstanceOf("t");
        // st?.impl?.dump();
        const events = st?.getEvents();
        const n = Misc.newLine.length;
        const expected =
            "EvalExprEvent{self=/t(), expr='[', exprStartChar=0, exprStopChar=0, start=0, stop=0}, " +
            "EvalExprEvent{self=/t(), expr='\\n', exprStartChar=2, exprStopChar=3, start=1, stop=" + n + "}, " +
            "EvalExprEvent{self=/t(), expr=']', exprStartChar=5, exprStopChar=5, start=" + (n + 1) + ", stop=" +
            (n + 1) + "}, EvalTemplateEvent{self=/t(), start=0, stop=" + (n + 1) + "}";
        const result = events?.join(", ");
        assertEquals(expected, result);
    }
}
