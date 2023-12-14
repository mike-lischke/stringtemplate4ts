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



/** The internal representation of a single group file (which must end in
 *  ".stg").  If we fail to find a group file, look for it via the
 *  CLASSPATH as a resource.  Templates are only looked up in this file
 *  or an import.
 */
export  class STGroupFile extends STGroup {
    /** Just records how user "spelled" the file name they wanted to load.
     *  The url is the key field here for loading content.
     *
     *  If they use ctor with URL arg, this field is null.
     */
    public  fileName:  string;

    /** Where to find the group file. NonNull. */
    public  url:  java.net.URL;

    protected  alreadyLoaded = false;

    /** Load a file relative to current directory or from root or via CLASSPATH. */
    public  constructor(fileName: string);

    /** Convenience ctor */
    public  constructor(url: java.net.URL);

    public  constructor(fullyQualifiedFileName: string, encoding: string);

    public  constructor(fileName: string, delimiterStartChar: char, delimiterStopChar: char);

    public  constructor(fullyQualifiedFileName: string, encoding: string,
                       delimiterStartChar: char, delimiterStopChar: char);

    /** Pass in a URL with the location of a group file. E.g.,
     *  STGroup g = new STGroupFile(loader.getResource("org/foo/templates/g.stg"), "UTF-8", '<', '>');
      */
    public  constructor(url: java.net.URL, encoding: string,
                       delimiterStartChar: char, delimiterStopChar: char);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 1: {
				const [fileName] = args as [string];

 this(fileName, '<', '>'); 

				break;
			}

			case 1: {
				const [url] = args as [java.net.URL];

 this(url, "UTF-8",'<', '>'); 

				break;
			}

			case 2: {
				const [fullyQualifiedFileName, encoding] = args as [string, string];


        this(fullyQualifiedFileName, encoding, '<', '>');
    

				break;
			}

			case 3: {
				const [fileName, delimiterStartChar, delimiterStopChar] = args as [string, char, char];


        super(delimiterStartChar, delimiterStopChar);
        if ( !fileName.endsWith(STGroupFile.GROUP_FILE_EXTENSION) ) {
            throw new  java.lang.IllegalArgumentException("Group file names must end in .stg: "+fileName);
        }
        //try {
        let  f = new  java.io.File(fileName);
        if ( f.exists() ) {
            try {
                this.url = f.toURI().toURL();
            } catch (e) {
if (e instanceof java.net.MalformedURLException) {
                throw new  STException("can't load group file "+fileName, e);
            } else {
	throw e;
	}
}
            if ( STGroupFile.verbose ) {
 java.lang.System.out.println("STGroupFile(" + fileName + ") == file "+f.getAbsolutePath());
}

        }
        else { // try in classpath
            this.url = this.getURL(fileName);
            if ( this.url===null ) {
                throw new  java.lang.IllegalArgumentException("No such group file: "+
                                                       fileName);
            }
            if ( STGroupFile.verbose ) {
 java.lang.System.out.println("STGroupFile(" + fileName + ") == url "+this.url);
}

        }
        this.fileName = fileName;
    

				break;
			}

			case 4: {
				const [fullyQualifiedFileName, encoding, delimiterStartChar, delimiterStopChar] = args as [string, string, char, char];


        this(fullyQualifiedFileName, delimiterStartChar, delimiterStopChar);
        this.encoding = encoding;
    

				break;
			}

			case 4: {
				const [url, encoding, delimiterStartChar, delimiterStopChar] = args as [java.net.URL, string, char, char];


        super(delimiterStartChar, delimiterStopChar);
        if ( url===null ) {
            throw new  java.lang.IllegalArgumentException("URL to group file cannot be null");
        }
        this.url = url;
        this.encoding = encoding;
        this.fileName = null;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public override  isDictionary(name: string):  boolean {
        if ( !this.alreadyLoaded ) {
 this.load();
}

        return super.isDictionary(name);
    }

    public override  isDefined(name: string):  boolean {
        if ( !this.alreadyLoaded ) {
 this.load();
}

        return super.isDefined(name);
    }

    public override  unload():  void {
        super.unload();
        this.alreadyLoaded = false;
    }

    public override  load():  void;

    protected override  load(name: string):  CompiledST;
public override load(...args: unknown[]):  void |  CompiledST {
		switch (args.length) {
			case 0: {

        if ( this.alreadyLoaded ) {
 return;
}

        this.alreadyLoaded = true; // do before actual load to say we're doing it
        // no prefix since this group file is the entire group, nothing lives
        // beneath it.
        if ( STGroupFile.verbose ) {
 java.lang.System.out.println("loading group file "+this.url.toString());
}

        this.loadGroupFile("/", this.url.toString());
        if ( STGroupFile.verbose ) {
 java.lang.System.out.println("found "+this.templates.size()+" templates in "+this.url.toString()+" = "+this.templates.keySet());
}

    

				break;
			}

			case 1: {
				const [name] = args as [string];


        if ( !this.alreadyLoaded ) {
 this.load();
}

        return this.rawGetTemplate(name);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public override  show():  string {
        if ( !this.alreadyLoaded ) {
 this.load();
}

        return super.show();
    }

    public override  getName():  string { return Misc.getFileNameNoSuffix(this.getFileName()); }

    public override  getFileName():  string {
        if ( this.fileName!==null ) {
            return this.fileName;
        }
        return this.url.getFile();
    }

    public override  getRootDirURL():  java.net.URL {
//      System.out.println("url of "+fileName+" is "+url.toString());
        let  parent = Misc.stripLastPathElement(this.url.toString());
        if ( parent.endsWith(".jar!") ) {
            parent = parent + "/."; // whooops. at the root so add "current dir" after jar spec
        }
        try {
            let  parentURL = new  java.net.URL(parent);
//          System.out.println("parent URL "+parentURL.toString());
            return parentURL;
        } catch (mue) {
if (mue instanceof java.net.MalformedURLException) {
            this.errMgr.runTimeError(null, null, ErrorType.INVALID_TEMPLATE_NAME,
                                mue, parent);
        } else {
	throw mue;
	}
}
        return null;
    }
}
