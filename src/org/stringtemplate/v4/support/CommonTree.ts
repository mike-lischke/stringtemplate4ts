/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Token } from "antlr4ng";

/**
 * A tree node that is wrapper for a Token object.  After 3.0 release
 *  while building tree rewrite stuff, it became clear that computing
 *  parent and child index is very difficult and cumbersome.  Better to
 *  spend the space in every tree node.  If you don't want these extra
 *  fields, it's easy to cut them out in your own BaseTree subclass.
 */
export class CommonTree {
    public getText(): string {
        throw new Error("Method not implemented.");
    }

    public get token(): Token {
        throw new Error("Method not implemented.");
    }
}
