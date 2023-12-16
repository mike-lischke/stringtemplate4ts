/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-param */

/**
 * An automatically created aggregate of properties.
 *
 *  <p>I often have lists of things that need to be formatted, but the list
 *  items are actually pieces of data that are not already in an object.  I
 *  need ST to do something like:</p>
 *  <p>
 *  Ter=3432<br>
 *  Tom=32234<br>
 *  ....</p>
 *  <p>
 *  using template:</p>
 *  <p>
 *  {@code $items:{it.name$=$it.type$}$}</p>
 *  <p>
 *  This example will call {@code getName()} on the objects in items attribute, but
 *  what if they aren't objects?  I have perhaps two parallel arrays
 *  instead of a single array of objects containing two fields.  One
 *  solution is allow {@code Map}s to be handled like properties so that {@code it.name}
 *  would fail {@code getName()} but then see that it's a {@code Map} and do
 *  {@code it.get("name")} instead.</p>
 *  <p>
 *  This very clean approach is espoused by some, but the problem is that
 *  it's a hole in my separation rules.  People can put the logic in the
 *  view because you could say: "go get bob's data" in the view:</p>
 *  <p>
 *  Bob's Phone: {@code $db.bob.phone$}</p>
 *  <p>
 *  A view should not be part of the program and hence should never be able
 *  to go ask for a specific person's data.</p>
 *  <p>
 *  After much thought, I finally decided on a simple solution.  I've
 *  added setAttribute variants that pass in multiple property values,
 *  with the property names specified as part of the name using a special
 *  attribute name syntax: {@code "name.{propName1,propName2,...}"}.  This
 *  object is a special kind of {@code HashMap} that hopefully prevents people
 *  from passing a subclass or other variant that they have created as
 *  it would be a loophole.  Anyway, the {@link AggregateModelAdaptor#getProperty}
 *  method looks for {@code Aggregate} as a special case and does a {@link #get} instead
 *  of {@code getPropertyName}.</p>
 */
export class Aggregate {
    public properties = new Map<string, unknown>();
    public get(propName: string): unknown {
        return this.properties.get(propName);
    }

    public toString(): string {
        // Convert the properties to a string.
        const entries: string[] = [];
        for (const [key, value] of this.properties) {
            entries.push(`${key}=${value}`);
        }

        return entries.join(", ");
    }

    /**
     * Allow StringTemplate to add values, but prevent the end
     *  user from doing so.
     */
    protected put(propName: string, propValue: Object): void {
        this.properties.set(propName, propValue);
    }
}
