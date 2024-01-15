/*
 [The "BSD license"]
 Copyright (c) 2009 Terence Parr
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
 3. The name of the author may not be used to endorse or promote products
    derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import path from "path";

import { BaseTest } from "./BaseTest.js";
import { Assert, assertEquals } from "../../../../junit.js";
import { STGroupFile, ST, ErrorBuffer, STGroupString, Misc, HashMap, ErrorManager } from "../../../../../src/index.js";

import { Test } from "../../../../decorators.js";

export class TestDictionaries extends BaseTest {
    @Test
    public testDict(): void {
        const templates =
            "typeInit ::= [\"int\":\"0\", \"float\":\"0.0\"] " + Misc.newLine +
            "var(type,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("var");
        st?.add("type", "int");
        st?.add("name", "x");
        const expecting = "int x = 0;";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDictValuesAreTemplates(): void {
        const templates =
            "typeInit ::= [\"int\":{0<w>}, \"float\":{0.0<w>}] " + Misc.newLine +
            "var(type,w,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("var");
        // st.impl.dump();
        st?.add("w", "L");
        st?.add("type", "int");
        st?.add("name", "x");
        const expecting = "int x = 0L;";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDictKeyLookupViaTemplate(): void {
        // Make sure we try rendering stuff to string if not found as regular object
        const templates =
            "typeInit ::= [\"int\":{0<w>}, \"float\":{0.0<w>}] " + Misc.newLine +
            "var(type,w,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("var");
        st?.add("w", "L");
        st?.add("type", new ST("int"));
        st?.add("name", "x");
        const expecting = "int x = 0L;";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDictKeyLookupAsNonToStringableObject(): void {
        // Make sure we try rendering stuff to string if not found as regular object
        const templates = "foo(m,k) ::= \"<m.(k)>\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);

        const group = new STGroupFile(path.join(this.tmpdir, "test.stg"));
        const st = group.getInstanceOf("foo");
        const m = new HashMap<BaseTest.HashableUser, string>();

        m.set(new BaseTest.HashableUser(99, "parrt"), "first");
        m.set(new BaseTest.HashableUser(172036, "tombu"), "second");
        m.set(new BaseTest.HashableUser(391, "sriram"), "third");
        st?.add("m", m);
        st?.add("k", new BaseTest.HashableUser(172036, "tombu"));

        const expecting = "second";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDictMissingDefaultValueIsEmpty(): void {
        const templates =
            "typeInit ::= [\"int\":\"0\", \"float\":\"0.0\"] " + Misc.newLine +
            "var(type,w,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("var");
        st?.add("w", "L");
        st?.add("type", "double"); // double not in typeInit map
        st?.add("name", "x");
        const expecting = "double x = ;";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDictMissingDefaultValueIsEmptyForNullKey(): void {
        const templates =
            "typeInit ::= [\"int\":\"0\", \"float\":\"0.0\"] " + Misc.newLine +
            "var(type,w,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("var");
        st?.add("w", "L");
        st?.add("type", null); // double not in typeInit map
        st?.add("name", "x");
        const expecting = " x = ;";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDictHiddenByFormalArg(): void {
        const templates =
            "typeInit ::= [\"int\":\"0\", \"float\":\"0.0\"] " + Misc.newLine +
            "var(typeInit,type,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("var");
        st?.add("type", "int");
        st?.add("name", "x");
        const expecting = "int x = ;";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDictEmptyValueAndAngleBracketStrings(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;
        const templates =
            "typeInit ::= [\"int\":\"0\", \"float\":, \"double\":<<0.0L>>] " + Misc.newLine +
            "var(type,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("var");
        st?.add("type", "float");
        st?.add("name", "x");
        const expecting = "float x = double;"; // The comma is ignored from parser single token recovery.
        const result = st?.render();
        assertEquals(expecting, result);
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testDictDefaultValue(): void {
        const templates =
            "typeInit ::= [\"int\":\"0\", default:\"null\"] " + Misc.newLine +
            "var(type,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("var");
        st?.add("type", "UserRecord");
        st?.add("name", "x");
        const expecting = "UserRecord x = null;";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDictNullKeyGetsDefaultValue(): void {
        const templates =
            "typeInit ::= [\"int\":\"0\", default:\"null\"] " + Misc.newLine +
            "var(type,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("var");

        // missing or set to null: st?.add("type", null);
        st?.add("name", "x");
        const expecting = " x = null;";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDictEmptyDefaultValue(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;
        const templates =
            "typeInit ::= [\"int\":\"0\", default:] " + Misc.newLine +
            "var(type,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const errors = new ErrorBuffer();
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        group.setListener(errors);
        group.load();
        const expected = "[test.stg 1:33: extraneous input ']' expecting {'true', 'false', '[', ID, STRING, " +
            "BIGSTRING_NO_NL, BIGSTRING, '{'}, test.stg 2:0: no viable alternative at input 'var']";
        const result = errors.toString();
        assertEquals(expected, result);
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testDictDefaultValueIsKey(): void {
        const templates =
            "typeInit ::= [\"int\":\"0\", default:key] " + Misc.newLine +
            "var(type,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("var");
        st?.add("type", "UserRecord");
        st?.add("name", "x");
        const expecting = "UserRecord x = UserRecord;";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    /**
     * Test that a map can have only the default entry.
     */
    @Test
    public testDictDefaultStringAsKey(): void {
        const templates =
            "typeInit ::= [\"default\":\"foo\"] " + Misc.newLine +
            "var(type,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("var");
        st?.add("type", "default");
        st?.add("name", "x");
        const expecting = "default x = foo;";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    /**
     * Test that a map can return a <b>string</b> with the word: default.
     */
    @Test
    public testDictDefaultIsDefaultString(): void {
        const templates =
            "map ::= [default: \"default\"] " + Misc.newLine +
            "t() ::= << <map.(\"1\")> >>" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("t");
        const expecting = " default ";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDictViaEnclosingTemplates(): void {
        const templates =
            "typeInit ::= [\"int\":\"0\", \"float\":\"0.0\"] " + Misc.newLine +
            "intermediate(type,name) ::= \"<var(type,name)>\"" + Misc.newLine +
            "var(type,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const st = group.getInstanceOf("intermediate");
        st?.add("type", "int");
        st?.add("name", "x");
        const expecting = "int x = 0;";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testDictViaEnclosingTemplates2(): void {
        const templates =
            "typeInit ::= [\"int\":\"0\", \"float\":\"0.0\"] " + Misc.newLine +
            "intermediate(stuff) ::= \"<stuff>\"" + Misc.newLine +
            "var(type,name) ::= \"<type> <name> = <typeInit.(type)>;\"" + Misc.newLine;
        TestDictionaries.writeFile(this.tmpdir, "test.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/test.stg");
        const interm = group.getInstanceOf("intermediate");
        const varTemplate = group.getInstanceOf("var");
        varTemplate?.add("type", "int");
        varTemplate?.add("name", "x");
        interm?.add("stuff", varTemplate);
        const expecting = "int x = 0;";
        const result = interm?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testAccessDictionaryFromAnonymousTemplate(): void {
        const dir = this.tmpdir;
        const g =
            "a() ::= <<[<[\"foo\",\"a\"]:{x|<if(values.(x))><x><endif>}>]>>\n" +
            "values ::= [\n" +
            "    \"a\":false,\n" +
            "    default:true\n" +
            "]\n";
        TestDictionaries.writeFile(dir, "g.stg", g);

        const group = new STGroupFile(this.tmpdir + "/g.stg");
        const st = group.getInstanceOf("a");
        const expected = "[foo]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testAccessDictionaryFromAnonymousTemplateInRegion(): void {
        const dir = this.tmpdir;
        const g =
            "a() ::= <<[<@r()>]>>\n" +
            "@a.r() ::= <<\n" +
            "<[\"foo\",\"a\"]:{x|<if(values.(x))><x><endif>}>\n" +
            ">>\n" +
            "values ::= [\n" +
            "    \"a\":false,\n" +
            "    default:true\n" +
            "]\n";
        TestDictionaries.writeFile(dir, "g.stg", g);

        const group = new STGroupFile(this.tmpdir + "/g.stg");
        const st = group.getInstanceOf("a");
        const expected = "[foo]";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testImportDictionary(): void {
        const Root = "d ::= [\"a\":\"b\"]\n";

        const Sub =
            "t() ::= <<\n" +
            "<d.a>\n" +
            ">>\n";
        const r = new STGroupString(Root);
        const s = new STGroupString(Sub);
        s.importTemplates(r);
        const st = s.getInstanceOf("t"); // visible only if we can see inherited dicts
        const expected = "b";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testStringsInDictionary(): void {
        const templates =
            "auxMap ::= [\n" +
            "   \"E\": \"electric <field>\",\n" +
            "   \"I\": \"in <field> between\",\n" +
            "   \"F\": \"<field> force\",\n" +
            "   default: \"<field>\"\n" +
            "]\n" +
            "\n" +
            "makeTmpl(type, field) ::= <<\n" +
            "<auxMap.(type)>\n" +
            ">>\n" +
            "\n" +
            "top() ::= <<\n" +
            "  <makeTmpl(\"E\", \"foo\")>\n" +
            "  <makeTmpl(\"F\", \"foo\")>\n" +
            "  <makeTmpl(\"I\", \"foo\")>\n" +
            ">>\n";
        TestDictionaries.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("top");
        Assert.assertNotNull(st);

        const expecting =
            "  electric <field>" + Misc.newLine +
            "  <field> force" + Misc.newLine +
            "  in <field> between";
        Assert.assertEquals(expecting, st?.render());
    }

    @Test
    public testTemplatesInDictionary(): void {
        const templates =
            "auxMap ::= [\n" +
            "   \"E\": {electric <field>},\n" +
            "   \"I\": {in <field> between},\n" +
            "   \"F\": {<field> force},\n" +
            "   default: {<field>}\n" +
            "]\n" +
            "\n" +
            "makeTmpl(type, field) ::= <<\n" +
            "<auxMap.(type)>\n" +
            ">>\n" +
            "\n" +
            "top() ::= <<\n" +
            "  <makeTmpl(\"E\", \"foo\")>\n" +
            "  <makeTmpl(\"F\", \"foo\")>\n" +
            "  <makeTmpl(\"I\", \"foo\")>\n" +
            ">>\n";
        TestDictionaries.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("top");
        Assert.assertNotNull(st);

        const expecting =
            "  electric foo" + Misc.newLine +
            "  foo force" + Misc.newLine +
            "  in foo between";
        Assert.assertEquals(expecting, st?.render());
    }

    @Test
    public testDictionaryBehaviorTrue(): void {
        const templates =
            "d ::= [\n" +
            "   \"x\" : true,\n" +
            "   default : false,\n" +
            "]\n" +
            "\n" +
            "t() ::= <<\n" +
            "<d.(\"x\")><if(d.(\"x\"))>+<else>-<endif>\n" +
            ">>\n";

        TestDictionaries.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("t");
        const expected = "true+";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDictionaryBehaviorFalse(): void {
        const templates =
            "d ::= [\n" +
            "   \"x\" : false,\n" +
            "   default : false,\n" +
            "]\n" +
            "\n" +
            "t() ::= <<\n" +
            "<d.(\"x\")><if(d.(\"x\"))>+<else>-<endif>\n" +
            ">>\n";

        TestDictionaries.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("t");
        const expected = "false-";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDictionaryBehaviorEmptyTemplate(): void {
        const templates =
            "d ::= [\n" +
            "   \"x\" : {},\n" +
            "   default : false,\n" +
            "]\n" +
            "\n" +
            "t() ::= <<\n" +
            "<d.(\"x\")><if(d.(\"x\"))>+<else>-<endif>\n" +
            ">>\n";

        TestDictionaries.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("t");
        const expected = "+";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDictionaryBehaviorEmptyList(): void {
        const templates =
            "d ::= [\n" +
            "   \"x\" : [],\n" +
            "   default : false\n" +
            "]\n" +
            "\n" +
            "t() ::= <<\n" +
            "<d.(\"x\")><if(d.(\"x\"))>+<else>-<endif>\n" +
            ">>\n";

        TestDictionaries.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("t");
        const expected = "-";
        const result = st?.render();
        assertEquals(expected, result);
    }

    /**
     * This is a regression test for antlr/stringtemplate4#114.
     * "dictionary value using <% %> is broken"
     * Before the fix the following test would return %hi%
     * https://github.com/antlr/stringtemplate4/issues/114
     */
    @Test
    public testDictionaryBehaviorNoNewlineTemplate(): void {
        const templates =
            "d ::= [\n" +
            "   \"x\" : <%hi%>\n" +
            "]\n" +
            "\n" +
            "t() ::= <<\n" +
            "<d.x>\n" +
            ">>\n";

        TestDictionaries.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));
        const st = group.getInstanceOf("t");
        const expected = "hi";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testDictionarySpecialValues(): void {
        const templates =
            "t(id) ::= <<\n" +
            "<identifier.(id)>\n" +
            ">>\n" +
            "\n" +
            "identifier ::= [\n" +
            "   \"keyword\" : \"@keyword\",\n" +
            "   default : key\n" +
            "]\n";

        TestDictionaries.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        // try with mapped values
        let template = group.getInstanceOf("t")?.add("id", "keyword");
        assertEquals("@keyword", template?.render());

        // try with non-mapped values
        template = group.getInstanceOf("t")?.add("id", "nonkeyword");
        assertEquals("nonkeyword", template?.render());

        // try with non-mapped values that might break (Substring here guarantees unique instances)
        template = group.getInstanceOf("t")?.add("id", "_default".substring(1));
        assertEquals("default", template?.render());

        template = group.getInstanceOf("t")?.add("id", "_keys".substring(1));
        assertEquals("keyworddefault", template?.render());

        template = group.getInstanceOf("t")?.add("id", "_values".substring(1));
        assertEquals("@keywordkey", template?.render());
    }

    @Test
    public testDictionarySpecialValuesOverride(): void {
        const templates =
            "t(id) ::= <<\n" +
            "<identifier.(id)>\n" +
            ">>\n" +
            "\n" +
            "identifier ::= [\n" +
            "   \"keyword\" : \"@keyword\",\n" +
            "   \"keys\" : \"keys\",\n" +
            "   \"values\" : \"values\",\n" +
            "   default : key\n" +
            "]\n";

        TestDictionaries.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(path.join(this.tmpdir, "t.stg"));

        // try with mapped values
        let template = group.getInstanceOf("t")?.add("id", "keyword");
        assertEquals("@keyword", template?.render());

        // try with non-mapped values
        template = group.getInstanceOf("t")?.add("id", "nonkeyword");
        assertEquals("nonkeyword", template?.render());

        // try with non-mapped values that might break (Substring here guarantees unique instances)
        template = group.getInstanceOf("t")?.add("id", "_default".substring(1));
        assertEquals("default", template?.render());

        template = group.getInstanceOf("t")?.add("id", "_keys".substring(1));
        assertEquals("keys", template?.render());

        template = group.getInstanceOf("t")?.add("id", "_values".substring(1));
        assertEquals("values", template?.render());
    }
}
