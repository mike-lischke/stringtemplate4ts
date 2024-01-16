/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { HashCode, Token } from "antlr4ng";

import { IFormalArgument } from "./common.js";
import { CompiledST } from "./CompiledST.js";

/**
 * Implementation of the formal argument interface.
 */
export class FormalArgument implements IFormalArgument {
    public name: string;

    public index = 0; // which argument is it? from 0..n-1

    /** If they specified default value {@code x=y}, store the token here */
    public defaultValueToken?: Token;
    public defaultValue: unknown; // x="str", x=true, x=false
    public compiledDefaultValue?: CompiledST; // x={...}

    public constructor(name: string, defaultValueToken?: Token) {
        this.name = name;
        this.defaultValueToken = defaultValueToken;
    }

    public hashCode(): number {
        return HashCode.hashStuff(this.name, this.defaultValueToken ? 1 : 0);
    }

    public equals(o: unknown): boolean {
        if (!(o instanceof FormalArgument)) {
            return false;
        }

        if (this.name !== o.name) {
            return false;
        }

        // Only check if there is a default value; that's all.
        return (this.defaultValueToken === undefined) === (o.defaultValueToken === undefined);
    }

    public toString(): string {
        if (this.defaultValueToken) {
            return this.name + "=" + this.defaultValueToken.text;
        }

        return this.name;
    }
}
