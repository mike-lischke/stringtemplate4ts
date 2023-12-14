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



import { java, type char, S } from "jree";
import { STGroup } from "./STGroup.js";
import { CompiledST } from "./compiler/CompiledST.js";
import { STException } from "./compiler/STException.js";
import { ErrorType } from "./misc/ErrorType.js";
import { Misc } from "./misc/Misc.js";



// TODO: caching?

/** A directory or directory tree full of templates and/or group files.
 *  We load files on-demand. Dir search path: current working dir then
 *  CLASSPATH (as a resource).  Do not look for templates outside of this dir
 *  subtree (except via imports).
 */
export  class STGroupDir extends STGroup {
    public  groupDirName:  string;
    public  root:  java.net.URL;

    public  constructor(dirName: string);
    public  constructor(root: java.net.URL);

    public  constructor(dirName: string, encoding: string);

    public  constructor(dirName: string, delimiterStartChar: char, delimiterStopChar: char);

    public  constructor(dirName: string, encoding: string,
                      delimiterStartChar: char, delimiterStopChar: char);

    public  constructor(root: java.net.URL, encoding: string,
                      delimiterStartChar: char, delimiterStopChar: char);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 1: {
				const [dirName] = args as [string];

 this(dirName, '<', '>'); 

				break;
			}

			case 1: {
				const [root] = args as [java.net.URL];

 this(root, "UTF-8", '<', '>'); 

				break;
			}

			case 2: {
				const [dirName, encoding] = args as [string, string];


        this(dirName, encoding, '<', '>');
    

				break;
			}

			case 3: {
				const [dirName, delimiterStartChar, delimiterStopChar] = args as [string, char, char];


        super(delimiterStartChar, delimiterStopChar);
        this.groupDirName = dirName;
        let  dir = new  java.io.File(dirName);
        if ( dir.exists() && dir.isDirectory() ) {
            // we found the directory and it'll be file based
            try {
                this.root = dir.toURI().toURL();
            } catch (e) {
if (e instanceof java.net.MalformedURLException) {
                throw new  STException("can't load dir "+dirName, e);
            } else {
	throw e;
	}
}
            if ( STGroupDir.verbose ) {
 java.lang.System.out.println("STGroupDir("+dirName+") found at "+this.root);
}

        }
        else {
            let  cl = java.lang.Thread.currentThread().getContextClassLoader();
            this.root = cl.getResource(dirName);
            if ( this.root===null ) {
                cl = this.getClass().getClassLoader();
                this.root = cl.getResource(dirName);
            }
            if ( STGroupDir.verbose ) {
 java.lang.System.out.println("STGroupDir("+dirName+") found via CLASSPATH at "+this.root);
}

            if ( this.root===null ) {
                throw new  java.lang.IllegalArgumentException("No such directory: "+
                                                       dirName);
            }
        }
        this.root = this.normalizeURL(this.root);
    

				break;
			}

			case 4: {
				const [dirName, encoding, delimiterStartChar, delimiterStopChar] = args as [string, string, char, char];


        this(dirName, delimiterStartChar, delimiterStopChar);
        this.encoding = encoding;
    

				break;
			}

			case 4: {
				const [root, encoding, delimiterStartChar, delimiterStopChar] = args as [java.net.URL, string, char, char];


        super(delimiterStartChar, delimiterStopChar);
        this.groupDirName = new  java.io.File(root.getFile()).getName();
        this.root = root;
        this.encoding = encoding;
        this.root = this.normalizeURL(this.root);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public override  importTemplates(fileNameToken: Token):  void {
        let  msg =
            "import illegal in group files embedded in STGroupDirs; "+
            "import "+fileNameToken.getText()+" in STGroupDir "+this.getName();
        throw new  java.lang.UnsupportedOperationException(msg);
    }

    /** Load .st as relative file name relative to root by {@code prefix}. */
    public override  loadTemplateFile(prefix: string, unqualifiedFileName: string):  CompiledST {
        if ( STGroupDir.verbose ) {
 java.lang.System.out.println("loadTemplateFile("+unqualifiedFileName+") in groupdir "+
                                          "from "+this.root+" prefix="+prefix);
}

        let  f: java.net.URL;
        try {
            f = new  java.net.URI(this.root+prefix+unqualifiedFileName).normalize().toURL();
        } catch (me) {
if (me instanceof java.net.MalformedURLException || me instanceof java.net.URISyntaxException) {
            this.errMgr.runTimeError(null, null, ErrorType.INVALID_TEMPLATE_NAME,
                                me, this.root+ unqualifiedFileName);
            return null;
        } else {
	throw me;
	}
}

        let  fs: ANTLRInputStream;
        try {
            fs = new  ANTLRInputStream(f.openStream(), this.encoding);
            fs.name = unqualifiedFileName;
        } catch (ioe) {
if (ioe instanceof java.io.IOException) {
            if ( STGroupDir.verbose ) {
 java.lang.System.out.println(this.root+"/"+unqualifiedFileName+" doesn't exist");
}

            //errMgr.IOError(null, ErrorType.NO_SUCH_TEMPLATE, ioe, unqualifiedFileName);
            return null;
        } else {
	throw ioe;
	}
}

        return this.loadTemplateFile(prefix, unqualifiedFileName, fs);
    }

    public override  getName():  string { return this.groupDirName; }
    public override  getFileName():  string { return this.root.getFile(); }
    public override  getRootDirURL():  java.net.URL { return this.root; }

    /** verify there is no extra slash on the end of URL */
    public  normalizeURL(url: java.net.URL):  java.net.URL {
        let  urlS = url.toString();
        if ( urlS.endsWith("/") ) {
            try {
                url = new  java.net.URL(urlS.substring(0,urlS.length()-1));
            } catch (e) {
if (e instanceof java.net.MalformedURLException) {
                this.errMgr.internalError(null, "bad URL: "+urlS, e);
            } else {
	throw e;
	}
}
        }
        return url;
    }

    /** Load a template from directory or group file.  Group file is given
     *  precedence over directory with same name. {@code name} is always fully-qualified.
     */
    protected override  load(name: string):  CompiledST {
        if ( STGroupDir.verbose ) {
 java.lang.System.out.println("STGroupDir.load("+name+")");
}

        let  parent = Misc.getParent(name); // must have parent; it's fully-qualified
        let  prefix = Misc.getPrefix(name);
//      if (parent.isEmpty()) {
//          // no need to check for a group file as name has no parent
//            return loadTemplateFile("/", name+TEMPLATE_FILE_EXTENSION); // load t.st file
//      }

        let  groupFileURL: java.net.URL;
        try { // see if parent of template name is a group file
            groupFileURL = new  java.net.URI(this.root+parent+STGroupDir.GROUP_FILE_EXTENSION).normalize().toURL();
        } catch (e) {
if (e instanceof java.net.MalformedURLException || e instanceof java.net.URISyntaxException) {
            this.errMgr.internalError(null, "bad URL: "+this.root+parent+STGroupDir.GROUP_FILE_EXTENSION, e);
            return null;
        } else {
	throw e;
	}
}

        let  is = null;
        try {
            is = groupFileURL.openStream();
        } catch (ioe) {
if (ioe instanceof java.io.IOException) {
            // must not be in a group file
            let  unqualifiedName = Misc.getFileName(name);
            return this.loadTemplateFile(prefix, unqualifiedName+STGroupDir.TEMPLATE_FILE_EXTENSION); // load t.st file
        } else {
	throw ioe;
	}
}
        finally { // clean up
            try {
                if (is!==null ) {
 is.close();
}

            } catch (ioe) {
if (ioe instanceof java.io.IOException) {
                this.errMgr.internalError(null, "can't close template file stream "+name, ioe);
            } else {
	throw ioe;
	}
}
        }

        this.loadGroupFile(prefix, this.root+parent+STGroupDir.GROUP_FILE_EXTENSION);
        return this.rawGetTemplate(name);
    }
}
