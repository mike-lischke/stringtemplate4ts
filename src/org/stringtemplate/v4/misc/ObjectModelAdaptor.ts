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
import { STNoSuchPropertyException } from "./STNoSuchPropertyException.js";
import { Interpreter } from "../Interpreter.js";
import { ModelAdaptor } from "../ModelAdaptor.js";
import { ST } from "../ST.js";

type Member = java.lang.reflect.Member;
type NoSuchFieldException = java.lang.NoSuchFieldException;
const NoSuchFieldException = java.lang.NoSuchFieldException;
type SecurityException = java.lang.SecurityException;
const SecurityException = java.lang.SecurityException;
type Map<K,​V> = java.util.Map<K,​V>;
type Class<T> = java.lang.Class<T>;
const Class = java.lang.Class;
type String = java.lang.String;
const String = java.lang.String;
type HashMap<K,​V> = java.util.HashMap<K,​V>;
const HashMap = java.util.HashMap;
type NullPointerException = java.lang.NullPointerException;
const NullPointerException = java.lang.NullPointerException;
type Method = java.lang.reflect.Method;
const Method = java.lang.reflect.Method;
type Field = java.lang.reflect.Field;
const Field = java.lang.reflect.Field;
type Exception = java.lang.Exception;
const Exception = java.lang.Exception;
type Character = java.lang.Character;
const Character = java.lang.Character;



export  class ObjectModelAdaptor<T> extends JavaObject implements ModelAdaptor<T> {
    protected static readonly  INVALID_MEMBER:  Member;

    protected static readonly  membersCache =
        new  HashMap<Class<unknown>, Map<String, Member>>();

    protected static  findMember(clazz: Class<unknown>, memberName: String):  Member {
        if (clazz === null) {
            throw new  NullPointerException("clazz");
        }
        if (memberName === null) {
            throw new  NullPointerException("memberName");
        }

        /* synchronized (membersCache) { */
            let  members = ObjectModelAdaptor.membersCache.get(clazz);
            let  member: Member;
            if (members !== null) {
                member = members.get(memberName);
                if (member !== null) {
                    return member !== ObjectModelAdaptor.INVALID_MEMBER ? member : null;
                }
            }
            else {
                members = new  HashMap<String, Member>();
                ObjectModelAdaptor.membersCache.put(clazz, members);
            }

            // try getXXX and isXXX properties, look up using reflection
            let  methodSuffix = Character.toUpperCase(memberName.charAt(0)) +
                memberName.substring(1, memberName.length());
            
            member = ObjectModelAdaptor.tryGetMethod(clazz, "get" + methodSuffix);
            if (member === null) {
                member = ObjectModelAdaptor.tryGetMethod(clazz, "is" + methodSuffix);
                if (member === null) {
                    member = ObjectModelAdaptor.tryGetMethod(clazz, "has" + methodSuffix);
                }
            }

            if (member === null) {
                // try for a visible field
                member = ObjectModelAdaptor.tryGetField(clazz, memberName);
            }

            members.put(memberName, member !== null ? member : ObjectModelAdaptor.INVALID_MEMBER);
            return member;
        /* } */ 
    }

    protected static  tryGetMethod(clazz: Class<unknown>, methodName: String):  Method {
        try {
            let  method = clazz.getMethod(methodName);
            if (method !== null) {
                method.setAccessible(true);
            }

            return method;
        } catch (ex) {
if (ex instanceof Exception) {
        } else {
	throw ex;
	}
}

        return null;
    }

    protected static  tryGetField(clazz: Class<unknown>, fieldName: String):  Field {
        try {
            let  field = clazz.getField(fieldName);
            if (field !== null) {
                field.setAccessible(true);
            }

            return field;
        } catch (ex) {
if (ex instanceof Exception) {
        } else {
	throw ex;
	}
}

        return null;
    }

    @Override
public  getProperty(interp: Interpreter, self: ST, model: T, property: java.lang.Object, propertyName: String):  java.lang.Object
    {
        if (model === null) {
            throw new  NullPointerException("o");
        }

        let  c = model.getClass();

        if ( property===null ) {
            return this.throwNoSuchProperty(c, propertyName, null);
        }

        let  member = ObjectModelAdaptor.findMember(c, propertyName);
        if ( member!==null ) {
            try {
                if (member instanceof Method) {
                    return (member as Method).invoke(model);
                }
                else {
 if (member instanceof Field) {
                    return (member as Field).get(model);
                }
}

            } catch (e) {
if (e instanceof Exception) {
                this.throwNoSuchProperty(c, propertyName, e);
            } else {
	throw e;
	}
}
        }

        return this.throwNoSuchProperty(c, propertyName, null);
    }

    protected  throwNoSuchProperty(clazz: Class<unknown>, propertyName: String, cause: Exception):  java.lang.Object {
        throw new  STNoSuchPropertyException(cause, null, clazz.getName() + "." + propertyName);
    }
     static {
        let  invalidMember: Member;
        try {
            invalidMember = ObjectModelAdaptor.class.getDeclaredField("INVALID_MEMBER");
        } catch (ex) {
if (ex instanceof NoSuchFieldException) {
            invalidMember = null;
        }else if (ex instanceof SecurityException) {
            invalidMember = null;
        } else {
	throw ex;
	}
}

        ObjectModelAdaptor.INVALID_MEMBER = invalidMember;
    }
}
