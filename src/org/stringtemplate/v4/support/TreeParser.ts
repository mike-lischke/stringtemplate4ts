/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { RecognitionException, TokenStream } from "antlr4ng";

import { BaseRecognizer } from "./BaseRecognizer.js";
import { RecognizerSharedState } from "./RecognizerSharedState.js";

export class TreeParser extends BaseRecognizer {
    public static readonly DOWN = -1;
    public static readonly UP = -2;

    protected input: TokenStream;

    public constructor(input: TokenStream, state: RecognizerSharedState) {
        super();

        this.input = input;
        this.state = state;
    }

    public getErrorHeader(e: RecognitionException): string {
        const token = e.offendingToken!;

        return this.getGrammarFileName() + ": node from line " + token.line + ":" + token.column;
    }

    public getErrorMessage(e: RecognitionException, tokenNames: string[]): string {
        return "";
    }

    public getGrammarFileName(): string {
        return "unknown grammar";
    }
}
