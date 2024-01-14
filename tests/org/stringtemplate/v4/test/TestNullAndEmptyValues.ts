/* java2ts: keep */

/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { BaseTest } from "./BaseTest.js";
import { assertArrayEquals, assertEquals } from "../../../../junit.js";
import {
    STGroup, ST, AutoIndentWriter, STGroupFile, Misc, StringWriter, ErrorManager,
} from "../../../../../src/index.js";

import { Test } from "../../../../decorators.js";

export class TestNullAndEmptyValues extends BaseTest {
    public static T = class T {
        public template: string;
        public x: unknown;
        public expecting: string;

        public result = "";

        public constructor(t: T);
        public constructor(template: string, x: unknown, expecting: string);
        public constructor(...args: unknown[]) {
            switch (args.length) {
                case 1: {
                    const [t] = args as [T];
                    this.template = t.template;
                    this.x = t.x;
                    this.expecting = t.expecting;

                    break;
                }

                case 3: {
                    const [template, x, expecting] = args as [string, Object, string];
                    this.template = template;
                    this.x = x;
                    this.expecting = expecting;

                    break;
                }

                default: {
                    throw new Error(`Invalid number of arguments`);
                }
            }
        }

        public toString(): string {
            let s: string;
            if (Array.isArray(this.x)) {
                s = this.x.join(", ");
            } else {
                s = String(this.x);
            }

            return "('" + this.template + "', " + s + ", '" + this.expecting + "', '" + this.result + "')";
        }
    };

    protected static readonly UNDEF = "<undefined>";
    protected static readonly LIST0 = new Array<Object>();

    protected static readonly singleValuedTests = [
        new TestNullAndEmptyValues.T("<x>", TestNullAndEmptyValues.UNDEF, ""),
        new TestNullAndEmptyValues.T("<x>", null, ""),
        new TestNullAndEmptyValues.T("<x>", "", ""),
        new TestNullAndEmptyValues.T("<x>", TestNullAndEmptyValues.LIST0, ""),

        new TestNullAndEmptyValues.T("<x:t()>", TestNullAndEmptyValues.UNDEF, ""),
        new TestNullAndEmptyValues.T("<x:t()>", null, ""),
        new TestNullAndEmptyValues.T("<x:t()>", "", ""),
        new TestNullAndEmptyValues.T("<x:t()>", TestNullAndEmptyValues.LIST0, ""),

        new TestNullAndEmptyValues.T("<x; null={y}>", TestNullAndEmptyValues.UNDEF, "y"),
        new TestNullAndEmptyValues.T("<x; null={y}>", null, "y"),
        new TestNullAndEmptyValues.T("<x; null={y}>", "", ""),
        new TestNullAndEmptyValues.T("<x; null={y}>", TestNullAndEmptyValues.LIST0, ""),

        new TestNullAndEmptyValues.T("<x:t(); null={y}>", TestNullAndEmptyValues.UNDEF, "y"),
        new TestNullAndEmptyValues.T("<x:t(); null={y}>", null, "y"),
        new TestNullAndEmptyValues.T("<x:t(); null={y}>", "", ""),
        new TestNullAndEmptyValues.T("<x:t(); null={y}>", TestNullAndEmptyValues.LIST0, ""),

        new TestNullAndEmptyValues.T("<if(x)>y<endif>", TestNullAndEmptyValues.UNDEF, ""),
        new TestNullAndEmptyValues.T("<if(x)>y<endif>", null, ""),
        new TestNullAndEmptyValues.T("<if(x)>y<endif>", "", "y"),
        new TestNullAndEmptyValues.T("<if(x)>y<endif>", TestNullAndEmptyValues.LIST0, ""),

        new TestNullAndEmptyValues.T("<if(x)>y<else>z<endif>", TestNullAndEmptyValues.UNDEF, "z"),
        new TestNullAndEmptyValues.T("<if(x)>y<else>z<endif>", null, "z"),
        new TestNullAndEmptyValues.T("<if(x)>y<else>z<endif>", "", "y"),
        new TestNullAndEmptyValues.T("<if(x)>y<else>z<endif>", TestNullAndEmptyValues.LIST0, "z"),
    ];

    protected static readonly LISTa = ["a"];
    protected static readonly LISTab = ["a", "b"];
    protected static readonly LISTnull = [null];
    protected static readonly LISTa_null = ["a", null];
    protected static readonly LISTnull_b = [null, "b"];
    protected static readonly LISTa_null_b = ["a", null, "b"];

    protected static readonly multiValuedTests = [
        new TestNullAndEmptyValues.T("<x>", TestNullAndEmptyValues.LIST0, ""),
        new TestNullAndEmptyValues.T("<x>", TestNullAndEmptyValues.LISTa, "a"),
        new TestNullAndEmptyValues.T("<x>", TestNullAndEmptyValues.LISTab, "ab"),
        new TestNullAndEmptyValues.T("<x>", TestNullAndEmptyValues.LISTnull, ""),
        new TestNullAndEmptyValues.T("<x>", TestNullAndEmptyValues.LISTnull_b, "b"),
        new TestNullAndEmptyValues.T("<x>", TestNullAndEmptyValues.LISTa_null, "a"),
        new TestNullAndEmptyValues.T("<x>", TestNullAndEmptyValues.LISTa_null_b, "ab"),

        new TestNullAndEmptyValues.T("<x; null={y}>", TestNullAndEmptyValues.LIST0, ""),
        new TestNullAndEmptyValues.T("<x; null={y}>", TestNullAndEmptyValues.LISTa, "a"),
        new TestNullAndEmptyValues.T("<x; null={y}>", TestNullAndEmptyValues.LISTab, "ab"),
        new TestNullAndEmptyValues.T("<x; null={y}>", TestNullAndEmptyValues.LISTnull, "y"),
        new TestNullAndEmptyValues.T("<x; null={y}>", TestNullAndEmptyValues.LISTnull_b, "yb"),
        new TestNullAndEmptyValues.T("<x; null={y}>", TestNullAndEmptyValues.LISTa_null, "ay"),
        new TestNullAndEmptyValues.T("<x; null={y}>", TestNullAndEmptyValues.LISTa_null_b, "ayb"),

        new TestNullAndEmptyValues.T("<x; separator={,}>", TestNullAndEmptyValues.LIST0, ""),
        new TestNullAndEmptyValues.T("<x; separator={,}>", TestNullAndEmptyValues.LISTa, "a"),
        new TestNullAndEmptyValues.T("<x; separator={,}>", TestNullAndEmptyValues.LISTab, "a,b"),
        new TestNullAndEmptyValues.T("<x; separator={,}>", TestNullAndEmptyValues.LISTnull, ""),
        new TestNullAndEmptyValues.T("<x; separator={,}>", TestNullAndEmptyValues.LISTnull_b, "b"),
        new TestNullAndEmptyValues.T("<x; separator={,}>", TestNullAndEmptyValues.LISTa_null, "a"),
        new TestNullAndEmptyValues.T("<x; separator={,}>", TestNullAndEmptyValues.LISTa_null_b, "a,b"),

        new TestNullAndEmptyValues.T("<x; null={y}, separator={,}>", TestNullAndEmptyValues.LIST0, ""),
        new TestNullAndEmptyValues.T("<x; null={y}, separator={,}>", TestNullAndEmptyValues.LISTa, "a"),
        new TestNullAndEmptyValues.T("<x; null={y}, separator={,}>", TestNullAndEmptyValues.LISTab, "a,b"),
        new TestNullAndEmptyValues.T("<x; null={y}, separator={,}>", TestNullAndEmptyValues.LISTnull, "y"),
        new TestNullAndEmptyValues.T("<x; null={y}, separator={,}>", TestNullAndEmptyValues.LISTnull_b, "y,b"),
        new TestNullAndEmptyValues.T("<x; null={y}, separator={,}>", TestNullAndEmptyValues.LISTa_null, "a,y"),
        new TestNullAndEmptyValues.T("<x; null={y}, separator={,}>", TestNullAndEmptyValues.LISTa_null_b, "a,y,b"),

        new TestNullAndEmptyValues.T("<if(x)>y<endif>", TestNullAndEmptyValues.LIST0, ""),
        new TestNullAndEmptyValues.T("<if(x)>y<endif>", TestNullAndEmptyValues.LISTa, "y"),
        new TestNullAndEmptyValues.T("<if(x)>y<endif>", TestNullAndEmptyValues.LISTab, "y"),
        new TestNullAndEmptyValues.T("<if(x)>y<endif>", TestNullAndEmptyValues.LISTnull, "y"),
        new TestNullAndEmptyValues.T("<if(x)>y<endif>", TestNullAndEmptyValues.LISTnull_b, "y"),
        new TestNullAndEmptyValues.T("<if(x)>y<endif>", TestNullAndEmptyValues.LISTa_null, "y"),
        new TestNullAndEmptyValues.T("<if(x)>y<endif>", TestNullAndEmptyValues.LISTa_null_b, "y"),

        new TestNullAndEmptyValues.T("<x:{it | <it>}>", TestNullAndEmptyValues.LIST0, ""),
        new TestNullAndEmptyValues.T("<x:{it | <it>}>", TestNullAndEmptyValues.LISTa, "a"),
        new TestNullAndEmptyValues.T("<x:{it | <it>}>", TestNullAndEmptyValues.LISTab, "ab"),
        new TestNullAndEmptyValues.T("<x:{it | <it>}>", TestNullAndEmptyValues.LISTnull, ""),
        new TestNullAndEmptyValues.T("<x:{it | <it>}>", TestNullAndEmptyValues.LISTnull_b, "b"),
        new TestNullAndEmptyValues.T("<x:{it | <it>}>", TestNullAndEmptyValues.LISTa_null, "a"),
        new TestNullAndEmptyValues.T("<x:{it | <it>}>", TestNullAndEmptyValues.LISTa_null_b, "ab"),

        new TestNullAndEmptyValues.T("<x:{it | <it>}; null={y}>", TestNullAndEmptyValues.LIST0, ""),
        new TestNullAndEmptyValues.T("<x:{it | <it>}; null={y}>", TestNullAndEmptyValues.LISTa, "a"),
        new TestNullAndEmptyValues.T("<x:{it | <it>}; null={y}>", TestNullAndEmptyValues.LISTab, "ab"),
        new TestNullAndEmptyValues.T("<x:{it | <it>}; null={y}>", TestNullAndEmptyValues.LISTnull, "y"),
        new TestNullAndEmptyValues.T("<x:{it | <it>}; null={y}>", TestNullAndEmptyValues.LISTnull_b, "yb"),
        new TestNullAndEmptyValues.T("<x:{it | <it>}; null={y}>", TestNullAndEmptyValues.LISTa_null, "ay"),
        new TestNullAndEmptyValues.T("<x:{it | <it>}; null={y}>", TestNullAndEmptyValues.LISTa_null_b, "ayb"),

        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}>", TestNullAndEmptyValues.LIST0, ""),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}>", TestNullAndEmptyValues.LISTa, "1.a"),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}>", TestNullAndEmptyValues.LISTab, "1.a2.b"),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}>", TestNullAndEmptyValues.LISTnull, ""),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}>", TestNullAndEmptyValues.LISTnull_b, "1.b"),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}>", TestNullAndEmptyValues.LISTa_null, "1.a"),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}>", TestNullAndEmptyValues.LISTa_null_b, "1.a2.b"),

        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}; null={y}>", TestNullAndEmptyValues.LIST0, ""),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}; null={y}>", TestNullAndEmptyValues.LISTa, "1.a"),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}; null={y}>", TestNullAndEmptyValues.LISTab, "1.a2.b"),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}; null={y}>", TestNullAndEmptyValues.LISTnull, "y"),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}; null={y}>", TestNullAndEmptyValues.LISTnull_b, "y1.b"),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}; null={y}>", TestNullAndEmptyValues.LISTa_null, "1.ay"),
        new TestNullAndEmptyValues.T("<x:{it | <i>.<it>}; null={y}>", TestNullAndEmptyValues.LISTa_null_b, "1.ay2.b"),

        new TestNullAndEmptyValues.T("<x:{it | x<if(!it)>y<endif>}; null={z}>", TestNullAndEmptyValues.LIST0, ""),
        new TestNullAndEmptyValues.T("<x:{it | x<if(!it)>y<endif>}; null={z}>", TestNullAndEmptyValues.LISTa, "x"),
        new TestNullAndEmptyValues.T("<x:{it | x<if(!it)>y<endif>}; null={z}>", TestNullAndEmptyValues.LISTab, "xx"),
        new TestNullAndEmptyValues.T("<x:{it | x<if(!it)>y<endif>}; null={z}>", TestNullAndEmptyValues.LISTnull, "z"),
        new TestNullAndEmptyValues.T("<x:{it | x<if(!it)>y<endif>}; null={z}>", TestNullAndEmptyValues.LISTnull_b,
            "zx"),
        new TestNullAndEmptyValues.T("<x:{it | x<if(!it)>y<endif>}; null={z}>", TestNullAndEmptyValues.LISTa_null,
            "xz"),
        new TestNullAndEmptyValues.T("<x:{it | x<if(!it)>y<endif>}; null={z}>", TestNullAndEmptyValues.LISTa_null_b,
            "xzx"),

        new TestNullAndEmptyValues.T("<x:t():u(); null={y}>", TestNullAndEmptyValues.LIST0, ""),
        new TestNullAndEmptyValues.T("<x:t():u(); null={y}>", TestNullAndEmptyValues.LISTa, "a"),
        new TestNullAndEmptyValues.T("<x:t():u(); null={y}>", TestNullAndEmptyValues.LISTab, "ab"),
        new TestNullAndEmptyValues.T("<x:t():u(); null={y}>", TestNullAndEmptyValues.LISTnull, "y"),
        new TestNullAndEmptyValues.T("<x:t():u(); null={y}>", TestNullAndEmptyValues.LISTnull_b, "yb"),
        new TestNullAndEmptyValues.T("<x:t():u(); null={y}>", TestNullAndEmptyValues.LISTa_null, "ay"),
        new TestNullAndEmptyValues.T("<x:t():u(); null={y}>", TestNullAndEmptyValues.LISTa_null_b, "ayb"),
    ];

    protected static readonly listTests = [
        new TestNullAndEmptyValues.T("<[]>", TestNullAndEmptyValues.UNDEF, ""),
        new TestNullAndEmptyValues.T("<[]; null={x}>", TestNullAndEmptyValues.UNDEF, ""),
        new TestNullAndEmptyValues.T("<[]:{it | x}>", TestNullAndEmptyValues.UNDEF, ""),
        new TestNullAndEmptyValues.T("<[[],[]]:{it| x}>", TestNullAndEmptyValues.UNDEF, ""),
        new TestNullAndEmptyValues.T("<[]:t()>", TestNullAndEmptyValues.UNDEF, ""),
    ];

    @Test
    public testSingleValued(): void {
        const failed = this.testMatrix(TestNullAndEmptyValues.singleValuedTests);
        assertArrayEquals([], failed);
    }

    @Test
    public testMultiValued(): void {
        const failed = this.testMatrix(TestNullAndEmptyValues.multiValuedTests);
        assertArrayEquals([], failed);
    }

    @Test
    public testLists(): void {
        const failed = this.testMatrix(TestNullAndEmptyValues.listTests);
        assertArrayEquals([], failed);
    }

    public testMatrix(tests: TestNullAndEmptyValues.T[]): TestNullAndEmptyValues.T[] {
        const failed = new Array<TestNullAndEmptyValues.T>();
        for (const t of tests) {
            const test = new TestNullAndEmptyValues.T(t); // dup since we might mod with result
            const group = new STGroup();
            group.defineTemplate("t", "x", "<x>");
            group.defineTemplate("u", "x", "<x>");
            group.defineTemplate("test", "x", test.template);
            const st = group.getInstanceOf("test");
            if (test.x !== TestNullAndEmptyValues.UNDEF) {
                st?.add("x", test.x);
            }
            const result = st?.render() ?? "<unknown>";
            if (result !== test.expecting) {
                test.result = result;
                failed.push(test);
            }
        }

        return failed;
    }

    @Test
    public testSeparatorWithNullFirstValue(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "hi <name; separator=\", \">!");
        const st = group.getInstanceOf("test");
        st?.add("name", null); // null is added to list, but ignored in iteration
        st?.add("name", "Tom");
        st?.add("name", "Sumana");
        const expected = "hi Tom, Sumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testTemplateAppliedToNullIsEmpty(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "<name:t()>");
        group.defineTemplate("t", "x", "<x>");
        const st = group.getInstanceOf("test");
        st?.add("name", null);
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testTemplateAppliedToMissingValueIsEmpty(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "<name:t()>");
        group.defineTemplate("t", "x", "<x>");
        const st = group.getInstanceOf("test");
        const expected = "";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSeparatorWithNull2ndValue(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "hi <name; separator=\", \">!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", null);
        st?.add("name", "Sumana");
        const expected = "hi Ter, Sumana!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSeparatorWithNullLastValue(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "hi <name; separator=\", \">!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", null);
        const expected = "hi Ter, Tom!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSeparatorWithTwoNullValuesInRow(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "hi <name; separator=\", \">!");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", "Tom");
        st?.add("name", null);
        st?.add("name", null);
        st?.add("name", "Sri");
        const expected = "hi Ter, Tom, Sri!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testTwoNullValues(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "hi <name; null=\"x\">!");
        const st = group.getInstanceOf("test");
        st?.add("name", null);
        st?.add("name", null);
        const expected = "hi xx!";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testNullListItemNotCountedForIteratorIndex(): void {
        const group = new STGroup();
        group.defineTemplate("test", "name", "<name:{n | <i>:<n>}>");
        const st = group.getInstanceOf("test");
        st?.add("name", "Ter");
        st?.add("name", null);
        st?.add("name", null);
        st?.add("name", "Jesse");
        const expected = "1:Ter2:Jesse";
        const result = st?.render();
        assertEquals(expected, result);
    }

    @Test
    public testSizeZeroButNonNullListGetsNoOutput(): void {
        const group = new STGroup();
        group.defineTemplate("test", "users",
            "begin\n" +
            "<users>\n" +
            "end\n");
        const t = group.getInstanceOf("test");
        t?.add("users", null);
        const expecting = "begin" + Misc.newLine + "end";
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testNullListGetsNoOutput(): void {
        const group = new STGroup();
        group.defineTemplate("test", "users",
            "begin\n" +
            "<users:{u | name: <u>}; separator=\", \">\n" +
            "end\n");
        const t = group.getInstanceOf("test");
        const expecting = "begin" + Misc.newLine + "end";
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testEmptyListGetsNoOutput(): void {
        const group = new STGroup();
        group.defineTemplate("test", "users",
            "begin\n" +
            "<users:{u | name: <u>}; separator=\", \">\n" +
            "end\n");
        const t = group.getInstanceOf("test");
        t?.add("users", new Array<Object>());
        const expecting = "begin" + Misc.newLine + "end";
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testMissingDictionaryValue(): void {
        const group = new STGroup();
        group.defineTemplate("test", "m", "<m.foo>");
        const t = group.getInstanceOf("test");
        t?.add("m", new Map<Object, Object>());
        const expecting = "";
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testMissingDictionaryValue2(): void {
        const group = new STGroup();
        group.defineTemplate("test", "m", "<if(m.foo)>[<m.foo>]<endif>");
        const t = group.getInstanceOf("test");
        t?.add("m", new Map<Object, Object>());
        const expecting = "";
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testMissingDictionaryValue3(): void {
        const group = new STGroup();
        group.defineTemplate("test", "m", "<if(m.foo)>[<m.foo>]<endif>");
        const t = group.getInstanceOf("test");
        t?.add("m", new Map([["foo", null]]));
        const expecting = "";
        const result = t?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testSeparatorEmittedForEmptyIteratorValue(): void {
        const st = new ST(
            "<values:{v|<if(v)>x<endif>}; separator=\" \">",
        );
        st?.add("values", [true, false, true]);
        const sw = new StringWriter();
        st.write(new AutoIndentWriter(sw));
        const result = sw.toString();
        const expecting = "x  x";
        assertEquals(expecting, result);
    };

    @Test
    public testSeparatorEmittedForEmptyIteratorValu3333e(): void {
        ErrorManager.DEFAULT_ERROR_LISTENER.silent = true;

        const dir = this.getRandomDir();
        const groupFile =
            "filter ::= [\"b\":, default: key]\n" +
            "t() ::= <%<[\"a\", \"b\", \"c\", \"b\"]:{it | <filter.(it)>}; separator=\",\">%>\n";
        TestNullAndEmptyValues.writeFile(dir, "group.stg", groupFile);
        const group = new STGroupFile(dir + "/group.stg");

        const st = group.getInstanceOf("t");
        const sw = new StringWriter();
        st?.write(new AutoIndentWriter(sw));
        const result = sw.toString();
        const expecting = "a,,c,";
        assertEquals(expecting, result);

        ErrorManager.DEFAULT_ERROR_LISTENER.silent = false;
    };

    @Test
    public testSeparatorEmittedForEmptyIteratorValue2(): void {
        const st = new ST(
            "<values; separator=\" \">",
        );
        st?.add("values", ["x", "", "y"]);
        const sw = new StringWriter();
        st.write(new AutoIndentWriter(sw));
        const result = sw.toString();
        const expecting = "x  y";
        assertEquals(expecting, result);
    }
}

export namespace TestNullAndEmptyValues {
    export type T = InstanceType<typeof TestNullAndEmptyValues.T>;
}
