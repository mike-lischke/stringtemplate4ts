/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

/**
 * This is a partial implementation of Java's TimeZone class, just to allow setting a default time zone.
 */
export class TimeZone {
    /** The current default timezone. If not set the timezone of the environment is used. */
    public static default: string | undefined;
}
