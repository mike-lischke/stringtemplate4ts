/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { TestNG } from "./TestNG.js";
import { TestAggregates } from "./org/stringtemplate/v4/test/TestAggregates.js";

describe("TestAggregates", () => {
    const testNG = new TestNG();
    testNG.run(TestAggregates);
});
