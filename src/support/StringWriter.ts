/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Writer } from "./Writer.js";
import { convertStringToUTF16, convertUTF16ToString } from "./helpers.js";

/** Code taken from the jree Node.js package */

type SimpleDataType = null | undefined | boolean | number | string | bigint;

export class StringWriter extends Writer {
    #data: Uint16Array;
    #currentLength = 0;

    /** Create a new string writer using the default initial string-buffer size. */
    public constructor();
    /** Create a new string writer using the specified initial string-buffer size. */
    public constructor(initialSize: number);
    public constructor(initialSize?: number) {
        super();

        this.#data = new Uint16Array(initialSize ?? 16);
    }

    public override toString(): string {
        return convertUTF16ToString(this.#data.subarray(0, this.#currentLength));
    }

    /** Writes an array of characters. */
    public override write(buffer: Uint16Array): void;
    /** Write a portion of an array of characters. */
    public override write(buffer: Uint16Array, offset: number, length: number): void;
    /** Write a single character. */
    public override write(c: number): void;
    /** Write a string. */
    public override write(str: string): void;
    /** Write a portion of a string. */
    public override write(str: string, offset: number, length: number): void;
    public override write(...args: unknown[]): void {
        if (args.length === 1) {
            if (typeof args[0] === "number") {
                this.append(args[0]);
            } else if (typeof args[0] === "string") {
                this.append(args[0]);
            }
        } else if (args.length === 3) {
            const str = args[0] as string | Uint16Array;
            const start = args[1] as number;
            const length = args[2] as number;

            if (str instanceof Uint16Array) {
                this.append(str, start, length);
            } else {
                this.append(str.substring(start, start + length));
            }
        }
    }

    /**
     * Inserts the specified data at the specified position.
     *
     * @param position the position to insert the data.
     * @param newContent the data to insert.
     */
    private insertData(position: number, newContent: SimpleDataType): void {
        let data: Uint16Array | undefined;
        let text;
        if (newContent === null) {
            text = "null";
        } else if (newContent === undefined) {
            text = "undefined";
        } else {
            text = `${newContent}`;
        }

        if (text.length > 0) {
            data = convertStringToUTF16(text);
        }

        if (!data) {
            return;
        }

        const requiredSize = this.#currentLength + data.length;
        if (requiredSize <= this.#data.length) {
            // No need to re-allocate. There's still room for the new data.
            if (position < this.#currentLength) {
                this.#data.copyWithin(position + data.length, position, this.#currentLength);
            }

            this.#data.set(data, position);
            position += data.length;

            this.#currentLength = requiredSize;
        } else {
            // Reallocate at least by half of the current buffer size.
            const newData = new Uint16Array(Math.max(requiredSize, this.#data.length * 1.5));
            if (position > 0) {
                // Copy what's before the target position.
                newData.set(this.#data.subarray(0, position), 0);
            }

            // Add the new data.
            newData.set(data, position);

            if (position < this.#currentLength) {
                // Copy the rest from the original data.
                newData.set(this.#data.subarray(position, this.#currentLength), position + data.length);
            }

            this.#data = newData;
            this.#currentLength = requiredSize;
        }
    }

    /**
     * A special version of the insertData method, which deals specifically with char arrays.
     *
     * @param position The position where to add the new content.
     * @param data The content to add.
     * @param start Optional start position in the source list.
     * @param end Optional end position in the source list.
     */
    private insertListData(position: number, data: Uint16Array, start?: number, end?: number): void {
        const array = start === undefined ? data : data.slice(start, end);
        const additionalSize = data.length;

        const requiredSize = this.#currentLength + additionalSize;
        if (requiredSize > 0) {
            if (requiredSize <= this.#data.length) {
                // No need to re-allocate. There's still room for the new data.
                if (position < this.#currentLength) {
                    this.#data.copyWithin(additionalSize, position, this.#currentLength);
                }

                this.#data.set(array, position);
                this.#currentLength = requiredSize;
            } else {
                const newData = new Uint16Array(Math.max(requiredSize, this.#data.length * 1.5));
                if (position > 0) {
                    // Copy what's before the target position.
                    newData.set(this.#data.subarray(0, position), 0);
                }

                // Add the new data.
                newData.set(array.subarray(start, end), position);

                if (position < this.#currentLength) {
                    // Copy the rest from the original data.
                    newData.set(this.#data.subarray(position, this.#currentLength), position + additionalSize);
                }

                this.#data = newData;
                this.#currentLength = requiredSize;
            }
        }
    }

    private append(source: SimpleDataType | Uint16Array, start?: number, end?: number): void {
        if (source instanceof Uint16Array) {
            start ??= 0;
            end = end ?? source.length;
            if (start < 0 || start > end || end > source.length) {
                throw new Error("Index out of bounds");
            }

            this.insertListData(this.#currentLength, source, start, end);
        } else {
            this.insertData(this.#currentLength, source);
        }

    }
}
