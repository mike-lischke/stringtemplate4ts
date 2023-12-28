/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { AddAttributeEvent } from "./debug/AddAttributeEvent.js";
import { ConstructionEvent } from "./debug/ConstructionEvent.js";
import { MultiMap } from "./misc/MultiMap.js";

/** Events during template hierarchy construction (not evaluation) */
export class DebugState {
    /** Record who made us? {@link ConstructionEvent} creates {@link Exception} to grab stack */
    public newSTEvent: ConstructionEvent | undefined;

    /** Track construction-time add attribute "events"; used for ST user-level debugging */
    public addAttrEvents = new MultiMap<string, AddAttributeEvent>();
};
