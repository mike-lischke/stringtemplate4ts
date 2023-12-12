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
export  class JTreeASTModel extends JavaObject implements TreeModel {
    protected  adaptor: TreeAdaptor;
    protected  root: java.lang.Object;

    public  constructor(root: java.lang.Object);

    public  constructor(adaptor: TreeAdaptor, root: java.lang.Object);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 1: {
				const [root] = args as [java.lang.Object];


        super();
this.adaptor = new  CommonTreeAdaptor();
        this.root = root;
    

				break;
			}

			case 2: {
				const [adaptor, root] = args as [TreeAdaptor, java.lang.Object];


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


    @Override
public  getChildCount(parent: java.lang.Object):  int {
        return this.adaptor.getChildCount(parent);
    }

    @Override
public  getIndexOfChild(parent: java.lang.Object, child: java.lang.Object):  int{
        if ( parent===null ) {
 return -1;
}

        return this.adaptor.getChildIndex(child);
    }

    @Override
public  getChild(parent: java.lang.Object, index: int):  java.lang.Object{
        return this.adaptor.getChild(parent, index);
    }

    @Override
public  isLeaf(node: java.lang.Object):  boolean {
        return this.getChildCount(node)===0;
    }

    @Override
public  getRoot():  java.lang.Object { return this.root; }

    @Override
public  valueForPathChanged(treePath: TreePath, o: java.lang.Object):  void {
    }

    @Override
public  addTreeModelListener(treeModelListener: TreeModelListener):  void {
    }

    @Override
public  removeTreeModelListener(treeModelListener: TreeModelListener):  void {
    }
}
