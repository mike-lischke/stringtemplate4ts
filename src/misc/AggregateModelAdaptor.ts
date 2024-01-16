/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { MapModelAdaptor } from "./MapModelAdaptor.js";
import { Aggregate } from "./Aggregate.js";
import { Interpreter } from "../Interpreter.js";
import { ModelAdaptor } from "../ModelAdaptor.js";
import { ST } from "../ST.js";

/** Deal with structs created via {@link ST#addAggr}{@code ("structname.{prop1, prop2}", ...);}. */
export class AggregateModelAdaptor implements ModelAdaptor<Aggregate> {
    private readonly mapAdaptor = new MapModelAdaptor<unknown, unknown>();

    public getProperty(interp: Interpreter, self: ST, model: Aggregate, property: unknown,
        propertyName: string): unknown {
        return this.mapAdaptor.getProperty(interp, self, model.properties, property, propertyName);
    }
}
