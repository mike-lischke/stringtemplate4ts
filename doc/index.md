# StringTemplate 4 Documentation

Please ask questions about StringTemplate in general on StackOverflow or in the StringTemplate-discussion list. For specific question about the TypeScript implementation of the ST library use the issue tracker or the discussions of the repository on Github.

## Installation

Get the Node.js package with the usual command:

```bash
npm i stringtemplate4ts
```

in your project folder.

> Note: This TypeScript port uses semantic versioning, independent of the original Code, and hence starts with version `1.0.0` instead of `4.3.3` (the version of Java ST4, at the time of writing this).

## Introductory material

* [Introduction](introduction.md)
* [StringTemplate cheat sheet](cheatsheet.md)
* [Motivation and philosophy](motivation.md)

## Groups

* [Group file syntax](groups.md)
* [Group inheritance](inheritance.md)
* [Template regions](regions.md)

## Templates

* [Literals](templates.md#literals)
* [Expressions](templates.md#expressions)
* [Template includes](templates.md#includes)
* [Expression options](expr-options.md)
* [Conditionals](templates.md#conditionals)
* [Anonymous templates](templates.md#subtemplates)
* [Map operations](templates.md#map)
* [Functions](templates.md#functions)
* [Lazy evaluation](templates.md#lazy)
* [Missing and null attribute evaluation](null-vs-empty.md)

## Whitespace and formatting

* [Auto-indentation](indent.md)
* [Automatic line wrapping](wrapping.md)

## Customizing StringTemplate behavior

* [Error listeners](listeners.md)
* [Renderers](renderers.md)
* [Model adaptors](adaptors.md)

## Misc

* [Template to Bytecode mapping](bytecode.md)
