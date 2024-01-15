import { Constructor, IMember } from "./IMember.js";

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/** Minimal java.lang.reflect.Method implementation. */
export class Method implements IMember {
    #c: Constructor;
    #function: Function;

    public constructor(c: Constructor, method: Function) {
        this.#c = c;
        this.#function = method;
    }

    public getName(): string {
        return this.#function.name;
    }

    public invoke<T extends Constructor>(target: InstanceType<T>, ...args: unknown[]): unknown {
        return this.#function.apply(target, args);
    }
}
