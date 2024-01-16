/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { DateTime } from "luxon";

import { AttributeRenderer, IAttributeRendererOptions } from "./AttributeRenderer.js";
import { TimeZone } from "./support/TimeZone.js";

/**
 * A renderer for {@link Date} objects. It understands a
 * variety of format names. By default it assumes {@code "short"} format. A prefix of {@code "date:"} or
 * {@code "time:"} shows only those components of the date object.
 */
export class DateRenderer implements AttributeRenderer<unknown> {
    #formatMapper = new Map<string, Map<string, Intl.DateTimeFormatOptions>>([
        ["date", new Map([
            ["full", DateTime.DATE_FULL],
            ["long", DateTime.DATE_HUGE],
            ["medium", DateTime.DATE_MED],
            ["short", { ...DateTime.DATE_SHORT, year: "2-digit" }],
        ])],

        ["time", new Map([
            ["full", DateTime.TIME_24_WITH_SECONDS],
            ["long", DateTime.TIME_24_WITH_SECONDS],
            ["medium", DateTime.TIME_WITH_SECONDS],
            ["short", DateTime.TIME_SIMPLE],
        ])],

        ["datetime", new Map([
            ["full", DateTime.DATETIME_HUGE_WITH_SECONDS],
            ["long", DateTime.DATETIME_HUGE],
            ["medium", DateTime.DATETIME_MED],
            ["short", { ...DateTime.DATETIME_SHORT, year: "2-digit" }],
        ])],
    ]);

    public toString(value: Date, options: IAttributeRendererOptions): string {
        let dt = DateTime.fromMillis(value.getTime(), { zone: options.timeZone });
        if (options.locale) {
            dt = dt.setLocale(options.locale.toString());
        }

        if (TimeZone.default) {
            dt = dt.setZone(TimeZone.default, { keepLocalTime: true });
        }

        if (!options.format) { // Unassigned or empty.
            options.format = "short";

            return dt.toLocaleString({ ...DateTime.DATETIME_SHORT, year: "2-digit" });
        }

        let dateStyle = "";
        let timeStyle = "";

        if (options.format.startsWith("date:")) {
            dateStyle = options.format.substring("date:".length);
        } else if (options.format.startsWith("time:")) {
            timeStyle = options.format.substring("time:".length);
        }

        if (dateStyle || timeStyle) {
            const dateOptions = this.#formatMapper.get("date")!.get(dateStyle);
            const timeOptions = this.#formatMapper.get("time")!.get(timeStyle);

            // Only one of the two can be set.
            if (dateOptions) {
                return dt.toLocaleString(dateOptions);
            } else {
                return dt.toLocaleString(timeOptions);
            }
        } else {
            // Here we either have a format string or we have a style.
            const dtOptions = this.#formatMapper.get("datetime")!.get(options.format);
            if (dtOptions) {
                // We have a format string.
                return dt.toLocaleString(dtOptions);
            } else {
                // Must be a custom format string then.
                return dt.toFormat(options.format);
            }
        }
    }
}
