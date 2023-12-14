/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { AttributeRenderer } from "./AttributeRenderer.js";

type FormatStyle = "full" | "long" | "medium" | "short";

/**
 * A renderer for {@link Date} objects. It understands a
 * variety of format names. By default it assumes {@code "short"} format. A prefix of {@code "date:"} or
 * {@code "time:"} shows only those components of the date object.
 */
// using <Object> because this can handle Date and Calendar objects, which don't have a common supertype.
export class DateRenderer implements AttributeRenderer<Object> {
    public static readonly formatToInt: Map<string, number>;

    public toString(value: Date, formatString?: string, locale?: Intl.Locale): string {
        let dateStyle: FormatStyle | undefined;
        let timeStyle: FormatStyle | undefined;

        if (formatString) {
            if (formatString.startsWith("date:")) {
                dateStyle = formatString.substring("date:".length) as FormatStyle;;
            } else {
                if (formatString.startsWith("time:")) {
                    timeStyle = formatString.substring("time:".length) as FormatStyle;
                } else {
                    dateStyle = formatString as FormatStyle;
                    timeStyle = formatString as FormatStyle;
                }

            }
        }

        const f = new Intl.DateTimeFormat(locale?.baseName, { dateStyle, timeStyle });

        return f.format(value);
    }
}
