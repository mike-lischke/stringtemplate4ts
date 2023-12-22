/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Token } from "antlr4ng";

import { CommonTree } from "./CommonTree.js";

export interface TreeAdaptor {
    getToken(t: unknown): Token;

    getTokenStartIndex(t: CommonTree | null): number;
    getTokenStopIndex(t: CommonTree | null): number;
}
