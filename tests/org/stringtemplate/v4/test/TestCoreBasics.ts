/* java2ts: keep */

/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { ErrorBufferAllErrors } from "./ErrorBufferAllErrors.js";
import { BaseTest } from "./BaseTest.js";
import { assertEquals } from "../../../../junit.js";
import {
    ST, ErrorBuffer, STGroup, STGroupFile, STRuntimeMessage, STNoSuchPropertyException, STGroupString,
    AutoIndentWriter, NoIndentWriter, Misc, StringWriter, ErrorManager,
} from "../../../../../src/index.js";

import { AfterAll, BeforeAll, Test } from "../../../../decorators.js";

export class TestCoreBasics extends BaseTest {
    @BeforeAll
    public init(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;
    }

    @AfterAll
    public restore(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    }

    @Test
    public testNullAttr(): void {
        const template = "hi <name>!";
        const st = new ST(template);
        const expected = "hi !";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testAttr(): void {
        const template = "hi <name>!";
        const st = new ST(template);
        st?.add("name", "Ter");
        const expected = "hi Ter!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testChainAttr(): void {
        const template = "<x>:<names>!";
        const st = new ST(template);
        st?.add("names", "Ter").add("names", "Tom").add("x", 1);
        const expected = "1:TerTom!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSetUnknownAttr(): void {
        const templates = "t() ::= <<hi <name>!>>\n";
        const errors = new ErrorBuffer();
        TestCoreBasics.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        group.setListener(errors);
        const st = group.getInstanceOf("t");
        let result = null;
        try {
            st!.add("name", "Ter");
        } catch (iae) {
            if (iae instanceof Error) {
                result = iae.message;
            } else {
                throw iae;
            }
        }
        const expected = "no such attribute: name";
        assertEquals(expected, result);
    }

    @Test
    public testMultiAttr(): void {
        const template = "hi <name>!";
        const st = new ST(template);
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        const expected = "hi TerTom!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testAttrIsArray(): void {
        const template = "hi <name>!";
        const st = new ST(template);
        const names = ["Ter", "Tom"];
        st?.add("name", names);
        st?.add("name", "Sumana"); // shouldn't alter my version of names list!
        const expected = "hi TerTomSumana!";  // ST sees 3 names
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testProp(): void {
        const template = "<u.id>: <u.name>"; // checks field and method getter
        const st = new ST(template);
        st?.add("u", new BaseTest.User(1, "parrt"));
        const expected = "1: parrt";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testPropWithNoAttr(): void {
        const template = "<foo.a>: <ick>";
        const st = new ST(template);
        st?.add("foo", new Map<string, string>([["a", "b"]]));
        const expected = "b: ";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testSTProp(): void {
        const template = "<t.x>"; // get x attr of template t
        const st = new ST(template);
        const t = new ST("<x>");
        t.add("x", "Ter");
        st?.add("t", t);
        const expected = "Ter";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testBooleanISProp(): void {
        const template = "<t.manager>"; // call isManager
        const st = new ST(template);
        st?.add("t", new BaseTest.User(32, "Ter"));
        const expected = "true";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testBooleanHASProp(): void {
        const template = "<t.parkingSpot>"; // call hasParkingSpot
        const st = new ST(template);
        st?.add("t", new BaseTest.User(32, "Ter"));
        const expected = "true";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testNullAttrProp(): void {
        const template = "<u.id>: <u.name>";
        const st = new ST(template);
        const expected = ": ";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testNoSuchProp(): void {
        const errors = new ErrorBufferAllErrors();
        const template = "<u.qqq>";
        const group = new STGroup();
        group.setListener(errors);
        const st = new ST(group, template);
        st?.add("u", new BaseTest.User(1, "parrt"));
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);

        const msg = errors.get(0) as STRuntimeMessage;
        const e = msg.cause as STNoSuchPropertyException<unknown>;
        assertEquals("User.qqq", e.propertyName);
    };

    @Test
    public testNullIndirectProp(): void {
        const errors = new ErrorBufferAllErrors();
        const group = new STGroup();
        group.setListener(errors);
        const template = "<u.(qqq)>";
        const st = new ST(group, template);
        st?.add("u", new BaseTest.User(1, "parrt"));
        st?.add("qqq", null);
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);

        const msg = errors.get(0) as STRuntimeMessage;
        const e = msg.cause as STNoSuchPropertyException<unknown>;
        assertEquals("User.null", e.propertyName);
    };

    @Test
    public testPropConvertsToString(): void {
        const errors = new ErrorBufferAllErrors();
        const group = new STGroup();
        group.setListener(errors);
        const template = "<u.(name)>";
        const st = new ST(group, template);
        st?.add("u", new BaseTest.User(1, "parrt"));
        st?.add("name", 100);
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);

        const msg = errors.get(0) as STRuntimeMessage;
        const e = msg.cause as STNoSuchPropertyException<unknown>;
        assertEquals("User.100", e.propertyName);
    };

    @Test
    public testInclude(): void {
        const template = "load <box()>;";
        const st = new ST(template);
        st.impl?.nativeGroup.defineTemplate("box", "kewl" + Misc.newLine + "daddy");
        const expected = "load kewl" + Misc.newLine + "daddy;";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testIncludeWithArg(): void {
        const template = "load <box(\"arg\")>;";
        const st = new ST(template);
        st.impl?.nativeGroup.defineTemplate("box", "x", "kewl <x> daddy");
        //st.impl?.dump();
        st?.add("name", "Ter");
        const expected = "load kewl arg daddy;";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testIncludeWithEmptySubtemplateArg(): void {
        const template = "load <box({})>;";
        const st = new ST(template);
        st.impl?.nativeGroup.defineTemplate("box", "x", "kewl <x> daddy");
        // st.impl?.dump();
        st?.add("name", "Ter");
        const expected = "load kewl  daddy;";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testIncludeWithArg2(): void {
        const template = "load <box(\"arg\", foo())>;";
        const st = new ST(template);
        st.impl?.nativeGroup.defineTemplate("box", "x,y", "kewl <x> <y> daddy");
        st.impl?.nativeGroup.defineTemplate("foo", "blech");
        st?.add("name", "Ter");
        const expected = "load kewl arg blech daddy;";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testIncludeWithNestedArgs(): void {
        const template = "load <box(foo(\"arg\"))>;";
        const st = new ST(template);
        st.impl?.nativeGroup.defineTemplate("box", "y", "kewl <y> daddy");
        st.impl?.nativeGroup.defineTemplate("foo", "x", "blech <x>");
        st?.add("name", "Ter");
        const expected = "load kewl blech arg daddy;";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testPassThru(): void {
        const templates =
            "a(x,y) ::= \"<b(...)>\"\n" +
            "b(x,y) ::= \"<x><y>\"\n";
        const group = new STGroupString(templates);
        const a = group.getInstanceOf("a");
        a?.add("x", "x");
        a?.add("y", "y");
        const expected = "xy";
        const result = a?.render();
        assertEquals(expected, result);
    };

    @Test
    public testPassThruWithDefaultValue(): void {
        const templates =
            "a(x,y) ::= \"<b(...)>\"\n" + // should not set y when it sees "no value" from above
            "b(x,y={99}) ::= \"<x><y>\"\n";
        const group = new STGroupString(templates);
        const a = group.getInstanceOf("a");
        a?.add("x", "x");
        const expected = "x99";
        const result = a?.render();
        assertEquals(expected, result);
    };

    @Test
    public testPassThruWithDefaultValueThatLacksDefinitionAbove(): void {
        const templates =
            "a(x) ::= \"<b(...)>\"\n" + // should not set y when it sees "no definition" from above
            "b(x,y={99}) ::= \"<x><y>\"\n";
        const group = new STGroupString(templates);
        const a = group.getInstanceOf("a");
        a?.add("x", "x");
        const expected = "x99";
        const result = a?.render();
        assertEquals(expected, result);
    };

    @Test
    public testPassThruPartialArgs(): void {
        const templates =
            "a(x,y) ::= \"<b(y={99},...)>\"\n" +
            "b(x,y) ::= \"<x><y>\"\n";
        const group = new STGroupString(templates);
        const a = group.getInstanceOf("a");
        a?.add("x", "x");
        a?.add("y", "y");
        const expected = "x99";
        const result = a?.render();
        assertEquals(expected, result);
    };

    @Test
    public testPassThruNoMissingArgs(): void {
        const templates =
            "a(x,y) ::= \"<b(y={99},x={1},...)>\"\n" +
            "b(x,y) ::= \"<x><y>\"\n";
        const group = new STGroupString(templates);
        const a = group.getInstanceOf("a");
        a?.add("x", "x");
        a?.add("y", "y");
        const expected = "199";
        const result = a?.render();
        assertEquals(expected, result);
    };

    @Test
    public testDefineTemplate(): void {
        const group = new STGroup();
        group.defineTemplate("inc", "x", "<x>+1");
        group.defineTemplate("test", "name", "hi <name>!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "hi TerTomSumana!";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testMap(): void {
        const group = new STGroup();
        group.defineTemplate("inc", "x", "[<x>]");
        group.defineTemplate("test", "name", "hi <name:inc()>!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "hi [Ter][Tom][Sumana]!";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testIndirectMap(): void {
        const group = new STGroup();
        group.defineTemplate("inc", "x", "[<x>]");
        group.defineTemplate("test", "t,name", "<name:(t)()>!");
        const st = group.getInstanceOf("test");
        st?.add("t", "inc");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "[Ter][Tom][Sumana]!";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testMapWithExprAsTemplateName(): void {
        const templates =
            "d ::= [\"foo\":\"bold\"]\n" +
            "test(name) ::= \"<name:(d.foo)()>\"\n" +
            "bold(x) ::= <<*<x>*>>\n";
        TestCoreBasics.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "*Ter**Tom**Sumana*";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testParallelMap(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names,phones", "hi <names,phones:{n,p | <n>:<p>;}>");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        st?.add("phones", "x5001");
        st?.add("phones", "x5002");
        st?.add("phones", "x5003");
        const expected = "hi Ter:x5001;Tom:x5002;Sumana:x5003;";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testParallelMapWith3Versus2Elements(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names,phones", "hi <names,phones:{n,p | <n>:<p>;}>");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        st?.add("phones", "x5001");
        st?.add("phones", "x5002");
        const expected = "hi Ter:x5001;Tom:x5002;Sumana:;";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testParallelMapThenMap(): void {
        const group = new STGroup();
        group.defineTemplate("bold", "x", "[<x>]");
        group.defineTemplate("test", "names,phones",
            "hi <names,phones:{n,p | <n>:<p>;}:bold()>");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        st?.add("phones", "x5001");
        st?.add("phones", "x5002");
        const expected = "hi [Ter:x5001;][Tom:x5002;][Sumana:;]";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testMapThenParallelMap(): void {
        const group = new STGroup();
        group.defineTemplate("bold", "x", "[<x>]");
        group.defineTemplate("test", "names,phones",
            "hi <[names:bold()],phones:{n,p | <n>:<p>;}>");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        st?.add("names", "Sumana");
        st?.add("phones", "x5001");
        st?.add("phones", "x5002");
        const expected = "hi [Ter]:x5001;[Tom]:x5002;[Sumana]:;";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testMapIndexes(): void {
        const group = new STGroup();
        group.defineTemplate("inc", "x,i", "<i>:<x>");
        group.defineTemplate("test", "name", "<name:{n|<inc(n,i)>}; separator=\", \">");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", null); // don't count this one
        st?.add("name", "Sumana");
        const expected = "1:Ter, 2:Tom, 3:Sumana";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testMapIndexes2(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "<name:{n | <i>:<n>}; separator=\", \">");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", null); // don't count this one. still can't apply subtemplate to null value
        st?.add("name", "Sumana");
        const expected = "1:Ter, 2:Tom, 3:Sumana";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testMapSingleValue(): void {
        const group = new STGroup();
        group.defineTemplate("a", "x", "[<x>]");
        group.defineTemplate("test", "name", "hi <name:a()>!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        const expected = "hi [Ter]!";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testMapNullValue(): void {
        const group = new STGroup();
        group.defineTemplate("a", "x", "[<x>]");
        group.defineTemplate("test", "name", "hi <name:a()>!");
        const st = group.getInstanceOf("test");
        const expected = "hi !";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testMapNullValueInList(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "<name; separator=\", \">");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", null); // don't print this one
        st?.add("name", "Sumana");
        const expected = "Ter, Tom, Sumana";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testRepeatedMap(): void {
        const group = new STGroup();
        group.defineTemplate("a", "x", "[<x>]");
        group.defineTemplate("b", "x", "(<x>)");
        group.defineTemplate("test", "name", "hi <name:a():b()>!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "hi ([Ter])([Tom])([Sumana])!";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testRepeatedMapWithNullValue(): void {
        const group = new STGroup();
        group.defineTemplate("a", "x", "[<x>]");
        group.defineTemplate("b", "x", "(<x>)");
        group.defineTemplate("test", "name", "hi <name:a():b()>!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", null);
        st?.add("name", "Sumana");
        const expected = "hi ([Ter])([Sumana])!";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testRepeatedMapWithNullValueAndNullOption(): void {
        const group = new STGroup();
        group.defineTemplate("a", "x", "[<x>]");
        group.defineTemplate("b", "x", "(<x>)");
        group.defineTemplate("test", "name", "hi <name:a():b(); null={x}>!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", null);
        st?.add("name", "Sumana");
        const expected = "hi ([Ter])x([Sumana])!";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testRoundRobinMap(): void {
        const group = new STGroup();
        group.defineTemplate("a", "x", "[<x>]");
        group.defineTemplate("b", "x", "(<x>)");
        group.defineTemplate("test", "name", "hi <name:a(),b()>!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "hi [Ter](Tom)[Sumana]!";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testTrueCond(): void {
        const template = "<if(name)>works<endif>";
        const st = new ST(template);
        st?.add("name", "Ter");
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testEmptyIFTemplate(): void {
        const template = "<if(x)>fail<elseif(name)><endif>";
        const st = new ST(template);
        st?.add("name", "Ter");
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testCondParens(): void {
        const template = "<if(!(x||y)&&!z)>works<endif>";
        const st = new ST(template);
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testFalseCond(): void {
        const template = "<if(name)>works<endif>";
        const st = new ST(template);
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testFalseCond2(): void {
        const template = "<if(name)>works<endif>";
        const st = new ST(template);
        st?.add("name", null);
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testFalseCondWithFormalArgs(): void {
        // insert of indent instr was not working; ok now
        const dir = this.getRandomDir();
        const groupFile =
            "a(scope) ::= <<" + Misc.newLine +
            "foo" + Misc.newLine +
            "    <if(scope)>oops<endif>" + Misc.newLine +
            "bar" + Misc.newLine +
            ">>";
        TestCoreBasics.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");
        const st = group.getInstanceOf("a");
        // st?.impl?.dump();
        const expected = "foo" + Misc.newLine + "bar";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testElseIf2(): void {
        const template = "<if(x)>fail1<elseif(y)>fail2<elseif(z)>works<else>fail3<endif>";
        const st = new ST(template);
        st?.add("z", "blort");
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testElseIf3(): void {
        const template = "<if(x)><elseif(y)><elseif(z)>works<else><endif>";
        const st = new ST(template);
        st?.add("z", "blort");
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testNotTrueCond(): void {
        const template = "<if(!name)>works<endif>";
        const st = new ST(template);
        st?.add("name", "Ter");
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testNotFalseCond(): void {
        const template = "<if(!name)>works<endif>";
        const st = new ST(template);
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testParensInConditonal(): void {
        const template = "<if((a||b)&&(c||d))>works<endif>";
        const st = new ST(template);
        st?.add("a", true);
        st?.add("b", true);
        st?.add("c", true);
        st?.add("d", true);
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testParensInConditonal2(): void {
        const template = "<if((!a||b)&&!(c||d))>broken<else>works<endif>";
        const st = new ST(template);
        st?.add("a", true);
        st?.add("b", true);
        st?.add("c", true);
        st?.add("d", true);
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testTrueCondWithElse(): void {
        const template = "<if(name)>works<else>fail<endif>";
        const st = new ST(template);
        st?.add("name", "Ter");
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testFalseCondWithElse(): void {
        const template = "<if(name)>fail<else>works<endif>";
        const st = new ST(template);
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testElseIf(): void {
        const template = "<if(name)>fail<elseif(id)>works<else>fail<endif>";
        const st = new ST(template);
        st?.add("id", "2DF3DF");
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testElseIfNoElseAllFalse(): void {
        const template = "<if(name)>fail<elseif(id)>fail<endif>";
        const st = new ST(template);
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testElseIfAllExprFalse(): void {
        const template = "<if(name)>fail<elseif(id)>fail<else>works<endif>";
        const st = new ST(template);
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testOr(): void {
        const template = "<if(name||notThere)>works<else>fail<endif>";
        const st = new ST(template);
        st?.add("name", "Ter");
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testMapConditionAndEscapeInside(): void {
        const template = "<if(m.name)>works \\\\<endif>";
        const st = new ST(template);
        const m = new Map<string, string>();
        m.set("name", "Ter");
        st?.add("m", m);
        const expected = "works \\";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testAnd(): void {
        const template = "<if(name&&notThere)>fail<else>works<endif>";
        const st = new ST(template);
        st?.add("name", "Ter");
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testAndNot(): void {
        const template = "<if(name&&!notThere)>works<else>fail<endif>";
        const st = new ST(template);
        st?.add("name", "Ter");
        const expected = "works";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testCharLiterals(): void {
        let st = new ST("Foo <\\n><\\n><\\t> bar\n");
        let sw = new StringWriter();
        st.write(new AutoIndentWriter(sw, "\n")); // force \n as newline
        let result = sw.toString();
        let expecting = "Foo \n\n\t bar\n";     // expect \n in output
        assertEquals(expecting, result);

        st = new ST("Foo <\\n><\\t> bar" + Misc.newLine);
        sw = new StringWriter();
        st.write(new AutoIndentWriter(sw, "\n")); // force \n as newline
        expecting = "Foo \n\t bar\n";     // expect \n in output
        result = sw.toString();
        assertEquals(expecting, result);

        st = new ST("Foo<\\ >bar<\\n>");
        sw = new StringWriter();
        st.write(new AutoIndentWriter(sw, "\n")); // force \n as newline
        result = sw.toString();
        expecting = "Foo bar\n"; // forced \n
        assertEquals(expecting, result);
    };

    @Test
    public testUnicodeLiterals(): void {
        let st = new ST("Foo <\\uFEA5><\\n><\\u00C2> bar\n");
        let expecting = "Foo \ufea5" + Misc.newLine + "\u00C2 bar" + Misc.newLine;
        let result = st?.render();
        assertEquals(expecting, result);

        st = new ST("Foo <\\uFEA5><\\n><\\u00C2> bar" + Misc.newLine);
        expecting = "Foo \ufea5" + Misc.newLine + "\u00C2 bar" + Misc.newLine;
        result = st?.render();
        assertEquals(expecting, result);

        st = new ST("Foo<\\ >bar<\\n>");
        expecting = "Foo bar" + Misc.newLine;
        result = st?.render();
        assertEquals(expecting, result);
    };

    @Test
    public testSubtemplateExpr(): void {
        const template = "<{name\n}>";
        const st = new ST(template);
        const expected = "name" + Misc.newLine;
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testSeparator(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "<names:{n | case <n>}; separator=\", \">");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", "Tom");
        const expected = "case Ter, case Tom";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testSeparatorInArray(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "<names:{n | case <n>}; separator=\", \">");
        const st = group.getInstanceOf("test");
        st?.add("names", ["Ter", "Tom"]);
        const expected = "case Ter, case Tom";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testSeparatorInArray2(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "<names:{n | case <n>}; separator=\", \">");
        const st = group.getInstanceOf("test");
        st?.add("names", "Ter");
        st?.add("names", ["Tom", "Sriram"]);
        const expected = "case Ter, case Tom, case Sriram";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testSeparatorInPrimitiveArray(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "<names:{n | case <n>}; separator=\", \">");
        const st = group.getInstanceOf("test");
        st?.add("names", [0, 1]);
        const expected = "case 0, case 1";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testSeparatorInPrimitiveArray2(): void {
        const group = new STGroup();
        group.defineTemplate("test", "names", "<names:{n | case <n>}; separator=\", \">");
        const st = group.getInstanceOf("test");
        st?.add("names", 0);
        st?.add("names", [1, 2]);
        const expected = "case 0, case 1, case 2";
        const result = st?.render();
        assertEquals(expected, result);
    };

    /**
     * (...) forces early eval to string. early eval {@code <(x)>} using new
     *  STWriter derived from type of current STWriter. e.g., AutoIndentWriter.
     */
    @Test
    public testEarlyEvalIndent(): void {
        const templates =
            "t() ::= <<  abc>>\n" +
            "main() ::= <<\n" +
            "<t()>\n" +
            "<(t())>\n" + // early eval ignores indents; mostly for simply strings
            "  <t()>\n" +
            "  <(t())>\n" +
            ">>\n";

        TestCoreBasics.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("main");
        const result = st?.render();
        const expected =
            "  abc" + Misc.newLine +
            "  abc" + Misc.newLine +
            "    abc" + Misc.newLine +
            "    abc";
        assertEquals(expected, result);
    };

    @Test
    public testEarlyEvalNoIndent(): void {
        const templates =
            "t() ::= <<  abc>>\n" +
            "main() ::= <<\n" +
            "<t()>\n" +
            "<(t())>\n" + // early eval ignores indents; mostly for simply strings
            "  <t()>\n" +
            "  <(t())>\n" +
            ">>\n";

        TestCoreBasics.writeFile(this.tmpdir, "t.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/t.stg");
        const st = group.getInstanceOf("main");
        const sw = new StringWriter();
        const w = new NoIndentWriter(sw);
        st?.write(w);
        const result = sw.toString();
        const expected =
            "abc" + Misc.newLine +
            "abc" + Misc.newLine +
            "abc" + Misc.newLine +
            "abc";
        assertEquals(expected, result);
    };

    @Test
    public testArrayOfTemplates(): void {
        const template = "<foo>!";
        const st = new ST(template);
        const t = [new ST("hi"), new ST("mom")];
        st?.add("foo", t);
        const expected = "himom!";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testArrayOfTemplatesInTemplate(): void {
        const template = "<foo>!";
        const st = new ST(template);
        const t = [new ST("hi"), new ST("mom")];
        st?.add("foo", t);
        const wrapper = new ST("<x>");
        wrapper.add("x", st);
        const expected = "himom!";
        const result = wrapper.render();
        assertEquals(expected, result);
    };

    @Test
    public testListOfTemplates(): void {
        const template = "<foo>!";
        const st = new ST(template);
        const t = [new ST("hi"), new ST("mom")];
        st?.add("foo", t);
        const expected = "himom!";
        const result = st?.render();
        assertEquals(expected, result);
    };

    @Test
    public testListOfTemplatesInTemplate(): void {
        const template = "<foo>!";
        const st = new ST(template);
        const t = [new ST("hi"), new ST("mom")];
        st?.add("foo", t);
        const wrapper = new ST("<x>");
        wrapper.add("x", st);
        const expected = "himom!";
        const result = wrapper.render();
        assertEquals(expected, result);
    };

    // Not really a test. Just for playing around with the library.
    public playing(): void {
        const template = "<a:t(x,y),u()>";
        const st = new ST(template);
        st.impl?.dump();
    };

    @Test
    public testPrototype(): void {
        const prototype = new ST("simple template");

        const st = new ST(prototype);
        st?.add("arg1", "value");
        assertEquals("simple template", st.render());

        const st2 = new ST(prototype);
        st2.add("arg1", "value");
        assertEquals("simple template", st2.render());
    };

    @Test
    public testFormatPositionalArguments(): void {
        const n = "n";
        const p = "p";
        const expected = "n:p";
        const actual = ST.format("<%1>:<%2>", n, p);
        assertEquals(expected, actual);
    }
}
