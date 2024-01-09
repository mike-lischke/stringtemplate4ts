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
import { TestTemplateNames } from "./org/stringtemplate/v4/test/TestTemplateNames.js";
import { TestTokensForDollarDelimiters } from "./org/stringtemplate/v4/test/TestTokensForDollarDelimiters.js";

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

describe("TestTemplateNames", () => {
    const testNG = new TestNG();
    testNG.run(TestTemplateNames);
});

describe("TestTokensForDollarDelimiters", () => {
    const testNG = new TestNG();
    testNG.run(TestTokensForDollarDelimiters);
});
