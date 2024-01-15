/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { IInstanceScope } from "./compiler/common.js";

import { ST } from "./ST.js";

export class InstanceScope implements IInstanceScope {
    /** Template that invoked us. */
    public readonly parent?: InstanceScope;

    /** Template we're executing. */
    public readonly st?: ST;

    /** Current instruction pointer. */
    public ip = 0;

    public earlyEval: boolean;

    public constructor(parent?: InstanceScope, st?: ST) {
        this.parent = parent;
        this.st = st;
        this.earlyEval = parent?.earlyEval ?? false;
    }
}
