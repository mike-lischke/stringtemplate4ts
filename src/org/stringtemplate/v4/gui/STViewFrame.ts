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
/*
 * Created by JFormDesigner on Sun Nov 29 12:38:59 PST 2009
 */




import { java } from "jree";



/**
 * @author Terence Parr
 */
export  class STViewFrame extends JFrame {
    public  treeContentSplitPane:  JSplitPane;
    public  treeAttributesSplitPane:  JSplitPane;
    public  treeScrollPane:  JScrollPane;
    public  outputTemplateSplitPane:  JSplitPane;
    public  output:  JTextPane;
    public  templateBytecodeTraceTabPanel:  JTabbedPane;
    public  template:  JTextPane;
    public  ast:  JTree;
    public  trace:  JTextPane;
    public  errorScrollPane:  JScrollPane;
    protected  tree:  JTree;
    protected  attributeScrollPane:  JScrollPane;
    protected  attributes:  JTree;
    protected  scrollPane7:  JScrollPane;
    protected  scrollPane15:  JScrollPane;
    protected  bytecode:  JTextPane;
    protected  errorList:  JList;

    // JFormDesigner - Variables declaration - DO NOT MODIFY  //GEN-BEGIN:variables
    // Generated using JFormDesigner non-commercial license
    private  toolBar1:  JToolBar;
    private  panel1:  JPanel;
    private  scrollPane3:  JScrollPane;
    private  scrollPane2:  JScrollPane;
    private  scrollPane1:  JScrollPane;
    public  constructor() {
        super();
this.initComponents();
    }

    private  initComponents():  void {
        // JFormDesigner - Component initialization - DO NOT MODIFY  //GEN-BEGIN:initComponents
        // Generated using JFormDesigner non-commercial license
        this.toolBar1 = new  JToolBar();
        this.treeContentSplitPane = new  JSplitPane();
        this.treeAttributesSplitPane = new  JSplitPane();
        this.treeScrollPane = new  JScrollPane();
        this.tree = new  JTree();
        this.attributeScrollPane = new  JScrollPane();
        this.attributes = new  JTree();
        this.outputTemplateSplitPane = new  JSplitPane();
        this.scrollPane7 = new  JScrollPane();
        this.output = new  JTextPane();
        this.templateBytecodeTraceTabPanel = new  JTabbedPane();
        this.panel1 = new  JPanel();
        this.scrollPane3 = new  JScrollPane();
        this.template = new  JTextPane();
        this.scrollPane2 = new  JScrollPane();
        this.ast = new  JTree();
        this.scrollPane15 = new  JScrollPane();
        this.bytecode = new  JTextPane();
        this.scrollPane1 = new  JScrollPane();
        this.trace = new  JTextPane();
        this.errorScrollPane = new  JScrollPane();
        this.errorList = new  JList();

        //======== this ========
        let  contentPane = getContentPane();
        contentPane.setLayout(new  GridBagLayout());
        (contentPane.getLayout() as GridBagLayout).columnWidths =  [0, 0];
        (contentPane.getLayout() as GridBagLayout).rowHeights =  [0, 0, 0, 0];
        (contentPane.getLayout() as GridBagLayout).columnWeights =  [1.0, 1.0E-4];
        (contentPane.getLayout() as GridBagLayout).rowWeights =  [0.0, 1.0, 0.0, 1.0E-4];
        contentPane.add(this.toolBar1, new  GridBagConstraints(0, 0, 1, 1, 0.0, 0.0,
            GridBagConstraints.CENTER, GridBagConstraints.BOTH,
            new  Insets(0, 0, 0, 0), 0, 0));

        //======== treeContentSplitPane ========
        {
            this.treeContentSplitPane.setResizeWeight(0.25);

            //======== treeAttributesSplitPane ========
            {
                this.treeAttributesSplitPane.setOrientation(JSplitPane.VERTICAL_SPLIT);
                this.treeAttributesSplitPane.setResizeWeight(0.7);

                //======== treeScrollPane ========
                {
                    this.treeScrollPane.setViewportView(this.tree);
                }
                this.treeAttributesSplitPane.setTopComponent(this.treeScrollPane);

                //======== attributeScrollPane ========
                {
                    this.attributeScrollPane.setViewportView(this.attributes);
                }
                this.treeAttributesSplitPane.setBottomComponent(this.attributeScrollPane);
            }
            this.treeContentSplitPane.setLeftComponent(this.treeAttributesSplitPane);

            //======== outputTemplateSplitPane ========
            {
                this.outputTemplateSplitPane.setOrientation(JSplitPane.VERTICAL_SPLIT);
                this.outputTemplateSplitPane.setResizeWeight(0.7);

                //======== scrollPane7 ========
                {
                    this.scrollPane7.setViewportView(this.output);
                }
                this.outputTemplateSplitPane.setTopComponent(this.scrollPane7);

                //======== templateBytecodeTraceTabPanel ========
                {

                    //======== panel1 ========
                    {
                        this.panel1.setLayout(new  BoxLayout(this.panel1, BoxLayout.X_AXIS));

                        //======== scrollPane3 ========
                        {
                            this.scrollPane3.setViewportView(this.template);
                        }
                        this.panel1.add(this.scrollPane3);

                        //======== scrollPane2 ========
                        {
                            this.scrollPane2.setViewportView(this.ast);
                        }
                        this.panel1.add(this.scrollPane2);
                    }
                    this.templateBytecodeTraceTabPanel.addTab("template", this.panel1);


                    //======== scrollPane15 ========
                    {
                        this.scrollPane15.setViewportView(this.bytecode);
                    }
                    this.templateBytecodeTraceTabPanel.addTab("bytecode", this.scrollPane15);


                    //======== scrollPane1 ========
                    {
                        this.scrollPane1.setViewportView(this.trace);
                    }
                    this.templateBytecodeTraceTabPanel.addTab("trace", this.scrollPane1);

                }
                this.outputTemplateSplitPane.setBottomComponent(this.templateBytecodeTraceTabPanel);
            }
            this.treeContentSplitPane.setRightComponent(this.outputTemplateSplitPane);
        }
        contentPane.add(this.treeContentSplitPane, new  GridBagConstraints(0, 1, 1, 1, 0.0, 0.0,
            GridBagConstraints.CENTER, GridBagConstraints.BOTH,
            new  Insets(0, 0, 0, 0), 0, 0));

        //======== errorScrollPane ========
        {
            this.errorScrollPane.setViewportView(this.errorList);
        }
        contentPane.add(this.errorScrollPane, new  GridBagConstraints(0, 2, 1, 1, 0.0, 0.0,
            GridBagConstraints.CENTER, GridBagConstraints.BOTH,
            new  Insets(0, 0, 0, 0), 0, 0));
        java.util.jar.Pack200.Packer.pack();
        setLocationRelativeTo(java.nio.file.attribute.FileOwnerAttributeView.getOwner());
        // JFormDesigner - End of component initialization  //GEN-END:initComponents
    }
    // JFormDesigner - End of variables declaration  //GEN-END:variables
}
