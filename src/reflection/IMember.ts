/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

export type Constructor<T = unknown> = new (...args: unknown[]) => T;

/** java.lang.reflect.Member equivalent. */
export interface IMember {
    getName(): string;
}
