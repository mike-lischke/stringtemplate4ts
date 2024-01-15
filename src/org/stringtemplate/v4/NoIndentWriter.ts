/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { AutoIndentWriter } from "./AutoIndentWriter.js";
import { Writer } from "./support/Writer.js";

/** Just pass through the text. */
export class NoIndentWriter extends AutoIndentWriter {
    public constructor(out: Writer) {
        super(out);
    }

    public override  write(str: string): number {
        this.out.write(str);

        return str.length;
    }
}
