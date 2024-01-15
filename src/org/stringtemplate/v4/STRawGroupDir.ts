/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { CharStream, CommonToken } from "antlr4ng";

import { ICompiledST } from "./compiler/common.js";

import { STGroupDir } from "./STGroupDir.js";
import { STLexer } from "./compiler/STLexer.js";
import { Misc } from "./misc/Misc.js";
import { Compiler } from "./compiler/Compiler.js";

/**
 * A directory of templates without headers like ST v3 had.  Still allows group
 * files in directory though like {@link STGroupDir} parent.
 */
export class STRawGroupDir extends STGroupDir {
    protected override doLoadTemplateFile(prefix: string, unqualifiedFileName: string,
        templateStream: CharStream): ICompiledST | undefined {
        const template = templateStream.getText(0, templateStream.size - 1);
        const templateName = Misc.getFileNameNoSuffix(unqualifiedFileName);
        const fullyQualifiedTemplateName = prefix + templateName;

        const impl = new Compiler(this).compile({ srcName: fullyQualifiedTemplateName, template });

        // Seems like a hack, best I could come up with.
        const nameT = new CommonToken([null, templateStream], STLexer.SEMI, 0, -1, -1);

        if (impl) {
            this.rawDefineTemplate(fullyQualifiedTemplateName, impl, nameT);
            impl.defineImplicitlyDefinedTemplates(this);
        }

        return impl;
    }
}
