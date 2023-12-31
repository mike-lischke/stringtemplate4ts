/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/no-undefined-types */

import { ParseTree } from "antlr4ng";

import { RuleReturnScope } from "./RuleReturnScope.js";

/**
 * This is identical to the {@link ParserRuleReturnScope} except that
 *  the start property is a tree nodes not {@link Token} object
 *  when you are parsing trees.  To be generic the tree node types
 *  have to be {@link Object}.
 */
export class TreeRuleReturnScope extends RuleReturnScope<ParseTree> {
    /** First node or root node of tree matched for this rule. */
    public start: ParseTree | null = null;

    public nargs = 0;

    public override getStart(): ParseTree | null {
        return this.start;
    }
}
