/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import he from "he";

import { printf } from "fast-printf";
import { AttributeRenderer, IAttributeRendererOptions } from "./AttributeRenderer.js";

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
export class StringRenderer implements AttributeRenderer<string> {

    public toString(value: string, options: IAttributeRendererOptions): string {
        switch (options.format) {
            case "upper": {
                return value.toLocaleUpperCase(options.locale?.toString());
            }

            case "lower": {
                return value.toLocaleLowerCase(options.locale?.toString());
            }

            case "cap": {
                return (value.length > 0) ? value[0].toUpperCase() + value.substring(1) : value;
            }

            case "url-encode": {
                const encoded = encodeURIComponent(value);

                return encoded.replace(/%20/g, "+"); // For compatibility with Java (application/x-www-form-urlencoded).
            }

            case "xml-encode": {
                const encoded = he.encode(value, { useNamedReferences: true, decimal: true });

                return encoded.replace(/&#9;/g, "\t");
            }

            default: {
                if (options.format) {
                    return printf(options.format, value);
                }

                return value;
            }
        }
    }

}
