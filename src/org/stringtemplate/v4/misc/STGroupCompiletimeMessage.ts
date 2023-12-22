/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { STMessage } from "./STMessage.js";
import { ErrorType } from "./ErrorType.js";
import { RecognitionException, Token } from "antlr4ng";
import { printf } from "fast-printf";

export class STGroupCompiletimeMessage extends STMessage {
    /** token inside group file */
    public token?: Token;
    public srcName: string;

    public constructor(error: ErrorType, srcName: string, t?: Token, cause?: Error, arg?: unknown, arg2?: unknown) {
        super(error, undefined, cause, arg, arg2);
        this.token = t;
        this.srcName = srcName;
    }

    public override  toString(): string {
        const re = this.cause as RecognitionException;
        let line = 0;
        let charPos = -1;
        if (this.token) {
            line = this.token.line;
            charPos = this.token.column;
        } else {
            if (re) {
                line = re.offendingToken?.line ?? 0;
                charPos = re.offendingToken?.column ?? 0;
            }
        }

        const position = line + ":" + charPos;
        if (this.srcName) {
            return this.srcName + " " + position + ": " + printf(this.error.message, this.arg, this.arg2);
        }

        return position + ": " + printf(this.error.message, this.arg, this.arg2);
    }
}
