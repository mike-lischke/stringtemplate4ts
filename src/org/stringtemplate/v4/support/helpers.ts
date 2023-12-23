/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { Constructor } from "../reflection/IMember.js";

/**
 * A method to determine if a class is a super class of another class.
 *
 * @param superclass The candidate superclass.
 * @param subclass The candidate subclass.
 *
 * @returns true if `superclass` is a superclass of `subclass`.
 */
export const isSuperclassOf = (superclass: Function | null, subclass: Function | null): boolean => {
    if (!superclass || !subclass) {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let proto = subclass.prototype;
    while (proto) {
        if (proto === superclass.prototype) {
            return true;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        proto = Object.getPrototypeOf(proto);
    }

    return false;
};

export const defaultLocale = (): Intl.Locale => {
    return new Intl.Locale("en-US");
};

/**
 * Get the constructor of an unknown value.
 *
 * @param obj The value to get the constructor from.
 *
 * @returns The constructor of the value or undefined if the value is not an object.
 */
export const constructorFromUnknown = (obj: unknown): Constructor | undefined => {
    const proto = Object.getPrototypeOf(obj) as Object;

    return proto?.constructor as Constructor | undefined;
};

/**
 * @param obj The object to check.
 *
 * @returns true if the object is an iterator.
 */
export const isIterator = (obj: unknown): obj is Iterator<unknown> => {
    // Iterator is an interface, so use duck typing.
    return (obj != null && typeof obj === "object" && "next" in obj && "return" in obj);
};

/**
 * Converts a Typescript string to a UTF-16 char code array. The string uses UTF-16 internally
 * so there's no need to handle surrogate pairs.
 *
 * @param data The Typescript string.
 *
 * @returns The UTF-16 char code array.
 */
export const convertStringToUTF16 = (data: string): Uint16Array => {
    const result = new Uint16Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data.charCodeAt(i);
    }

    return result;
};

/**
 * Converts a UTF-16 char code array to a Typescript string. The string uses UTF-16 internally
 * so there's no need to handle surrogate pairs.
 *
 * @param data The UTF-16 char code array.
 *
 * @returns The Typescript string.
 */
export const convertUTF16ToString = (data: Uint16Array): string => {
    const decoder = new TextDecoder("utf-16");

    return decoder.decode(data);
};
