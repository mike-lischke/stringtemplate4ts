/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { InstanceScope } from "../InstanceScope.js";
import { IInterpEvent } from "../compiler/common.js";

export class InterpEvent implements IInterpEvent {
    public scope: InstanceScope;
    /** Index of first char into output stream. */
    public readonly outputStartChar: number;
    /** Index of last char into output stream (inclusive). */
    public readonly outputStopChar: number;
    public constructor(scope: InstanceScope, outputStartChar: number, outputStopChar: number) {
        this.scope = scope;
        this.outputStartChar = outputStartChar;
        this.outputStopChar = outputStopChar;
    }

    public toString(): string {
        return this.constructor.name + "{" +
            "self=" + this.scope.st +
            ", start=" + this.outputStartChar +
            ", stop=" + this.outputStopChar +
            "}";
    }
}
