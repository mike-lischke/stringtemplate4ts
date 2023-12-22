/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { IntStream } from "antlr4ng";

export class NoViableAltExceptionV3 extends Error {
    public constructor(message: string, decisionNumber: number, stateNumber: number, input: IntStream) {
        super();
    }
}
