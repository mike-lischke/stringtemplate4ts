/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Token } from "antlr4ng";
import { printf } from "fast-printf";

import { ErrorType } from "./ErrorType.js";
import { IST } from "../compiler/common.js";

/**
 * Upon error, ST creates an {@link STMessage} or subclass instance and notifies
 * the listener. This root class is used for IO and internal errors.
 *
 *  @see STRuntimeMessage
 *  @see STCompiletimeMessage
 */
export class STMessage {
    /**
     * if in debug mode, has created instance, add attr events and eval
     *  template events.
     */
    public self?: IST;
    public error: ErrorType;
    public arg: unknown;
    public arg2: unknown;
    public arg3: unknown;
    public cause?: Error;

    public constructor(error: ErrorType);
    public constructor(error: ErrorType, self: IST);
    public constructor(error: ErrorType, self?: IST, cause?: Error);
    public constructor(error: ErrorType, self?: IST, cause?: Error, arg?: unknown);
    public constructor(error: ErrorType, self?: IST, cause?: Error, where?: Token, arg?: unknown);
    public constructor(error: ErrorType, self?: IST, cause?: Error, arg?: unknown, arg2?: unknown);
    public constructor(error: ErrorType, self?: IST, cause?: Error, arg?: unknown, arg2?: unknown, arg3?: unknown);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 1: {
                const [error] = args as [ErrorType];
                this.error = error;

                break;
            }

            case 2: {
                const [error, self] = args as [ErrorType, IST];

                this.error = error;
                this.self = self;

                break;
            }

            case 3: {
                const [error, self, cause] = args as [ErrorType, IST, Error];

                this.error = error;
                this.self = self;
                this.cause = cause;

                break;
            }

            case 4: {
                const [error, self, cause, arg] = args as [ErrorType, IST, Error, unknown];

                this.error = error;
                this.self = self;
                this.cause = cause;
                this.arg = arg;

                break;
            }

            case 5: {
                if (args[3] && typeof args[3] === "object" && "tokenIndex" in args[3]) {
                    const [error, self, cause, _where, arg] = args as [ErrorType, IST, Error, Token, unknown];

                    this.error = error;
                    this.self = self;
                    this.cause = cause;
                    this.arg = arg;
                } else {
                    const [error, self, cause, arg, arg2] = args as [ErrorType, IST, Error, unknown, unknown];

                    this.error = error;
                    this.self = self;
                    this.cause = cause;
                    this.arg = arg;
                    this.arg2 = arg2;
                }

                break;
            }

            case 6: {
                const [error, self, cause, arg, arg2, arg3] =
                    args as [ErrorType, IST, Error, unknown, unknown, unknown];

                this.error = error;
                this.self = self;
                this.cause = cause;
                this.arg = arg;
                this.arg2 = arg2;
                this.arg3 = arg3;

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }
    }

    public toString(): string {
        let msg = printf(this.error.message, this.arg, this.arg2, this.arg3);
        if (this.cause) {
            msg += "\nCaused by: ";
            msg += this.cause.stack ?? "";
        }

        return msg;
    }
}
