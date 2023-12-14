/*
 * [The "BSD license"]
 *  Copyright (c) 2011 Terence Parr
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */




import { JavaObject, type int, S } from "jree";



// TODO: copied from ANTLR v4; rm when upgraded to v4
export class JTreeASTModel implements TreeModel {
    protected adaptor: TreeAdaptor;
    protected root: Object;

    public constructor(root: Object);

    public constructor(adaptor: TreeAdaptor, root: Object);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 1: {
                const [root] = args as [Object];


                super();
                this.adaptor = new CommonTreeAdaptor();
                this.root = root;


                break;
            }

            case 2: {
                const [adaptor, root] = args as [TreeAdaptor, Object];


                super();
                this.adaptor = adaptor;
                this.root = root;


                break;
            }

            default: {
                throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
            }
        }
    }


    public getChildCount(parent: Object): int {
        return this.adaptor.getChildCount(parent);
    }

    public getIndexOfChild(parent: Object, child: Object): int {
        if (parent === null) {
            return -1;
        }

        return this.adaptor.getChildIndex(child);
    }

    public getChild(parent: Object, index: int): Object {
        return this.adaptor.getChild(parent, index);
    }

    public isLeaf(node: Object): boolean {
        return this.getChildCount(node) === 0;
    }

    public getRoot(): Object { return this.root; }

    public valueForPathChanged(treePath: TreePath, o: Object): void {
    }

    public addTreeModelListener(treeModelListener: TreeModelListener): void {
    }

    public removeTreeModelListener(treeModelListener: TreeModelListener): void {
    }
}
