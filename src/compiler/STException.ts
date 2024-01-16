/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

export class STException extends Error {
    public constructor(msg?: string, cause?: Error) {
        if (cause) {
            super(msg, { cause });
        } else {
            super(msg);
        }
    }
}
