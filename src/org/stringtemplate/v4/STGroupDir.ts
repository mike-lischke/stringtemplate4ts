/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-returns, jsdoc/require-param */

import * as fs from "fs";
import * as path from "path";

import { CharStreams, Token } from "antlr4ng";

import { STGroup } from "./STGroup.js";
import { CompiledST } from "./compiler/CompiledST.js";
import { Misc } from "./misc/Misc.js";

// TODO: caching?

/**
 * A directory or directory tree full of templates and/or group files.
 *  We load files on-demand. Dir search path: current working dir then
 *  CLASSPATH (as a resource).  Do not look for templates outside of this dir
 *  subtree (except via imports).
 */
export class STGroupDir extends STGroup {
    public groupDirName: string;

    public constructor(dirName: string);
    public constructor(dirName: string, encoding: string);
    public constructor(dirName: string, delimiterStartChar: string, delimiterStopChar: string);
    public constructor(dirName: string, encoding: string, delimiterStartChar: string, delimiterStopChar: string);
    public constructor(...args: unknown[]) {
        let dirName;
        let encoding = "utf-8";
        let delimiterStartChar = "<";
        let delimiterStopChar = ">";

        switch (args.length) {
            case 1: {
                [dirName] = args as [string];

                break;
            }

            case 2: {
                [dirName, encoding] = args as [string, string];

                break;
            }

            case 3: {
                [dirName, delimiterStartChar, delimiterStopChar] = args as [string, string, string];

                break;
            }

            case 4: {
                [dirName, encoding, delimiterStartChar, delimiterStopChar] = args as [string, string, string, string];

                break;
            }

            default: {
                throw new Error("Invalid number of arguments");
            }
        }

        super(delimiterStartChar, delimiterStopChar);

        this.encoding = encoding;
        this.groupDirName = dirName;
        const stat = fs.statSync(dirName);
        if (stat.isDirectory()) {
            // we found the directory and it'll be file based
            if (STGroupDir.verbose) {
                console.log("STGroupDir(" + dirName + ") found");
            }

        } else {
            throw new Error("No such directory: " + dirName);
        }
    }

    public override importTemplates(g: STGroup): void;
    public override importTemplates(fileNameToken: Token): void;
    public override importTemplates(g: STGroup, clearOnUnload: boolean): void;
    public override importTemplates(...args: unknown[]): void {
        if (args.length === 1 && !(args[0] instanceof STGroup)) {
            const fileNameToken = args[0] as Token;
            const msg =
                "import illegal in group files embedded in STGroupDirs; " +
                "import " + fileNameToken.text + " in STGroupDir " + this.getName();
            throw new Error(msg);
        }

        super.importTemplates.apply(args);
    }

    /**
     * Load .st as relative file name relative to root by {@code prefix}.
     */
    public override loadTemplateFile(prefix: string, unqualifiedFileName: string): CompiledST | undefined {
        if (STGroupDir.verbose) {
            console.log("loadTemplateFile(" + unqualifiedFileName + ") in group dir " +
                "from " + this.groupDirName + " prefix=" + prefix);
        }

        const fullPath = path.join(this.groupDirName, prefix, unqualifiedFileName);
        const content = fs.readFileSync(fullPath, this.encoding as BufferEncoding);
        const stream = CharStreams.fromString(content);
        stream.name = unqualifiedFileName;

        return super.loadTemplateFile(prefix, unqualifiedFileName, stream);
    }

    public override  getName(): string {
        return this.groupDirName;
    }

    public override  getFileName(): string {
        return this.groupDirName;
    }

    public override load(): void;
    /**
     * Load a template from directory or group file.  Group file is given
     *  precedence over directory with same name. {@code name} is always fully-qualified.
     * @param name
     */
    public override load(name: string): CompiledST | undefined;
    public override load(name?: string): CompiledST | undefined {
        if (!name) {
            super.load();

            return;
        }

        if (STGroupDir.verbose) {
            console.log("STGroupDir.loa(" + name + ")");
        }

        const parent = path.dirname(name); // must have parent; it's fully-qualified
        const prefix = Misc.getPrefix(name);
        const groupFile = path.join(this.groupDirName, parent + STGroupDir.GROUP_FILE_EXTENSION);

        // try as file then as group
        const stat = fs.statSync(groupFile);
        if (stat.isFile()) {
            this.loadGroupFile(prefix, groupFile);

            return this.rawGetTemplate(name);
        }

        // must not be in a group file
        const unqualifiedName = Misc.getFileName(name);

        return this.loadTemplateFile(prefix, unqualifiedName + STGroupDir.TEMPLATE_FILE_EXTENSION);
    }

    protected override importGroupDir(dirName: string): STGroup | undefined {
        return new STGroupDir(dirName, this.encoding, this.delimiterStartChar, this.delimiterStopChar);

    }
}
