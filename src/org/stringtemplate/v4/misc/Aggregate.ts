/*
 * [The "BSD license"]
 *  Copyright (c) 2011 Terence Parr
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */




import { java, JavaObject } from "jree";

type HashMap<K,​V> = java.util.HashMap<K,​V>;
const HashMap = java.util.HashMap;
type String = java.lang.String;
const String = java.lang.String;



/** An automatically created aggregate of properties.
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
export  class Aggregate extends JavaObject {
    public  properties = new  HashMap<String, java.lang.Object>();
    public  get(propName: String):  java.lang.Object {
        return this.properties.get(propName);
    }
    @Override
public override  toString():  String {
        return this.properties.toString();
    }
    /** Allow StringTemplate to add values, but prevent the end
     *  user from doing so.
     */
    protected  put(propName: String, propValue: java.lang.Object):  void {
        this.properties.put(propName, propValue);
    }
}

