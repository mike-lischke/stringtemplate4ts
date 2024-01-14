/* java2ts: keep */

/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import path from "path";

import { BaseTest } from "./BaseTest.js";
import { assertEquals } from "../../../../junit.js";
import { ErrorManager, Misc, ST, STGroupFile } from "../../../../../src/index.js";

import { Test } from "../../../../decorators.js";

export class TestLists extends BaseTest {
    @Test
    public testJustCat(): void {
        const e = new ST("<[names,phones]>");
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("phones", "1");
        e.add("phones", "2");
        const expecting = "TerTom12";
        assertEquals(expecting, e.render());
    }

    @Test
    public testListLiteralWithEmptyElements(): void {
        const e = new ST("<[\"Ter\",,\"Jesse\"]:{n | <i>:<n>}; separator=\", \", null={foo}>");
        const expecting = "1:Ter, foo, 2:Jesse";
        assertEquals(expecting, e.render());
    }

    @Test
    public testListLiteralWithEmptyFirstElement(): void {
        const e = new ST("<[,\"Ter\",\"Jesse\"]:{n | <i>:<n>}; separator=\", \", null={foo}>");
        const expecting = "foo, 1:Ter, 2:Jesse";
        assertEquals(expecting, e.render());
    }

    @Test
    public testLength(): void {
        const e = new ST("<length([names,phones])>");
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("phones", "1");
        e.add("phones", "2");
        const expecting = "4";
        assertEquals(expecting, e.render());
    }

    @Test
    public testCat2Attributes(): void {
        const e = new ST("<[names,phones]; separator=\", \">");
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("phones", "1");
        e.add("phones", "2");
        const expecting = "Ter, Tom, 1, 2";
        assertEquals(expecting, e.render());
    }

    @Test
    public testCat2AttributesWithApply(): void {
        const e = new ST("<[names,phones]:{a|<a>.}>");
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("phones", "1");
        e.add("phones", "2");
        const expecting = "Ter.Tom.1.2.";
        assertEquals(expecting, e.render());
    }

    @Test
    public testCat3Attributes(): void {
        const e = new ST("<[names,phones,salaries]; separator=\", \">");
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("phones", "1");
        e.add("phones", "2");
        e.add("salaries", "big");
        e.add("salaries", "huge");
        const expecting = "Ter, Tom, 1, 2, big, huge";
        assertEquals(expecting, e.render());
    }

    @Test
    public testCatWithTemplateApplicationAsElement(): void {
        const e = new ST("<[names:{n|<n>!},phones]; separator=\", \">");
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("phones", "1");
        e.add("phones", "2");
        const expecting = "Ter!, Tom!, 1, 2";
        assertEquals(expecting, e.render());
    }

    @Test
    public testCatWithIFAsElement(): void {
        const e = new ST("<[{<if(names)>doh<endif>},phones]; separator=\", \">");
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("phones", "1");
        e.add("phones", "2");
        const expecting = "doh, 1, 2";
        assertEquals(expecting, e.render());
    }

    @Test
    public testCatNullValues(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;

        // [a, b] must behave like <a><b>; if a==b==null, blank output
        // unless null argument.
        const e = new ST("<[no,go]; null=\"foo\", separator=\", \">");
        e.add("phones", "1");
        e.add("phones", "2");
        const expecting = "foo, foo";
        assertEquals(expecting, e.render());

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testCatWithNullTemplateApplicationAsElement(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;

        const e = new ST("<[names:{n|<n>!},\"foo\"]:{a|x}; separator=\", \">");
        e.add("phones", "1");
        e.add("phones", "2");
        const expecting = "x";  // only one since template application gives nothing
        assertEquals(expecting, e.render());

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testCatWithNestedTemplateApplicationAsElement(): void {
        const e = new ST("<[names, [\"foo\",\"bar\"]:{x | <x>!},phones]; separator=\", \">");
        e.add("names", "Ter");
        e.add("names", "Tom");
        e.add("phones", "1");
        e.add("phones", "2");
        const expecting = "Ter, Tom, foo!, bar!, 1, 2";
        assertEquals(expecting, e.render());
    }

    @Test
    public testListAsTemplateArgument(): void {
        const templates =
            "test(names,phones) ::= \"<foo([names,phones])>\"" + Misc.newLine +
            "foo(items) ::= \"<items:{a | *<a>*}>\"" + Misc.newLine;
        TestLists.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const e = group.getInstanceOf("test");
        e?.add("names", "Ter");
        e?.add("names", "Tom");
        e?.add("phones", "1");
        e?.add("phones", "2");
        const expecting = "*Ter**Tom**1**2*";
        const result = e?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testListWithTwoEmptyListsCollapsesToEmptyList(): void {
        const e = new ST("<[[],[]]:{x | <x>!}; separator=\", \">");
        e.add("names", "Ter");
        e.add("names", "Tom");
        const expecting = "";
        assertEquals(expecting, e.render());
    }

}
