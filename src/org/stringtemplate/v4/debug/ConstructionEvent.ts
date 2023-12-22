/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable max-classes-per-file */

import { StackTraceElement } from "../support/StackTraceElement.js";

class StackHolder {
    protected stack?: string;
}

/** An event that happens when building ST trees, adding attributes etc... */
export class ConstructionEvent extends StackHolder {
    #elements: StackTraceElement[] = [];

    public constructor() {
        super();

        Error.captureStackTrace(this, ConstructionEvent);
        this.fillInStackTrace();
    }

    public getFileName(): string {
        return this.getSTEntryPoint().getFileName();
    }

    public getLine(): number {
        return this.getSTEntryPoint().getLineNumber();
    }

    public getSTEntryPoint(): StackTraceElement {
        for (const e of this.#elements) {
            const name = e.toString();
            if (!name.startsWith("org.stringtemplate.v4")) { // XXX: This won't work.
                return e;
            }
        }

        return this.#elements[0];
    }

    /**
     * Fills in the execution stack trace. This method records within this Throwable object information about the
     * current state of the stack frames for the current thread.
     */
    private fillInStackTrace(): void {
        if (this.stack) {
            const lines = this.stack.split("\n").slice(1);

            this.#elements = lines.map((line) => {
                return new StackTraceElement(line);
            });
        }
    }
}
