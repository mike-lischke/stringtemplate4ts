[![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/mike-lischke/stringtemplate4ts/nodejs.yml?style=for-the-badge&logo=github)](https://github.com/mike-lischke/stringtemplate4ts/actions/workflows/nodejs.yml)
[![Weekly Downloads](https://img.shields.io/npm/dw/stringtemplate4ts?style=for-the-badge&color=blue)](https://www.npmjs.com/package/stringtemplate4ts)
[![npm version](https://img.shields.io/npm/v/stringtemplate4ts?style=for-the-badge&color=yellow)](https://www.npmjs.com/package/stringtemplate4ts)

# Introduction

This repository contains a TypeScript port of the StringTemplate 4 template engine. It's released under the BSD license, like the original code, plus some additional code, which is released under the MIT license. These are:

- Testing infrastructure code (decorators, JUnit wrappers, configuration and spec files)
- A MurmurHash implementation used by the HashMap class.
- The HashMap class.

> **Note: Breaking Change**
> Starting with version 2.0 the package no longer depends on any Node.js support. Instead it's now ready to be used also in browser environments. To make this possible the Node.js fs module was replaced by [memfs](https://github.com/streamich/memfs), an in-memory file system.
> 
> You can still use the package like before, with the exception that all group files have to be provided in memfs now. Read more below in the "How To Use" section.

ST4TS (StringTemplate4TypeScript) is a template engine for generating source code, web pages, emails, or any other formatted text output. ST4TS is particularly good at multi-targeted code generators, multiple site skins, and internationalization/localization.

The main website for the original ST implementation is:

> https://www.stringtemplate.org

Its distinguishing characteristic is that it strictly enforces
model-view separation, unlike other engines. See [this document](./doc/mvc.templates.pdf)

The documentation is [here](./doc/index.md)

Per the BSD license in [LICENSE.txt](LICENSE.txt), this software is not guaranteed to work and might even destroy all life on this planet.

## Known Differences

The port closely resembles the original. Luckily, Java and TypeScript share many similarities, allowing for the implementation of even esoteric language features such as runtime method access and invocation using string names (also known as reflection). However, there are a few differences, which are listed below:

- Importing modules is different in both languages and can be challenging when dealing with circular dependencies. To avoid these dependencies, interfaces and factory methods have been defined for certain classes that refer to each other. This should not impose any restrictions for normal usage.
- Formatting numbers with arbitrary format strings and locale support is not available. We can either have locale aware formatting using the standard `toLocaleString` method or we can have a custom format string pattern, not both. I decided for the latter (which uses the `fast-printf` library). Once I have found a library which supports both (such as `luxon` for date and time), this can be improved.

## Installation

Run

```bash
npm i stringtemplate4ts
```

Or use your preferred package manager.

## How to Use

ST4TS works with template (`*.st`) and template group (`*.stg`) files. These files can import other files, which makes it necessary to provide a file system from which the automatic import can be performed. In Java the library directly accessed the real file system, which is not desirable in a web environment. Instead [memfs](https://github.com/streamich/memfs) comes into play. You can use it just like you use a disk based file system. The only difference is that you first have to transfer your group files to memfs under any path you like (which you then pass on to the ST4TS classes).

There's a way to use the [native filesystem](https://github.com/streamich/memfs/blob/master/docs/node/index.md) with memfs, if you still want that.

Other than that there's no difference in usage. For example the test cases still look the same as before. Here's one example:

```typescript
    @Test
    public testSimpleAdaptor(): void {
        const templates = "foo(x) ::= \"<x.id>: <x.name>\"\n";
        TestModelAdaptors.writeFile(this.tmpdir, "foo.stg", templates);
        const group = new STGroupFile(this.tmpdir + "/foo.stg");
        group.registerModelAdaptor(BaseTest.User, new TestModelAdaptors.UserAdaptor());
        const st = group.getInstanceOf("foo");
        st?.add("x", new BaseTest.User(100, "parrt"));
        const expecting = "100: parrt";
        const result = st?.render();
        assertEquals(expecting, result);
    }
```

simply because they already generate all files manually. The function used to write the file is this:

```typescript
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

```

The general approach, however, is to prime memfs with the files you want it to work with. Here's an example from the [memfs documentation](https://github.com/streamich/memfs/blob/master/docs/node/usage.md):

```typescript
import { fs, vol } from 'memfs';

const json = {
  './README.md': '1',
  './src/index.js': '2',
  './node_modules/debug/index.js': '3',
};
vol.fromJSON(json, '/app');

fs.readFileSync('/app/README.md', 'utf8'); // 1
vol.readFileSync('/app/src/index.js', 'utf8'); // 2
```

This allows to get the template files from anywhere (file system, fetch, HTML input fields, source code etc.).

## Building from Source

The source is at github.com:

> https://github.com/mike-lischke/stringtemplate4ts

Check the repository out and run

```bash
npm run build
```

in the project root.

## Running Unit Tests

Running the tests is equally simple. Just do:

```bash
npm run test
```

in the project root.

## Release Notes

### 2.0.0

The library no longer needs Node.js to run. Instead it uses the in-memory file system memfs.

### 1.0.9

Also switched 3rd party deps that depended on antlr4ng-cli.

### 1.0.8

Switched from antlr4ng-cli to antlr-ng.

### 1.0.7

- The if<> check in Interpreter did not correctly handle maps and sets. Added a test case for the fix.
- Renderer registration did not default the parameter "recursive" to true, causing rendering problems in nested templates, if this parameter isn't specified.

### 1.0.6

- Updated 3rd party packages.

### 1.0.5

- Property names for map model objects can be anything, including numbers or null. Using a general falsification test might wrongly reject them.

### 1.0.4

- Bug fix for HashMap. It used get() to determine if a key exists (which returns the value instead).

### 1.0.3

- Fixed a bug where members of model objects, which are themselves object were not accessible in templates. Added a test case for that.

### 1.0.2

- Upgraded dependencies to latest versions.
- Added export for common interfaces.

### 1.0.0 - 1.0.1

- Initial release.
- Changed build structure to include both CommonJS and ES6 modules.
