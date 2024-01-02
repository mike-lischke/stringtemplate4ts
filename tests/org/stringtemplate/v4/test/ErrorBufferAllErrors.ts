/*
  * Copyright(c) Terence Parr.All rights reserved.
  * Licensed under the BSD- 3 License.See License.txt in the project root for license information.
  */

// cspell: disable

import { ErrorBuffer, STMessage } from "../../../../../src/index.js";

import { Override } from "../../../../decorators.js";

export class ErrorBufferAllErrors extends ErrorBuffer {
    @Override
    public override runTimeError(msg: STMessage): void {
        this.errors.push(msg);
    }
}
