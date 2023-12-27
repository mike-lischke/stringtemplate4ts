/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { InterpEvent } from "./InterpEvent.js";
import { InstanceScope } from "../InstanceScope.js";
import { IEvalTemplateEvent } from "../compiler/common.js";

export class EvalTemplateEvent extends InterpEvent implements IEvalTemplateEvent {
    public constructor(scope: InstanceScope, exprStartChar: number, exprStopChar: number) {
        super(scope, exprStartChar, exprStopChar);
    }
}
