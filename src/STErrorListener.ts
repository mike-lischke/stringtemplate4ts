/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { STMessage } from "./misc/STMessage.js";

/** How to handle messages. */
export interface STErrorListener {
    compileTimeError(msg: STMessage): void;
    runTimeError(msg: STMessage): void;
    iOError(msg: STMessage): void;
    internalError(msg: STMessage): void;
}
