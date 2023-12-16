/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/**
 * An inclusive interval {@code a..b}.  Used to track ranges in output and
 * template patterns (for debugging).
 */
export class Interval {
    public a: number;
    public b: number;
    public constructor(a: number, b: number) {
        this.a = a; this.b = b;
    }

    public toString(): string {
        return this.a + ".." + this.b;
    }
}
