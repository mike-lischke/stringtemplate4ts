/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { printf } from "fast-printf";

import { AttributeRenderer } from "./AttributeRenderer.js";

/** Works with {@link Byte}, {@link Short}, {@link Integer}, {@link Long}, and {@link BigInteger} as well as
 *  {@link Float}, {@link Double}, and {@link BigDecimal}.  You pass in a format string suitable
 *  for {@link Formatter#format}.
 *  <p>
 *  For example, {@code %10d} emits a number as a decimal int padding to 10 char.
 *  This can even do {@code long} to {@code Date} conversions using the format string.</p>
 */
export class NumberRenderer implements AttributeRenderer<Object> {
    public toString(value: unknown, formatString: string, locale: Intl.Locale): string {
        if (formatString === null) {
            return String(value);
        }

        const result = printf(formatString, value);
        return result;
    }
}
