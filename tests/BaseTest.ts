/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

// cspell: disable

import path from "path";
import os from "os";
import { existsSync, mkdirSync, rmSync, statSync, unlinkSync, writeFileSync } from "fs";

import { CharStreams, CommonToken, CommonTokenStream, Token } from "antlr4ng";

import { Compiler, ST, STGroup, STLexer } from "../src/index.js";
import { AfterEach, BeforeEach } from "./decorators.js";

export abstract class BaseTest {
    public static readonly pathSep = path.delimiter;

    public static User = class User {
        public id: number;
        public name: string;
        public constructor(id: number, name: string) {
            this.id = id; this.name = name;
        }
        public isManager(): boolean { return true; }
        public hasParkingSpot(): boolean { return true; }
        public getName(): string { return this.name; }
    };

    public static HashableUser = class HashableUser extends BaseTest.User {
        public constructor(id: number, name: string) { super(id, name); }

        public hashCode(): number {
            return this.id;
        }

        public equals(o: unknown): boolean {
            if (o instanceof HashableUser) {
                const hu = o;

                return this.id === hu.id && this.name === hu.name;
            }

            return false;
        }
    };

    #tmpdir = ""; // Set in `setUp()`.

    public static writeFile(dir: string, fileName: string, content: string): void {
        try {
            const f = path.join(dir, fileName);
            const realDir = path.dirname(f); // fileName can contain subdirectories.
            if (!existsSync(realDir)) {
                mkdirSync(realDir, { recursive: true });
            }

            writeFileSync(f, content);
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
        if (!existsSync(file)) {
            return;
        }

        const stat = statSync(file);
        if (stat.isDirectory()) {
            rmSync(file, { recursive: true, force: true });
        } else {
            unlinkSync(file);
        }
    }

    public get tmpdir(): string {
        return this.#tmpdir;
    }

    @BeforeEach
    public setUp(): void {
        STGroup.defaultGroup = new STGroup();
        Compiler.subtemplateCount = 0;

        const baseTestDirectory = os.tmpdir();
        const testDirectory = this.constructor.name + "-" + new Date().getMilliseconds();
        this.#tmpdir = path.resolve(baseTestDirectory, testDirectory);
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

    /*    public java(mainClassName: string, extraCLASSPATH: string, workingDirName: string): string {
            let classpathOption = "-classpath";

            let path = "." + BaseTest.pathSep + BaseTest.CLASSPATH;
            if (extraCLASSPATH !== null) {
                path = "." + BaseTest.pathSep + extraCLASSPATH + BaseTest.pathSep + BaseTest.CLASSPATH;
            }

            let args = [
                "java",
                classpathOption, path,
                mainClassName
            ];
            System.out.println("executing: " + Arrays.toString(args));
            return this.exec(args, null, workingDirName);
        }

        public jar(fileName: string, files: string[], workingDirName: string): void {
            let workingDir = new File(workingDirName);
            let stream = new JarOutputStream(new FileOutputStream(new File(workingDir, fileName)));
            try {
                for (let inputFileName of files) {
                    let file = new File(workingDirName, inputFileName);
                    this.addJarFile(file, workingDir, stream);
                }
            }
            finally {
                stream.close();
            }
        }

        public exec(args: string[], envp: string[], workingDirName: string): string {
            let cmdLine = args.join(" ");

            let process = Runtime.getRuntime().exec(args, envp, workingDir);
            let stdout = new BaseTest.StreamVacuum(process.getInputStream());
            let stderr = new BaseTest.StreamVacuum(process.getErrorStream());
            stdout.start();
            stderr.start();
            process.waitFor();
            stdout.join();
            stderr.join();
            if (stdout.toString().length() > 0) {
                return stdout.toString();
            }
            if (stderr.toString().length() > 0) {
                System.err.println("compile stderr from: " + cmdLine);
                System.err.println(stderr);
            }
            let ret = process.exitValue();
            if (ret !== 0) {
                System.err.println("failed");
            }

            return null;
        }*/

    public checkTokens(template: string, expected: string, delimiterStartChar?: string,
        delimiterStopChar?: string): void {
        delimiterStartChar ??= "<";
        delimiterStopChar ??= ">";

        const lexer = new STLexer(STGroup.DEFAULT_ERR_MGR, CharStreams.fromString(template), undefined,
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
        const randomDir = path.join(this.#tmpdir, "dir" + Math.trunc(Math.random() * 100000));
        mkdirSync(randomDir, { recursive: true });

        return randomDir;
    }

    /*
            protected addJarFile(file: File, workingDir: File, stream: JarOutputStream): void {
                let name = workingDir.toURI().relativize(file.toURI()).getPath().replace("\\", "/");
                if (file.isDirectory()) {
                    if (!name.isEmpty()) {
                        if (!name.endsWith("/")) {
                            // the entry for a folder must end with "/"
                            name += "/";
                        }

                        let entry = new JarEntry(name);
                        entry.setTime(file.lastModified());
                        stream.putNextEntry(entry);
                        stream.closeEntry();
                    }

                    for (let child of file.listFiles()) {
                        this.addJarFile(child, workingDir, stream);
                    }

                    return;
                }

                let entry = new JarEntry(name);
                entry.setTime(file.lastModified());
                stream.putNextEntry(entry);

                let input = new BufferedInputStream(new FileInputStream(file));
                try {
                    let buffer = new Int8Array(16 * 1024);
                    while (true) {
                        let count = input.read(buffer);
                        if (count === -1) {
                            break;
                        }

                        stream.write(buffer, 0, count);
                    }

                    stream.closeEntry();
                }
                finally {
                    input.close();
                }
            }

            protected compile(fileName: string, workingDirName: string): void {
                let files = new Array<File>();
                files.add(new File(workingDirName, fileName));

                let compiler = java.util.spi.ToolProvider.getSystemJavaCompiler();

                let fileManager =
                    compiler.getStandardFileManager(null, null, null);

                let compilationUnits =
                    fileManager.getJavaFileObjectsFromFiles(files);

                let compileOptions =
                    Arrays.asList("-g", "-source", "1.6", "-target", "1.6", "-implicit:class", "-Xlint:-options", "-d",
                    workingDirName, "-cp", workingDirName + BaseTest.pathSep + BaseTest.CLASSPATH);

                let task =
                    compiler.getTask(null, fileManager, null, compileOptions, null,
                        compilationUnits);
                let ok = task.call();

                try {
                    fileManager.close();
                } catch (ioe) {
                    if (ioe instanceof IOException) {
                        ioe.printStackTrace(System.err);
                    } else {
                        throw ioe;
                    }
                }

                assertTrue(ok);
            }
        */

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace BaseTest {
    export type User = InstanceType<typeof BaseTest.User>;
    export type HashableUser = InstanceType<typeof BaseTest.HashableUser>;
}
