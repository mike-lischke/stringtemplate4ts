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




import { java, type char, S } from "jree";
import { STGroup } from "./STGroup.js";
import { CompiledST } from "./compiler/CompiledST.js";
import { ErrorType } from "./misc/ErrorType.js";



/** A group derived from a string not a file or directory. */
export  class STGroupString extends STGroup {
    public  sourceName:  string;
    public  text:  string;
    protected  alreadyLoaded = false;

    public  constructor(text: string);

    public  constructor(sourceName: string, text: string);

    public  constructor(sourceName: string, text: string, delimiterStartChar: char, delimiterStopChar: char);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 1: {
				const [text] = args as [string];

 this("<string>", text, '<', '>'); 

				break;
			}

			case 2: {
				const [sourceName, text] = args as [string, string];

 this(sourceName, text, '<', '>'); 

				break;
			}

			case 4: {
				const [sourceName, text, delimiterStartChar, delimiterStopChar] = args as [string, string, char, char];


        super(delimiterStartChar, delimiterStopChar);
        this.sourceName = sourceName;
        this.text = text;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public override  isDictionary(name: string):  boolean {
        if ( !this.alreadyLoaded ) {
 this.load();
}

        return super.isDictionary(name);
    }

    public override  isDefined(name: string):  boolean {
        if ( !this.alreadyLoaded ) {
 this.load();
}

        return super.isDefined(name);
    }

    public override  load():  void;

    protected override  load(name: string):  CompiledST;
public override load(...args: unknown[]):  void |  CompiledST {
		switch (args.length) {
			case 0: {

        if (this.alreadyLoaded) {
 return;
}

        this.alreadyLoaded = true;
        let  parser: GroupParser;
        try {
            let  fs = new  ANTLRStringStream(this.text);
            fs.name = this.sourceName;
            let  lexer = new  GroupLexer(fs);
            let  tokens = new  CommonTokenStream(lexer);
            parser = new  GroupParser(tokens);
            // no prefix since this group file is the entire group, nothing lives
            // beneath it.
            parser.group(this, "/");
        } catch (e) {
if (e instanceof java.lang.Exception) {
            this.errMgr.IOError(null, ErrorType.CANT_LOAD_GROUP_FILE, e, "<string>");
        } else {
	throw e;
	}
}
    

				break;
			}

			case 1: {
				const [name] = args as [string];


        if ( !this.alreadyLoaded ) {
 this.load();
}

        return this.rawGetTemplate(name);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public override  getFileName():  string { return "<string>"; }
}
