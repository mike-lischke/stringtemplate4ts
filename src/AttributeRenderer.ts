/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

export interface IAttributeRendererOptions {
    /**
     * The format to use for formatting the date. If not given, the default format is used.
     */
    format?: string;

    /**
     * The locale to use for formatting the date. If not given, the default locale is used.
     */
    locale?: Intl.Locale;

    /**
     * The time zone to use for formatting dates. If not given, the default time zone is used.
     */
    timeZone?: string;
}

/**
 * This interface describes an object that knows how to format or otherwise
 * render an object appropriately. There is one renderer registered per group
 * for a given Java type.
 *
 * <p>
 * If the format string passed to the renderer is not recognized then simply
 * call {@link Object#toString}.</p>
 *
 * <p>
 * {@code formatString} can be {@code null} but {@code locale} will at least be
 * {@link Locale#getDefault}.</p>
 *
 * @template T
 *     the type of values this renderer can handle.
 */
export interface AttributeRenderer<T> {
    toString(value: T, options: IAttributeRendererOptions): string;
}
