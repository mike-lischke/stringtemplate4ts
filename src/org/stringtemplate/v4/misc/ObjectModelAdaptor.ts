/* java2ts: keep */

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

export class ObjectModelAdaptor implements ModelAdaptor<Constructor> {
    protected static readonly INVALID_MEMBER: IMember = new Field(Object, "INVALID_MEMBER");
    protected static readonly membersCache = new Map<Constructor, Map<string, IMember>>();

    protected static findMember(clazz: Constructor, memberName: string): IMember | undefined {
        if (clazz == null) {
            throw new Error("clazz");
        }

        if (!memberName) {
            throw new Error("memberName");
        }

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

        // try getXXX and isXXX properties, look up using reflection
        const methodSuffix = memberName[0].toUpperCase() + memberName.substring(1);

        member = ObjectModelAdaptor.tryGetMethod(clazz, "get" + methodSuffix);
        if (!member) {
            member = ObjectModelAdaptor.tryGetMethod(clazz, "is" + methodSuffix);
            if (!member) {
                member = ObjectModelAdaptor.tryGetMethod(clazz, "has" + methodSuffix);
            }
        }

        if (!member) {
            // try for a visible field
            member = ObjectModelAdaptor.tryGetField(clazz, memberName);
        }

        members.set(memberName, member ?? ObjectModelAdaptor.INVALID_MEMBER);

        return member;
    }

    protected static tryGetMethod(clazz: Constructor, methodName: string): Method | undefined {
        const method = (clazz as never)[methodName];
        if (typeof method === "function") {
            return new Method(clazz, method);
        }

        return undefined;
    }

    protected static tryGetField(clazz: Constructor, fieldName: string): Field | undefined {
        const field = (clazz as never)[fieldName];
        if (typeof field !== "function" && typeof field !== "object") {
            return new Field(clazz, field);
        }

        return undefined;
    }

    public getProperty(_interp: Interpreter, _self: ST, model: Object, property: unknown,
        propertyName: string): unknown {
        const prototype = Object.getPrototypeOf(model) as Constructor;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const member = ObjectModelAdaptor.findMember(prototype, propertyName);
        if (member) {
            if (member instanceof Method) {
                return member.invoke(model);
            } else {
                if (member instanceof Field) {
                    return member.get(model);
                }
            }
        }

        this.throwNoSuchProperty(prototype, propertyName);
    }

    protected throwNoSuchProperty<T extends Constructor>(clazz: T, propertyName: string): never {
        throw new STNoSuchPropertyException(undefined, clazz, propertyName);
    }

}
