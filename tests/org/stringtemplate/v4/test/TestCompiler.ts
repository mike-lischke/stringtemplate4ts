/* java2ts: keep */

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

import { BaseTest } from "./BaseTest.js";
import { ErrorBuffer, STGroup, Compiler, ErrorManager } from "../../../../../src/index.js";
import { assertEquals } from "../../../../junit.js";

import { Test } from "../../../../decorators.js";

export class TestCompiler extends BaseTest {

    @Test
    public testAttr(): void {
        const template = "hi <name>";

        const code = new Compiler().compile({ template });
        const asmExpected = "write_str 0, load_attr 1, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[hi , name]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testInclude(): void {
        const template = "hi <foo()>";

        const code = new Compiler().compile({ template });
        const asmExpected = "write_str 0, new 1 0, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[hi , foo]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testIncludeWithPassThrough(): void {
        const template = "hi <foo(...)>";

        const code = new Compiler().compile({ template });
        const asmExpected = "write_str 0, args, passthru 1, new_box_args 1, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);
        const stringsExpected = "[hi , foo]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testIncludeWithPartialPassThrough(): void {
        const template = "hi <foo(x=y,...)>";

        const code = new Compiler().compile({ template });
        const asmExpected = "write_str 0, args, load_attr 1, store_arg 2, passthru 3, new_box_args 3, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);
        const stringsExpected = "[hi , y, x, foo]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testSuperInclude(): void {
        const template = "<super.foo()>";

        const code = new Compiler().compile({ template });
        const asmExpected = "super_new 0 0, write";
        // code!.dump();
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);
        const stringsExpected = "[foo]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testSuperIncludeWithArgs(): void {
        const template = "<super.foo(a,{b})>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, new 1 0, super_new 2 2, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);
        const stringsExpected = "[a, _sub1, foo]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testSuperIncludeWithNamedArgs(): void {
        const template = "<super.foo(x=a,y={b})>";

        const code = new Compiler().compile({ template });
        const asmExpected = "args, load_attr 0, store_arg 1, new 2 0, store_arg 3, super_new_box_args 4, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);
        const stringsExpected = "[a, x, _sub1, y, foo]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testIncludeWithArgs(): void {
        const template = "hi <foo(a,b)>";

        const code = new Compiler().compile({ template });
        const asmExpected = "write_str 0, load_attr 1, load_attr 2, new 3 2, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);
        const stringsExpected = "[hi , a, b, foo]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testAnonIncludeArgs(): void {
        const template = "<({ a, b | <a><b>})>";

        const code = new Compiler().compile({ template });
        const asmExpected = "new 0 0, tostr, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[_sub1]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testAnonIncludeArgMismatch(): void {
        const errors = new ErrorBuffer();
        const template = "<a:{foo}>";
        const g = new STGroup();
        g.errMgr = new ErrorManager(errors);

        const _code = new Compiler(g).compile({ template });

        const expected = "[1:3: anonymous template has 0 arg(s) but mapped across 1 value(s)]";
        assertEquals(expected, errors.toString());
    }

    @Test
    public testAnonIncludeArgMismatch2(): void {
        const errors = new ErrorBuffer();
        const template = "<a,b:{x|foo}>";
        const g = new STGroup();
        g.errMgr = new ErrorManager(errors);

        const _code = new Compiler(g).compile({ template });
        const expected = "[1:5: anonymous template has 1 arg(s) but mapped across 2 value(s)]";
        assertEquals(expected, errors.toString());
    }

    @Test
    public testAnonIncludeArgMismatch3(): void {
        const errors = new ErrorBuffer();
        const template = "<a:{x|foo},{bar}>";
        const g = new STGroup();
        g.errMgr = new ErrorManager(errors);

        const _code = new Compiler(g).compile({ template });
        const expected = "[1:11: anonymous template has 0 arg(s) but mapped across 1 value(s)]";
        assertEquals(expected, errors.toString());
    }

    @Test
    public testIndirectIncludeWitArgs(): void {
        const template = "hi <(foo)(a,b)>";

        const code = new Compiler().compile({ template });
        const asmExpected = "write_str 0, load_attr 1, tostr, load_attr 2, load_attr 3, new_ind 2, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[hi , foo, a, b]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testProp(): void {
        const template = "hi <a.b>";

        const code = new Compiler().compile({ template });
        const asmExpected = "write_str 0, load_attr 1, load_prop 2, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[hi , a, b]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testProp2(): void {
        const template = "<u.id>: <u.name>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, load_prop 1, write, write_str 2, load_attr 0, load_prop 3, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[u, id, : , name]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testMap(): void {
        const template = "<name:bold()>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, null, new 1 1, map, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[name, bold]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testMapAsOption(): void {
        const template = "<a; wrap=name:bold()>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, options, load_attr 1, null, new 2 1, map, store_option 4, write_opt";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[a, name, bold]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testMapArg(): void {
        const template = "<name:bold(x)>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, null, load_attr 1, new 2 2, map, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[name, x, bold]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testIndirectMapArg(): void {
        const template = "<name:(t)(x)>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, load_attr 1, tostr, null, load_attr 2, new_ind 2, map, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[name, t, x]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testRepeatedMap(): void {
        const template = "<name:bold():italics()>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, null, new 1 1, map, null, new 2 1, map, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[name, bold, italics]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testRepeatedMapArg(): void {
        const template = "<name:bold(x):italics(x,y)>";

        const code = new Compiler().compile({ template });
        const asmExpected =
            "load_attr 0, null, load_attr 1, new 2 2, map, " +
            "null, load_attr 1, load_attr 3, new 4 3, map, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[name, x, bold, y, italics]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testRotMap(): void {
        const template = "<name:bold(),italics()>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, null, new 1 1, null, new 2 1, rot_map 2, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[name, bold, italics]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testRotMapArg(): void {
        const template = "<name:bold(x),italics()>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, null, load_attr 1, new 2 2, null, new 3 1, rot_map 2, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[name, x, bold, italics]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testZipMap(): void {
        const template = "<names,phones:bold()>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, load_attr 1, null, null, new 2 2, zip_map 2, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[names, phones, bold]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testZipMapArg(): void {
        const template = "<names,phones:bold(x)>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, load_attr 1, null, null, load_attr 2, new 3 3, zip_map 2, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[names, phones, x, bold]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testAnonMap(): void {
        const template = "<name:{n | <n>}>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, null, new 1 1, map, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[name, _sub1]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testAnonZipMap(): void {
        const template = "<a,b:{x,y | <x><y>}>";

        const code = new Compiler().compile({ template });
        const asmExpected = "load_attr 0, load_attr 1, null, null, new 2 2, zip_map 2, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[a, b, _sub1]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testIf(): void {
        const template = "go: <if(name)>hi, foo<endif>";

        const code = new Compiler().compile({ template });
        const asmExpected = "write_str 0, load_attr 1, brf 12, write_str 2";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[go: , name, hi, foo]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testIfElse(): void {
        const template = "go: <if(name)>hi, foo<else>bye<endif>";

        const code = new Compiler().compile({ template });
        const asmExpected =
            "write_str 0, " +
            "load_attr 1, " +
            "brf 15, " +
            "write_str 2, " +
            "br 18, " +
            "write_str 3";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[go: , name, hi, foo, bye]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testElseIf(): void {
        const template = "go: <if(name)>hi, foo<elseif(user)>a user<endif>";

        const code = new Compiler().compile({ template });
        const asmExpected =
            "write_str 0, " +
            "load_attr 1, " +
            "brf 15, " +
            "write_str 2, " +
            "br 24, " +
            "load_attr 3, " +
            "brf 24, " +
            "write_str 4";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[go: , name, hi, foo, user, a user]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testElseIfElse(): void {
        const template = "go: <if(name)>hi, foo<elseif(user)>a user<else>bye<endif>";

        const code = new Compiler().compile({ template });
        const asmExpected =
            "write_str 0, " +
            "load_attr 1, " +
            "brf 15, " +
            "write_str 2, " +
            "br 30, " +
            "load_attr 3, " +
            "brf 27, " +
            "write_str 4, " +
            "br 30, " +
            "write_str 5";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[go: , name, hi, foo, user, a user, bye]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testOption(): void {
        const template = "hi <name; separator=\"x\">";

        const code = new Compiler().compile({ template });
        const asmExpected = "write_str 0, load_attr 1, options, load_str 2, store_option 3, write_opt";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[hi , name, x]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testOptionAsTemplate(): void {
        const template = "hi <name; separator={, }>";

        const code = new Compiler().compile({ template });
        const asmExpected = "write_str 0, load_attr 1, options, new 2 0, store_option 3, write_opt";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[hi , name, _sub1]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testOptions(): void {
        const template = "hi <name; anchor, wrap=foo(), separator=\", \">";

        const code = new Compiler().compile({ template });
        const asmExpected =
            "write_str 0, " +
            "load_attr 1, " +
            "options, " +
            "load_str 2, " +
            "store_option 0, " +
            "new 3 0, " +
            "store_option 4, " +
            "load_str 4, " +
            "store_option 3, " +
            "write_opt";
        const stringsExpected = // the ", , ," is the ", " separator string
            "[hi , name, true, foo, , ]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);

        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);
    }

    @Test
    public testEmptyList(): void {
        const template = "<[]>";

        const code = new Compiler().compile({ template });
        const asmExpected = "list, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testList(): void {
        const template = "<[a,b]>";

        const code = new Compiler().compile({ template });
        const asmExpected = "list, load_attr 0, add, load_attr 1, add, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[a, b]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testEmbeddedRegion(): void {
        const template = "<@r>foo<@end>";

        // compile as if in root dir and in template 'a'
        const code = new Compiler().compile({ name: "a", template });
        const asmExpected = "new 0 0, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[/region__/a__r]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }

    @Test
    public testRegion(): void {
        const template = "x:<@r()>";

        // compile as if in root dir and in template 'a'
        const code = new Compiler().compile({ name: "a", template });
        const asmExpected = "write_str 0, new 1 0, write";
        const asmResult = code!.instrs();
        assertEquals(asmExpected, asmResult);

        const stringsExpected = "[x:, /region__/a__r]";
        const stringsResult = "[" + code!.strings.join(", ") + "]";
        assertEquals(stringsExpected, stringsResult);
    }
}
