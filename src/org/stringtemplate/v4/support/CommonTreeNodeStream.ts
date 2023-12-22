/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { ParseTree, TokenStream } from "antlr4ng";

import { TreeNodeStream } from "./TreeNodeStream.js";
import { CommonTree } from "./CommonTree.js";
import { TokenStreamV3 } from "./TokenStreamV3.js";
import { TreeAdaptor } from "./TreeAdaptor.js";

export class CommonTreeNodeStream implements TreeNodeStream {
    public constructor(private tree: ParseTree) {
    }

    public getTokenStream(): TokenStreamV3 {
        throw new Error("Method not implemented.");
    }

    public getTreeAdaptor(): TreeAdaptor {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public LT(k: number): CommonTree {
        throw new Error("Method not implemented.");
    }

    public consume(): void {
        throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public LA(i: number): number {
        throw new Error("Method not implemented.");
    }

    public mark(): number {
        throw new Error("Method not implemented.");
    }

    public release(marker: number): void {
        throw new Error("Method not implemented.");
    }

    public get index(): number {
        throw new Error("Method not implemented.");
    }

    public seek(index: number): void {
        throw new Error("Method not implemented.");
    }

    public get size(): number {
        throw new Error("Method not implemented.");
    }

    public getSourceName(): string {
        throw new Error("Method not implemented.");
    }

    public setTokenStream(stream: TokenStream): void {
        throw new Error("Method not implemented.");
    }
}
