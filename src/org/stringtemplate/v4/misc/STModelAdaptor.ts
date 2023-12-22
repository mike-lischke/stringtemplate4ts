/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Interpreter } from "../Interpreter.js";
import { ModelAdaptor } from "../ModelAdaptor.js";
import { ST } from "../ST.js";

export class STModelAdaptor implements ModelAdaptor<ST> {
    public getProperty(interp: Interpreter, self: ST, model: ST, property: Object,
        propertyName: string): unknown {
        return model.getAttribute(propertyName);
    }
}
