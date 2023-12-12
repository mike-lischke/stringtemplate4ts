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



import { JavaObject, type int, java } from "jree";
import { Interpreter } from "../Interpreter.js";
import { ST } from "../ST.js";
import { StringRenderer } from "../StringRenderer.js";
import { EvalTemplateEvent } from "../debug/EvalTemplateEvent.js";

type String = java.lang.String;
const String = java.lang.String;



export  class JTreeSTModel extends JavaObject implements TreeModel {

    public static Wrapper =  class Wrapper extends JavaObject {
        protected  event: EvalTemplateEvent;
        public  constructor(event: EvalTemplateEvent) { super();
this.event = event; }

        @Override
public override  hashCode():  int {
            return this.event.hashCode();
        }

        @Override
public override  equals(o: java.lang.Object):  boolean {
            if ( o === null ) {
 return false;
}

            //System.out.println(event+"=="+((Wrapper)o).event+" is "+(this.event == ((Wrapper)o).event));
            return this.event === (o as Wrapper).event;
        }

        @Override
public override  toString():  String {
            let  st = this.event.scope.st;
            if ( st.isAnonSubtemplate() ) {
 return "{...}";
}

            if ( st.debugState!==null && st.debugState.newSTEvent!==null ) {
                let  label = st.toString()+" @ "+st.debugState.newSTEvent.getFileName()+":"+
                       st.debugState.newSTEvent.getLine();
                return "<html><b>" + StringRenderer.escapeHTML(label) + "</b></html>";
            }
            else {
                return st.toString();
            }
        }
    };

    public  interp:  Interpreter;
    public  root:  JTreeSTModel.Wrapper;

    public  constructor(interp: Interpreter, root: EvalTemplateEvent) {
        super();
this.interp = interp;
        this.root = new  JTreeSTModel.Wrapper(root);
    }

    @Override
public  getChild(parent: java.lang.Object, index: int):  java.lang.Object {
        let  e = (parent as JTreeSTModel.Wrapper).event;
        return new  JTreeSTModel.Wrapper(e.scope.childEvalTemplateEvents.get(index));
    }

    @Override
public  getChildCount(parent: java.lang.Object):  int {
        let  e = (parent as JTreeSTModel.Wrapper).event;
        return e.scope.childEvalTemplateEvents.size();
    }

    @Override
public  getIndexOfChild(parent: java.lang.Object, child: java.lang.Object):  int {
        let  p = (parent as JTreeSTModel.Wrapper).event;
        let  c = (parent as JTreeSTModel.Wrapper).event;
        let  i = 0;
        for (let e of p.scope.childEvalTemplateEvents) {
            if ( e.scope.st === c.scope.st ) {
//              System.out.println(i);
//              System.out.println("found "+e.self+" as child of "+parentST);
                return i;
            }
            i++;
        }
        return -1;
    }

    @Override
public  isLeaf(node: java.lang.Object):  boolean {
        return this.getChildCount(node) === 0;
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

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace JTreeSTModel {
	export type Wrapper = InstanceType<typeof JTreeSTModel.Wrapper>;
}


