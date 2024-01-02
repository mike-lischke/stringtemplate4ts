/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { STMessage } from "./STMessage.js";
import { Misc } from "./Misc.js";
import { ErrorType } from "./ErrorType.js";
import { STErrorListener } from "../STErrorListener.js";

/** Used during tests to track all errors. */
export class ErrorBuffer implements STErrorListener {
    public errors = new Array<STMessage>();

    public compileTimeError(msg: STMessage): void {
        this.errors.push(msg);
    }

    public runTimeError(msg: STMessage): void {
        if (msg.error !== ErrorType.NO_SUCH_PROPERTY) { // ignore these
            this.errors.push(msg);
        }
    }

    public iOError(msg: STMessage): void {
        this.errors.push(msg);
    }

    public internalError(msg: STMessage): void {
        this.errors.push(msg);
    }

    public toString(): string {
        let buf = "";
        for (const m of this.errors) {
            buf += m.toString() + Misc.newLine;
        }

        return buf;
    }
}
