/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { CharStreams, CommonTokenStream } from "antlr4ng";

import { ICompiledST } from "./compiler/common.js";

import { STGroup } from "./STGroup.js";
import { GroupParser } from "./compiler/generated/GroupParser.js";
import { GroupLexer } from "./compiler/generated/GroupLexer.js";

/** A group derived from a string not a file or directory. */
export class STGroupString extends STGroup {
    public sourceName: string;
    public text: string;
    protected alreadyLoaded = false;

    public constructor(text: string);
    public constructor(sourceName: string, text: string);
    public constructor(sourceName: string, text: string, delimiterStartChar: string, delimiterStopChar: string);
    public constructor(...args: unknown[]) {
        let sourceName;
        let text;
        let delimiterStartChar = "<";
        let delimiterStopChar = ">";

        switch (args.length) {
            case 1: {
                [text] = args as [string];
                sourceName = "<string>";

                break;
            }

            case 2: {
                [sourceName, text] = args as [string, string];

                break;
            }

            case 4: {
                [sourceName, text, delimiterStartChar, delimiterStopChar] = args as [string, string, string, string];

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }

        super(delimiterStartChar, delimiterStopChar);
        this.sourceName = sourceName;
        this.text = text;

    }

    public override isDictionary(name: string): boolean {
        if (!this.alreadyLoaded) {
            this.load();
        }

        return super.isDictionary(name);
    }

    public override isDefined(name: string): boolean {
        if (!this.alreadyLoaded) {
            this.load();
        }

        return super.isDefined(name);
    }

    public override load(): void;
    public override load(name: string): ICompiledST | null | undefined;
    public override load(...args: unknown[]): void | ICompiledST | null | undefined {
        switch (args.length) {
            case 0: {

                if (this.alreadyLoaded) {
                    return;
                }

                this.alreadyLoaded = true;
                const stream = CharStreams.fromString(this.text);
                stream.name = this.sourceName;
                const lexer = new GroupLexer(stream);
                const tokens = new CommonTokenStream(lexer);
                const parser = new GroupParser(tokens);

                // no prefix since this group file is the entire group, nothing lives
                // beneath it.
                parser.group(this, "/");

                break;
            }

            case 1: {
                const [name] = args as [string];

                if (!this.alreadyLoaded) {
                    this.load();
                }

                return this.rawGetTemplate(name);
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }
    }

    public override  getFileName(): string {
        return "<string>";
    }
}
