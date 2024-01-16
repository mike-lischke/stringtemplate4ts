/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/**
 * A line number and char position within a line.  Used by the source
 *  mapping stuff to map address to range within a template.
 */
export class Coordinate {
    public line: number;
    public charPosition: number;
    public constructor(a: number, b: number) {
        this.line = a;
        this.charPosition = b;
    }

    public toString(): string {
        return this.line + ":" + this.charPosition;
    }
}
