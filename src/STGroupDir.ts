/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/* eslint-disable jsdoc/require-returns, jsdoc/require-param */

import * as fs from "fs";
import * as path from "path";

import { CharStream, Token } from "antlr4ng";

import { STGroup } from "./STGroup.js";
import { Misc } from "./misc/Misc.js";
import { ICompiledST, ISTGroup } from "./compiler/common.js";
import { Factories } from "./compiler/factories.js";

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

        super.importTemplates.apply(this, args);
    }

    /**
     * Load .st as relative file name relative to root by {@code prefix}.
     */
    public override loadTemplateFile(prefix: string, unqualifiedFileName: string): ICompiledST | undefined {
        if (STGroupDir.verbose) {
            console.log("loadTemplateFile(" + unqualifiedFileName + ") in group dir " +
                "from " + this.groupDirName + " prefix=" + prefix);
        }

        const fullPath = path.join(this.groupDirName, prefix, unqualifiedFileName);

        let content;
        try {
            content = fs.readFileSync(fullPath, this.encoding as BufferEncoding);
        } catch {
            return undefined;
        }

        const stream = CharStream.fromString(content);
        stream.name = unqualifiedFileName;

        return this.doLoadTemplateFile(prefix, unqualifiedFileName, stream);
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
    public override load(name: string): ICompiledST | undefined | null;
    public override load(name?: string): ICompiledST | undefined | null | void {
        if (!name) {
            super.load();

            return;
        }

        if (STGroupDir.verbose) {
            console.log("STGroupDir.load(" + name + ")");
        }

        const parent = Misc.getParent(name); // must have parent; it's fully-qualified
        const prefix = Misc.getPrefix(name);

        // see if parent of template name is a group file
        const groupFile = path.join(this.groupDirName, parent + STGroupDir.GROUP_FILE_EXTENSION);
        if (fs.existsSync(groupFile)) {
            this.loadGroupFile(prefix, groupFile);

            return this.rawGetTemplate(name);
        }

        // must not be in a group file
        const unqualifiedName = Misc.getFileName(name);

        return this.loadTemplateFile(prefix, unqualifiedName + STGroupDir.TEMPLATE_FILE_EXTENSION);
    }

    /** Separated call to allow overriding it in derived classes. */
    protected doLoadTemplateFile(prefix: string, unqualifiedFileName: string,
        templateStream: CharStream): ICompiledST | undefined {
        return super.loadTemplateFile(prefix, unqualifiedFileName, templateStream);
    }

    static {
        Factories.createStringTemplateGroupDir = (dirName: string, encoding?: string, delimiterStartChar?: string,
            delimiterStopChar?: string): ISTGroup => {
            if (!encoding) {
                return new STGroupDir(dirName);
            }

            if (!delimiterStartChar) {
                return new STGroupDir(dirName, encoding);
            }

            return new STGroupDir(dirName, encoding, delimiterStartChar, delimiterStopChar!);
        };
    }
}
