/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Interpreter } from "../Interpreter.js";
import { ModelAdaptor } from "../ModelAdaptor.js";
import { ST } from "../ST.js";
import { STGroup } from "../STGroup.js";

// TODO: get rid of `unknown` as allowed type.
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type AllowedMapKey = string | number | boolean | unknown;
export type ValueOrIterable<Key extends AllowedMapKey, Value> = Key | Value | Iterable<Value> | IterableIterator<Key>;

export class MapModelAdaptor<Key extends AllowedMapKey, Value> implements ModelAdaptor<Map<Key, Value>> {

    private static getDefaultValue<Value>(map: Map<unknown, Value>): Value | undefined {
        return map.get(STGroup.DEFAULT_KEY);
    }

    public getProperty(_interp: Interpreter, _self: ST, model: Map<Key, Value>, property: Key,
        propertyName: string): ValueOrIterable<Key, Value> | undefined {
        let value: ValueOrIterable<Key, Value> | undefined;
        if (!property) {
            value = MapModelAdaptor.getDefaultValue(model);
        } else {
            if (model.has(property)) {
                value = model.get(property);
            } else {
                if (model.has(propertyName as Key)) { // if can't find the key, try toString version
                    value = model.get(propertyName as Key);
                } else {
                    if (property === "keys") {
                        value = model.keys();
                    } else {
                        if (property === "values") {
                            value = model.values();
                        } else {
                            value = MapModelAdaptor.getDefaultValue(model);
                        }
                    }
                }
            }
        }

        // not found, use default
        if (value === STGroup.DICT_KEY) {
            value = property;
        }

        return value;
    }
}
