/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

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
    toString(value: T, formatString: string, locale: Intl.Locale): string;
}
