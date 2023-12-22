/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Constructor } from "../reflection/IMember.js";
import { isSuperclassOf } from "../support/helpers.js";
import { AmbiguousMatchException } from "./AmbiguousMatchException.js";

export class TypeRegistry<K extends Constructor, V> implements Map<K, V> {
    public [Symbol.toStringTag]: string;

    private readonly backingStore = new Map<K, V>();
    private readonly cache = new Map<K, K | undefined>();

    public forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?: unknown): void {
        this.backingStore.forEach(callbackfn, thisArg);
    }

    public entries(): IterableIterator<[K, V]> {
        return this.backingStore.entries();
    }

    public keys(): IterableIterator<K> {
        return this.backingStore.keys();
    }

    public values(): IterableIterator<V> {
        return this.backingStore.values();
    }

    public [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.backingStore[Symbol.iterator]();
    }

    public get size(): number {
        return this.backingStore.size;
    }

    public isEmpty(): boolean {
        return this.backingStore.size === 0;
    }

    public has(key: K): boolean {
        if (this.cache.has(key)) {
            return true;
        }

        return this.get(key) !== null;
    }

    public containsValue(value: V): boolean {
        for (const entry of this.backingStore.values()) {
            if (entry === value) {
                return true;
            }
        }

        return false;
    }

    public get(key: K): V | undefined {
        const value = this.backingStore.get(key);
        if (value) {
            return value;
        }

        const redirect = this.cache.get(key);
        if (redirect) {
            if (!redirect) {
                return undefined;
            } else {
                return this.backingStore.get(redirect);
            }
        }

        const candidates = new Array<K | null>();
        for (const clazz of this.backingStore.keys()) {
            if (isSuperclassOf(clazz, key)) { // XXX: Class.isAssignableFrom
                candidates.push(clazz);
            }
        }

        if (candidates.length === 0) {
            this.cache.set(key, undefined);

            return undefined;
        } else {
            if (candidates.length === 1) {
                this.cache.set(key, candidates[0]!);

                return this.backingStore.get(candidates[0]!);
            } else {
                for (let i = 0; i < candidates.length - 1; i++) {
                    if (!candidates[i]) {
                        continue;
                    }

                    for (let j = i + 1; j < candidates.length; j++) {
                        if (isSuperclassOf(candidates[i], candidates[j])) { // XXX: Class.isAssignableFrom
                            candidates[i] = null;
                            break;
                        } else {
                            // XXX: Class.isAssignableFrom
                            if (isSuperclassOf(candidates[j], candidates[i])) {
                                candidates[j] = null;
                            }
                        }

                    }
                }

                let j = 0;
                for (let i = 0; i < candidates.length; i++) {
                    const current = candidates[i];
                    if (!current) {
                        continue;
                    }

                    if (i !== j) {
                        candidates[j] = current;
                    }

                    j++;
                }

                /* assert j > 0; */
                if (j !== 1) {
                    let builder = "";
                    builder += `The class '${key.name}' does not match a single item in the registry. ` +
                        `The ${j} ambiguous matches are:"`;
                    for (let i = 0; i < j; i++) {
                        builder += "\n    " + candidates[j]?.name ?? "<null>";
                    }

                    throw new AmbiguousMatchException(builder);
                }

                this.cache.set(key, candidates[0]!);

                return this.backingStore.get(candidates[0]!);
            }
        }
    }

    public put(key: K, value: V): V | undefined {
        const result = this.get(key);
        this.backingStore.set(key, value);
        this.handleAlteration(key);

        return result;
    }

    public set(key: K, value: V): this {
        this.put(key, value);

        return this;
    }

    public remove(key: K): V | undefined {
        const previous = this.get(key);
        if (this.backingStore.delete(key)) {
            this.handleAlteration(key);
        }

        return previous;
    }

    public delete(key: K): boolean {
        return this.remove(key) !== undefined;
    }

    public clear(): void {
        this.backingStore.clear();
        this.cache.clear();
    }

    private handleAlteration(clazz: Constructor): void {
        for (const [key] of this.cache.entries()) {
            if (isSuperclassOf(clazz, key)) { // XXX: Class.isAssignableFrom
                this.cache.set(key, undefined);
            }
        }
    }
}
