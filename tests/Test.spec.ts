/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { TestNG } from "./TestNG.js";
import { TestAggregates } from "./org/stringtemplate/v4/test/TestAggregates.js";
import { TestAttributes } from "./org/stringtemplate/v4/test/TestAttributes.js";
import { TestBuggyDefaultValueRaisesNPETest } from "./org/stringtemplate/v4/test/TestBuggyDefaultValueRaisesNPETest.js";
import { TestCompiler } from "./org/stringtemplate/v4/test/TestCompiler.js";
import { TestCoreBasics } from "./org/stringtemplate/v4/test/TestCoreBasics.js";
import { TestDebugEvents } from "./org/stringtemplate/v4/test/TestDebugEvents.js";
import { TestDictionaries } from "./org/stringtemplate/v4/test/TestDictionaries.js";
import { TestDollarDelimiters } from "./org/stringtemplate/v4/test/TestDollarDelimiters.js";
import { TestEarlyEvaluation } from "./org/stringtemplate/v4/test/TestEarlyEvaluation.js";
import { TestFunctions } from "./org/stringtemplate/v4/test/TestFunctions.js";
import { TestGroupSyntax } from "./org/stringtemplate/v4/test/TestGroupSyntax.js";
import { TestGroupSyntaxErrors } from "./org/stringtemplate/v4/test/TestGroupSyntaxErrors.js";
import { TestGroups } from "./org/stringtemplate/v4/test/TestGroups.js";
import { TestImports } from "./org/stringtemplate/v4/test/TestImports.js";
import { TestIndentation } from "./org/stringtemplate/v4/test/TestIndentation.js";
import { TestIndirectionAndEarlyEval } from "./org/stringtemplate/v4/test/TestIndirectionAndEarlyEval.js";
import { TestInterptimeErrors } from "./org/stringtemplate/v4/test/TestInterptimeErrors.js";
import { TestLexer } from "./org/stringtemplate/v4/test/TestLexer.js";
import { TestLineWrap } from "./org/stringtemplate/v4/test/TestLineWrap.js";
import { TestLists } from "./org/stringtemplate/v4/test/TestLists.js";
import { TestModelAdaptors } from "./org/stringtemplate/v4/test/TestModelAdaptors.js";
import { TestNoNewlineTemplates } from "./org/stringtemplate/v4/test/TestNoNewlineTemplates.js";
import { TestNullAndEmptyValues } from "./org/stringtemplate/v4/test/TestNullAndEmptyValues.js";
import { TestOptions } from "./org/stringtemplate/v4/test/TestOptions.js";
import { TestRegions } from "./org/stringtemplate/v4/test/TestRegions.js";
import { TestRenderers } from "./org/stringtemplate/v4/test/TestRenderers.js";
import { TestSTRawGroupDir } from "./org/stringtemplate/v4/test/TestSTRawGroupDir.js";
import { TestScopes } from "./org/stringtemplate/v4/test/TestScopes.js";
import { TestSubtemplates } from "./org/stringtemplate/v4/test/TestSubtemplates.js";
import { TestSyntaxErrors } from "./org/stringtemplate/v4/test/TestSyntaxErrors.js";
import { TestTemplateNames } from "./org/stringtemplate/v4/test/TestTemplateNames.js";
import { TestTokensForDollarDelimiters } from "./org/stringtemplate/v4/test/TestTokensForDollarDelimiters.js";
import { TestTypeRegistry } from "./org/stringtemplate/v4/test/TestTypeRegistry.js";
import { TestWhitespace } from "./org/stringtemplate/v4/test/TestWhitespace.js";

describe("TestAggregates", () => {
    const testNG = new TestNG();
    testNG.run(TestAggregates);
});

describe("TestAttributes", () => {
    const testNG = new TestNG();
    testNG.run(TestAttributes);
});

describe("TestBuggyDefaultValueRaisesNPETest", () => {
    const testNG = new TestNG();
    testNG.run(TestBuggyDefaultValueRaisesNPETest);
});

describe("TestCompiler", () => {
    const testNG = new TestNG();
    testNG.run(TestCompiler);
});

describe("TestCoreBasics", () => {
    const testNG = new TestNG();
    testNG.run(TestCoreBasics);
});

describe("TestDebugEvents", () => {
    const testNG = new TestNG();
    testNG.run(TestDebugEvents);
});

describe("TestDictionaries", () => {
    const testNG = new TestNG();
    testNG.run(TestDictionaries);
});

describe("TestDollarDelimiters", () => {
    const testNG = new TestNG();
    testNG.run(TestDollarDelimiters);
});

describe("TestEarlyEvaluation", () => {
    const testNG = new TestNG();
    testNG.run(TestEarlyEvaluation);
});

describe("TestFunctions", () => {
    const testNG = new TestNG();
    testNG.run(TestFunctions);
});

describe("TestGroups", () => {
    const testNG = new TestNG();
    testNG.run(TestGroups);
});

describe("TestGroupSyntax", () => {
    const testNG = new TestNG();
    testNG.run(TestGroupSyntax);
});

describe("TestGroupSyntaxErrors", () => {
    const testNG = new TestNG();
    testNG.run(TestGroupSyntaxErrors);
});

describe("TestImports", () => {
    const testNG = new TestNG();
    testNG.run(TestImports);
});

describe("TestIndentation", () => {
    const testNG = new TestNG();
    testNG.run(TestIndentation);
});

describe("TestIndirectionAndEarlyEval", () => {
    const testNG = new TestNG();
    testNG.run(TestIndirectionAndEarlyEval);
});

describe("TestInterptimeErrors", () => {
    const testNG = new TestNG();
    testNG.run(TestInterptimeErrors);
});

describe("TestLexer", () => {
    const testNG = new TestNG();
    testNG.run(TestLexer);
});

describe("TestLineWrap", () => {
    const testNG = new TestNG();
    testNG.run(TestLineWrap);
});

describe("TestLists", () => {
    const testNG = new TestNG();
    testNG.run(TestLists);
});

describe("TestModelAdaptors", () => {
    const testNG = new TestNG();
    testNG.run(TestModelAdaptors);
});

describe("TestNoNewlineTemplates", () => {
    const testNG = new TestNG();
    testNG.run(TestNoNewlineTemplates);
});

describe("TestNullAndEmptyValues", () => {
    const testNG = new TestNG();
    testNG.run(TestNullAndEmptyValues);
});

describe("TestOptions", () => {
    const testNG = new TestNG();
    testNG.run(TestOptions);
});

describe("TestRegions", () => {
    const testNG = new TestNG();
    testNG.run(TestRegions);
});

describe("TestRenderers", () => {
    const testNG = new TestNG();
    testNG.run(TestRenderers);
});

describe("TestScopes", () => {
    const testNG = new TestNG();
    testNG.run(TestScopes);
});

describe("TestSTRawGroupDir", () => {
    const testNG = new TestNG();
    testNG.run(TestSTRawGroupDir);
});

describe("TestSubtemplates", () => {
    const testNG = new TestNG();
    testNG.run(TestSubtemplates);
});

describe("TestSyntaxErrors", () => {
    const testNG = new TestNG();
    testNG.run(TestSyntaxErrors);
});

describe("TestTemplateNames", () => {
    const testNG = new TestNG();
    testNG.run(TestTemplateNames);
});

describe("TestTokensForDollarDelimiters", () => {
    const testNG = new TestNG();
    testNG.run(TestTokensForDollarDelimiters);
});

describe("TestTypeRegistry", () => {
    const testNG = new TestNG();
    testNG.run(TestTypeRegistry);
});

describe("TestWhitespace", () => {
    const testNG = new TestNG();
    testNG.run(TestWhitespace);
});
