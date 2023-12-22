/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { ConstructionEvent } from "./ConstructionEvent.js";

export class AddAttributeEvent extends ConstructionEvent {
    protected name: string;

    /** Reserved for future use. */
    protected value: unknown;

    public constructor(name: string, value: unknown) {
        super();
        this.name = name;
        this.value = value;
    }

    public override  toString(): string {
        return "addEvent{" +
            ", name='" + this.name + "'" +
            ", value=" + String(this.value) +
            ", location=" + this.getFileName() + ":" + this.getLine() +
            "}";
    }
}
