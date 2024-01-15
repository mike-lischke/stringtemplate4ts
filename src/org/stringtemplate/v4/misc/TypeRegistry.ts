/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Constructor } from "../reflection/IMember.js";
import { isSuperclassOf } from "../support/helpers.js";
import { AmbiguousMatchException } from "./AmbiguousMatchException.js";

export class TypeRegistry<V> {
    public [Symbol.toStringTag]: string = "TypeRegistry";

    private readonly backingStore = new Map<Constructor, V>();
    private readonly cache = new Map<Constructor, Constructor | null>();

    public forEach(callbackfn: (value: V, key: Constructor, map: Map<Constructor, V>) => void,
        thisArg?: unknown): void {
        this.backingStore.forEach(callbackfn, thisArg);
    }

    public entries(): IterableIterator<[Constructor, V]> {
        return this.backingStore.entries();
    }

    public keys(): IterableIterator<Constructor> {
        return this.backingStore.keys();
    }

    public values(): IterableIterator<V> {
        return this.backingStore.values();
    }

    public [Symbol.iterator](): IterableIterator<[Constructor, V]> {
        return this.backingStore[Symbol.iterator]();
    }

    public get size(): number {
        return this.backingStore.size;
    }

    public isEmpty(): boolean {
        return this.backingStore.size === 0;
    }

    public has(key: Constructor): boolean {
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

    public get(key: Constructor): V | null {
        const value = this.backingStore.get(key);
        if (value) {
            return value;
        }

        const redirect = this.cache.get(key);
        if (redirect) {
            if (!redirect) {
                return null;
            } else {
                return this.backingStore.get(redirect) ?? null;
            }
        }

        const candidates = new Array<Constructor | null>();
        for (const clazz of this.backingStore.keys()) {
            if (isSuperclassOf(clazz, key)) {
                candidates.push(clazz);
            }
        }

        if (candidates.length === 0) {
            this.cache.set(key, null);

            return null;
        } else {
            if (candidates.length === 1) {
                this.cache.set(key, candidates[0]);

                return this.backingStore.get(candidates[0]!) ?? null;
            } else {
                for (let i = 0; i < candidates.length - 1; i++) {
                    if (!candidates[i]) {
                        continue;
                    }

                    for (let j = i + 1; j < candidates.length; j++) {
                        if (isSuperclassOf(candidates[i], candidates[j])) {
                            candidates[i] = null;
                            break;
                        } else {
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
                        builder += "\n    " + (candidates[j]?.name ?? "<null>");
                    }

                    throw new AmbiguousMatchException(builder);
                }

                this.cache.set(key, candidates[0]);

                return this.backingStore.get(candidates[0]!) ?? null;
            }
        }
    }

    public put(key: Constructor, value: V): V | null {
        const result = this.get(key);
        this.backingStore.set(key, value);
        this.handleAlteration(key);

        return result;
    }

    public set(key: Constructor, value: V): this {
        this.put(key, value);

        return this;
    }

    public remove(key: Constructor): V | null {
        const previous = this.get(key);
        if (this.backingStore.delete(key)) {
            this.handleAlteration(key);
        }

        return previous;
    }

    public delete(key: Constructor): boolean {
        return this.remove(key) !== undefined;
    }

    public clear(): void {
        this.backingStore.clear();
        this.cache.clear();
    }

    private handleAlteration(clazz: Constructor): void {
        for (const [key] of this.cache.entries()) {
            if (isSuperclassOf(clazz, key)) {
                this.cache.set(key, null);
            }
        }
    }
}
