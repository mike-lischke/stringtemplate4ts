/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { convertStringToUTF16 } from "./helpers.js";

/** An implementation of the needed parts of java.io.Writer. */
export abstract class Writer {
    /** Writes an array of characters. */
    public write(buffer: Uint16Array): void;
    /** Writes a portion of an array of characters. */
    public /* abstract */ write(buffer: Uint16Array, offset: number, length: number): void;
    /** Writes a single character. */
    public write(c: number): void;
    /** Writes a string. */
    public write(str: string): void;
    /** Writes a portion of a string. */
    public write(str: string, offset: number, length: number): void;
    public write(...args: unknown[]): void {
        switch (args.length) {
            case 1: {
                const value = args[0] as number | Uint16Array | string;

                let array;
                if (value instanceof Uint16Array) {
                    array = value;
                } else if (typeof value === "string") {
                    array = convertStringToUTF16(value);
                } else {
                    array = new Uint16Array(1);
                    array[0] = value & 0xFFFF;

                    break;
                }

                this.write(array, 0, array.length);
                break;
            }

            case 3: {
                const [buffer, offset, length] = args as [Uint16Array | string, number, number];
                if (typeof buffer === "string") {
                    const array = convertStringToUTF16(buffer);
                    this.write(array, offset, length);
                } else {
                    throw new Error("abstract");
                }

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }
    }
}
