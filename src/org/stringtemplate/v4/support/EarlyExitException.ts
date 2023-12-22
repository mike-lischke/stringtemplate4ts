/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { IntStream, RecognitionException } from "antlr4ng";

export class EarlyExitException extends RecognitionException {
    public constructor(decisionNumber: number, stream: IntStream) {
        super({ message: "", recognizer: null, input: null, ctx: null });
    }
}
