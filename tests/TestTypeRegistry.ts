/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { assertEquals, assertNull } from "./junit.js";
import { TypeRegistry } from "../src/index.js";

import { Test } from "./decorators.js";

export class TestTypeRegistry {
    // https://github.com/antlr/stringtemplate4/issues/122

    public static A = class A { };

    public static B = class B extends TestTypeRegistry.A { };

    @Test
    public registryWithObject(): void {
        const registry = new TypeRegistry<string>();
        registry.put(Object, "Object");
        assertEquals("Object", registry.get(Object));
        assertEquals("Object", registry.get(TestTypeRegistry.A));
        assertEquals("Object", registry.get(TestTypeRegistry.B));
    }

    @Test
    public registryWithA(): void {
        const registry = new TypeRegistry<string>();
        registry.put(TestTypeRegistry.A, "A");
        assertNull(registry.get(Object));
        assertEquals("A", registry.get(TestTypeRegistry.A));
        assertEquals("A", registry.get(TestTypeRegistry.B));
    }

    @Test
    public registryWithB(): void {
        const registry = new TypeRegistry<string>();
        registry.put(TestTypeRegistry.B, "B");
        assertNull(registry.get(Object));
        assertNull(registry.get(TestTypeRegistry.A));
        assertEquals("B", registry.get(TestTypeRegistry.B));
    }

    @Test
    public registryWithObjectAndA(): void {
        const registry = new TypeRegistry<string>();
        registry.put(Object, "Object");
        registry.put(TestTypeRegistry.A, "A");
        assertEquals("Object", registry.get(Object));
        assertEquals("A", registry.get(TestTypeRegistry.A));
        assertEquals("A", registry.get(TestTypeRegistry.B));
    }

    @Test
    public registryWithObjectAndB(): void {
        const registry = new TypeRegistry<string>();
        registry.put(Object, "Object");
        registry.put(TestTypeRegistry.B, "B");
        assertEquals("Object", registry.get(Object));
        assertEquals("Object", registry.get(TestTypeRegistry.A));
        assertEquals("B", registry.get(TestTypeRegistry.B));
    }

    @Test
    public registryWithAAndB(): void {
        const registry = new TypeRegistry<string>();
        registry.put(TestTypeRegistry.A, "A");
        registry.put(TestTypeRegistry.B, "B");
        assertNull(registry.get(Object));
        assertEquals("A", registry.get(TestTypeRegistry.A));
        assertEquals("B", registry.get(TestTypeRegistry.B));
    }

    @Test
    public registryWithObjectAndAAndB(): void {
        const registry = new TypeRegistry<string>();
        registry.put(Object, "Object");
        registry.put(TestTypeRegistry.A, "A");
        registry.put(TestTypeRegistry.B, "B");
        assertEquals("Object", registry.get(Object));
        assertEquals("A", registry.get(TestTypeRegistry.A));
        assertEquals("B", registry.get(TestTypeRegistry.B));
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace TestTypeRegistry {
    export type A = InstanceType<typeof TestTypeRegistry.A>;
    export type B = InstanceType<typeof TestTypeRegistry.B>;
}
