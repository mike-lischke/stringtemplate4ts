/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-returns */

/** Rules can return start/stop info as well as possible trees and templates */
export class RuleReturnScope<T> {
    /** Return the start token or tree */
    public getStart(): T | null { return null; }

    /** Return the stop token or tree */
    public getStop(): T | null { return null; }

    /** Has a value potentially if output=AST; */
    public getTree(): T | null { return null; }

    /**
     * Has a value potentially if output=template; Don't use StringTemplate
     *  type as it then causes a dependency with ST lib.
     */
    public getTemplate(): unknown { return null; }
}
