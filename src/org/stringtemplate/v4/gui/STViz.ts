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



import { java, JavaObject, type int, S } from "jree";
import { STViewFrame } from "./STViewFrame.js";
import { JTreeScopeStackModel } from "./JTreeScopeStackModel.js";
import { JTreeSTModel } from "./JTreeSTModel.js";
import { JTreeASTModel } from "./JTreeASTModel.js";
import { InstanceScope } from "../InstanceScope.js";
import { Interpreter } from "../Interpreter.js";
import { ST } from "../ST.js";
import { STGroup } from "../STGroup.js";
import { STGroupFile } from "../STGroupFile.js";
import { STGroupString } from "../STGroupString.js";
import { EvalExprEvent } from "../debug/EvalExprEvent.js";
import { EvalTemplateEvent } from "../debug/EvalTemplateEvent.js";
import { InterpEvent } from "../debug/InterpEvent.js";
import { Interval } from "../misc/Interval.js";
import { Misc } from "../misc/Misc.js";
import { STMessage } from "../misc/STMessage.js";
import { STRuntimeMessage } from "../misc/STRuntimeMessage.js";



export class STViz {
    protected static readonly WINDOWS_LINE_ENDINGS = "WINDOWS_LINE_ENDINGS";

    //public ST currentST; // current ST selected in template tree
    public root: EvalTemplateEvent;
    public currentEvent: InterpEvent;
    public currentScope: InstanceScope;
    public allEvents: java.util.List<InterpEvent>;
    public tmodel: JTreeSTModel;
    public errMgr: java.util.logging.ErrorManager;
    public interp: Interpreter;
    public output: string;
    public trace: java.util.List<string>;
    public errors: java.util.List<STMessage>;

    public viewFrame: STViewFrame;

    private readonly updateDepth = new java.util.concurrent.atomic.AtomicInteger();

    public constructor(errMgr: java.util.logging.ErrorManager,
        root: EvalTemplateEvent,
        output: string,
        interp: Interpreter,
        trace: java.util.List<string>,
        errors: java.util.List<STMessage>) {
        super();
        this.errMgr = errMgr;
        this.currentEvent = root;
        this.currentScope = root.scope;
        this.output = output;
        this.interp = interp;
        this.allEvents = interp.getEvents();
        this.trace = trace;
        this.errors = errors;
    }

    public static main(args: string[]): void { // test rig
        if (args.length > 0 && args[0].equals("1")) {
            STViz.test1();
        }

        else {
            if (args.length > 0 && args[0].equals("2")) {
                STViz.test2();
            }

            else {
                if (args.length > 0 && args[0].equals("3")) {
                    STViz.test3();
                }

                else {
                    if (args.length > 0 && args[0].equals("4")) {
                        STViz.test4();
                    }

                }

            }

        }

    }

    public static test1(): void { // test rig
        let templates =
            "method(type,name,locals,args,stats) ::= <<\n" +
            "public <type> <name>(<args:{a| int <a>}; separator=\", \">) {\n" +
            "    <if(locals)>int locals[<locals>];<endif>\n" +
            "    <stats;separator=\"\\n\">\n" +
            "}\n" +
            ">>\n" +
            "assign(a,b) ::= \"<a> = <b>;\"\n" +
            "return(x) ::= <<return <x>;>>\n" +
            "paren(x) ::= \"(<x>)\"\n";

        let tmpdir = java.lang.System.getProperty("java.io.tmpdir");
        STViz.writeFile(tmpdir, "t.stg", templates);
        let group = new STGroupFile(tmpdir + "/" + "t.stg");
        let st = group.getInstanceOf("method");
        st.impl.dump();
        st.add("type", "float");
        st.add("name", "foo");
        st.add("locals", 3);
        st.add("args", ["x", "y", "z"]);
        let s1 = group.getInstanceOf("assign");
        let paren = group.getInstanceOf("paren");
        paren.add("x", "x");
        s1.add("a", paren);
        s1.add("b", "y");
        let s2 = group.getInstanceOf("assign");
        s2.add("a", "y");
        s2.add("b", "z");
        let s3 = group.getInstanceOf("return");
        s3.add("x", "3.14159");
        st.add("stats", s1);
        st.add("stats", s2);
        st.add("stats", s3);

        let viz = st.inspect();
        java.lang.System.out.println(st.render()); // should not mess up ST event lists
    }

    public static test2(): void { // test rig
        let templates =
            "t1(q1=\"Some\\nText\") ::= <<\n" +
            "<q1>\n" +
            ">>\n" +
            "\n" +
            "t2(p1) ::= <<\n" +
            "<p1>\n" +
            ">>\n" +
            "\n" +
            "main() ::= <<\n" +
            "START-<t1()>-END\n" +
            "\n" +
            "START-<t2(p1=\"Some\\nText\")>-END\n" +
            ">>\n";

        let tmpdir = java.lang.System.getProperty("java.io.tmpdir");
        STViz.writeFile(tmpdir, "t.stg", templates);
        let group = new STGroupFile(tmpdir + "/" + "t.stg");
        let st = group.getInstanceOf("main");
        let viz = st.inspect();
    }

    public static test3(): void {
        let templates =
            "main() ::= <<\n" +
            "Foo: <{bar};format=\"lower\">\n" +
            ">>\n";

        let tmpdir = java.lang.System.getProperty("java.io.tmpdir");
        STViz.writeFile(tmpdir, "t.stg", templates);
        let group = new STGroupFile(tmpdir + "/" + "t.stg");
        let st = group.getInstanceOf("main");
        st.inspect();
    }

    public static test4(): void {
        let templates =
            "main(t) ::= <<\n" +
            "hi: <t>\n" +
            ">>\n" +
            "foo(x,y={hi}) ::= \"<bar(x,y)>\"\n" +
            "bar(x,y) ::= << <y> >>\n" +
            "ignore(m) ::= \"<m>\"\n";

        let group = new STGroupString(templates);
        let st = group.getInstanceOf("main");
        let foo = group.getInstanceOf("foo");
        st.add("t", foo);
        let ignore = group.getInstanceOf("ignore");
        ignore.add("m", foo); // embed foo twice!
        st.inspect();
        st.render();
    }

    public static writeFile(dir: string, fileName: string, content: string): void {
        try {
            let f = new java.io.File(dir, fileName);
            if (!f.getParentFile().exists()) {
                f.getParentFile().mkdirs();
            }

            let w = new java.io.FileWriter(f);
            let bw = new java.io.BufferedWriter(w);
            bw.write(content);
            bw.close();
            w.close();
        } catch (ioe) {
            if (ioe instanceof java.io.IOException) {
                java.lang.System.err.println("can't write file");
                ioe.printStackTrace(java.lang.System.err);
            } else {
                throw ioe;
            }
        }
    }

    public open(): void {
        this.viewFrame = new STViewFrame();
        this.updateStack(this.currentScope, this.viewFrame);
        this.updateAttributes(this.currentScope, this.viewFrame);

        let events = this.currentScope.events;
        this.tmodel = new JTreeSTModel(this.interp, events.get(events.size() - 1) as EvalTemplateEvent);
        this.viewFrame.tree.setModel(this.tmodel);
        this.viewFrame.tree.addTreeSelectionListener(
            new class extends TreeSelectionListener {
                public valueChanged(treeSelectionEvent: TreeSelectionEvent): void {
                    let depth = $outer.updateDepth.incrementAndGet();
                    try {
                        if (depth !== 1) {
                            return;
                        }

                        $outer.currentEvent = ($outer.viewFrame.tree.getLastSelectedPathComponent() as JTreeSTModel.Wrapper).event;
                        $outer.currentScope = $outer.currentEvent.scope;
                        $outer.updateCurrentST($outer.viewFrame);
                    }
                    finally {
                        $outer.updateDepth.decrementAndGet();
                    }
                }
            }()
        );

        let astModel = new JTreeASTModel(new CommonTreeAdaptor(), this.currentScope.st.impl.ast);
        this.viewFrame.ast.setModel(astModel);
        this.viewFrame.ast.addTreeSelectionListener(
            new class extends TreeSelectionListener {
                public valueChanged(treeSelectionEvent: TreeSelectionEvent): void {
                    let depth = $outer.updateDepth.incrementAndGet();
                    try {
                        if (depth !== 1) {
                            return;
                        }

                        let path = treeSelectionEvent.getNewLeadSelectionPath();
                        if (path === null) {
                            return;
                        }

                        let node = treeSelectionEvent.getNewLeadSelectionPath().getLastPathComponent() as CommonTree;
                        //System.out.println("select AST: "+node);
                        let a = $outer.currentScope.st.impl.tokens.get(node.getTokenStartIndex()) as CommonToken;
                        let b = $outer.currentScope.st.impl.tokens.get(node.getTokenStopIndex()) as CommonToken;
                        $outer.highlight($outer.viewFrame.template, a.getStartIndex(), b.getStopIndex());
                    }
                    finally {
                        $outer.updateDepth.decrementAndGet();
                    }
                }
            }()
        );

        // Track selection of attr but do nothing for now
        //        viewFrame.attributes.addListSelectionListener(
        //            new ListSelectionListener() {
        //                public void valueChanged(ListSelectionEvent e) {
        //                    int minIndex = viewFrame.attributes.getMinSelectionIndex();
        //                    int maxIndex = viewFrame.attributes.getMaxSelectionIndex();
        //                    for (int i = minIndex; i <= maxIndex; i++) {
        //                        if (viewFrame.attributes.isSelectedIndex(i)) {
        //                            //System.out.println("index="+i);
        //                        }
        //                    }
        //                }
        //            }
        //        );

        let caretListenerLabel = new class extends CaretListener {
            public caretUpdate(e: CaretEvent): void {
                let depth = $outer.updateDepth.incrementAndGet();
                try {
                    if (depth !== 1) {
                        return;
                    }

                    let dot = $outer.toEventPosition(e.getSource() as JTextComponent, e.getDot());
                    $outer.currentEvent = $outer.findEventAtOutputLocation($outer.allEvents, dot);
                    if ($outer.currentEvent === null) {
                        $outer.currentScope = $outer.tmodel.root.event.scope;
                    }

                    else {
                        $outer.currentScope = $outer.currentEvent.scope;
                    }


                    // update tree view of template hierarchy
                    // compute path from root to currentST, create TreePath for tree widget
                    let stack = Interpreter.getEvalTemplateEventStack($outer.currentScope, true);
                    //System.out.println("\nselect path="+stack);
                    let path = new Array<Object>(stack.size());
                    let j = 0;
                    for (let s of stack) {
                        path[j++] = new JTreeSTModel.Wrapper(s);
                    }
                    let p = new TreePath(path);
                    $outer.viewFrame.tree.setSelectionPath(p);
                    $outer.viewFrame.tree.scrollPathToVisible(p);
                    $outer.updateCurrentST($outer.viewFrame);
                }
                finally {
                    $outer.updateDepth.decrementAndGet();
                }
            }
        }();

        this.viewFrame.output.addCaretListener(caretListenerLabel);

        // ADD ERRORS
        if (this.errors === null || this.errors.size() === 0) {
            this.viewFrame.errorScrollPane.setVisible(false); // don't show unless errors
        }
        else {
            let errorListModel = new DefaultListModel();
            for (let msg of this.errors) {
                errorListModel.addElement(msg);
            }
            this.viewFrame.errorList.setModel(errorListModel);
        }

        this.viewFrame.errorList.addListSelectionListener(
            new class extends ListSelectionListener {
                public valueChanged(e: ListSelectionEvent): void {
                    let depth = $outer.updateDepth.incrementAndGet();
                    try {
                        if (depth !== 1) {
                            return;
                        }

                        let minIndex = $outer.viewFrame.errorList.getMinSelectionIndex();
                        let maxIndex = $outer.viewFrame.errorList.getMaxSelectionIndex();
                        let i = minIndex;
                        while (i <= maxIndex) {
                            if ($outer.viewFrame.errorList.isSelectedIndex(i)) {
                                break;
                            }

                            i++;
                        }
                        let model = $outer.viewFrame.errorList.getModel();
                        let msg = model.getElementAt(i) as STMessage;
                        if (msg instanceof STRuntimeMessage) {
                            let rmsg = msg as STRuntimeMessage;
                            let I = rmsg.self.impl.sourceMap[rmsg.ip];
                            $outer.currentEvent = null;
                            $outer.currentScope = (msg as STRuntimeMessage).scope;
                            $outer.updateCurrentST($outer.viewFrame);
                            if (I !== null) { // highlight template
                                $outer.highlight($outer.viewFrame.template, I.a, I.b);
                            }
                        }
                    }
                    finally {
                        $outer.updateDepth.decrementAndGet();
                    }
                }
            }()
        );

        let empty = BorderFactory.createEmptyBorder();
        this.viewFrame.treeContentSplitPane.setBorder(empty);
        this.viewFrame.outputTemplateSplitPane.setBorder(empty);
        this.viewFrame.templateBytecodeTraceTabPanel.setBorder(empty);
        this.viewFrame.treeAttributesSplitPane.setBorder(empty);


        this.viewFrame.treeContentSplitPane.setOneTouchExpandable(true);
        this.viewFrame.outputTemplateSplitPane.setOneTouchExpandable(true);
        this.viewFrame.treeContentSplitPane.setDividerSize(10);
        this.viewFrame.outputTemplateSplitPane.setDividerSize(8);
        this.viewFrame.treeContentSplitPane.setContinuousLayout(true);
        this.viewFrame.treeAttributesSplitPane.setContinuousLayout(true);
        this.viewFrame.outputTemplateSplitPane.setContinuousLayout(true);

        this.viewFrame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        this.viewFrame.pack();
        this.viewFrame.setSize(900, 700);

        this.setText(this.viewFrame.output, this.output);
        this.setText(this.viewFrame.template, this.currentScope.st.impl.template);
        this.setText(this.viewFrame.bytecode, this.currentScope.st.impl.disasm());
        this.setText(this.viewFrame.trace, Misc.join(this.trace.iterator(), "\n"));

        this.viewFrame.setVisible(true);
    }

    public waitForClose(): void {
        let lock = new Object();

        let t = new class extends java.lang.Thread {
            public run(): void {
                /* synchronized (lock) { */
                while ($outer.viewFrame.isVisible()) {
                    try {
                        lock.wait();
                    } catch (e) {
                        if (e instanceof java.lang.InterruptedException) {
                        } else {
                            throw e;
                        }
                    }
                }
                /* } */
            }
        }();

        t.start();

        this.viewFrame.addWindowListener(new class extends WindowAdapter {
            public windowClosing(arg0: WindowEvent): void {
                /* synchronized (lock) { */
                $outer.viewFrame.setVisible(false);
                lock.notify();
                /* } */
            }
        }());

        t.join();
    }

    public findEventAtOutputLocation(events: java.util.List<InterpEvent>,
        charIndex: int): InterpEvent {
        for (let e of events) {
            if (e.scope.earlyEval) {
                continue;
            }

            if (charIndex >= e.outputStartChar && charIndex <= e.outputStopChar) {
                return e;
            }

        }
        return null;
    }

    protected setText(component: JEditorPane, text: string): void {
        let windowsLineEndingsList = new Array<number>();
        for (let i = 0; i < text.length(); i += 2) {
            i = text.indexOf("\r\n", i);
            if (i < 0) {
                break;
            }

            windowsLineEndingsList.add(i);
        }

        let windowsLineEndings = new Int32Array(windowsLineEndingsList.size());
        for (let i = 0; i < windowsLineEndingsList.size(); i++) {
            windowsLineEndings[i] = windowsLineEndingsList.get(i);
        }

        component.setText(text);
        component.getDocument().putProperty(STViz.WINDOWS_LINE_ENDINGS, windowsLineEndings);
    }

    protected toComponentPosition(component: JTextComponent, position: int): int {
        let windowsLineEndings = component.getDocument().getProperty(STViz.WINDOWS_LINE_ENDINGS) as Int32Array;
        if (windowsLineEndings === null || windowsLineEndings.length === 0) {
            return position;
        }

        let index = java.util.Arrays.binarySearch(windowsLineEndings, position);
        if (index >= 0) {
            return position - index;
        }

        return position - (-index - 1);
    }

    protected toEventPosition(component: JTextComponent, position: int): int {
        let result = position;
        while (this.toComponentPosition(component, result) < position) {
            result++;
        }

        return result;
    }

    protected readonly highlight(comp: JTextComponent, i: int, j: int): void;

    protected highlight(comp: JTextComponent, i: int, j: int, scroll: boolean): void;
    protected readonly highlight(...args: unknown[]): void {
        switch (args.length) {
            case 3: {
                const [comp, i, j] = args as [JTextComponent, int, int];


                this.highlight(comp, i, j, true);


                break;
            }

            case 4: {
                const [comp, i, j, scroll] = args as [JTextComponent, int, int, boolean];


                let highlighter = comp.getHighlighter();
                highlighter.removeAllHighlights();

                try {
                    i = this.toComponentPosition(comp, i);
                    j = this.toComponentPosition(comp, j);
                    highlighter.addHighlight(i, j + 1, DefaultHighlighter.DefaultPainter);
                    if (scroll) {
                        if (comp.getCaretPosition() < i || comp.getCaretPosition() > j) {
                            comp.moveCaretPosition(i);
                            comp.scrollRectToVisible(comp.modelToView(i));
                        }
                    }
                } catch (ble) {
                    if (ble instanceof BadLocationException) {
                        this.errMgr.internalError(this.tmodel.root.event.scope.st, "bad highlight location", ble);
                    } else {
                        throw ble;
                    }
                }


                break;
            }

            default: {
                throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
            }
        }
    }


    protected updateAttributes(/* final */  scope: InstanceScope, /* final */  m: STViewFrame): void {
        //System.out.println("updateAttributes: "+Interpreter.getEnclosingInstanceStackString(scope) );
        m.attributes.setModel(new JTreeScopeStackModel(scope));
        m.attributes.setRootVisible(false);
        m.attributes.setShowsRootHandles(true);
        //System.out.println("add events="+ st.addAttrEvents);
        //      ST st = scope.st;
        //      final DefaultListModel attrModel = new DefaultListModel();
        //      final Map<String,Object> attrs = st.getAttributes();
        //      if ( attrs!=null ) {
        //          for (String a : attrs.keySet()) {
        //              if ( st.debugState!=null && st.debugState.addAttrEvents!=null ) {
        //                  List<AddAttributeEvent> events = st.debugState.addAttrEvents.get(a);
        //                  StringBuilder locations = new StringBuilder();
        //                  int i = 0;
        //                  if ( events!=null ) {
        //                      for (AddAttributeEvent ae : events) {
        //                          if ( i>0 ) locations.append(", ");
        //                          locations.append(ae.getFileName()+":"+ae.getLine());
        //                          i++;
        //                      }
        //                  }
        //                  if ( locations.length()>0 ) {
        //                      attrModel.addElement(a+" = "+attrs.get(a)+" @ "+locations.toString());
        //                  }
        //                  else {
        //                      attrModel.addElement(a+" = "+attrs.get(a));
        //                  }
        //              }
        //              else {
        //                  attrModel.addElement(a+" = "+attrs.get(a));
        //              }
        //          }
        //      }
        //      m.attributes.setModel(attrModel);
    }

    protected updateStack(scope: InstanceScope, m: STViewFrame): void {
        let stack = Interpreter.getEnclosingInstanceStack(scope, true);
        m.setTitle("STViz - [" + Misc.join(stack.iterator(), " ") + "]");
        //        // also do source stack
        //        StackTraceElement[] trace = st.newSTEvent.stack.getStackTrace();
        //        StringWriter sw = new StringWriter();
        //        for (StackTraceElement e : trace) {
        //            sw.write(e.toString()+"\n");
        //        }
    }

    private updateCurrentST(m: STViewFrame): void {
        //      System.out.println("updateCurrentST(): currentScope.st="+currentScope.st);
        // update all views according to currentScope.st
        this.updateStack(this.currentScope, m);                      // STACK
        this.updateAttributes(this.currentScope, m);                 // ATTRIBUTES
        this.setText(m.bytecode, this.currentScope.st.impl.disasm()); // BYTECODE DIS.
        this.setText(m.template, this.currentScope.st.impl.template); // TEMPLATE SRC
        let astModel = new JTreeASTModel(new CommonTreeAdaptor(), this.currentScope.st.impl.ast);
        this.viewFrame.ast.setModel(astModel);

        // highlight output text and, if {...} subtemplate, region in ST src
        // get last event for currentScope.st; it's the event that captures ST eval
        if (this.currentEvent instanceof EvalExprEvent) {
            let exprEvent = this.currentEvent as EvalExprEvent;
            this.highlight(m.output, exprEvent.outputStartChar, exprEvent.outputStopChar);
            this.highlight(m.template, exprEvent.exprStartChar, exprEvent.exprStopChar);
        }
        else {
            let templateEvent: EvalTemplateEvent;
            if (this.currentEvent instanceof EvalTemplateEvent) {
                templateEvent = this.currentEvent as EvalTemplateEvent;
            }
            else {
                let events = this.currentScope.events;
                templateEvent = events.get(events.size() - 1) as EvalTemplateEvent;
            }

            if (templateEvent !== null) {
                this.highlight(m.output, templateEvent.outputStartChar, templateEvent.outputStopChar);
            }

            if (this.currentScope.st.isAnonSubtemplate()) {
                let r = this.currentScope.st.impl.getTemplateRange();
                //System.out.println("currentScope.st src range="+r);
                //m.template.moveCaretPosition(r.a);
                this.highlight(m.template, r.a, r.b);
            }
        }
    }
}
