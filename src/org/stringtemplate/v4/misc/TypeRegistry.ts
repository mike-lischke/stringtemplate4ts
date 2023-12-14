/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



import { java, JavaObject, type int } from "jree";
import { AmbiguousMatchException } from "./AmbiguousMatchException.js";



/**
 *
 * @author Sam Harwell
 */
export class TypeRegistry<V> implements Map<java.lang.Class<unknown>, V> {

    private readonly backingStore = new Map<java.lang.Class<unknown>, V>();
    private readonly cache = new Map<java.lang.Class<unknown>, java.lang.Class<unknown>>();

    public size(): int {
        return this.backingStore.size();
    }

    public isEmpty(): boolean {
        return this.backingStore.isEmpty();
    }

    public containsKey(key: Object): boolean {
        if (this.cache.containsKey(key)) {
            return true;
        }

        if (!(key instanceof java.lang.Class)) {
            return false;
        }

        return this.get(key) !== null;
    }

    public containsValue(value: Object): boolean {
        return this.values().contains(value);
    }

    /**
     * {@inheritDoc}
     *
     * @throws AmbiguousMatchException if the registry contains more than value
     * mapped to a maximally-specific type from which {@code key} is derived.
     */
    public get(key: Object): V {
        let value = this.backingStore.get(key);
        if (value !== null) {
            return value;
        }

        let redirect = this.cache.get(key);
        if (redirect !== null) {
            if (redirect === java.lang.Void.TYPE) {
                return null;
            }
            else {
                return this.backingStore.get(redirect);
            }
        }

        if (!(key instanceof java.lang.Class)) {
            return null;
        }

        let keyClass = key as java.lang.Class<unknown>;
        let candidates = new Array<java.lang.Class<unknown>>();
        for (let clazz of this.backingStore.keySet()) {
            if (clazz.isAssignableFrom(keyClass)) {
                candidates.add(clazz);
            }
        }

        if (candidates.isEmpty()) {
            this.cache.put(keyClass, java.lang.Void.TYPE);
            return null;
        }
        else {
            if (candidates.size() === 1) {
                this.cache.put(keyClass, candidates.get(0));
                return this.backingStore.get(candidates.get(0));
            }
            else {
                for (let i = 0; i < candidates.size() - 1; i++) {
                    if (candidates.get(i) === null) {
                        continue;
                    }

                    for (let j = i + 1; j < candidates.size(); j++) {
                        if (candidates.get(i).isAssignableFrom(candidates.get(j))) {
                            candidates.set(i, null);
                            break;
                        }
                        else {
                            if (candidates.get(j).isAssignableFrom(candidates.get(i))) {
                                candidates.set(j, null);
                            }
                        }

                    }
                }

                let j = 0;
                for (let i = 0; i < candidates.size(); i++) {
                    let current = candidates.get(i);
                    if (current === null) {
                        continue;
                    }

                    if (i !== j) {
                        candidates.set(j, current);
                    }

                    j++;
                }

                /* assert j > 0; */
                if (j !== 1) {
                    let builder = new java.lang.StringBuilder();
                    builder.append(string.format("The class '%s' does not match a single item in the registry. The %d ambiguous matches are:", keyClass.getName(), j));
                    for (let i = 0; i < j; i++) {
                        builder.append(string.format("%n    %s", candidates.get(j).getName()));
                    }

                    throw new AmbiguousMatchException(builder.toString());
                }

                this.cache.put(keyClass, candidates.get(0));
                return this.backingStore.get(candidates.get(0));
            }
        }

    }

    public put(key: java.lang.Class<unknown>, value: V): V {
        let result = this.get(key);
        this.backingStore.put(key, value);
        this.handleAlteration(key);
        return result;
    }

    public remove(key: Object): V {
        if (!(key instanceof java.lang.Class)) {
            return null;
        }

        let clazz = key as java.lang.Class<unknown>;
        let previous = this.get(clazz);
        if (this.backingStore.remove(clazz) !== null) {
            this.handleAlteration(clazz);
        }

        return previous;
    }

    public putAll(m: Map<java.lang.Class<unknown>, V>): void {
        for (let entry of m.entrySet()) {
            this.put(entry.getKey(), entry.getValue());
        }
    }

    public clear(): void {
        this.backingStore.clear();
        this.cache.clear();
    }

    public keySet(): java.util.Set<java.lang.Class<unknown>> {
        return java.util.Collections.unmodifiableSet(this.backingStore.keySet());
    }

    public values(): java.util.Collection<V> {
        return java.util.Collections.unmodifiableCollection(this.backingStore.values());
    }

    public entrySet(): java.util.Set<java.security.KeyStore.Entry<java.lang.Class<unknown>, V>> {
        return java.util.Collections.unmodifiableSet(this.backingStore.entrySet());
    }

    protected handleAlteration(clazz: java.lang.Class<unknown>): void {
        for (let entry of this.cache.entrySet()) {
            if (clazz.isAssignableFrom(entry.getKey())) {
                entry.setValue(null);
            }
        }
    }
}
