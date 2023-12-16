/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Token } from "antlr4ng";

import { STMessage } from "./STMessage.js";
import { ErrorType } from "./ErrorType.js";
import { GroupParser } from "../compiler/generated/GroupParser.js";
import { printf } from "fast-printf";

/**
 * Used for semantic errors that occur at compile time not during
 *  interpretation. For ST parsing ONLY not group parsing.
 */
export class STCompiletimeMessage extends STMessage {
    /** overall token pulled from group file */
    public templateToken?: Token;

    /** token inside template */
    public token: Token;
    public srcName: string;

    public constructor(error: ErrorType, srcName: string, templateToken: Token | undefined, t: Token,
        cause?: Error | null, arg?: string | null, arg2?: string) {
        if (!cause) {
            super(error);
            this.templateToken = templateToken;
            this.token = t;
            this.srcName = srcName;
        } else if (!arg) {
            super(error, undefined, cause);
            this.templateToken = templateToken;
            this.token = t;
            this.srcName = srcName;
        } else if (!arg2) {
            super(error, undefined, cause, arg);
            this.templateToken = templateToken;
            this.token = t;
            this.srcName = srcName;
        } else {
            super(error, undefined, cause, arg, arg2);
            this.templateToken = templateToken;
            this.token = t;
            this.srcName = srcName;
        }
    }

    public override toString(): string {
        let line = 0;
        let charPos = -1;
        if (this.token !== null) {
            line = this.token.line;
            charPos = this.token.column;

            // check the input streams - if different then token is embedded in templateToken and we need to
            // adjust the offset
            if (this.templateToken && this.templateToken.inputStream !== this.token.inputStream) {
                let templateDelimiterSize = 1;
                if (this.templateToken.type === GroupParser.BIGSTRING
                    || this.templateToken.type === GroupParser.BIGSTRING_NO_NL) {
                    templateDelimiterSize = 2;
                }
                line += this.templateToken.line - 1;
                charPos += this.templateToken.column + templateDelimiterSize;
            }
        }
        const filePosition = line + ":" + charPos;
        if (this.srcName) {
            return this.srcName + " " + filePosition + ": " + printf(this.error.message, this.arg, this.arg2);
        }

        return filePosition + ": " + printf(this.error.message, this.arg, this.arg2);
    }
}
