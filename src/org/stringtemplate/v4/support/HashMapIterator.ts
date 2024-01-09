/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

export interface HashMapEntry<Key, Value> { key: Key, value: Value; }

export class HashMapIterator<Key, Value> implements IterableIterator<[Key, Value]> {
    #data: { [key: string]: Array<HashMapEntry<Key, Value>>; } = {};
    #entries: Array<HashMapEntry<Key, Value>> = [];
    #current = 0;

    public constructor(data: { [key: string]: Array<HashMapEntry<Key, Value>>; }) {
        this.#data = data;
        this.#entries = Object.keys(this.#data).flatMap((key) => {
            return this.#data[key];
        }, this);
    }

    public next(): IteratorResult<[Key, Value]> {
        if (this.#current < this.#entries.length) {
            const entry = this.#entries[this.#current++];

            return { done: false, value: [entry.key, entry.value] };
        }

        return { done: true, value: undefined };
    }

    public [Symbol.iterator](): IterableIterator<[Key, Value]> {
        return this;
    }
}
