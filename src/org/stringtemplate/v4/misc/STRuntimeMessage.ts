/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-returns */

import { STMessage } from "./STMessage.js";
import { Misc } from "./Misc.js";
import { ErrorType } from "./ErrorType.js";
import { InstanceScope } from "../InstanceScope.js";
import { Interpreter } from "../Interpreter.js";

/** Used to track errors that occur in the ST interpreter. */
export class STRuntimeMessage extends STMessage {
    /** Where error occurred in bytecode memory. */
    public readonly ip: number;
    public readonly scope?: InstanceScope;

    /**
     * Which interpreter was executing?  If {@code null}, can be IO error or
     *  bad URL etc...
     */
    protected readonly interp: Interpreter;

    public constructor(interp: Interpreter, error: ErrorType, ip: number);
    public constructor(interp: Interpreter, error: ErrorType, ip: number, scope: InstanceScope);
    public constructor(interp: Interpreter, error: ErrorType, ip: number, scope: InstanceScope, arg: unknown);
    public constructor(interp: Interpreter, error: ErrorType, ip: number, scope: InstanceScope, e: Error, arg: unknown);
    public constructor(interp: Interpreter, error: ErrorType, ip: number, scope: InstanceScope, e: Error | undefined,
        arg: unknown, arg2: unknown);
    public constructor(interp: Interpreter, error: ErrorType, ip: number, scope: InstanceScope, e: Error | undefined,
        arg: unknown, arg2: unknown, arg3: unknown);
    public constructor(...args: unknown[]) {
        const [interp, error, ip] = args as [Interpreter, ErrorType, number];

        let scope;
        let e;
        let arg;
        let arg2;
        let arg3;

        switch (args.length) {
            case 4: {
                scope = args[3] as InstanceScope;

                break;
            }

            case 5: {
                scope = args[3] as InstanceScope;
                arg = args[4] as Error;

                break;
            }

            case 6: {
                scope = args[3] as InstanceScope;
                e = args[4] as Error;
                arg = args[5];

                break;
            }

            case 7: {
                scope = args[3] as InstanceScope;
                e = args[4] as Error;
                arg = args[5];
                arg2 = args[6];

                break;
            }

            case 8: {
                scope = args[3] as InstanceScope;
                e = args[4] as Error;
                arg = args[5];
                arg2 = args[6];
                arg3 = args[7];

                break;
            }

            default:
        }

        super(error, scope?.st, e, arg, arg2, arg3);

        this.interp = interp;
        this.ip = ip;
        this.scope = scope;
    }

    /**
     * Given an IP (code location), get it's range in source template then
     *  return it's template line:col.
     */
    public getSourceLocation(): string | undefined {
        if (this.ip < 0 || !this.self || !this.self.impl) {
            return undefined;
        }

        const interval = this.self?.impl.sourceMap[this.ip];
        if (!interval) {
            return undefined;
        }

        // get left edge and get line/col
        const i = interval.start;
        const loc = Misc.getLineCharPosition(this.self.impl.template, i);

        return loc.toString();
    }

    public override toString(): string {
        let buf = "";
        let loc;
        if (this.self) {
            loc = this.getSourceLocation();
            buf += "context [";
            if (this.interp !== null) {
                buf += Interpreter.getEnclosingInstanceStackString(this.scope);
            }
            buf += "]";
        }

        if (loc) {
            buf += " " + loc;
        }

        return buf + " " + super.toString();
    }
}
