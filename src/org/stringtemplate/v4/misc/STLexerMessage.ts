/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { RecognitionException, Token } from "antlr4ng";

import { STMessage } from "./STMessage.js";
import { ErrorType } from "./ErrorType.js";
import { GroupParser } from "../compiler/generated/GroupParser.js";
import { printf } from "fast-printf";

export class STLexerMessage extends STMessage {
    public msg: string;
    /** overall token pulled from group file */
    public templateToken: Token | null;
    public srcName: string;

    public constructor(srcName: string, msg: string, templateToken: Token | null, cause: Error) {
        super(ErrorType.LEXER_ERROR, undefined, cause, null);
        this.msg = msg;
        this.templateToken = templateToken;
        this.srcName = srcName;
    }

    public override  toString(): string {
        const re = this.cause as RecognitionException;
        let line = re.offendingToken?.line ?? 0;
        let charPos = re.offendingToken?.column ?? 0;
        if (this.templateToken !== null) {
            let templateDelimiterSize = 1;
            if (this.templateToken.type === GroupParser.BIGSTRING) {
                templateDelimiterSize = 2;
            }
            line += this.templateToken.line - 1;
            charPos += this.templateToken.column + templateDelimiterSize;
        }

        const filePos = line + ":" + charPos;
        if (this.srcName !== null) {
            return this.srcName + " " + filePos + ": " + printf(this.error.message, this.msg);
        }

        return filePos + ": " + printf(this.error.message, this.msg);
    }
}
