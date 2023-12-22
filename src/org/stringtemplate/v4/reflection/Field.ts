/* java2ts: keep */

import { Constructor, IMember } from "./IMember.js";

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/** Minimal java.lang.reflect.Field implementation. */
export class Field implements IMember {
    #c: Constructor;
    #field: string;

    public constructor(c: Constructor, field: string) {
        this.#c = c;
        this.#field = field;
    }

    public getName(): string {
        return this.#c.name;
    }

    public get<T>(target: T): unknown {
        return target[this.#field as keyof T];
    }
}
