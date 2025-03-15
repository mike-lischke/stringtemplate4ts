/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { fs } from "memfs";

import { CharStream, CommonToken, CommonTokenStream, Token } from "antlr4ng";

import { Compiler, dirname, resolve, ST, STGroup, STLexer } from "../src/index.js";
import { AfterEach, BeforeEach } from "./decorators.js";

export abstract class BaseTest {
    public static User = class User {
        public id: number;
        #name: string;
        public constructor(id: number, name: string) {
            this.id = id;
            this.#name = name;
        }
        public isManager(): boolean { return true; }
        public hasParkingSpot(): boolean { return true; }
        public getName(): string { return this.#name; }
    };

    public static HashableUser = class HashableUser extends BaseTest.User {
        public constructor(id: number, name: string) { super(id, name); }

        public hashCode(): number {
            return this.id;
        }

        public equals(o: unknown): boolean {
            if (o instanceof HashableUser) {
                const hu = o;

                return this.id === hu.id && this.getName() === hu.getName();
            }

            return false;
        }
    };

    #tmpdir = ""; // Set in `setUp()`.

    public static writeFile(dir: string, fileName: string, content: string): void {
        try {
            const f = dir + "/" + fileName;
            const realDir = dirname(f); // fileName can contain subdirectories.
            if (!fs.existsSync(realDir)) {
                fs.mkdirSync(realDir, { recursive: true });
            }

            fs.writeFileSync(f, content);
        } catch (ioe) {
            if (ioe instanceof Error) {
                console.error("can't write file " + fileName + "\n" + ioe.stack);
            } else {
                throw ioe;
            }
        }
    }

    /**
     * Removes the specified file or directory, and all subdirectories.
     *
     * Nothing if the file does not exists.
     *
     * @param file the file or directory to remove
     */
    public static deleteFile(file: string): void {
        if (!fs.existsSync(file)) {
            return;
        }

        const stat = fs.statSync(file);
        if (stat.isDirectory()) {
            fs.rmSync(file, { recursive: true, force: true });
        } else {
            fs.unlinkSync(file);
        }
    }

    public get tmpdir(): string {
        return this.#tmpdir;
    }

    @BeforeEach
    public setUp(): void {
        STGroup.defaultGroup = new STGroup();
        Compiler.subtemplateCount = 0;

        const testDirectory = this.constructor.name + "-" + new Date().getMilliseconds();
        this.#tmpdir = resolve("/tmp", testDirectory);
    };

    @AfterEach
    public shutDown(): void {
        BaseTest.deleteFile(this.#tmpdir);
    }
    /**
     * Creates a file "Test.java" in the directory dirName containing a main
     * method with content starting as given by main.
     * <p>
     * The value of a variable 'result' defined in 'main' is written to
     * System.out, followed by a newline character.</p>
     * <p>
     * The final newline character is just the '\n' character, not the
     * system specific line separator ({@link #newline}).</p>
     *
     * @param main the main method content
     * @param dirName the directory name
     */
    public writeTestFile(main: string, dirName: string): void {
        const outputFileST = new ST(
            "import org.antlr.runtime.*;\n" +
            "import org.stringtemplate.v4.*;\n" +
            "import org.stringtemplate.v4.misc.STMessage;\n" +
            "import org.antlr.runtime.tree.*;\n" +
            "import java.io.*;\n" +
            "import java.net.*;\n" +
            "\n" +
            "public class Test {\n" +
            "    public static void main(String[] args) throws Exception {\n" +
            "        final StringBuilder errors = new StringBuilder();" +
            "        STErrorListener listener = new STErrorListener() {\n" +
            "            public void compileTimeError(STMessage stMessage) { error(stMessage); }\n" +
            "            public void runTimeError(STMessage stMessage) { error(stMessage); }\n" +
            "            public void IOError(STMessage stMessage) { error(stMessage); }\n" +
            "            public void internalError(STMessage stMessage) { error(stMessage); }\n" +
            "            protected void error(STMessage stMessage) {\n" +
            "                errors.append(stMessage.toString());\n" +
            "            }\n" +
            "        };\n" +
            "        <code>\n" +
            "        System.out.println(result);\n" +
            "        if ( errors.length()>0 ) System.out.println(\"errors: \"+errors);\n" +
            "    }\n" +
            "}",
        );
        outputFileST.add("code", main);
        BaseTest.writeFile(dirName, "Test.java", outputFileST.render());
    };

    public checkTokens(template: string, expected: string, delimiterStartChar?: string,
        delimiterStopChar?: string): void {
        delimiterStartChar ??= "<";
        delimiterStopChar ??= ">";

        const lexer = new STLexer(STGroup.DEFAULT_ERR_MGR, CharStream.fromString(template), undefined,
            delimiterStartChar, delimiterStopChar);
        const tokenStream = new CommonTokenStream(lexer);
        tokenStream.fill();
        const tokens = tokenStream.getTokens() as CommonToken[];

        const entries: string[] = [];
        for (const token of tokens) {
            if (token.type !== Token.EOF) {
                entries.push(token.toString());
            }
        }
        const result = "[" + entries.join(", ") + "]";
        expect(result).toEqual(expected);
    }

    public getRandomDir(): string {
        const randomDir = this.#tmpdir + "/dir" + Math.trunc(Math.random() * 100000);
        fs.mkdirSync(randomDir, { recursive: true });

        return randomDir;
    }

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace BaseTest {
    export type User = InstanceType<typeof BaseTest.User>;
    export type HashableUser = InstanceType<typeof BaseTest.HashableUser>;
}
