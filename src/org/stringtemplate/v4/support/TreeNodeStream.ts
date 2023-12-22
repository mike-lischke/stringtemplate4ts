/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { IntStream } from "antlr4ng";

import { TreeAdaptor } from "./TreeAdaptor.js";
import { CommonTree } from "./CommonTree.js";
import { TokenStreamV3 } from "./TokenStreamV3.js";

export interface TreeNodeStream extends IntStream {

    getTokenStream(): TokenStreamV3;
    getTreeAdaptor(): TreeAdaptor;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    LT(k: number): CommonTree;
}
