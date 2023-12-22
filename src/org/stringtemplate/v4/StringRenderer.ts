/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import he from "he";

import { printf } from "fast-printf";
import { AttributeRenderer } from "./AttributeRenderer.js";

/**
 * This render knows to perform a few format operations on {@link String} objects:
 * <ul>
 *  <li>{@code upper}: Convert to upper case.</li>
 *  <li>{@code lower}: Convert to lower case.</li>
 *  <li>{@code cap}: Convert first character to upper case.</li>
 *  <li>{@code url-encode}:</li>
 *  <li>{@code xml-encode}:</li>
 * </ul>
 */
export class StringRenderer implements AttributeRenderer<unknown> {

    public toString(value: string, formatString: string, locale: Intl.Locale): string {
        switch (formatString) {
            case "upper": {
                return value.toLocaleUpperCase(locale.baseName);
            }

            case "lower": {
                return value.toLocaleLowerCase(locale.baseName);
            }

            case "cap": {
                return (value.length > 0) ? value[0] + value.substring(1) : value;
            }

            case "url-encode": {
                return encodeURIComponent(value);
            }

            case "xml-encode": {
                return he.encode(value);
            }

            default: {
                return printf(formatString, value);
            }
        }
    }

}
