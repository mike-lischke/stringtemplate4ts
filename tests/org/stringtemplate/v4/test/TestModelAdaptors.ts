/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { ErrorBufferAllErrors } from "./ErrorBufferAllErrors.js";
import { BaseTest } from "./BaseTest.js";
import {
    ModelAdaptor, Interpreter, ST, STNoSuchPropertyException, STGroupFile, STRuntimeMessage, HashMap,
} from "../../../../../src/index.js";
import { assertEquals } from "../../../../junit.js";

import { Test, Override } from "../../../../decorators.js";

export class TestModelAdaptors extends BaseTest {
    private static UserAdaptor = class UserAdaptor implements ModelAdaptor<BaseTest.User> {
        public getProperty(interp: Interpreter, self: ST, model: BaseTest.User, property: Object,
            propertyName: string): Object {
            if (propertyName === "id") {
                return model.id;
            }

            if (propertyName === "name") {
                return model.getName();
            }

            throw new STNoSuchPropertyException(undefined, BaseTest.User, "User." + propertyName);
        }
    };

    private static UserAdaptorConst = class UserAdaptorConst implements ModelAdaptor<BaseTest.User> {
        public getProperty(interp: Interpreter, self: ST, model: BaseTest.User, property: Object,
            propertyName: string): Object {
            if (propertyName === "id") {
                return "const id value";
            }

            if (propertyName === "name") {
                return "const name value";
            }

            throw new STNoSuchPropertyException(undefined, BaseTest.User, "User." + propertyName);
        }
    };

    private static SuperUser = class SuperUser extends BaseTest.User {
        protected bitmask: number;
        public constructor(id: number, name: string) {
            super(id, name);
            this.bitmask = 0x8080;
        }

        @Override
        public override  getName(): string {
            return "super " + super.getName();
        }
    };

    @Test
    public testSimpleAdaptor(): void {
        const templates = "foo(x) ::= \"<x.id>: <x.name>\"\n";
        TestModelAdaptors.writeFile(this.tmpdir, "foo.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/foo.stg");
        group.registerModelAdaptor(BaseTest.User, new TestModelAdaptors.UserAdaptor());
        const st = group.getInstanceOf("foo");
        st?.add("x", new BaseTest.User(100, "parrt"));
        const expecting = "100: parrt";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testAdaptorAndBadProp(): void {
        const errors = new ErrorBufferAllErrors();
        const templates = "foo(x) ::= \"<x.qqq>\"\n";
        TestModelAdaptors.writeFile(this.tmpdir, "foo.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/foo.stg");
        group.setListener(errors);
        group.registerModelAdaptor(BaseTest.User, new TestModelAdaptors.UserAdaptor());
        const st = group.getInstanceOf("foo");
        st?.add("x", new BaseTest.User(100, "parrt"));
        const expecting = "";
        const result = st?.render();
        assertEquals(expecting, result);

        const msg = errors.get(0) as STRuntimeMessage;
        const e = msg.cause as STNoSuchPropertyException<BaseTest.User>;
        assertEquals("User.qqq", e.propertyName);
    }

    @Test
    public testAdaptorCoversSubclass(): void {
        const templates = "foo(x) ::= \"<x.id>: <x.name>\"\n";
        TestModelAdaptors.writeFile(this.tmpdir, "foo.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/foo.stg");
        group.registerModelAdaptor(BaseTest.User, new TestModelAdaptors.UserAdaptor());
        const st = group.getInstanceOf("foo");
        st?.add("x", new TestModelAdaptors.SuperUser(100, "parrt")); // create subclass of User
        const expecting = "100: super parrt";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testWeCanResetAdaptorCacheInvalidatedUponAdaptorReset(): void {
        const templates = "foo(x) ::= \"<x.id>: <x.name>\"\n";
        TestModelAdaptors.writeFile(this.tmpdir, "foo.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/foo.stg");
        group.registerModelAdaptor(BaseTest.User, new TestModelAdaptors.UserAdaptor());
        group.getModelAdaptor(BaseTest.User); // get User, SuperUser into cache
        group.getModelAdaptor(TestModelAdaptors.SuperUser);

        group.registerModelAdaptor(BaseTest.User, new TestModelAdaptors.UserAdaptorConst());
        // cache should be reset so we see new adaptor
        const st = group.getInstanceOf("foo");
        st?.add("x", new BaseTest.User(100, "parrt"));
        const expecting = "const id value: const name value"; // sees UserAdaptorConst
        const result = st?.render();
        assertEquals(expecting, result);
    }

    @Test
    public testSeesMostSpecificAdaptor(): void {
        const templates =
            "foo(x) ::= \"<x.id>: <x.name>\"\n";
        TestModelAdaptors.writeFile(this.tmpdir, "foo.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/foo.stg");
        group.registerModelAdaptor(BaseTest.User, new TestModelAdaptors.UserAdaptor());
        group.registerModelAdaptor(TestModelAdaptors.SuperUser, new TestModelAdaptors.UserAdaptorConst());
        const st = group.getInstanceOf("foo");
        st?.add("x", new BaseTest.User(100, "parrt"));
        let expecting = "100: parrt";
        let result = st?.render();
        assertEquals(expecting, result);

        st?.remove("x");
        st?.add("x", new TestModelAdaptors.SuperUser(100, "parrt"));
        expecting = "const id value: const name value"; // sees UserAdaptorConst
        result = st?.render();
        assertEquals(expecting, result);
    }

    // https://github.com/antlr/stringtemplate4/issues/214
    @Test
    public testHandlesNullKeys(): void {
        const templates = "foo(x, y) ::= \"<x.(y); null={NULL}>\"";
        TestModelAdaptors.writeFile(this.tmpdir, "foo.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/foo.stg");
        const st = group.getInstanceOf("foo");
        st?.add("x", new HashMap<string, string>());
        st?.add("y", null);
        const expecting = "NULL";
        const result = st?.render();
        assertEquals(expecting, result);
    }

    // https://github.com/antlr/stringtemplate4/issues/214
    @Test
    public testHandlesKeysNotComparableToString(): void {
        const templates =
            "foo(x) ::= \"<x.keys>\"";
        TestModelAdaptors.writeFile(this.tmpdir, "foo.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/foo.stg");
        const st = group.getInstanceOf("foo");

        const x = new HashMap<number, string>();
        x.set(1, "value");
        st?.add("x", x);
        const expecting = "1";
        const result = st?.render();
        assertEquals(expecting, result);
    }
}
