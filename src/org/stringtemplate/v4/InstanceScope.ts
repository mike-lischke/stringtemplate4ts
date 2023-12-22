/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { ST } from "./ST.js";
import { EvalTemplateEvent } from "./debug/EvalTemplateEvent.js";
import { InterpEvent } from "./debug/InterpEvent.js";

export class InstanceScope {
    /** Template that invoked us. */
    public readonly parent?: InstanceScope;

    /** Template we're executing. */
    public readonly st?: ST;

    /** Current instruction pointer. */
    public ip: number;

    /**
     * Includes the {@link EvalTemplateEvent} for this template. This is a
     * subset of {@link Interpreter#events} field. The final
     * {@link EvalTemplateEvent} is stored in 3 places:
     *
     * <ol>
     *  <li>In {@link #parent}'s {@link #childEvalTemplateEvents} list</li>
     *  <li>In this list</li>
     *  <li>In the {@link Interpreter#events} list</li>
     * </ol>
     *
     * The root ST has the final {@link EvalTemplateEvent} in its list.
     * <p>
     * All events get added to the {@link #parent}'s event list.</p>
     */
    public events = new Array<InterpEvent>();

    /**
     * All templates evaluated and embedded in this {@link ST}. Used
     *  for tree view in STViz.
     */
    public childEvalTemplateEvents = new Array<EvalTemplateEvent>();

    public earlyEval: boolean;

    public constructor(parent?: InstanceScope, st?: ST) {
        this.parent = parent;
        this.st = st;
        this.earlyEval = parent?.earlyEval ?? false;
    }
}
