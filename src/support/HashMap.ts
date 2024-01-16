/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { HashMapEntry, HashMapIterator } from "./HashMapIterator.js";
import { MurmurHash } from "./MurmurHash.js";
import { isEquatable } from "./helpers.js";

/**
 * A map modelled after the Java HashMap, but with TypeScript semantics. There are no views for keys, values, or
 * entries that can be altered and affect the map.
 * What's different is that keys can be any type, including objects. If an object is used as a key and implements the
 * IEquatable interface, then the equals() method is used to compare keys. Otherwise the === operator is used.
 */
export class HashMap<Key, Value> implements Map<Key, Value> {
    public [Symbol.toStringTag]: string = "HashMap";

    // Our buckets indexed by a hash code.
    #data: { [key: string]: Array<HashMapEntry<Key, Value>>; } = {};

    #count = 0;

    public clear(): void {
        this.#data = {};
    }

    public delete(key: Key): boolean {
        const hashCode = MurmurHash.hashCode(key);
        const bucket = this.#data[hashCode];
        if (bucket) {
            if (bucket.length === 1) {
                delete this.#data[hashCode];
                --this.#count;

                return true;
            }

            for (let i = 0; i < bucket.length; ++i) {
                const entry = bucket[i];
                if ((isEquatable(key) && key.equals(entry.key)) || (entry.key === key)) {
                    bucket.splice(i, 1);
                    --this.#count;

                    return true;
                }
            }
        }

        return false;
    }

    public forEach(callbackfn: (value: Value, key: Key, map: Map<Key, Value>) => void, thisArg?: unknown): void {
        for (const hashCode in this.#data) {
            const bucket = this.#data[hashCode];
            for (const entry of bucket) {
                callbackfn.call(thisArg, entry.value, entry.key, this);
            }
        }
    }

    public get(key: Key): Value | undefined {
        const hashCode = MurmurHash.hashCode(key);
        const bucket = this.#data[hashCode];
        if (bucket) {
            if (bucket.length === 1) {
                return bucket[0].value;
            }

            for (const entry of bucket) {
                if ((isEquatable(key) && key.equals(entry.key)) || (entry.key === key)) {
                    return entry.value;
                }
            }
        }

        return undefined;
    }

    public has(key: Key): boolean {
        return this.get(key) !== undefined;
    }

    public set(key: Key, value: Value): this {
        const hashCode = MurmurHash.hashCode(key);
        let bucket = this.#data[hashCode];
        if (!bucket) {
            bucket = [];
            this.#data[hashCode] = bucket;
        }

        if (bucket.length === 1) {
            bucket[0].value = value;
        } else {
            for (const entry of bucket) {
                if ((isEquatable(key) && key.equals(entry.key)) || (entry.key === key)) {
                    entry.value = value;

                    return this;
                }
            }

            ++this.#count;
            bucket.push({ key, value });
        }

        return this;
    }

    public get size(): number {
        return this.#count;
    }

    public entries(): IterableIterator<[Key, Value]> {
        return new HashMapIterator(this.#data);
    }

    public keys(): IterableIterator<Key> {
        const entries = new HashMapIterator<Key, Value>(this.#data);

        return {
            [Symbol.iterator](): IterableIterator<Key> {
                return this;
            },
            next: () => {
                const entry = entries.next();
                const value = entry.value as [Key, Value];

                return { done: entry.done, value: value?.[0] };
            },

        };
    }

    public values(): IterableIterator<Value> {
        const entries = new HashMapIterator<Key, Value>(this.#data);

        return {
            [Symbol.iterator](): IterableIterator<Value> {
                return this;
            },
            next: () => {
                const entry = entries.next();
                const value = entry.value as [Key, Value];

                return { done: entry.done, value: value?.[1] };
            },

        };
    };

    public [Symbol.iterator](): IterableIterator<[Key, Value]> {
        return this.entries();
    }

}
