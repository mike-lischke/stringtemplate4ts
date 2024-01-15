/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { assertEquals } from "../../../../junit.js";
import {
    STGroup, STGroupFile, DateRenderer, ST, StringRenderer, NumberRenderer, TimeZone,
} from "../../../../../src/index.js";

import { Test } from "../../../../decorators.js";

export class TestRenderers extends BaseTest {

    @Test
    public testRendererForGroup(): void {
        const templates = "dateThing(created) ::= \"datetime: <created>\"\n";
        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(Date, new DateRenderer());
        const st = group.getInstanceOf("dateThing");
        st?.add("created", new Date(2005, 7 - 1, 5));
        const expecting = "datetime: 7/5/05, 12:00 AM";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testRendererWithFormat(): void {
        const templates = "dateThing(created) ::= << date: <created; format=\"yyyy.MM.dd\"> >>\n";
        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(Date, new DateRenderer());
        const st = group.getInstanceOf("dateThing");
        st?.add("created", new Date(2005, 7 - 1, 5));
        const expecting = " date: 2005.07.05 ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testRendererWithPredefinedFormat(): void {
        const templates = "dateThing(created) ::= << datetime: <created; format=\"short\"> >>\n";
        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(Date, new DateRenderer());
        const st = group.getInstanceOf("dateThing");
        st?.add("created", new Date(2005, 7 - 1, 5));
        const expecting = " datetime: 7/5/05, 12:00 AM ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testRendererWithPredefinedFormat2(): void {
        const templates = "dateThing(created) ::= << datetime: <created; format=\"full\"> >>\n";
        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(Date, new DateRenderer());
        const st = group.getInstanceOf("dateThing");
        const origTimeZone = TimeZone.default;
        try {
            // set Timezone to "PDT"
            TimeZone.default = "America/Los_Angeles";
            st?.add("created", new Date(2005, 7 - 1, 5));
            const expecting = " datetime: Tuesday, July 5, 2005 at 12:00:00 AM Pacific Daylight Time ";
            const result = st?.render();
            assertEquals(expecting, result);
        }
        finally {
            // Restore original Timezone
            TimeZone.default = origTimeZone;
        }
    }

    @Test
    public testRendererWithPredefinedFormat3(): void {
        const templates = "dateThing(created) ::= << date: <created; format=\"date:medium\"> >>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(Date, new DateRenderer());
        const st = group.getInstanceOf("dateThing");
        st?.add("created", new Date(2005, 7 - 1, 5));
        const expecting = " date: Jul 5, 2005 ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testRendererWithPredefinedFormat4(): void {
        const templates = "dateThing(created) ::= << time: <created; format=\"time:medium\"> >>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(Date, new DateRenderer());
        const st = group.getInstanceOf("dateThing");
        st?.add("created", new Date(2005, 7 - 1, 5));
        const expecting = " time: 12:00:00 AM ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testStringRendererWithFormatCap(): void {
        const templates = "foo(x) ::= << <x; format=\"cap\"> >>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(String, new StringRenderer());
        const st = group.getInstanceOf("foo");
        st?.add("x", "hi");
        const expecting = " Hi ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testStringRendererWithTemplateIncludeCap(): void {
        // must toString the t() ref before applying format
        const templates =
            "foo(x) ::= << <(t()); format=\"cap\"> >>\n" +
            "t() ::= <<ack>>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(String, new StringRenderer());
        const st = group.getInstanceOf("foo");
        st?.add("x", "hi");
        const expecting = " Ack ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testStringRendererWithSubtemplateIncludeCap(): void {
        const templates =
            "foo(x) ::= << <({ack}); format=\"cap\"> >>\n" +
            "t() ::= <<ack>>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(String, new StringRenderer());
        const st = group.getInstanceOf("foo");
        st?.add("x", "hi");
        const expecting = " Ack ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testStringRendererWithFormatCapEmptyValue(): void {
        const templates = "foo(x) ::= << <x; format=\"cap\"> >>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(String, new StringRenderer());
        const st = group.getInstanceOf("foo");
        st?.add("x", "");
        const expecting = " ";//FIXME: why not two spaces?
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testStringRendererWithFormatUrlEncode(): void {
        const templates = "foo(x) ::= << <x; format=\"url-encode\"> >>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(String, new StringRenderer());
        const st = group.getInstanceOf("foo");
        st?.add("x", "a b");
        const expecting = " a+b ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testStringRendererWithFormatXmlEncode(): void {
        const templates = "foo(x) ::= << <x; format=\"xml-encode\"> >>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(String, new StringRenderer());
        const st = group.getInstanceOf("foo");
        st?.add("x", "a<b> &\t\b");
        const expecting = " a&lt;b&gt; &amp;\t&#8; ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testStringRendererWithFormatXmlEncodeNull(): void {
        const templates = "foo(x) ::= << <x; format=\"xml-encode\"> >>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(String, new StringRenderer());
        const st = group.getInstanceOf("foo");
        st?.add("x", null);
        const expecting = " ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testStringRendererWithFormatXmlEncodeEmoji(): void {
        const templates = "foo(x) ::= << <x; format=\"xml-encode\"> >>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(String, new StringRenderer());
        const st = group.getInstanceOf("foo");
        st?.add("x", "\uD83E\uDE73");
        const expecting = " &#129651; ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testStringRendererWithPrintfFormat(): void {
        const templates = "foo(x) ::= << <x; format=\"%6s\"> >>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(String, new StringRenderer());
        const st = group.getInstanceOf("foo");
        st?.add("x", "hi");
        const expecting = "     hi ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testNumberRendererWithPrintfFormat(): void {
        const templates = "foo(x,y) ::= << <x; format=\"%d\"> <y; format=\"%2.3f\"> >>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(Number, new NumberRenderer());
        //group.registerRenderer(Double.class, new NumberRenderer());
        const st = group.getInstanceOf("foo");
        st?.add("x", -2100);
        st?.add("y", 3.14159);
        const expecting = " -2100 3.142 ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testInstanceofRenderer(): void {
        const templates = "numberThing(x,y,z) ::= \"numbers: <x>, <y>; <z>\"\n";
        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(Number, new NumberRenderer());
        const st = group.getInstanceOf("numberThing");
        st?.add("x", -2100);
        st?.add("y", 3.14159);
        st?.add("z", "hi");
        const expecting = "numbers: -2100, 3.14159; hi";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testLocaleWithNumberRenderer(): void {
        // Note: the current number renderer is not locale aware.
        //       It could be made locale aware but then it would no longer accept format strings.
        const templates =
            "foo(x,y) ::= <<\n" +
            //"<x; format=\"%,d\"> <y; format=\"%,2.3f\">\n" +
            "<x; format=\"%d\"> <y; format=\"%2.3f\">\n" +
            ">>\n";

        TestRenderers.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.registerRenderer(Number, new NumberRenderer());
        const st = group.getInstanceOf("foo");
        st?.add("x", -2100);
        st?.add("y", 3.14159);
        // Polish uses ' ' (ASCII 160) for ',' and ',' for '.'
        //const expecting = "-2\u00A0100 3,142";
        const expecting = "-2100 3.142";
        const result = st?.render(new Intl.Locale("pl"));
        assertEquals(expecting, result);
    }

    @Test
    public testRendererWithFormatAndList(): void {
        const template = "The names: <names; format=\"upper\">";
        const group = new STGroup();
        group.registerRenderer(String, new StringRenderer());
        const st = new ST(group, template);
        st?.add("names", "ter");
        st?.add("names", "tom");
        st?.add("names", "sriram");
        const expecting = "The names: TERTOMSRIRAM";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testRendererWithFormatAndSeparator(): void {
        const template = "The names: <names; separator=\" and \", format=\"upper\">";
        const group = new STGroup();
        group.registerRenderer(String, new StringRenderer());
        const st = new ST(group, template);
        st?.add("names", "ter");
        st?.add("names", "tom");
        st?.add("names", "sriram");
        const expecting = "The names: TER and TOM and SRIRAM";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testRendererWithFormatAndSeparatorAndNull(): void {
        const template = "The names: <names; separator=\" and \", null=\"n/a\", format=\"upper\">";
        const group = new STGroup();
        group.registerRenderer(String, new StringRenderer());
        const st = new ST(group, template);
        const names = ["ter", null, "sriram"];
        st?.add("names", names);
        const expecting = "The names: TER and N/A and SRIRAM";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDateRendererWithLocale(): void {
        const input = "<date; format=\"dd 'de' MMMM 'de' yyyy\">";
        const group = new STGroup();
        group.registerRenderer(Date, new DateRenderer());
        const st = new ST(group, input);

        const date = new Date(2012, 5, 12); // Months are 0-based.
        st?.add("date", date);

        const expected = "12 de junho de 2012";
        assertEquals(expected, st?.render(new Intl.Locale("pt")));
    }
}
