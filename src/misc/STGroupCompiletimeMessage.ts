/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { printf } from "fast-printf";

import { STMessage } from "./STMessage.js";
import { ErrorType } from "./ErrorType.js";

export class STGroupCompiletimeMessage extends STMessage {
    private srcName: string;
    private line: number;
    private column: number;

    public constructor(error: ErrorType, srcName: string, line: number, column: number, cause?: Error, arg?: unknown,
        arg2?: unknown) {
        super(error, undefined, cause, arg, arg2);
        this.srcName = srcName;
        this.line = line;
        this.column = column;
    }

    public override  toString(): string {
        const position = this.line + ":" + this.column;
        if (this.srcName) {
            return this.srcName + " " + position + ": " + printf(this.error.message, this.arg, this.arg2);
        }

        return position + ": " + printf(this.error.message, this.arg, this.arg2);
    }
}
