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



import { JavaObject, java, type int, S } from "jree";
import { CompiledST } from "./CompiledST.js";

type String = java.lang.String;
const String = java.lang.String;



/**
 * Represents the name of a formal argument defined in a template:
 * <pre>
 *  test(a,b,x=defaultvalue) ::= "&lt;a&gt; &lt;n&gt; &lt;x&gt;"
 * </pre> Each template has a set of these formal arguments or sets
 * {@link CompiledST#hasFormalArgs} to {@code false} (indicating that no
 * arguments were specified such as when we create a template with
 * {@code new ST(...)}).
 *
 * <p>
 * Note: originally, I tracked cardinality as well as the name of an attribute.
 * I'm leaving the code here as I suspect something may come of it later.
 * Currently, though, cardinality is not used.</p>
 */
export  class FormalArgument extends JavaObject {
/*
    // the following represent bit positions emulating a cardinality bitset.
    public static final int OPTIONAL = 1;     // a?
    public static final int REQUIRED = 2;     // a
    public static final int ZERO_OR_MORE = 4; // a*
    public static final int ONE_OR_MORE = 8;  // a+
    public static final String[] suffixes = {
        null,
        "?",
        "",
        null,
        "*",
        null,
        null,
        null,
        "+"
    };
    protected int cardinality = REQUIRED;
     */

    public  name:  String;

    public  index:  int; // which argument is it? from 0..n-1

    /** If they specified default value {@code x=y}, store the token here */
    public  defaultValueToken:  Token;
    public  defaultValue:  java.lang.Object; // x="str", x=true, x=false
    public  compiledDefaultValue:  CompiledST; // x={...}

    public  constructor(name: String);

    public  constructor(name: String, defaultValueToken: Token);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 1: {
				const [name] = args as [String];

 super();
this.name = name; 

				break;
			}

			case 2: {
				const [name, defaultValueToken] = args as [String, Token];


        super();
this.name = name;
        this.defaultValueToken = defaultValueToken;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    /*
    public static String getCardinalityName(int cardinality) {
        switch (cardinality) {
            case OPTIONAL : return "optional";
            case REQUIRED : return "exactly one";
            case ZERO_OR_MORE : return "zero-or-more";
            case ONE_OR_MORE : return "one-or-more";
            default : return "unknown";
        }
    }
    */

    @Override
public override  hashCode():  int {
        return this.name.hashCode() + this.defaultValueToken.hashCode();
    }

    @Override
public override  equals(o: java.lang.Object):  boolean {
        if ( o===null || !(o instanceof FormalArgument) ) {
            return false;
        }
        let  other = o as FormalArgument;
        if ( !this.name.equals(other.name) ) {
            return false;
        }
        // only check if there is a default value; that's all
        return !((this.defaultValueToken !== null && other.defaultValueToken === null) ||
               (this.defaultValueToken === null && other.defaultValueToken !== null));
    }

    @Override
public override  toString():  String {
        if ( this.defaultValueToken!==null ) {
 return this.name+"="+this.defaultValueToken.getText();
}

        return this.name;
    }
}
