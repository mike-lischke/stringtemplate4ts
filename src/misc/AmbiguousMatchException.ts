/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

export class AmbiguousMatchException extends Error {
    public constructor(message?: string);
    public constructor(cause: Error);
    public constructor(message: string, cause: Error);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 0: {
                super();

                break;
            }

            case 1: {
                const [param] = args as [string | Error];

                if (param instanceof Error) {
                    super(undefined, { cause: param });
                } else {
                    super(param);
                }

                break;
            }

            case 2: {
                const [message, cause] = args as [string, Error];

                super(message, { cause });

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }
    }

}
