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




import { java, JavaObject, type int } from "jree";
import { InstanceScope } from "../InstanceScope.js";
import { Interpreter } from "../Interpreter.js";
import { ST } from "../ST.js";
import { StringRenderer } from "../StringRenderer.js";
import { AddAttributeEvent } from "../debug/AddAttributeEvent.js";



/** From a scope, get stack of enclosing scopes in order from root down
 *  to scope.  Then show each scope's (ST's) attributes as children.
 */
export class JTreeScopeStackModel implements TreeModel {

    public static StringTree = class StringTree extends CommonTree {
        protected text: string;
        public constructor(text: string) {
            super();
            this.text = text;
        }

        public isNil(): boolean {
            return this.text === null;
        }

        public toString(): string {
            if (!this.isNil()) {
                return this.text;
            }

            return "nil";
        }
    };

    protected root: CommonTree;

    public constructor(scope: InstanceScope) {
        super();
        this.root = new JTreeScopeStackModel.StringTree("Scope stack:");
        let names = new java.util.HashSet<string>();
        let stack = Interpreter.getScopeStack(scope, false);
        for (let s of stack) {
            let templateNode = new JTreeScopeStackModel.StringTree(s.st.getName());
            this.root.insertChild(0, templateNode);
            this.addAttributeDescriptions(s.st, templateNode, names);
        }
        //System.out.println(root.toStringTree());
    }

    public addAttributeDescriptions(st: ST, node: JTreeScopeStackModel.StringTree, names: java.util.Set<string>): void {
        let attrs = st.getAttributes();
        if (attrs === null) {
            return;
        }

        for (let a of attrs.keySet()) {
            let descr: string;
            if (st.debugState !== null && st.debugState.addAttrEvents !== null) {
                let events = st.debugState.addAttrEvents.get(a);
                let locations = new java.lang.StringBuilder();
                let i = 0;
                if (events !== null) {
                    for (let ae of events) {
                        if (i > 0) {
                            locations.append(", ");
                        }

                        locations.append(ae.getFileName() + ":" + ae.getLine());
                        i++;
                    }
                }
                if (locations.length() > 0) {
                    descr = a + " = " + attrs.get(a) + " @ " + locations.toString();
                }
                else {
                    descr = a + " = " + attrs.get(a);
                }
            }
            else {
                descr = a + " = " + attrs.get(a);
            }

            if (!names.add(a)) {
                let builder = new java.lang.StringBuilder();
                builder.append("<html><font color=\"gray\">");
                builder.append(StringRenderer.escapeHTML(descr));
                builder.append("</font></html>");
                descr = builder.toString();
            }

            node.addChild(new JTreeScopeStackModel.StringTree(descr));
        }
    }

    public getRoot(): Object {
        return this.root;
    }

    public getChild(parent: Object, i: int): Object {
        let t = parent as JTreeScopeStackModel.StringTree;
        return t.getChild(i);
    }

    public getChildCount(parent: Object): int {
        let t = parent as JTreeScopeStackModel.StringTree;
        return t.getChildCount();
    }

    public isLeaf(node: Object): boolean {
        return this.getChildCount(node) === 0;
    }

    public getIndexOfChild(parent: Object, child: Object): int {
        let c = child as JTreeScopeStackModel.StringTree;
        return c.getChildIndex();
    }

    public valueForPathChanged(treePath: TreePath, o: Object): void {
    }

    public addTreeModelListener(treeModelListener: TreeModelListener): void {
    }

    public removeTreeModelListener(treeModelListener: TreeModelListener): void {
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace JTreeScopeStackModel {
    export type StringTree = InstanceType<typeof JTreeScopeStackModel.StringTree>;
}
