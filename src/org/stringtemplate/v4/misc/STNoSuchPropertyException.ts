/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { STException } from "../compiler/STException.js";
import { Constructor } from "../reflection/IMember.js";

/** For {@code <a.b>}, object {@code a} does not have a property {@code b}. */
export class STNoSuchPropertyException<T> extends STException {
    public o?: Constructor<T>;
    public propertyName?: string;
    public constructor(e?: Error, o?: Constructor<T>, propertyName?: string) {
        super(undefined, e);
        this.o = o;
        this.propertyName = propertyName;
    }

    public getMessage(): string {
        if (this.o) {
            return "object " + this.o.name + " has no " + this.propertyName + " property";
        } else {
            return "no such property: " + this.propertyName;
        }

    }
}
