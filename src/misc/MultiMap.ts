/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/** A hash table that maps a key to a list of elements not just a single. */
export class MultiMap<K, V> extends Map<K, V[]> {
    public map(key: K, value: V): void {
        let elementsForKey = this.get(key);
        if (elementsForKey === null) {
            elementsForKey = new Array<V>();
            super.set(key, elementsForKey);
        }

        elementsForKey?.push(value);
    }
}
