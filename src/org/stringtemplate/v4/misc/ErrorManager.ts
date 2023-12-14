/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { RecognitionException, Token } from "antlr4ng";

import { STRuntimeMessage } from "./STRuntimeMessage.js";
import { STMessage } from "./STMessage.js";
import { STLexerMessage } from "./STLexerMessage.js";
import { STGroupCompiletimeMessage } from "./STGroupCompiletimeMessage.js";
import { STCompiletimeMessage } from "./STCompiletimeMessage.js";
import { Misc } from "./Misc.js";
import { ErrorType } from "./ErrorType.js";
import { InstanceScope } from "../InstanceScope.js";
import { Interpreter } from "../Interpreter.js";
import { ST } from "../ST.js";
import { STErrorListener } from "../STErrorListener.js";

export class ErrorManager {
    public static DEFAULT_ERROR_LISTENER = new class implements STErrorListener {
        public compileTimeError(msg: STMessage): void {
            console.error(msg);
        }

        public runTimeError(msg: STMessage): void {
            if (msg.error !== ErrorType.NO_SUCH_PROPERTY) { // ignore these
                console.error(msg);
            }
        }

        public iOError(msg: STMessage): void {
            console.error(msg);
        }

        public internalError(msg: STMessage): void {
            console.error(msg);
        }

        public error(s: string, e?: Error): void {
            console.error(s);
            if (e) {
                console.error(e.stack);
            }
        }
    }();

    public readonly listener: STErrorListener;

    public constructor(listener?: STErrorListener) {
        this.listener = listener ?? ErrorManager.DEFAULT_ERROR_LISTENER;
    }

    public compileTimeError(error: ErrorType, templateToken: Token, t: Token, arg?: string, arg2?: string): void {
        const srcName = this.sourceName(t);

        if (!arg) {
            this.listener.compileTimeError(
                new STCompiletimeMessage(error, srcName, templateToken, t, null, t.text),
            );
        } else if (!arg2) {
            this.listener.compileTimeError(
                new STCompiletimeMessage(error, srcName, templateToken, t, null, arg),
            );
        } else {
            this.listener.compileTimeError(
                new STCompiletimeMessage(error, srcName, templateToken, t, null, arg, arg2),
            );
        }
    }

    public lexerError(srcName: string, msg: string, templateToken: Token, e: RecognitionException): void {
        if (srcName !== null) {
            srcName = Misc.getFileName(srcName);
        }

        this.listener.compileTimeError(
            new STLexerMessage(srcName, msg, templateToken, e),
        );
    }

    public groupSyntaxError(error: ErrorType, srcName: string, e: RecognitionException, msg: string): void {
        this.listener.compileTimeError(
            new STGroupCompiletimeMessage(error, srcName, t, e.offendingToken, msg),
        );
    }

    public groupLexerError(error: ErrorType, srcName: string, e: RecognitionException, msg: string): void {
        this.listener.compileTimeError(
            new STGroupCompiletimeMessage(error, srcName, e.offendingToken, e, msg),
        );
    }

    public runTimeError(interp: Interpreter, scope: InstanceScope, error: ErrorType): void;
    public runTimeError(interp: Interpreter, scope: InstanceScope, error: ErrorType, arg: string): void;
    public runTimeError(interp: Interpreter, scope: InstanceScope, error: ErrorType, e: Error, arg: string): void;
    public runTimeError(interp: Interpreter, scope: InstanceScope, error: ErrorType, arg: string, arg2: string): void;
    public runTimeError(interp: Interpreter, scope: InstanceScope, error: ErrorType, arg: string, arg2: string,
        arg3: string): void;
    public runTimeError(...args: unknown[]): void {
        switch (args.length) {
            case 3: {
                const [interp, scope, error] = args as [Interpreter, InstanceScope, ErrorType];

                this.listener.runTimeError(new STRuntimeMessage(interp, error, scope !== null ? scope.ip : 0, scope));

                break;
            }

            case 4: {
                const [interp, scope, error, arg] = args as [Interpreter, InstanceScope, ErrorType, string];
                this.listener.runTimeError(new STRuntimeMessage(interp, error, scope !== null ? scope.ip : 0, scope,
                    arg));

                break;
            }

            case 5: {
                if (args[3] instanceof Error) {
                    const [interp, scope, error, e, arg] = args as [Interpreter, InstanceScope, ErrorType, Error,
                        string];

                    this.listener.runTimeError(new STRuntimeMessage(interp, error, scope !== null ? scope.ip : 0, scope,
                        e, arg));
                } else {
                    const [interp, scope, error, arg, arg2] = args as [Interpreter, InstanceScope, ErrorType, string,
                        string];

                    this.listener.runTimeError(new STRuntimeMessage(interp, error, scope !== null ? scope.ip : 0, scope,
                        null, arg, arg2));
                }

                break;
            }

            case 6: {
                const [interp, scope, error, arg, arg2, arg3] =
                    args as [Interpreter, InstanceScope, ErrorType, string, string, string];

                this.listener.runTimeError(new STRuntimeMessage(interp, error, scope !== null ? scope.ip : 0, scope,
                    null, arg, arg2, arg3));

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }
    }

    public iOError(self: ST, error: ErrorType, e: Error, arg?: string): void {
        if (!arg) {
            this.listener.iOError(new STMessage(error, self, e));
        } else {
            this.listener.iOError(new STMessage(error, self, e, arg));
        }
    }

    public internalError(self: ST, msg: string, e: Error): void {
        this.listener.internalError(new STMessage(ErrorType.INTERNAL_ERROR, self, e, msg));
    }

    private sourceName(t: Token): string | null {
        const input = t.inputStream;
        if (input === null) {
            return null;
        }
        let srcName = input.getSourceName();
        if (srcName !== null) {
            srcName = Misc.getFileName(srcName);
        }

        return srcName;
    }
}
