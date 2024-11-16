/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { STNoSuchPropertyException } from "./STNoSuchPropertyException.js";
import { Interpreter } from "../Interpreter.js";
import { ModelAdaptor } from "../ModelAdaptor.js";
import { ST } from "../ST.js";
import { Constructor, IMember } from "../reflection/IMember.js";
import { Method } from "../reflection/Method.js";
import { Field } from "../reflection/Field.js";

type IndexedObject = Object & { [key: string]: unknown; };

export class ObjectModelAdaptor implements ModelAdaptor<Constructor> {
    protected static readonly INVALID_MEMBER: IMember = new Field(Object, "INVALID_MEMBER");
    protected static readonly membersCache = new Map<Constructor, Map<string, IMember>>();

    protected static findMember(model: Object, memberName: string): IMember | undefined {
        if (memberName.length === 0) {
            return undefined;
        }

        const clazz = Object.getPrototypeOf(model) as Constructor;
        let members = ObjectModelAdaptor.membersCache.get(clazz);
        let member: IMember | undefined;
        if (members) {
            member = members.get(memberName);
            if (member) {
                return member !== ObjectModelAdaptor.INVALID_MEMBER ? member : undefined;
            }
        } else {
            members = new Map<string, IMember>();
            ObjectModelAdaptor.membersCache.set(clazz, members);
        }

        if (memberName in model) {
            // try for a visible field
            member = new Field(clazz, memberName);
        }

        if (!member) {
            const o = model as IndexedObject;
            const methodSuffix = memberName[0].toUpperCase() + memberName.substring(1);
            if ("get" + methodSuffix in o && o["get" + methodSuffix] instanceof Function) {
                member = new Method(clazz, o["get" + methodSuffix] as Function);
            } else if ("is" + methodSuffix in o && o["is" + methodSuffix] instanceof Function) {
                member = new Method(clazz, o["is" + methodSuffix] as Function);
            } else if ("has" + methodSuffix in o && o["has" + methodSuffix] instanceof Function) {
                member = new Method(clazz, o["has" + methodSuffix] as Function);
            }
        }

        members.set(memberName, member ?? ObjectModelAdaptor.INVALID_MEMBER);

        return member;
    }

    public getProperty(_interp: Interpreter, _self: ST, model: Object, _property: unknown,
        propertyName: string): unknown {
        const member = ObjectModelAdaptor.findMember(model, propertyName);
        if (member) {
            try {
                if (member instanceof Method) {
                    return member.invoke(model);
                } else {
                    if (member instanceof Field) {
                        return member.get(model);
                    }
                }
            }
            catch (e) {
                if (e instanceof Error) {
                    this.throwNoSuchProperty(Object.getPrototypeOf(model), propertyName, e);
                }

                throw e;
            }
        }

        this.throwNoSuchProperty(Object.getPrototypeOf(model), propertyName);
    }

    protected throwNoSuchProperty<T extends Constructor>(clazz: T, propertyName: string, cause?: Error): never {
        throw new STNoSuchPropertyException(cause, clazz, `${clazz.constructor.name}.${propertyName}`);
    }
}
