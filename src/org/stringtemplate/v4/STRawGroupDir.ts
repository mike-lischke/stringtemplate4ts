


import { java, type char, S } from "jree";
import { STGroupDir } from "./STGroupDir.js";
import { STGroup } from "./STGroup.js";
import { STLexer } from "./compiler/STLexer.js";
import { CompiledST } from "./compiler/CompiledST.js";
import { Misc } from "./misc/Misc.js";



/** A directory of templates without headers like ST v3 had.  Still allows group
 *  files in directory though like {@link STGroupDir} parent.
 */
export  class STRawGroupDir extends STGroupDir {
    public  constructor(dirName: string);

    public  constructor(dirName: string, encoding: string);

    public  constructor(dirName: string, delimiterStartChar: char, delimiterStopChar: char);

    public  constructor(dirName: string, encoding: string, delimiterStartChar: char, delimiterStopChar: char);

    public  constructor(root: java.net.URL, encoding: string, delimiterStartChar: char, delimiterStopChar: char);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 1: {
				const [dirName] = args as [string];


        super(dirName);
    

				break;
			}

			case 2: {
				const [dirName, encoding] = args as [string, string];


        super(dirName, encoding);
    

				break;
			}

			case 3: {
				const [dirName, delimiterStartChar, delimiterStopChar] = args as [string, char, char];


        super(dirName, delimiterStartChar, delimiterStopChar);
    

				break;
			}

			case 4: {
				const [dirName, encoding, delimiterStartChar, delimiterStopChar] = args as [string, string, char, char];


        super(dirName, encoding, delimiterStartChar, delimiterStopChar);
    

				break;
			}

			case 4: {
				const [root, encoding, delimiterStartChar, delimiterStopChar] = args as [java.net.URL, string, char, char];


        super(root, encoding, delimiterStartChar, delimiterStopChar);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public override  loadTemplateFile(prefix: string, unqualifiedFileName: string,
                                       templateStream: CharStream):  CompiledST
    {
        let  template = templateStream.substring(0, templateStream.size() - 1);
        let  templateName = Misc.getFileNameNoSuffix(unqualifiedFileName);
        let  fullyQualifiedTemplateName = prefix + templateName;
        let  impl = new  java.lang.Compiler(this).compile(fullyQualifiedTemplateName, template);
        let  nameT = new  CommonToken(STLexer.SEMI); // Seems like a hack, best I could come up with.
        nameT.setInputStream(templateStream);
        $outer.rawDefineTemplate(fullyQualifiedTemplateName, impl, nameT);
        impl.defineImplicitlyDefinedTemplates(this);
        return impl;
    }
}
