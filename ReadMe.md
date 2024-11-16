[![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/mike-lischke/stringtemplate4ts/nodejs.yml?style=for-the-badge&logo=github)](https://github.com/mike-lischke/stringtemplate4ts/actions/workflows/nodejs.yml)
[![Weekly Downloads](https://img.shields.io/npm/dw/stringtemplate4ts?style=for-the-badge&color=blue)](https://www.npmjs.com/package/stringtemplate4ts)
[![npm version](https://img.shields.io/npm/v/stringtemplate4ts?style=for-the-badge&color=yellow)](https://www.npmjs.com/package/stringtemplate4ts)

# Introduction

This repository contains a TypeScript port of the StringTemplate 4 template engine. It's released under the BSD license, like the original code, plus some additional code, which is released under the MIT license. These are:

- Testing infrastructure code (decorators, JUnit wrappers, configuration and spec files)
- A MurmurHash implementation used by the HashMap class.
- The HashMap class.

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

### 1.0.3

- Fixed a bug where members of model objects, which are themselves object were not accessible in templates. Added a test case for that.

### 1.0.2

- Upgraded dependencies to latest versions.
- Added export for common interfaces.

### 1.0.0 - 1.0.1

- Initial release.
- Changed build structure to include both CommonJS and ES6 modules.
