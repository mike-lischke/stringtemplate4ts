/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { InstanceScope } from "../InstanceScope.js";
import { STException } from "../compiler/STException.js";

/** {@code <name>} where {@code name} is not found up the dynamic scoping chain. */
export class STNoSuchAttributeException extends STException {
    public scope: InstanceScope;

    public constructor(name: string, scope: InstanceScope) {
        super();
        this.name = name;
        this.scope = scope;
    }

    public getMessage(): string {
        return "from template " + this.scope.st!.getName() + " no attribute " + this.name + " is visible";
    }
}
