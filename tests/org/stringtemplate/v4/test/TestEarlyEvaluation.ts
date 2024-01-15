/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { ErrorManager, STGroupFile } from "../../../../../src/index.js";

import { Test } from "../../../../decorators.js";
import { Assert } from "../../../../junit.js";

export class TestEarlyEvaluation extends BaseTest {
    /**
     * see
     * https://www.antlr3.org/pipermail/stringtemplate-interest/2011-May/003476.html
     *
     * @throws Exception
     */
    @Test
    public testEarlyEval(): void {
        const templates = "main() ::= <<\n<f(p=\"x\")>*<f(p=\"y\")>\n>>\n\n"
            + "f(p,q={<({a<p>})>}) ::= <<\n-<q>-\n>>";
        TestEarlyEvaluation.writeFile(this.tmpdir, "t.stg", templates);

        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("main");
        const s = st?.render();
        Assert.assertEquals("-ax-*-ay-", s);
    }

    /**
     * see
     * https://www.antlr.org/pipermail/stringtemplate-interest/2011-May/003476.html
     *
     * @throws Exception
     */
    @Test
    public testEarlyEval2(): void {
        const templates = "main() ::= <<\n<f(p=\"x\")>*\n>>\n\n"
            + "f(p,q={<({a<p>})>}) ::= <<\n-<q>-\n>>";
        TestEarlyEvaluation.writeFile(this.tmpdir, "t.stg", templates);

        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("main");
        const s = st?.render();
        Assert.assertEquals("-ax-*", s);
    }

    /**
     * see https://www.antlr3.org/pipermail/stringtemplate-interest/2011-August/003758.html
     * @throws Exception
     */
    @Test
    public testBugArrayIndexOutOfBoundsExceptionInSTRuntimeMessageGetSourceLocation(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;

        const templates = "main(doit = true) ::= "
            + "\"<if(doit || other)><t(...)><endif>\"\n"
            + "t2() ::= \"Hello\"\n" //
            + "t(x={<(t2())>}) ::= \"<x>\"";

        TestEarlyEvaluation.writeFile(this.tmpdir, "t.stg", templates);

        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("main");
        const s = st?.render();

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;

        Assert.assertEquals("Hello", s);
    }

    @Test
    public testEarlyEvalInIfExpr(): void {
        const templates = "main(x) ::= << <if((x))>foo<else>bar<endif> >>";
        TestEarlyEvaluation.writeFile(this.tmpdir, "t.stg", templates);

        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("main");
        let s = st?.render();
        Assert.assertEquals(" bar ", s);

        st?.add("x", "true");
        s = st?.render();
        Assert.assertEquals(" foo ", s);
    }

    @Test
    public testEarlyEvalOfSubtemplateInIfExpr(): void {
        const templates = "main(x) ::= << <if(({a<x>b}))>foo<else>bar<endif> >>";
        TestEarlyEvaluation.writeFile(this.tmpdir, "t.stg", templates);

        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("main");
        const s = st?.render();
        Assert.assertEquals(" foo ", s);
    }

    @Test
    public testEarlyEvalOfMapInIfExpr(): void {
        const templates =
            "m ::= [\n" +
            "   \"parrt\": \"value\",\n" +
            "   default: \"other\"\n" +
            "]\n" +
            "main(x) ::= << p<x>t: <m.({p<x>t})>, <if(m.({p<x>t}))>if<else>else<endif> >>\n";
        TestEarlyEvaluation.writeFile(this.tmpdir, "t.stg", templates);

        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("main");

        st?.add("x", null);
        let s = st?.render();
        Assert.assertEquals(" pt: other, if ", s);

        st?.add("x", "arr");
        s = st?.render();
        Assert.assertEquals(" parrt: value, if ", s);
    }

    @Test
    public testEarlyEvalOfMapInIfExprPassInHashMap(): void {
        const templates = "main(m,x) ::= << p<x>t: <m.({p<x>t})>, <if(m.({p<x>t}))>if<else>else<endif> >>\n";
        TestEarlyEvaluation.writeFile(this.tmpdir, "t.stg", templates);

        const group = new STGroupFile(this.tmpdir + "/t.stg");

        const st = group.getInstanceOf("main");
        st?.add("m", new Map<string, string>([["parrt", "value"]]));

        st?.add("x", null);
        let s = st?.render();
        Assert.assertEquals(" pt: , else ", s); // m[null] has no default value so else clause

        st?.add("x", "arr");
        s = st?.render();
        Assert.assertEquals(" parrt: value, if ", s);
    }

}
