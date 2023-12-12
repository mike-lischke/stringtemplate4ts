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

type Map<K,​V> = java.util.Map<K,​V>;
type Class<T> = java.lang.Class<T>;
const Class = java.lang.Class;
type HashMap<K,​V> = java.util.HashMap<K,​V>;
const HashMap = java.util.HashMap;
type Void = java.lang.Void;
const Void = java.lang.Void;
type List<E> = java.util.List<E>;
type ArrayList<E> = java.util.ArrayList<E>;
const ArrayList = java.util.ArrayList;
type StringBuilder = java.lang.StringBuilder;
const StringBuilder = java.lang.StringBuilder;
type String = java.lang.String;
const String = java.lang.String;
type Set<E> = java.util.Set<E>;
type Collections = java.util.Collections;
const Collections = java.util.Collections;
type Collection<E> = java.util.Collection<E>;



/**
 *
 * @author Sam Harwell
 */
export  class TypeRegistry<V> extends JavaObject implements Map<Class<unknown>, V> {

    private readonly  backingStore = new  HashMap<Class<unknown>, V>();
    private readonly  cache = new  HashMap<Class<unknown>, Class<unknown>>();

    public  size():  int {
        return this.backingStore.size();
    }

    public  isEmpty():  boolean {
        return this.backingStore.isEmpty();
    }

    public  containsKey(key: java.lang.Object):  boolean {
        if (this.cache.containsKey(key)) {
            return true;
        }

        if (!(key instanceof Class)) {
            return false;
        }

        return this.get(key) !== null;
    }

    @SuppressWarnings("unchecked")
public  containsValue(value: java.lang.Object):  boolean {
        return this.values().contains(value);
    }

    /**
     * {@inheritDoc}
     *
     * @throws AmbiguousMatchException if the registry contains more than value
     * mapped to a maximally-specific type from which {@code key} is derived.
     */
    public  get(key: java.lang.Object):  V {
        let  value = this.backingStore.get(key);
        if (value !== null) {
            return value;
        }

        let  redirect = this.cache.get(key);
        if (redirect !== null) {
            if (redirect === Void.TYPE) {
                return null;
            }
            else {
                return this.backingStore.get(redirect);
            }
        }

        if (!(key instanceof Class)) {
            return null;
        }

        let  keyClass = key as Class<unknown>;
        let  candidates = new  ArrayList<Class<unknown>>();
        for (let clazz of this.backingStore.keySet()) {
            if (clazz.isAssignableFrom(keyClass)) {
                candidates.add(clazz);
            }
        }

        if (candidates.isEmpty()) {
            this.cache.put(keyClass, Void.TYPE);
            return null;
        }
        else {
 if (candidates.size() === 1) {
            this.cache.put(keyClass, candidates.get(0));
            return this.backingStore.get(candidates.get(0));
        }
        else {
            for (let  i = 0; i < candidates.size() - 1; i++) {
                if (candidates.get(i) === null) {
                    continue;
                }

                for (let  j = i + 1; j < candidates.size(); j++) {
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

            let  j = 0;
            for (let  i = 0; i < candidates.size(); i++) {
                let  current = candidates.get(i);
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
                let  builder = new  StringBuilder();
                builder.append(String.format("The class '%s' does not match a single item in the registry. The %d ambiguous matches are:", keyClass.getName(), j));
                for (let  i = 0; i < j; i++) {
                    builder.append(String.format("%n    %s", candidates.get(j).getName()));
                }

                throw new  AmbiguousMatchException(builder.toString());
            }

            this.cache.put(keyClass, candidates.get(0));
            return this.backingStore.get(candidates.get(0));
        }
}

    }

    public  put(key: Class<unknown>, value: V):  V {
        let  result = this.get(key);
        this.backingStore.put(key, value);
        this.handleAlteration(key);
        return result;
    }

    public  remove(key: java.lang.Object):  V {
        if (!(key instanceof Class)) {
            return null;
        }

        let  clazz = key as Class<unknown>;
        let  previous = this.get(clazz);
        if (this.backingStore.remove(clazz) !== null) {
            this.handleAlteration(clazz);
        }

        return previous;
    }

    public  putAll(m: Map< Class<unknown>,  V>):  void {
        for (let entry of m.entrySet()) {
            this.put(entry.getKey(), entry.getValue());
        }
    }

    public  clear():  void {
        this.backingStore.clear();
        this.cache.clear();
    }

    public  keySet():  Set<Class<unknown>> {
        return Collections.unmodifiableSet(this.backingStore.keySet());
    }

    public  values():  Collection<V> {
        return Collections.unmodifiableCollection(this.backingStore.values());
    }

    public  entrySet():  Set<java.security.KeyStore.Entry<Class<unknown>, V>> {
        return Collections.unmodifiableSet(this.backingStore.entrySet());
    }

    protected  handleAlteration(clazz: Class<unknown>):  void {
        for (let entry of this.cache.entrySet()) {
            if (clazz.isAssignableFrom(entry.getKey())) {
                entry.setValue(null);
            }
        }
    }
}
