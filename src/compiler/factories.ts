/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { ICompiledST, IST, ISTGroup } from "./common.js";

/**
 * Factory methods to create new objects of specific types.
 * This allows to separate object creation and consumption, which often leads to circular dependencies.
 */

export class Factories {
    public static createStringTemplate?: (group: ISTGroup, impl?: ICompiledST) => IST;
    public static cloneStringTemplate?: (prototype?: IST) => IST;
    public static createStringTemplateGroupFile?: (dirName: string, encoding?: string, delimiterStartChar?: string,
        delimiterStopChar?: string) => ISTGroup;
    public static createStringTemplateGroupDir?: (dirName: string, encoding?: string, delimiterStartChar?: string,
        delimiterStopChar?: string) => ISTGroup;
}
