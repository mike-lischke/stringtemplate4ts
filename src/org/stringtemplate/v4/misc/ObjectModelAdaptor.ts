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



export class ObjectModelAdaptor<T> implements ModelAdaptor<T> {
    protected static readonly INVALID_MEMBER: java.lang.reflect.Member;

    protected static readonly membersCache =
        new Map<java.lang.Class<unknown>, Map<string, java.lang.reflect.Member>>();

    protected static findMember(clazz: java.lang.Class<unknown>, memberName: string): java.lang.reflect.Member {
        if (clazz === null) {
            throw new java.lang.NullPointerException("clazz");
        }
        if (memberName === null) {
            throw new java.lang.NullPointerException("memberName");
        }

        /* synchronized (membersCache) { */
        let members = ObjectModelAdaptor.membersCache.get(clazz);
        let member: java.lang.reflect.Member;
        if (members !== null) {
            member = members.get(memberName);
            if (member !== null) {
                return member !== ObjectModelAdaptor.INVALID_MEMBER ? member : null;
            }
        }
        else {
            members = new Map<string, java.lang.reflect.Member>();
            ObjectModelAdaptor.membersCache.put(clazz, members);
        }

        // try getXXX and isXXX properties, look up using reflection
        let methodSuffix = java.lang.Character.toUpperCase(memberName.charAt(0)) +
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

    protected static tryGetMethod(clazz: java.lang.Class<unknown>, methodName: string): java.lang.reflect.Method {
        try {
            let method = clazz.getMethod(methodName);
            if (method !== null) {
                method.setAccessible(true);
            }

            return method;
        } catch (ex) {
            if (ex instanceof java.lang.Exception) {
            } else {
                throw ex;
            }
        }

        return null;
    }

    protected static tryGetField(clazz: java.lang.Class<unknown>, fieldName: string): java.lang.reflect.Field {
        try {
            let field = clazz.getField(fieldName);
            if (field !== null) {
                field.setAccessible(true);
            }

            return field;
        } catch (ex) {
            if (ex instanceof java.lang.Exception) {
            } else {
                throw ex;
            }
        }

        return null;
    }

    public getProperty(interp: Interpreter, self: ST, model: T, property: Object, propertyName: string): Object {
        if (model === null) {
            throw new java.lang.NullPointerException("o");
        }

        let c = model.getClass();

        if (property === null) {
            return this.throwNoSuchProperty(c, propertyName, null);
        }

        let member = ObjectModelAdaptor.findMember(c, propertyName);
        if (member !== null) {
            try {
                if (member instanceof java.lang.reflect.Method) {
                    return (member as java.lang.reflect.Method).invoke(model);
                }
                else {
                    if (member instanceof java.lang.reflect.Field) {
                        return (member as java.lang.reflect.Field).get(model);
                    }
                }

            } catch (e) {
                if (e instanceof java.lang.Exception) {
                    this.throwNoSuchProperty(c, propertyName, e);
                } else {
                    throw e;
                }
            }
        }

        return this.throwNoSuchProperty(c, propertyName, null);
    }

    protected throwNoSuchProperty(clazz: java.lang.Class<unknown>, propertyName: string, cause: java.lang.Exception): Object {
        throw new STNoSuchPropertyException(cause, null, clazz.getName() + "." + propertyName);
    }
    static {
        let invalidMember: java.lang.reflect.Member;
        try {
            invalidMember = ObjectModelAdaptor.class.getDeclaredField("INVALID_MEMBER");
        } catch (ex) {
            if (ex instanceof java.lang.NoSuchFieldException) {
                invalidMember = null;
            } else if (ex instanceof java.lang.SecurityException) {
                invalidMember = null;
            } else {
                throw ex;
            }
        }

        ObjectModelAdaptor.INVALID_MEMBER = invalidMember;
    }
}
