/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { ICompiledST, IST, ISTGroup } from "./common.js";

/**
 * Factory methods to create new objects of specific types.
 * These come usually as pairs: one setter for the factory method and the factory method itself.
 * This allows to separate object creation and consumption, which often leads to circular dependencies.
 */

type StringTemplateFactory = (group: ISTGroup, impl?: ICompiledST) => IST;

let stFactory: StringTemplateFactory;

export const setStringTemplateFactory = (factory: StringTemplateFactory): void => {
    stFactory = factory;
};

export const createStringTemplate = (group: ISTGroup, impl?: ICompiledST): IST => {
    return stFactory(group, impl);
};

type StringTemplateCloner = (prototype?: IST) => IST;

let stCloner: StringTemplateCloner;

export const setStringTemplateCloner = (cloner: StringTemplateCloner): void => {
    stCloner = cloner;
};

export const cloneStringTemplate = (prototype?: IST): IST => {
    return stCloner(prototype);
};
