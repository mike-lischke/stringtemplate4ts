[![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/mike-lischke/stringtemplate4-ts/nodejs.yml?style=for-the-badge&logo=github)](https://github.com/mike-lischke/stringtemplate4-ts/actions/workflows/nodejs.yml)

# Introduction

This repository contains a TypeScript port of the StringTemplate 4 template engine. It's released under the BSD license, like the original code, plus some additional code, which is released under the MIT license. These are:

- Testing infrastructure code (decorators, JUnit wrappers, configuration and spec files)
- A MurmurHash implementation used by the HashMap class.
- The HashMap class. 

ST4TS (StringTemplate4TypeScript) is a template engine for generating source code, web pages, emails, or any other formatted text output. ST4TS is particularly good at multi-targeted code generators, multiple site skins, and internationalisation/localisation.

The main website for the original ST implementation is:

> https://www.stringtemplate.org

Its distinguishing characteristic is that it strictly enforces
model-view separation, unlike other engines. See [this document](./doc/mvc.templates.pdf)

The documentation is [here](./doc/index.md)

Per the BSD license in [LICENSE.txt](LICENSE.txt), this software is not guaranteed to work and might even destroy all life on this planet.

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

## Running Unit Tests

Running the tests is equally simple. Just do:

```bash
npm run test
```