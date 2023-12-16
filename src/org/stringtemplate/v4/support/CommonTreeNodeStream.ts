/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { ParseTree, TokenStream } from "antlr4ng";

export class CommonTreeNodeStream {
    public constructor(private tree: ParseTree) {
    }

    public setTokenStream(stream: TokenStream): void {
        throw new Error("Method not implemented.");
    }
}
