/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-param */

/**
 * A unique set of strings where we can get a string's index.
 *  We can also get them back out in original order.
 */
export class StringTable {
    protected table = new Map<string, number>();
    protected i = -1;

    public add(s: string): number {
        const index = this.table.get(s);
        if (index !== undefined) {
            return index;
        }

        this.table.set(s, ++this.i);

        return this.i;
    }

    public toArray(): string[] {
        return [...this.table.keys()];
    }
}
