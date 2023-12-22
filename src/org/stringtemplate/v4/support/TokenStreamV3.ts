/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Token } from "antlr4ng";

export class TokenStreamV3 {
    public toString(start: number, stop: number): string {
        throw new Error("Method not implemented.");
    }

    public get(index: number): Token {
        throw new Error("Method not implemented.");
    }
}
