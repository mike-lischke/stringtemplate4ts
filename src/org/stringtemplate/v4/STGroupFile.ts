/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { existsSync } from "fs";
import { dirname, resolve } from "path";

import { STGroup } from "./STGroup.js";
import { CompiledST } from "./compiler/CompiledST.js";
import { Misc } from "./misc/Misc.js";

/**
 * The internal representation of a single group file (which must end in
 *  ".stg").  If we fail to find a group file, look for it via the
 *  CLASSPATH as a resource.  Templates are only looked up in this file
 *  or an import.
 */
export class STGroupFile extends STGroup {
    /** Where to find the group file. NonNull. */
    public fileName: string;

    protected alreadyLoaded = false;

    /** Load a file relative to current directory or from root or via CLASSPATH. */
    public constructor(fileName: string);

    /** Convenience ctor */
    public constructor(url: string);
    public constructor(fullyQualifiedFileName: string, encoding: string);
    public constructor(fileName: string, delimiterStartChar: string, delimiterStopChar: string);
    public constructor(fullyQualifiedFileName: string, encoding: string, delimiterStartChar: string,
        delimiterStopChar: string);
    /**
     * Pass in a URL with the location of a group file. E.g.,
     *  STGroup g = new STGroupFile(loader.getResource("org/foo/templates/g.stg"), "UTF-8", '<', '>');
     */
    public constructor(url: string, encoding: string, delimiterStartChar: string, delimiterStopChar: string);
    public constructor(...args: unknown[]) {
        let fileName;
        let encoding = "utf-8";
        let delimiterStartChar = "<";
        let delimiterStopChar = ">";

        switch (args.length) {
            case 1: {
                [fileName] = args as [string];

                break;
            }

            case 2: {
                [fileName, encoding] = args as [string, string];

                break;
            }

            case 3: {
                [fileName, delimiterStartChar, delimiterStopChar] = args as [string, string, string];

                break;
            }

            case 4: {
                [fileName, encoding, delimiterStartChar, delimiterStopChar] = args as [string, string, string, string];

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }

        super(delimiterStartChar, delimiterStopChar);

        this.encoding = encoding;
        this.fileName = fileName;

        if (!fileName.endsWith(STGroupFile.GROUP_FILE_EXTENSION)) {
            throw new Error("Group file names must end in .stg: " + fileName);
        }

        if (existsSync(fileName)) {
            if (STGroupFile.verbose) {
                console.log("STGroupFile(" + fileName + ") " + resolve(fileName));
            }
        }
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

    public override unload(): void {
        super.unload();
        this.alreadyLoaded = false;
    }

    public override load(): void;
    public override load(name: string): CompiledST;
    public override load(...args: unknown[]): void | CompiledST {
        if (!this.alreadyLoaded) {
            this.load();
        }

        this.alreadyLoaded = true; // do before actual load to say we're doing it
        switch (args.length) {
            case 0: {
                if (this.alreadyLoaded) {
                    return;
                }

                // no prefix since this group file is the entire group, nothing lives
                // beneath it.
                if (STGroupFile.verbose) {
                    console.log("loading group file " + this.fileName);
                }

                this.loadGroupFile("/", this.fileName);
                if (STGroupFile.verbose) {
                    console.log("found " + this.templates.size + " templates in " + this.fileName + " = " +
                        [...this.templates.keys()].join(", "));
                }

                break;
            }

            case 1: {
                const [name] = args as [string];

                return this.rawGetTemplate(name);
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }
    }

    public override show(): string {
        if (!this.alreadyLoaded) {
            this.load();
        }

        return super.show();
    }

    public override getName(): string {
        return Misc.getFileNameNoSuffix(this.getFileName());
    }

    public override getFileName(): string {
        return this.fileName;
    }

    public override getRootDir(): string {
        return dirname(this.fileName);
    }

    protected override importGroupFile(fileName: string): STGroup | undefined {
        return new STGroupFile(fileName, this.encoding, this.delimiterStartChar, this.delimiterStopChar);
    }
}
