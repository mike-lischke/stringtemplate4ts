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
import { Interpreter } from "../Interpreter.js";
import { ModelAdaptor } from "../ModelAdaptor.js";
import { ST } from "../ST.js";
import { STGroup } from "../STGroup.js";

type Map<K,​V> = java.util.Map<K,​V>;
type String = java.lang.String;
const String = java.lang.String;
type Boolean = java.lang.Boolean;
const Boolean = java.lang.Boolean;
type ClassCastException = java.lang.ClassCastException;
const ClassCastException = java.lang.ClassCastException;



export  class MapModelAdaptor extends JavaObject implements ModelAdaptor<Map<unknown, unknown>> {

    private static  containsKey(map: Map<unknown, unknown>, key: java.lang.Object):  Boolean {
        try {
            return map.containsKey(key);
        } catch (ex) {
if (ex instanceof ClassCastException) {
            // Map.containsKey is allowed to throw ClassCastException if the key
            // cannot be compared to keys already in the map.
            return false;
        } else {
	throw ex;
	}
}
    }

    private static  getDefaultValue(map: Map<unknown, unknown>):  java.lang.Object {
        try {
            return map.get(STGroup.DEFAULT_KEY);
        } catch (ex) {
if (ex instanceof ClassCastException) {
            // Map.containsKey is allowed to throw ClassCastException if the key
            // cannot be compared to keys already in the map.
            return false;
        } else {
	throw ex;
	}
}
    }
    @Override
public  getProperty(interp: Interpreter, self: ST, model: Map<unknown, unknown>, property: java.lang.Object, propertyName: String):  java.lang.Object
    {
        let  value: java.lang.Object;
        if ( property===null ) {
 value = MapModelAdaptor.getDefaultValue(model);
}

        else {
 if ( MapModelAdaptor.containsKey(model, property) ) {
 value = model.get(property);
}

        else {
 if ( MapModelAdaptor.containsKey(model, propertyName) ) { // if can't find the key, try toString version
            value = model.get(propertyName);
        }
        else {
 if ( property.equals("keys") ) {
 value = model.keySet();
}

        else {
 if ( property.equals("values") ) {
 value = model.values();
}

        else {
 value = MapModelAdaptor.getDefaultValue(model);
}

}

}

}

}
 // not found, use default
        if ( value === STGroup.DICT_KEY ) {
            value = property;
        }
        return value;
    }
}
