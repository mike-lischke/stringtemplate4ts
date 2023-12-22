/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { EvalExprEvent } from "./EvalExprEvent.js";
import { InstanceScope } from "../InstanceScope.js";

export class IndentEvent extends EvalExprEvent {
    public constructor(scope: InstanceScope, start: number, stop: number, exprStartChar: number, exprStopChar: number) {
        super(scope, start, stop, exprStartChar, exprStopChar);
    }
}
