/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information./index
 */

import { TestException } from "./TestException.js";

export type Constructor<T> = (new () => T);
export type TestFunction = Function & { isTest: boolean; };

interface IPropertyDescriptorParams {
    isTest?: boolean;
    description?: string;
    dataProvider?: string;
    expectedExceptions?: Array<typeof Error>;
    enabled?: boolean;
    timeout?: number;

    isBeforeAll?: boolean;
    isAfterAll?: boolean;
}

/**
 * @returns All property descriptors for the given target, including those from the prototype chain.
 *
 * @param target The target to get the property descriptors for.
 */
const getAllPropertyDescriptors = (target: unknown): PropertyDescriptorMap => {
    let descriptors: PropertyDescriptorMap = {};
    while (target != null) {
        descriptors = { ...Object.getOwnPropertyDescriptors(target), ...descriptors };
        target = Object.getPrototypeOf(target);
    }

    return descriptors;
};

/**
 * This class is the main entry point for running tests similar like in the TestNG framework.
 * It either runs a static `main` method in the given class or it runs all methods marked with the @Test decorator
 * in the given class. The class must have a constructor with no parameters.
 */
export class TestNG {
    public run<T>(testClass: Constructor<T>, params: unknown[] = []): void {
        // Get all properties of the given class.
        const descriptors = getAllPropertyDescriptors(testClass.prototype);

        // Check if there is a static main method. If so, call it to start the tests.
        if ("constructor" in descriptors && "value" in descriptors.constructor) {
            const constructor = descriptors.constructor.value as Function;
            if ("main" in constructor) {
                const main = constructor.main as Function;
                describe("main", () => {
                    main(params);
                });

                return;
            }
        }

        const instance = new testClass();
        let beforeAll: TestFunction | undefined;
        let afterAll: TestFunction | undefined;

        const testMethods = Object.entries(descriptors).filter(([, descriptor]) => {
            const value = descriptor.value as IPropertyDescriptorParams;
            if (value?.isBeforeAll) {
                beforeAll = descriptor.value as TestFunction;

                return false;
            }

            if (value?.isAfterAll) {
                afterAll = descriptor.value as TestFunction;

                return false;
            }

            return value?.isTest;
        });

        if (beforeAll) {
            // This adds a beforeAll hook to the current test case.
            beforeAll.call(instance);
        }

        if (afterAll) {
            afterAll.call(instance);
        }

        testMethods.forEach(([entry, descriptor]) => {
            try {
                const method = descriptor.value as TestFunction;
                if (method.isTest) {
                    method.call(instance);
                }
            } catch (error) {
                if (error instanceof TestException) {
                    // Unfold the test exception to get to the real cause.
                    const cause = error.cause;
                    if (cause) {
                        throw cause;
                    }

                    throw error;
                } else {
                    throw error;
                }
            }
        });
    }
}
