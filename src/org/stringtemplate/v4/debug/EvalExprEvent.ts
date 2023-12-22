/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { InterpEvent } from "./InterpEvent.js";
import { InstanceScope } from "../InstanceScope.js";

export class EvalExprEvent extends InterpEvent {
    /** Index of first char in template. */
    public readonly exprStartChar: number;

    /** Index of last char in template (inclusive). */
    public readonly exprStopChar: number;
    public readonly expr: string;

    public constructor(scope: InstanceScope, start: number, stop: number,
        exprStartChar: number, exprStopChar: number) {
        super(scope, start, stop);
        this.exprStartChar = exprStartChar;
        this.exprStopChar = exprStopChar;
        if (exprStartChar >= 0 && exprStopChar >= 0) {
            this.expr = scope.st?.impl?.template.substring(exprStartChar, exprStopChar + 1) ?? "";
        } else {
            this.expr = "";
        }
    }

    public override toString(): string {
        return this.constructor.name + "{" +
            "self=" + this.scope.st +
            ", expr='" + this.expr + "'" +
            ", exprStartChar=" + this.exprStartChar +
            ", exprStopChar=" + this.exprStopChar +
            ", start=" + this.outputStartChar +
            ", stop=" + this.outputStopChar +
            "}";
    }

}
