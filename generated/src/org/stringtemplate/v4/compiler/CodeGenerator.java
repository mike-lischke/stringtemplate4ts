// $ANTLR 3.5.3 src/org/stringtemplate/v4/compiler/CodeGenerator.g 2023-12-16 19:47:31

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
package org.stringtemplate.v4.compiler;
import org.stringtemplate.v4.misc.*;
import org.stringtemplate.v4.*;


import org.antlr.runtime.*;
import org.antlr.runtime.tree.*;
import java.util.Stack;
import java.util.List;
import java.util.ArrayList;

@SuppressWarnings("all")
public class CodeGenerator extends TreeParser {
	public static final String[] tokenNames = new String[] {
		"<invalid>", "<EOR>", "<DOWN>", "<UP>", "IF", "ELSE", "ELSEIF", "ENDIF", 
		"SUPER", "SEMI", "BANG", "ELLIPSIS", "EQUALS", "COLON", "LPAREN", "RPAREN", 
		"LBRACK", "RBRACK", "COMMA", "DOT", "LCURLY", "RCURLY", "TEXT", "LDELIM", 
		"RDELIM", "ID", "STRING", "WS", "PIPE", "OR", "AND", "INDENT", "NEWLINE", 
		"AT", "END", "TRUE", "FALSE", "COMMENT", "SLASH", "EXPR", "OPTIONS", "PROP", 
		"PROP_IND", "INCLUDE", "INCLUDE_IND", "EXEC_FUNC", "INCLUDE_SUPER", "INCLUDE_SUPER_REGION", 
		"INCLUDE_REGION", "TO_STR", "LIST", "MAP", "ZIP", "SUBTEMPLATE", "ARGS", 
		"ELEMENTS", "REGION", "NULL", "INDENTED_EXPR"
	};
	public static final int EOF=-1;
	public static final int RBRACK=17;
	public static final int LBRACK=16;
	public static final int ELSE=5;
	public static final int ELLIPSIS=11;
	public static final int LCURLY=20;
	public static final int BANG=10;
	public static final int EQUALS=12;
	public static final int TEXT=22;
	public static final int ID=25;
	public static final int SEMI=9;
	public static final int LPAREN=14;
	public static final int IF=4;
	public static final int ELSEIF=6;
	public static final int COLON=13;
	public static final int RPAREN=15;
	public static final int WS=27;
	public static final int COMMA=18;
	public static final int RCURLY=21;
	public static final int ENDIF=7;
	public static final int RDELIM=24;
	public static final int SUPER=8;
	public static final int DOT=19;
	public static final int LDELIM=23;
	public static final int STRING=26;
	public static final int PIPE=28;
	public static final int OR=29;
	public static final int AND=30;
	public static final int INDENT=31;
	public static final int NEWLINE=32;
	public static final int AT=33;
	public static final int END=34;
	public static final int TRUE=35;
	public static final int FALSE=36;
	public static final int COMMENT=37;
	public static final int SLASH=38;
	public static final int EXPR=39;
	public static final int OPTIONS=40;
	public static final int PROP=41;
	public static final int PROP_IND=42;
	public static final int INCLUDE=43;
	public static final int INCLUDE_IND=44;
	public static final int EXEC_FUNC=45;
	public static final int INCLUDE_SUPER=46;
	public static final int INCLUDE_SUPER_REGION=47;
	public static final int INCLUDE_REGION=48;
	public static final int TO_STR=49;
	public static final int LIST=50;
	public static final int MAP=51;
	public static final int ZIP=52;
	public static final int SUBTEMPLATE=53;
	public static final int ARGS=54;
	public static final int ELEMENTS=55;
	public static final int REGION=56;
	public static final int NULL=57;
	public static final int INDENTED_EXPR=58;

	// delegates
	public TreeParser[] getDelegates() {
		return new TreeParser[] {};
	}

	// delegators


	public CodeGenerator(TreeNodeStream input) {
		this(input, new RecognizerSharedState());
	}
	public CodeGenerator(TreeNodeStream input, RecognizerSharedState state) {
		super(input, state);
	}

	@Override public String[] getTokenNames() { return CodeGenerator.tokenNames; }
	@Override public String getGrammarFileName() { return "src/org/stringtemplate/v4/compiler/CodeGenerator.g"; }


		String outermostTemplateName;	// name of overall template
		CompiledST outermostImpl;
		Token templateToken;			// overall template token
		String template;  				// overall template text
		ErrorManager errMgr;
		public CodeGenerator(TreeNodeStream input, ErrorManager errMgr, String name, String template, Token templateToken) {
			this(input, new RecognizerSharedState());
			this.errMgr = errMgr;
			this.outermostTemplateName = name;
			this.template = template;
			this.templateToken = templateToken;
		}

		public void addArgument(List<FormalArgument> args, Token t) {
			String name = t.getText();
			for (FormalArgument arg : args) {
				if (arg.name.equals(name)) {
					errMgr.compileTimeError(ErrorType.PARAMETER_REDEFINITION, templateToken, t, name);
					return;
				}
			}

			args.add(new FormalArgument(name));
		}

		// convenience funcs to hide offensive sending of emit messages to
		// CompilationState temp data object.

		public void emit1(CommonTree opAST, short opcode, int arg) {
			template_stack.peek().state.emit1(opAST, opcode, arg);
		}
		public void emit1(CommonTree opAST, short opcode, String arg) {
			template_stack.peek().state.emit1(opAST, opcode, arg);
		}
		public void emit2(CommonTree opAST, short opcode, int arg, int arg2) {
			template_stack.peek().state.emit2(opAST, opcode, arg, arg2);
		}
		public void emit2(CommonTree opAST, short opcode, String s, int arg2) {
			template_stack.peek().state.emit2(opAST, opcode, s, arg2);
		}
	    public void emit(CommonTree opAST, short opcode) {
			template_stack.peek().state.emit(opAST, opcode);
		}
		public void insert(int addr, short opcode, String s) {
			template_stack.peek().state.insert(addr, opcode, s);
		}
		public void setOption(CommonTree id) {
			template_stack.peek().state.setOption(id);
		}
		public void write(int addr, short value) {
			template_stack.peek().state.write(addr,value);
		}
		public int address() { return template_stack.peek().state.ip; }
		public void func(CommonTree id) { template_stack.peek().state.func(templateToken, id); }
		public void refAttr(CommonTree id) { template_stack.peek().state.refAttr(templateToken, id); }
		public int defineString(String s) { return template_stack.peek().state.defineString(s); }

		@Override
		public void displayRecognitionError(String[] tokenNames, RecognitionException e) {
			Token tokenWithPosition = e.token;
			if (tokenWithPosition.getInputStream() == null) {
				tokenWithPosition = input.getTreeAdaptor().getToken(input.LT(-1));
			}

			String hdr = getErrorHeader(e);
			String msg = getErrorMessage(e, tokenNames);
			errMgr.compileTimeError(ErrorType.SYNTAX_ERROR, templateToken, tokenWithPosition, hdr + " " + msg);
		}



	// $ANTLR start "templateAndEOF"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:142:1: templateAndEOF : template[null,null] EOF ;
	public final void templateAndEOF() throws RecognitionException {
		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:142:15: ( template[null,null] EOF )
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:143:5: template[null,null] EOF
			{
			pushFollow(FOLLOW_template_in_templateAndEOF69);
			template(null, null);
			state._fsp--;

			match(input,EOF,FOLLOW_EOF_in_templateAndEOF72); 
			}

		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
	}
	// $ANTLR end "templateAndEOF"


	protected static class template_scope {
		CompilationState state;
	}
	protected Stack<template_scope> template_stack = new Stack<template_scope>();


	// $ANTLR start "template"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:146:1: template[String name, List<FormalArgument> args] returns [CompiledST impl] : chunk ;
	public final CompiledST template(String name, List<FormalArgument> args) throws RecognitionException {
		template_stack.push(new template_scope());
		CompiledST impl = null;



		 	template_stack.peek().state = new CompilationState(errMgr, name, input.getTokenStream());
			impl = template_stack.peek().state.impl;
		 	if ( template_stack.size() == 1 ) outermostImpl = impl;
			impl.defineFormalArgs(args); // make sure args are defined prior to compilation
			if ( name!=null && name.startsWith(Compiler.SUBTEMPLATE_PREFIX) ) {
			    impl.addArg(new FormalArgument("i"));
			    impl.addArg(new FormalArgument("i0"));
		    }
			impl.template = template; // always forget the entire template; char indexes are relative to it

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:160:2: ( chunk )
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:161:5: chunk
			{
			pushFollow(FOLLOW_chunk_in_template106);
			chunk();
			state._fsp--;

			 // finish off the CompiledST result
			        if ( template_stack.peek().state.stringtable!=null ) impl.strings = template_stack.peek().state.stringtable.toArray();
			        impl.codeSize = template_stack.peek().state.ip;
					
			}

		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
			template_stack.pop();
		}
		return impl;
	}
	// $ANTLR end "template"



	// $ANTLR start "chunk"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:167:1: chunk : ( element )* ;
	public final void chunk() throws RecognitionException {
		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:167:6: ( ( element )* )
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:168:5: ( element )*
			{
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:168:5: ( element )*
			loop1:
			while (true) {
				int alt1=2;
				int LA1_0 = input.LA(1);
				if ( (LA1_0==IF||LA1_0==TEXT||LA1_0==NEWLINE||LA1_0==EXPR||LA1_0==REGION||LA1_0==INDENTED_EXPR) ) {
					alt1=1;
				}

				switch (alt1) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:168:5: element
					{
					pushFollow(FOLLOW_element_in_chunk120);
					element();
					state._fsp--;

					}
					break;

				default :
					break loop1;
				}
			}

			}

		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
	}
	// $ANTLR end "chunk"



	// $ANTLR start "element"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:171:1: element : ( ^( INDENTED_EXPR INDENT compoundElement[$INDENT] ) | compoundElement[null] | ^( INDENTED_EXPR INDENT ( singleElement )? ) | singleElement );
	public final void element() throws RecognitionException {
		CommonTree INDENT1=null;
		CommonTree INDENT2=null;

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:171:8: ( ^( INDENTED_EXPR INDENT compoundElement[$INDENT] ) | compoundElement[null] | ^( INDENTED_EXPR INDENT ( singleElement )? ) | singleElement )
			int alt3=4;
			switch ( input.LA(1) ) {
			case INDENTED_EXPR:
				{
				int LA3_1 = input.LA(2);
				if ( (LA3_1==DOWN) ) {
					int LA3_4 = input.LA(3);
					if ( (LA3_4==INDENT) ) {
						int LA3_5 = input.LA(4);
						if ( (LA3_5==IF||LA3_5==REGION) ) {
							alt3=1;
						}
						else if ( (LA3_5==UP||LA3_5==TEXT||LA3_5==NEWLINE||LA3_5==EXPR) ) {
							alt3=3;
						}

						else {
							int nvaeMark = input.mark();
							try {
								for (int nvaeConsume = 0; nvaeConsume < 4 - 1; nvaeConsume++) {
									input.consume();
								}
								NoViableAltException nvae =
									new NoViableAltException("", 3, 5, input);
								throw nvae;
							} finally {
								input.rewind(nvaeMark);
							}
						}

					}

					else {
						int nvaeMark = input.mark();
						try {
							for (int nvaeConsume = 0; nvaeConsume < 3 - 1; nvaeConsume++) {
								input.consume();
							}
							NoViableAltException nvae =
								new NoViableAltException("", 3, 4, input);
							throw nvae;
						} finally {
							input.rewind(nvaeMark);
						}
					}

				}

				else {
					int nvaeMark = input.mark();
					try {
						input.consume();
						NoViableAltException nvae =
							new NoViableAltException("", 3, 1, input);
						throw nvae;
					} finally {
						input.rewind(nvaeMark);
					}
				}

				}
				break;
			case IF:
			case REGION:
				{
				alt3=2;
				}
				break;
			case TEXT:
			case NEWLINE:
			case EXPR:
				{
				alt3=4;
				}
				break;
			default:
				NoViableAltException nvae =
					new NoViableAltException("", 3, 0, input);
				throw nvae;
			}
			switch (alt3) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:172:5: ^( INDENTED_EXPR INDENT compoundElement[$INDENT] )
					{
					match(input,INDENTED_EXPR,FOLLOW_INDENTED_EXPR_in_element143); 
					match(input, Token.DOWN, null); 
					INDENT1=(CommonTree)match(input,INDENT,FOLLOW_INDENT_in_element145); 
					pushFollow(FOLLOW_compoundElement_in_element147);
					compoundElement(INDENT1);
					state._fsp--;

					match(input, Token.UP, null); 

					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:175:7: compoundElement[null]
					{
					pushFollow(FOLLOW_compoundElement_in_element163);
					compoundElement(null);
					state._fsp--;

					}
					break;
				case 3 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:176:7: ^( INDENTED_EXPR INDENT ( singleElement )? )
					{
					match(input,INDENTED_EXPR,FOLLOW_INDENTED_EXPR_in_element182); 
					match(input, Token.DOWN, null); 
					INDENT2=(CommonTree)match(input,INDENT,FOLLOW_INDENT_in_element184); 
					template_stack.peek().state.indent(INDENT2);
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:177:66: ( singleElement )?
					int alt2=2;
					int LA2_0 = input.LA(1);
					if ( (LA2_0==TEXT||LA2_0==NEWLINE||LA2_0==EXPR) ) {
						alt2=1;
					}
					switch (alt2) {
						case 1 :
							// src/org/stringtemplate/v4/compiler/CodeGenerator.g:177:66: singleElement
							{
							pushFollow(FOLLOW_singleElement_in_element188);
							singleElement();
							state._fsp--;

							}
							break;

					}

					template_stack.peek().state.emit(Bytecode.INSTR_DEDENT);
					match(input, Token.UP, null); 

					}
					break;
				case 4 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:179:7: singleElement
					{
					pushFollow(FOLLOW_singleElement_in_element205);
					singleElement();
					state._fsp--;

					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
	}
	// $ANTLR end "element"



	// $ANTLR start "singleElement"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:182:1: singleElement : ( exprElement | TEXT | NEWLINE );
	public final void singleElement() throws RecognitionException {
		CommonTree TEXT3=null;
		CommonTree NEWLINE4=null;

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:182:14: ( exprElement | TEXT | NEWLINE )
			int alt4=3;
			switch ( input.LA(1) ) {
			case EXPR:
				{
				alt4=1;
				}
				break;
			case TEXT:
				{
				alt4=2;
				}
				break;
			case NEWLINE:
				{
				alt4=3;
				}
				break;
			default:
				NoViableAltException nvae =
					new NoViableAltException("", 4, 0, input);
				throw nvae;
			}
			switch (alt4) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:183:5: exprElement
					{
					pushFollow(FOLLOW_exprElement_in_singleElement217);
					exprElement();
					state._fsp--;

					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:184:7: TEXT
					{
					TEXT3=(CommonTree)match(input,TEXT,FOLLOW_TEXT_in_singleElement225); 

							if ( (TEXT3!=null?TEXT3.getText():null).length()>0 ) {
								emit1(TEXT3,Bytecode.INSTR_WRITE_STR, (TEXT3!=null?TEXT3.getText():null));
							}
							
					}
					break;
				case 3 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:189:7: NEWLINE
					{
					NEWLINE4=(CommonTree)match(input,NEWLINE,FOLLOW_NEWLINE_in_singleElement235); 
					emit(NEWLINE4, Bytecode.INSTR_NEWLINE);
					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
	}
	// $ANTLR end "singleElement"



	// $ANTLR start "compoundElement"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:192:1: compoundElement[CommonTree indent] : ( ifstat[indent] | region[indent] );
	public final void compoundElement(CommonTree indent) throws RecognitionException {
		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:192:35: ( ifstat[indent] | region[indent] )
			int alt5=2;
			int LA5_0 = input.LA(1);
			if ( (LA5_0==IF) ) {
				alt5=1;
			}
			else if ( (LA5_0==REGION) ) {
				alt5=2;
			}

			else {
				NoViableAltException nvae =
					new NoViableAltException("", 5, 0, input);
				throw nvae;
			}

			switch (alt5) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:193:5: ifstat[indent]
					{
					pushFollow(FOLLOW_ifstat_in_compoundElement250);
					ifstat(indent);
					state._fsp--;

					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:194:7: region[indent]
					{
					pushFollow(FOLLOW_region_in_compoundElement259);
					region(indent);
					state._fsp--;

					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
	}
	// $ANTLR end "compoundElement"



	// $ANTLR start "exprElement"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:197:1: exprElement : ^( EXPR expr ( exprOptions )? ) ;
	public final void exprElement() throws RecognitionException {
		CommonTree EXPR5=null;

		 short op = Bytecode.INSTR_WRITE; 
		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:198:47: ( ^( EXPR expr ( exprOptions )? ) )
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:199:5: ^( EXPR expr ( exprOptions )? )
			{
			EXPR5=(CommonTree)match(input,EXPR,FOLLOW_EXPR_in_exprElement282); 
			match(input, Token.DOWN, null); 
			pushFollow(FOLLOW_expr_in_exprElement284);
			expr();
			state._fsp--;

			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:199:17: ( exprOptions )?
			int alt6=2;
			int LA6_0 = input.LA(1);
			if ( (LA6_0==OPTIONS) ) {
				alt6=1;
			}
			switch (alt6) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:199:18: exprOptions
					{
					pushFollow(FOLLOW_exprOptions_in_exprElement287);
					exprOptions();
					state._fsp--;

					op=Bytecode.INSTR_WRITE_OPT;
					}
					break;

			}

			match(input, Token.UP, null); 


					/*
					CompilationState state = template_stack.peek().state;
					CompiledST impl = state.impl;
					if ( impl.instrs[state.ip-1] == Bytecode.INSTR_LOAD_LOCAL ) {
						impl.instrs[state.ip-1] = Bytecode.INSTR_WRITE_LOCAL;
					}
					else {
						emit(EXPR5, op);
					}
					*/
					emit(EXPR5, op);
					
			}

		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
	}
	// $ANTLR end "exprElement"


	public static class region_return extends TreeRuleReturnScope {
		public String name;
	};


	// $ANTLR start "region"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:214:1: region[CommonTree indent] returns [String name] : ^( REGION ID template[$name,null] ) ;
	public final CodeGenerator.region_return region(CommonTree indent) throws RecognitionException {
		CodeGenerator.region_return retval = new CodeGenerator.region_return();
		retval.start = input.LT(1);

		CommonTree ID6=null;
		CompiledST template7 =null;


			if ( indent!=null ) template_stack.peek().state.indent(indent);

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:221:2: ( ^( REGION ID template[$name,null] ) )
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:222:5: ^( REGION ID template[$name,null] )
			{
			match(input,REGION,FOLLOW_REGION_in_region342); 
			match(input, Token.DOWN, null); 
			ID6=(CommonTree)match(input,ID,FOLLOW_ID_in_region344); 
			retval.name = STGroup.getMangledRegionName(outermostTemplateName, (ID6!=null?ID6.getText():null));
			pushFollow(FOLLOW_template_in_region348);
			template7=template(retval.name, null);
			state._fsp--;


						CompiledST sub = template7;
				        sub.isRegion = true;
				        sub.regionDefType = ST.RegionType.EMBEDDED;
				        sub.templateDefStartToken = ID6.token;
						//sub.dump();
						outermostImpl.addImplicitlyDefinedTemplate(sub);
						emit2(((CommonTree)retval.start), Bytecode.INSTR_NEW, retval.name, 0);
						emit(((CommonTree)retval.start), Bytecode.INSTR_WRITE);
						
			match(input, Token.UP, null); 

			}


				if ( indent!=null ) template_stack.peek().state.emit(Bytecode.INSTR_DEDENT);

		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
		return retval;
	}
	// $ANTLR end "region"


	public static class subtemplate_return extends TreeRuleReturnScope {
		public String name;
		public int nargs;
	};


	// $ANTLR start "subtemplate"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:236:1: subtemplate returns [String name, int nargs] : ( ^( SUBTEMPLATE ( ^( ARGS ( ID )+ ) )* template[$name,args] ) | SUBTEMPLATE );
	public final CodeGenerator.subtemplate_return subtemplate() throws RecognitionException {
		CodeGenerator.subtemplate_return retval = new CodeGenerator.subtemplate_return();
		retval.start = input.LT(1);

		CommonTree ID8=null;
		CommonTree SUBTEMPLATE10=null;
		CommonTree SUBTEMPLATE11=null;
		CompiledST template9 =null;


		    retval.name = Compiler.getNewSubtemplateName();
			List<FormalArgument> args = new ArrayList<FormalArgument>();

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:241:2: ( ^( SUBTEMPLATE ( ^( ARGS ( ID )+ ) )* template[$name,args] ) | SUBTEMPLATE )
			int alt9=2;
			int LA9_0 = input.LA(1);
			if ( (LA9_0==SUBTEMPLATE) ) {
				int LA9_1 = input.LA(2);
				if ( (LA9_1==DOWN) ) {
					alt9=1;
				}
				else if ( ((LA9_1 >= UP && LA9_1 <= ELSEIF)||(LA9_1 >= BANG && LA9_1 <= EQUALS)||LA9_1==TEXT||(LA9_1 >= ID && LA9_1 <= STRING)||(LA9_1 >= OR && LA9_1 <= AND)||LA9_1==NEWLINE||(LA9_1 >= TRUE && LA9_1 <= FALSE)||(LA9_1 >= EXPR && LA9_1 <= SUBTEMPLATE)||(LA9_1 >= REGION && LA9_1 <= INDENTED_EXPR)) ) {
					alt9=2;
				}

				else {
					int nvaeMark = input.mark();
					try {
						input.consume();
						NoViableAltException nvae =
							new NoViableAltException("", 9, 1, input);
						throw nvae;
					} finally {
						input.rewind(nvaeMark);
					}
				}

			}

			else {
				NoViableAltException nvae =
					new NoViableAltException("", 9, 0, input);
				throw nvae;
			}

			switch (alt9) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:242:5: ^( SUBTEMPLATE ( ^( ARGS ( ID )+ ) )* template[$name,args] )
					{
					SUBTEMPLATE10=(CommonTree)match(input,SUBTEMPLATE,FOLLOW_SUBTEMPLATE_in_subtemplate395); 
					if ( input.LA(1)==Token.DOWN ) {
						match(input, Token.DOWN, null); 
						// src/org/stringtemplate/v4/compiler/CodeGenerator.g:243:21: ( ^( ARGS ( ID )+ ) )*
						loop8:
						while (true) {
							int alt8=2;
							int LA8_0 = input.LA(1);
							if ( (LA8_0==ARGS) ) {
								alt8=1;
							}

							switch (alt8) {
							case 1 :
								// src/org/stringtemplate/v4/compiler/CodeGenerator.g:243:22: ^( ARGS ( ID )+ )
								{
								match(input,ARGS,FOLLOW_ARGS_in_subtemplate399); 
								match(input, Token.DOWN, null); 
								// src/org/stringtemplate/v4/compiler/CodeGenerator.g:243:29: ( ID )+
								int cnt7=0;
								loop7:
								while (true) {
									int alt7=2;
									int LA7_0 = input.LA(1);
									if ( (LA7_0==ID) ) {
										alt7=1;
									}

									switch (alt7) {
									case 1 :
										// src/org/stringtemplate/v4/compiler/CodeGenerator.g:243:30: ID
										{
										ID8=(CommonTree)match(input,ID,FOLLOW_ID_in_subtemplate402); 
										addArgument(args, ID8.token);
										}
										break;

									default :
										if ( cnt7 >= 1 ) break loop7;
										EarlyExitException eee = new EarlyExitException(7, input);
										throw eee;
									}
									cnt7++;
								}

								match(input, Token.UP, null); 

								}
								break;

							default :
								break loop8;
							}
						}

						retval.nargs = args.size();
						pushFollow(FOLLOW_template_in_subtemplate413);
						template9=template(retval.name, args);
						state._fsp--;


									CompiledST sub = template9;
									sub.isAnonSubtemplate = true;
							        sub.templateDefStartToken = SUBTEMPLATE10.token;
						            sub.ast = SUBTEMPLATE10;
						            sub.ast.setUnknownTokenBoundaries();
						            sub.tokens = input.getTokenStream();
									//sub.dump();
									outermostImpl.addImplicitlyDefinedTemplate(sub);
									
						match(input, Token.UP, null); 
					}

					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:254:7: SUBTEMPLATE
					{
					SUBTEMPLATE11=(CommonTree)match(input,SUBTEMPLATE,FOLLOW_SUBTEMPLATE_in_subtemplate430); 

								CompiledST sub = new CompiledST();
								sub.name = retval.name;
								sub.template = "";
								sub.addArg(new FormalArgument("i"));
								sub.addArg(new FormalArgument("i0"));
								sub.isAnonSubtemplate = true;
						        sub.templateDefStartToken = SUBTEMPLATE11.token;
					            sub.ast = SUBTEMPLATE11;
					            sub.ast.setUnknownTokenBoundaries();
					            sub.tokens = input.getTokenStream();
								//sub.dump();
								outermostImpl.addImplicitlyDefinedTemplate(sub);
								
					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
		return retval;
	}
	// $ANTLR end "subtemplate"



	// $ANTLR start "ifstat"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:271:1: ifstat[CommonTree indent] : ^(i= 'if' conditional chunk ( ^(eif= 'elseif' ec= conditional chunk ) )* ( ^(el= 'else' chunk ) )? ) ;
	public final void ifstat(CommonTree indent) throws RecognitionException {
		CommonTree i=null;
		CommonTree eif=null;
		CommonTree el=null;
		TreeRuleReturnScope ec =null;


		    /** Tracks address of branch operand (in code block).  It's how
		     *  we backpatch forward references when generating code for IFs.
		     */
		    int prevBranchOperand = -1;
		    /** Branch instruction operands that are forward refs to end of IF.
		     *  We need to update them once we see the endif.
		     */
		    List<Integer> endRefs = new ArrayList<Integer>();
		    if ( indent!=null ) template_stack.peek().state.indent(indent);

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:285:2: ( ^(i= 'if' conditional chunk ( ^(eif= 'elseif' ec= conditional chunk ) )* ( ^(el= 'else' chunk ) )? ) )
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:286:5: ^(i= 'if' conditional chunk ( ^(eif= 'elseif' ec= conditional chunk ) )* ( ^(el= 'else' chunk ) )? )
			{
			i=(CommonTree)match(input,IF,FOLLOW_IF_in_ifstat482); 
			match(input, Token.DOWN, null); 
			pushFollow(FOLLOW_conditional_in_ifstat484);
			conditional();
			state._fsp--;


				        prevBranchOperand = address()+1;
				        emit1(i,Bytecode.INSTR_BRF, -1); // write placeholder as branch target
						
			pushFollow(FOLLOW_chunk_in_ifstat488);
			chunk();
			state._fsp--;

			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:290:12: ( ^(eif= 'elseif' ec= conditional chunk ) )*
			loop10:
			while (true) {
				int alt10=2;
				int LA10_0 = input.LA(1);
				if ( (LA10_0==ELSEIF) ) {
					alt10=1;
				}

				switch (alt10) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:291:13: ^(eif= 'elseif' ec= conditional chunk )
					{
					eif=(CommonTree)match(input,ELSEIF,FOLLOW_ELSEIF_in_ifstat526); 

									endRefs.add(address()+1);
									emit1(eif,Bytecode.INSTR_BR, -1); // br end
									// update previous branch instruction
									write(prevBranchOperand, (short)address());
									prevBranchOperand = -1;
									
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_conditional_in_ifstat534);
					ec=conditional();
					state._fsp--;


							       	prevBranchOperand = address()+1;
							       	// write placeholder as branch target
							       	emit1((ec!=null?((CommonTree)ec.start):null), Bytecode.INSTR_BRF, -1);
									
					pushFollow(FOLLOW_chunk_in_ifstat538);
					chunk();
					state._fsp--;

					match(input, Token.UP, null); 

					}
					break;

				default :
					break loop10;
				}
			}

			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:304:12: ( ^(el= 'else' chunk ) )?
			int alt11=2;
			int LA11_0 = input.LA(1);
			if ( (LA11_0==ELSE) ) {
				alt11=1;
			}
			switch (alt11) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:305:13: ^(el= 'else' chunk )
					{
					el=(CommonTree)match(input,ELSE,FOLLOW_ELSE_in_ifstat601); 

										endRefs.add(address()+1);
										emit1(el, Bytecode.INSTR_BR, -1); // br end
										// update previous branch instruction
										write(prevBranchOperand, (short)address());
										prevBranchOperand = -1;
										
					if ( input.LA(1)==Token.DOWN ) {
						match(input, Token.DOWN, null); 
						pushFollow(FOLLOW_chunk_in_ifstat605);
						chunk();
						state._fsp--;

						match(input, Token.UP, null); 
					}

					}
					break;

			}

			match(input, Token.UP, null); 


					if ( prevBranchOperand>=0 ) {
						write(prevBranchOperand, (short)address());
					}
			        for (int opnd : endRefs) write(opnd, (short)address());
					
			}


				if ( indent!=null ) template_stack.peek().state.emit(Bytecode.INSTR_DEDENT);

		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
	}
	// $ANTLR end "ifstat"


	public static class conditional_return extends TreeRuleReturnScope {
	};


	// $ANTLR start "conditional"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:323:1: conditional : ( ^( OR conditional conditional ) | ^( AND conditional conditional ) | ^( BANG conditional ) | expr );
	public final CodeGenerator.conditional_return conditional() throws RecognitionException {
		CodeGenerator.conditional_return retval = new CodeGenerator.conditional_return();
		retval.start = input.LT(1);

		CommonTree OR12=null;
		CommonTree AND13=null;
		CommonTree BANG14=null;

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:323:12: ( ^( OR conditional conditional ) | ^( AND conditional conditional ) | ^( BANG conditional ) | expr )
			int alt12=4;
			switch ( input.LA(1) ) {
			case OR:
				{
				alt12=1;
				}
				break;
			case AND:
				{
				alt12=2;
				}
				break;
			case BANG:
				{
				alt12=3;
				}
				break;
			case ID:
			case STRING:
			case TRUE:
			case FALSE:
			case PROP:
			case PROP_IND:
			case INCLUDE:
			case INCLUDE_IND:
			case EXEC_FUNC:
			case INCLUDE_SUPER:
			case INCLUDE_SUPER_REGION:
			case INCLUDE_REGION:
			case TO_STR:
			case LIST:
			case MAP:
			case ZIP:
			case SUBTEMPLATE:
				{
				alt12=4;
				}
				break;
			default:
				NoViableAltException nvae =
					new NoViableAltException("", 12, 0, input);
				throw nvae;
			}
			switch (alt12) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:324:5: ^( OR conditional conditional )
					{
					OR12=(CommonTree)match(input,OR,FOLLOW_OR_in_conditional651); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_conditional_in_conditional653);
					conditional();
					state._fsp--;

					pushFollow(FOLLOW_conditional_in_conditional655);
					conditional();
					state._fsp--;

					match(input, Token.UP, null); 

					emit(OR12, Bytecode.INSTR_OR);
					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:325:7: ^( AND conditional conditional )
					{
					AND13=(CommonTree)match(input,AND,FOLLOW_AND_in_conditional667); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_conditional_in_conditional669);
					conditional();
					state._fsp--;

					pushFollow(FOLLOW_conditional_in_conditional671);
					conditional();
					state._fsp--;

					match(input, Token.UP, null); 

					emit(AND13, Bytecode.INSTR_AND);
					}
					break;
				case 3 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:326:7: ^( BANG conditional )
					{
					BANG14=(CommonTree)match(input,BANG,FOLLOW_BANG_in_conditional683); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_conditional_in_conditional685);
					conditional();
					state._fsp--;

					match(input, Token.UP, null); 

					emit(BANG14, Bytecode.INSTR_NOT);
					}
					break;
				case 4 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:327:7: expr
					{
					pushFollow(FOLLOW_expr_in_conditional696);
					expr();
					state._fsp--;

					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
		return retval;
	}
	// $ANTLR end "conditional"


	public static class exprOptions_return extends TreeRuleReturnScope {
	};


	// $ANTLR start "exprOptions"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:330:1: exprOptions : ^( OPTIONS ( option )* ) ;
	public final CodeGenerator.exprOptions_return exprOptions() throws RecognitionException {
		CodeGenerator.exprOptions_return retval = new CodeGenerator.exprOptions_return();
		retval.start = input.LT(1);

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:330:12: ( ^( OPTIONS ( option )* ) )
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:331:5: ^( OPTIONS ( option )* )
			{
			emit(((CommonTree)retval.start), Bytecode.INSTR_OPTIONS);
			match(input,OPTIONS,FOLLOW_OPTIONS_in_exprOptions712); 
			if ( input.LA(1)==Token.DOWN ) {
				match(input, Token.DOWN, null); 
				// src/org/stringtemplate/v4/compiler/CodeGenerator.g:331:55: ( option )*
				loop13:
				while (true) {
					int alt13=2;
					int LA13_0 = input.LA(1);
					if ( (LA13_0==EQUALS) ) {
						alt13=1;
					}

					switch (alt13) {
					case 1 :
						// src/org/stringtemplate/v4/compiler/CodeGenerator.g:331:55: option
						{
						pushFollow(FOLLOW_option_in_exprOptions714);
						option();
						state._fsp--;

						}
						break;

					default :
						break loop13;
					}
				}

				match(input, Token.UP, null); 
			}

			}

		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
		return retval;
	}
	// $ANTLR end "exprOptions"



	// $ANTLR start "option"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:334:1: option : ^( '=' ID expr ) ;
	public final void option() throws RecognitionException {
		CommonTree ID15=null;

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:334:7: ( ^( '=' ID expr ) )
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:335:5: ^( '=' ID expr )
			{
			match(input,EQUALS,FOLLOW_EQUALS_in_option729); 
			match(input, Token.DOWN, null); 
			ID15=(CommonTree)match(input,ID,FOLLOW_ID_in_option731); 
			pushFollow(FOLLOW_expr_in_option733);
			expr();
			state._fsp--;

			match(input, Token.UP, null); 

			setOption(ID15);
			}

		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
	}
	// $ANTLR end "option"



	// $ANTLR start "expr"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:338:1: expr : ( ^( ZIP ^( ELEMENTS ( expr )+ ) mapTemplateRef[ne] ) | ^( MAP expr ( mapTemplateRef[1] )+ ) | prop | includeExpr );
	public final void expr() throws RecognitionException {
		CommonTree ZIP16=null;
		CommonTree MAP17=null;

		int nt = 0, ne = 0;
		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:339:32: ( ^( ZIP ^( ELEMENTS ( expr )+ ) mapTemplateRef[ne] ) | ^( MAP expr ( mapTemplateRef[1] )+ ) | prop | includeExpr )
			int alt16=4;
			switch ( input.LA(1) ) {
			case ZIP:
				{
				alt16=1;
				}
				break;
			case MAP:
				{
				alt16=2;
				}
				break;
			case PROP:
			case PROP_IND:
				{
				alt16=3;
				}
				break;
			case ID:
			case STRING:
			case TRUE:
			case FALSE:
			case INCLUDE:
			case INCLUDE_IND:
			case EXEC_FUNC:
			case INCLUDE_SUPER:
			case INCLUDE_SUPER_REGION:
			case INCLUDE_REGION:
			case TO_STR:
			case LIST:
			case SUBTEMPLATE:
				{
				alt16=4;
				}
				break;
			default:
				NoViableAltException nvae =
					new NoViableAltException("", 16, 0, input);
				throw nvae;
			}
			switch (alt16) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:340:5: ^( ZIP ^( ELEMENTS ( expr )+ ) mapTemplateRef[ne] )
					{
					ZIP16=(CommonTree)match(input,ZIP,FOLLOW_ZIP_in_expr758); 
					match(input, Token.DOWN, null); 
					match(input,ELEMENTS,FOLLOW_ELEMENTS_in_expr761); 
					match(input, Token.DOWN, null); 
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:340:22: ( expr )+
					int cnt14=0;
					loop14:
					while (true) {
						int alt14=2;
						int LA14_0 = input.LA(1);
						if ( ((LA14_0 >= ID && LA14_0 <= STRING)||(LA14_0 >= TRUE && LA14_0 <= FALSE)||(LA14_0 >= PROP && LA14_0 <= SUBTEMPLATE)) ) {
							alt14=1;
						}

						switch (alt14) {
						case 1 :
							// src/org/stringtemplate/v4/compiler/CodeGenerator.g:340:23: expr
							{
							pushFollow(FOLLOW_expr_in_expr764);
							expr();
							state._fsp--;

							ne++;
							}
							break;

						default :
							if ( cnt14 >= 1 ) break loop14;
							EarlyExitException eee = new EarlyExitException(14, input);
							throw eee;
						}
						cnt14++;
					}

					match(input, Token.UP, null); 

					pushFollow(FOLLOW_mapTemplateRef_in_expr771);
					mapTemplateRef(ne);
					state._fsp--;

					match(input, Token.UP, null); 

					emit1(ZIP16, Bytecode.INSTR_ZIP_MAP, ne);
					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:341:7: ^( MAP expr ( mapTemplateRef[1] )+ )
					{
					MAP17=(CommonTree)match(input,MAP,FOLLOW_MAP_in_expr784); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_expr_in_expr786);
					expr();
					state._fsp--;

					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:341:18: ( mapTemplateRef[1] )+
					int cnt15=0;
					loop15:
					while (true) {
						int alt15=2;
						int LA15_0 = input.LA(1);
						if ( ((LA15_0 >= INCLUDE && LA15_0 <= INCLUDE_IND)||LA15_0==SUBTEMPLATE) ) {
							alt15=1;
						}

						switch (alt15) {
						case 1 :
							// src/org/stringtemplate/v4/compiler/CodeGenerator.g:341:19: mapTemplateRef[1]
							{
							pushFollow(FOLLOW_mapTemplateRef_in_expr789);
							mapTemplateRef(1);
							state._fsp--;

							nt++;
							}
							break;

						default :
							if ( cnt15 >= 1 ) break loop15;
							EarlyExitException eee = new EarlyExitException(15, input);
							throw eee;
						}
						cnt15++;
					}

					match(input, Token.UP, null); 


							if ( nt>1 ) emit1(MAP17, nt>1?Bytecode.INSTR_ROT_MAP:Bytecode.INSTR_MAP, nt);
							else emit(MAP17, Bytecode.INSTR_MAP);
							
					}
					break;
				case 3 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:345:7: prop
					{
					pushFollow(FOLLOW_prop_in_expr805);
					prop();
					state._fsp--;

					}
					break;
				case 4 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:346:7: includeExpr
					{
					pushFollow(FOLLOW_includeExpr_in_expr813);
					includeExpr();
					state._fsp--;

					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
	}
	// $ANTLR end "expr"



	// $ANTLR start "prop"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:349:1: prop : ( ^( PROP expr ID ) | ^( PROP_IND expr expr ) );
	public final void prop() throws RecognitionException {
		CommonTree PROP18=null;
		CommonTree ID19=null;
		CommonTree PROP_IND20=null;

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:349:5: ( ^( PROP expr ID ) | ^( PROP_IND expr expr ) )
			int alt17=2;
			int LA17_0 = input.LA(1);
			if ( (LA17_0==PROP) ) {
				alt17=1;
			}
			else if ( (LA17_0==PROP_IND) ) {
				alt17=2;
			}

			else {
				NoViableAltException nvae =
					new NoViableAltException("", 17, 0, input);
				throw nvae;
			}

			switch (alt17) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:350:5: ^( PROP expr ID )
					{
					PROP18=(CommonTree)match(input,PROP,FOLLOW_PROP_in_prop826); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_expr_in_prop828);
					expr();
					state._fsp--;

					ID19=(CommonTree)match(input,ID,FOLLOW_ID_in_prop830); 
					match(input, Token.UP, null); 

					emit1(PROP18, Bytecode.INSTR_LOAD_PROP, (ID19!=null?ID19.getText():null));
					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:351:7: ^( PROP_IND expr expr )
					{
					PROP_IND20=(CommonTree)match(input,PROP_IND,FOLLOW_PROP_IND_in_prop842); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_expr_in_prop844);
					expr();
					state._fsp--;

					pushFollow(FOLLOW_expr_in_prop846);
					expr();
					state._fsp--;

					match(input, Token.UP, null); 

					emit(PROP_IND20, Bytecode.INSTR_LOAD_PROP_IND);
					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
	}
	// $ANTLR end "prop"


	public static class mapTemplateRef_return extends TreeRuleReturnScope {
	};


	// $ANTLR start "mapTemplateRef"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:354:1: mapTemplateRef[int num_exprs] : ( ^( INCLUDE qualifiedId args ) | subtemplate | ^( INCLUDE_IND expr args ) );
	public final CodeGenerator.mapTemplateRef_return mapTemplateRef(int num_exprs) throws RecognitionException {
		CodeGenerator.mapTemplateRef_return retval = new CodeGenerator.mapTemplateRef_return();
		retval.start = input.LT(1);

		CommonTree INCLUDE21=null;
		CommonTree INCLUDE_IND25=null;
		TreeRuleReturnScope args22 =null;
		TreeRuleReturnScope qualifiedId23 =null;
		TreeRuleReturnScope subtemplate24 =null;
		TreeRuleReturnScope args26 =null;

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:354:30: ( ^( INCLUDE qualifiedId args ) | subtemplate | ^( INCLUDE_IND expr args ) )
			int alt18=3;
			switch ( input.LA(1) ) {
			case INCLUDE:
				{
				alt18=1;
				}
				break;
			case SUBTEMPLATE:
				{
				alt18=2;
				}
				break;
			case INCLUDE_IND:
				{
				alt18=3;
				}
				break;
			default:
				NoViableAltException nvae =
					new NoViableAltException("", 18, 0, input);
				throw nvae;
			}
			switch (alt18) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:355:5: ^( INCLUDE qualifiedId args )
					{
					INCLUDE21=(CommonTree)match(input,INCLUDE,FOLLOW_INCLUDE_in_mapTemplateRef872); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_qualifiedId_in_mapTemplateRef874);
					qualifiedId23=qualifiedId();
					state._fsp--;

					for (int i=1; i<=num_exprs; i++) emit(INCLUDE21,Bytecode.INSTR_NULL);
					pushFollow(FOLLOW_args_in_mapTemplateRef878);
					args22=args();
					state._fsp--;

					match(input, Token.UP, null); 


							if ( (args22!=null?((CodeGenerator.args_return)args22).passThru:false) ) emit1(((CommonTree)retval.start), Bytecode.INSTR_PASSTHRU, (qualifiedId23!=null?(input.getTokenStream().toString(input.getTreeAdaptor().getTokenStartIndex(qualifiedId23.start),input.getTreeAdaptor().getTokenStopIndex(qualifiedId23.start))):null));
							if ( (args22!=null?((CodeGenerator.args_return)args22).namedArgs:false) ) emit1(INCLUDE21, Bytecode.INSTR_NEW_BOX_ARGS, (qualifiedId23!=null?(input.getTokenStream().toString(input.getTreeAdaptor().getTokenStartIndex(qualifiedId23.start),input.getTreeAdaptor().getTokenStopIndex(qualifiedId23.start))):null));
							else emit2(INCLUDE21, Bytecode.INSTR_NEW, (qualifiedId23!=null?(input.getTokenStream().toString(input.getTreeAdaptor().getTokenStartIndex(qualifiedId23.start),input.getTreeAdaptor().getTokenStopIndex(qualifiedId23.start))):null), (args22!=null?((CodeGenerator.args_return)args22).n:0)+num_exprs);
							
					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:362:7: subtemplate
					{
					pushFollow(FOLLOW_subtemplate_in_mapTemplateRef894);
					subtemplate24=subtemplate();
					state._fsp--;


							if ( (subtemplate24!=null?((CodeGenerator.subtemplate_return)subtemplate24).nargs:0) != num_exprs ) {
					            errMgr.compileTimeError(ErrorType.ANON_ARGUMENT_MISMATCH,
					            						templateToken, (subtemplate24!=null?((CommonTree)subtemplate24.start):null).token, (subtemplate24!=null?((CodeGenerator.subtemplate_return)subtemplate24).nargs:0), num_exprs);
							}
							for (int i=1; i<=num_exprs; i++) emit((subtemplate24!=null?((CommonTree)subtemplate24.start):null),Bytecode.INSTR_NULL);
					        emit2((subtemplate24!=null?((CommonTree)subtemplate24.start):null), Bytecode.INSTR_NEW,
						              (subtemplate24!=null?((CodeGenerator.subtemplate_return)subtemplate24).name:null),
						              num_exprs);
							
					}
					break;
				case 3 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:372:7: ^( INCLUDE_IND expr args )
					{
					INCLUDE_IND25=(CommonTree)match(input,INCLUDE_IND,FOLLOW_INCLUDE_IND_in_mapTemplateRef914); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_expr_in_mapTemplateRef916);
					expr();
					state._fsp--;


								emit(INCLUDE_IND25,Bytecode.INSTR_TOSTR);
								for (int i=1; i<=num_exprs; i++) emit(INCLUDE_IND25,Bytecode.INSTR_NULL);
								
					pushFollow(FOLLOW_args_in_mapTemplateRef920);
					args26=args();
					state._fsp--;


								emit1(INCLUDE_IND25, Bytecode.INSTR_NEW_IND, (args26!=null?((CodeGenerator.args_return)args26).n:0)+num_exprs);
								
					match(input, Token.UP, null); 

					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
		return retval;
	}
	// $ANTLR end "mapTemplateRef"


	public static class includeExpr_return extends TreeRuleReturnScope {
	};


	// $ANTLR start "includeExpr"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:382:1: includeExpr : ( ^( EXEC_FUNC ID ( expr )? ) | ^( INCLUDE qualifiedId args ) | ^( INCLUDE_SUPER ID args ) | ^( INCLUDE_REGION ID ) | ^( INCLUDE_SUPER_REGION ID ) | primary );
	public final CodeGenerator.includeExpr_return includeExpr() throws RecognitionException {
		CodeGenerator.includeExpr_return retval = new CodeGenerator.includeExpr_return();
		retval.start = input.LT(1);

		CommonTree ID27=null;
		CommonTree INCLUDE30=null;
		CommonTree ID32=null;
		CommonTree INCLUDE_SUPER33=null;
		CommonTree ID34=null;
		CommonTree INCLUDE_REGION35=null;
		CommonTree ID36=null;
		CommonTree INCLUDE_SUPER_REGION37=null;
		TreeRuleReturnScope args28 =null;
		TreeRuleReturnScope qualifiedId29 =null;
		TreeRuleReturnScope args31 =null;

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:382:12: ( ^( EXEC_FUNC ID ( expr )? ) | ^( INCLUDE qualifiedId args ) | ^( INCLUDE_SUPER ID args ) | ^( INCLUDE_REGION ID ) | ^( INCLUDE_SUPER_REGION ID ) | primary )
			int alt20=6;
			switch ( input.LA(1) ) {
			case EXEC_FUNC:
				{
				alt20=1;
				}
				break;
			case INCLUDE:
				{
				alt20=2;
				}
				break;
			case INCLUDE_SUPER:
				{
				alt20=3;
				}
				break;
			case INCLUDE_REGION:
				{
				alt20=4;
				}
				break;
			case INCLUDE_SUPER_REGION:
				{
				alt20=5;
				}
				break;
			case ID:
			case STRING:
			case TRUE:
			case FALSE:
			case INCLUDE_IND:
			case TO_STR:
			case LIST:
			case SUBTEMPLATE:
				{
				alt20=6;
				}
				break;
			default:
				NoViableAltException nvae =
					new NoViableAltException("", 20, 0, input);
				throw nvae;
			}
			switch (alt20) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:383:5: ^( EXEC_FUNC ID ( expr )? )
					{
					match(input,EXEC_FUNC,FOLLOW_EXEC_FUNC_in_includeExpr941); 
					match(input, Token.DOWN, null); 
					ID27=(CommonTree)match(input,ID,FOLLOW_ID_in_includeExpr943); 
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:383:20: ( expr )?
					int alt19=2;
					int LA19_0 = input.LA(1);
					if ( ((LA19_0 >= ID && LA19_0 <= STRING)||(LA19_0 >= TRUE && LA19_0 <= FALSE)||(LA19_0 >= PROP && LA19_0 <= SUBTEMPLATE)) ) {
						alt19=1;
					}
					switch (alt19) {
						case 1 :
							// src/org/stringtemplate/v4/compiler/CodeGenerator.g:383:20: expr
							{
							pushFollow(FOLLOW_expr_in_includeExpr945);
							expr();
							state._fsp--;

							}
							break;

					}

					match(input, Token.UP, null); 

					func(ID27);
					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:384:7: ^( INCLUDE qualifiedId args )
					{
					INCLUDE30=(CommonTree)match(input,INCLUDE,FOLLOW_INCLUDE_in_includeExpr958); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_qualifiedId_in_includeExpr960);
					qualifiedId29=qualifiedId();
					state._fsp--;

					pushFollow(FOLLOW_args_in_includeExpr962);
					args28=args();
					state._fsp--;

					match(input, Token.UP, null); 


							if ( (args28!=null?((CodeGenerator.args_return)args28).passThru:false) ) emit1(((CommonTree)retval.start), Bytecode.INSTR_PASSTHRU, (qualifiedId29!=null?(input.getTokenStream().toString(input.getTreeAdaptor().getTokenStartIndex(qualifiedId29.start),input.getTreeAdaptor().getTokenStopIndex(qualifiedId29.start))):null));
							if ( (args28!=null?((CodeGenerator.args_return)args28).namedArgs:false) ) emit1(INCLUDE30, Bytecode.INSTR_NEW_BOX_ARGS, (qualifiedId29!=null?(input.getTokenStream().toString(input.getTreeAdaptor().getTokenStartIndex(qualifiedId29.start),input.getTreeAdaptor().getTokenStopIndex(qualifiedId29.start))):null));
							else emit2(INCLUDE30, Bytecode.INSTR_NEW, (qualifiedId29!=null?(input.getTokenStream().toString(input.getTreeAdaptor().getTokenStartIndex(qualifiedId29.start),input.getTreeAdaptor().getTokenStopIndex(qualifiedId29.start))):null), (args28!=null?((CodeGenerator.args_return)args28).n:0));
							
					}
					break;
				case 3 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:389:7: ^( INCLUDE_SUPER ID args )
					{
					INCLUDE_SUPER33=(CommonTree)match(input,INCLUDE_SUPER,FOLLOW_INCLUDE_SUPER_in_includeExpr974); 
					match(input, Token.DOWN, null); 
					ID32=(CommonTree)match(input,ID,FOLLOW_ID_in_includeExpr976); 
					pushFollow(FOLLOW_args_in_includeExpr978);
					args31=args();
					state._fsp--;

					match(input, Token.UP, null); 


							if ( (args31!=null?((CodeGenerator.args_return)args31).passThru:false) ) emit1(((CommonTree)retval.start), Bytecode.INSTR_PASSTHRU, (ID32!=null?ID32.getText():null));
							if ( (args31!=null?((CodeGenerator.args_return)args31).namedArgs:false) ) emit1(INCLUDE_SUPER33, Bytecode.INSTR_SUPER_NEW_BOX_ARGS, (ID32!=null?ID32.getText():null));
							else emit2(INCLUDE_SUPER33, Bytecode.INSTR_SUPER_NEW, (ID32!=null?ID32.getText():null), (args31!=null?((CodeGenerator.args_return)args31).n:0));
							
					}
					break;
				case 4 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:394:7: ^( INCLUDE_REGION ID )
					{
					INCLUDE_REGION35=(CommonTree)match(input,INCLUDE_REGION,FOLLOW_INCLUDE_REGION_in_includeExpr990); 
					match(input, Token.DOWN, null); 
					ID34=(CommonTree)match(input,ID,FOLLOW_ID_in_includeExpr992); 
					match(input, Token.UP, null); 


														CompiledST impl =
															Compiler.defineBlankRegion(outermostImpl, ID34.token);
														//impl.dump();
														emit2(INCLUDE_REGION35,Bytecode.INSTR_NEW,impl.name,0);
														
					}
					break;
				case 5 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:400:7: ^( INCLUDE_SUPER_REGION ID )
					{
					INCLUDE_SUPER_REGION37=(CommonTree)match(input,INCLUDE_SUPER_REGION,FOLLOW_INCLUDE_SUPER_REGION_in_includeExpr1004); 
					match(input, Token.DOWN, null); 
					ID36=(CommonTree)match(input,ID,FOLLOW_ID_in_includeExpr1006); 
					match(input, Token.UP, null); 


							                            String mangled =
							                                STGroup.getMangledRegionName(outermostImpl.name, (ID36!=null?ID36.getText():null));
														emit2(INCLUDE_SUPER_REGION37,Bytecode.INSTR_SUPER_NEW,mangled,0);
														
					}
					break;
				case 6 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:405:7: primary
					{
					pushFollow(FOLLOW_primary_in_includeExpr1017);
					primary();
					state._fsp--;

					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
		return retval;
	}
	// $ANTLR end "includeExpr"


	public static class primary_return extends TreeRuleReturnScope {
	};


	// $ANTLR start "primary"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:408:1: primary : ( ID | STRING | TRUE | FALSE | subtemplate | list | ^( INCLUDE_IND expr args ) | ^( TO_STR expr ) );
	public final CodeGenerator.primary_return primary() throws RecognitionException {
		CodeGenerator.primary_return retval = new CodeGenerator.primary_return();
		retval.start = input.LT(1);

		CommonTree ID38=null;
		CommonTree STRING39=null;
		CommonTree TRUE40=null;
		CommonTree FALSE41=null;
		CommonTree INCLUDE_IND43=null;
		CommonTree TO_STR45=null;
		TreeRuleReturnScope subtemplate42 =null;
		TreeRuleReturnScope args44 =null;

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:408:8: ( ID | STRING | TRUE | FALSE | subtemplate | list | ^( INCLUDE_IND expr args ) | ^( TO_STR expr ) )
			int alt21=8;
			switch ( input.LA(1) ) {
			case ID:
				{
				alt21=1;
				}
				break;
			case STRING:
				{
				alt21=2;
				}
				break;
			case TRUE:
				{
				alt21=3;
				}
				break;
			case FALSE:
				{
				alt21=4;
				}
				break;
			case SUBTEMPLATE:
				{
				alt21=5;
				}
				break;
			case LIST:
				{
				alt21=6;
				}
				break;
			case INCLUDE_IND:
				{
				alt21=7;
				}
				break;
			case TO_STR:
				{
				alt21=8;
				}
				break;
			default:
				NoViableAltException nvae =
					new NoViableAltException("", 21, 0, input);
				throw nvae;
			}
			switch (alt21) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:409:5: ID
					{
					ID38=(CommonTree)match(input,ID,FOLLOW_ID_in_primary1029); 
					refAttr(ID38);
					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:410:7: STRING
					{
					STRING39=(CommonTree)match(input,STRING,FOLLOW_STRING_in_primary1039); 
					emit1(STRING39,Bytecode.INSTR_LOAD_STR, Misc.strip((STRING39!=null?STRING39.getText():null),1));
					}
					break;
				case 3 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:411:7: TRUE
					{
					TRUE40=(CommonTree)match(input,TRUE,FOLLOW_TRUE_in_primary1049); 
					emit(TRUE40, Bytecode.INSTR_TRUE);
					}
					break;
				case 4 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:412:7: FALSE
					{
					FALSE41=(CommonTree)match(input,FALSE,FOLLOW_FALSE_in_primary1059); 
					emit(FALSE41, Bytecode.INSTR_FALSE);
					}
					break;
				case 5 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:413:7: subtemplate
					{
					pushFollow(FOLLOW_subtemplate_in_primary1069);
					subtemplate42=subtemplate();
					state._fsp--;

					emit2(((CommonTree)retval.start),Bytecode.INSTR_NEW, (subtemplate42!=null?((CodeGenerator.subtemplate_return)subtemplate42).name:null), 0);
					}
					break;
				case 6 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:415:7: list
					{
					pushFollow(FOLLOW_list_in_primary1084);
					list();
					state._fsp--;

					}
					break;
				case 7 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:416:7: ^( INCLUDE_IND expr args )
					{
					INCLUDE_IND43=(CommonTree)match(input,INCLUDE_IND,FOLLOW_INCLUDE_IND_in_primary1102); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_expr_in_primary1104);
					expr();
					state._fsp--;

					emit(INCLUDE_IND43, Bytecode.INSTR_TOSTR);
					pushFollow(FOLLOW_args_in_primary1108);
					args44=args();
					state._fsp--;

					emit1(INCLUDE_IND43, Bytecode.INSTR_NEW_IND, (args44!=null?((CodeGenerator.args_return)args44).n:0));
					match(input, Token.UP, null); 

					}
					break;
				case 8 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:419:7: ^( TO_STR expr )
					{
					TO_STR45=(CommonTree)match(input,TO_STR,FOLLOW_TO_STR_in_primary1125); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_expr_in_primary1127);
					expr();
					state._fsp--;

					match(input, Token.UP, null); 

					emit(TO_STR45, Bytecode.INSTR_TOSTR);
					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
		return retval;
	}
	// $ANTLR end "primary"


	public static class qualifiedId_return extends TreeRuleReturnScope {
	};


	// $ANTLR start "qualifiedId"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:422:1: qualifiedId : ( ^( SLASH qualifiedId ID ) | ^( SLASH ID ) | ID );
	public final CodeGenerator.qualifiedId_return qualifiedId() throws RecognitionException {
		CodeGenerator.qualifiedId_return retval = new CodeGenerator.qualifiedId_return();
		retval.start = input.LT(1);

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:422:12: ( ^( SLASH qualifiedId ID ) | ^( SLASH ID ) | ID )
			int alt22=3;
			int LA22_0 = input.LA(1);
			if ( (LA22_0==SLASH) ) {
				int LA22_1 = input.LA(2);
				if ( (LA22_1==DOWN) ) {
					int LA22_3 = input.LA(3);
					if ( (LA22_3==ID) ) {
						int LA22_4 = input.LA(4);
						if ( (LA22_4==UP) ) {
							alt22=2;
						}
						else if ( (LA22_4==ID) ) {
							alt22=1;
						}

						else {
							int nvaeMark = input.mark();
							try {
								for (int nvaeConsume = 0; nvaeConsume < 4 - 1; nvaeConsume++) {
									input.consume();
								}
								NoViableAltException nvae =
									new NoViableAltException("", 22, 4, input);
								throw nvae;
							} finally {
								input.rewind(nvaeMark);
							}
						}

					}
					else if ( (LA22_3==SLASH) ) {
						alt22=1;
					}

					else {
						int nvaeMark = input.mark();
						try {
							for (int nvaeConsume = 0; nvaeConsume < 3 - 1; nvaeConsume++) {
								input.consume();
							}
							NoViableAltException nvae =
								new NoViableAltException("", 22, 3, input);
							throw nvae;
						} finally {
							input.rewind(nvaeMark);
						}
					}

				}

				else {
					int nvaeMark = input.mark();
					try {
						input.consume();
						NoViableAltException nvae =
							new NoViableAltException("", 22, 1, input);
						throw nvae;
					} finally {
						input.rewind(nvaeMark);
					}
				}

			}
			else if ( (LA22_0==ID) ) {
				alt22=3;
			}

			else {
				NoViableAltException nvae =
					new NoViableAltException("", 22, 0, input);
				throw nvae;
			}

			switch (alt22) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:423:5: ^( SLASH qualifiedId ID )
					{
					match(input,SLASH,FOLLOW_SLASH_in_qualifiedId1143); 
					match(input, Token.DOWN, null); 
					pushFollow(FOLLOW_qualifiedId_in_qualifiedId1145);
					qualifiedId();
					state._fsp--;

					match(input,ID,FOLLOW_ID_in_qualifiedId1147); 
					match(input, Token.UP, null); 

					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:424:7: ^( SLASH ID )
					{
					match(input,SLASH,FOLLOW_SLASH_in_qualifiedId1157); 
					match(input, Token.DOWN, null); 
					match(input,ID,FOLLOW_ID_in_qualifiedId1159); 
					match(input, Token.UP, null); 

					}
					break;
				case 3 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:425:7: ID
					{
					match(input,ID,FOLLOW_ID_in_qualifiedId1168); 
					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
		return retval;
	}
	// $ANTLR end "qualifiedId"



	// $ANTLR start "arg"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:428:1: arg : expr ;
	public final void arg() throws RecognitionException {
		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:428:4: ( expr )
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:429:5: expr
			{
			pushFollow(FOLLOW_expr_in_arg1180);
			expr();
			state._fsp--;

			}

		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
	}
	// $ANTLR end "arg"


	public static class args_return extends TreeRuleReturnScope {
		public int n=0;
		public boolean namedArgs=false;
		public boolean passThru;
	};


	// $ANTLR start "args"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:432:1: args returns [int n=0, boolean namedArgs=false, boolean passThru] : ( ( arg )+ | ( ^(eq= '=' ID expr ) )+ ( '...' )? | '...' |);
	public final CodeGenerator.args_return args() throws RecognitionException {
		CodeGenerator.args_return retval = new CodeGenerator.args_return();
		retval.start = input.LT(1);

		CommonTree eq=null;
		CommonTree ID46=null;

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:433:64: ( ( arg )+ | ( ^(eq= '=' ID expr ) )+ ( '...' )? | '...' |)
			int alt26=4;
			switch ( input.LA(1) ) {
			case ID:
			case STRING:
			case TRUE:
			case FALSE:
			case PROP:
			case PROP_IND:
			case INCLUDE:
			case INCLUDE_IND:
			case EXEC_FUNC:
			case INCLUDE_SUPER:
			case INCLUDE_SUPER_REGION:
			case INCLUDE_REGION:
			case TO_STR:
			case LIST:
			case MAP:
			case ZIP:
			case SUBTEMPLATE:
				{
				alt26=1;
				}
				break;
			case EQUALS:
				{
				alt26=2;
				}
				break;
			case ELLIPSIS:
				{
				alt26=3;
				}
				break;
			case UP:
				{
				alt26=4;
				}
				break;
			default:
				NoViableAltException nvae =
					new NoViableAltException("", 26, 0, input);
				throw nvae;
			}
			switch (alt26) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:433:66: ( arg )+
					{
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:433:66: ( arg )+
					int cnt23=0;
					loop23:
					while (true) {
						int alt23=2;
						int LA23_0 = input.LA(1);
						if ( ((LA23_0 >= ID && LA23_0 <= STRING)||(LA23_0 >= TRUE && LA23_0 <= FALSE)||(LA23_0 >= PROP && LA23_0 <= SUBTEMPLATE)) ) {
							alt23=1;
						}

						switch (alt23) {
						case 1 :
							// src/org/stringtemplate/v4/compiler/CodeGenerator.g:433:67: arg
							{
							pushFollow(FOLLOW_arg_in_args1196);
							arg();
							state._fsp--;

							retval.n++;
							}
							break;

						default :
							if ( cnt23 >= 1 ) break loop23;
							EarlyExitException eee = new EarlyExitException(23, input);
							throw eee;
						}
						cnt23++;
					}

					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:434:7: ( ^(eq= '=' ID expr ) )+ ( '...' )?
					{
					emit(((CommonTree)retval.start), Bytecode.INSTR_ARGS); retval.namedArgs =true;
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:434:66: ( ^(eq= '=' ID expr ) )+
					int cnt24=0;
					loop24:
					while (true) {
						int alt24=2;
						int LA24_0 = input.LA(1);
						if ( (LA24_0==EQUALS) ) {
							alt24=1;
						}

						switch (alt24) {
						case 1 :
							// src/org/stringtemplate/v4/compiler/CodeGenerator.g:435:9: ^(eq= '=' ID expr )
							{
							eq=(CommonTree)match(input,EQUALS,FOLLOW_EQUALS_in_args1225); 
							match(input, Token.DOWN, null); 
							ID46=(CommonTree)match(input,ID,FOLLOW_ID_in_args1227); 
							pushFollow(FOLLOW_expr_in_args1229);
							expr();
							state._fsp--;

							match(input, Token.UP, null); 

							retval.n++; emit1(eq, Bytecode.INSTR_STORE_ARG, defineString((ID46!=null?ID46.getText():null)));
							}
							break;

						default :
							if ( cnt24 >= 1 ) break loop24;
							EarlyExitException eee = new EarlyExitException(24, input);
							throw eee;
						}
						cnt24++;
					}

					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:436:8: ( '...' )?
					int alt25=2;
					int LA25_0 = input.LA(1);
					if ( (LA25_0==ELLIPSIS) ) {
						alt25=1;
					}
					switch (alt25) {
						case 1 :
							// src/org/stringtemplate/v4/compiler/CodeGenerator.g:436:9: '...'
							{
							match(input,ELLIPSIS,FOLLOW_ELLIPSIS_in_args1242); 
							retval.passThru =true;
							}
							break;

					}

					}
					break;
				case 3 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:437:7: '...'
					{
					match(input,ELLIPSIS,FOLLOW_ELLIPSIS_in_args1254); 
					retval.passThru =true; emit(((CommonTree)retval.start), Bytecode.INSTR_ARGS); retval.namedArgs =true;
					}
					break;
				case 4 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:439:5: 
					{
					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
		return retval;
	}
	// $ANTLR end "args"


	public static class list_return extends TreeRuleReturnScope {
	};


	// $ANTLR start "list"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:441:1: list : ^( LIST ( listElement )* ) ;
	public final CodeGenerator.list_return list() throws RecognitionException {
		CodeGenerator.list_return retval = new CodeGenerator.list_return();
		retval.start = input.LT(1);

		TreeRuleReturnScope listElement47 =null;

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:441:5: ( ^( LIST ( listElement )* ) )
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:442:5: ^( LIST ( listElement )* )
			{
			emit(((CommonTree)retval.start), Bytecode.INSTR_LIST);
			match(input,LIST,FOLLOW_LIST_in_list1286); 
			if ( input.LA(1)==Token.DOWN ) {
				match(input, Token.DOWN, null); 
				// src/org/stringtemplate/v4/compiler/CodeGenerator.g:443:14: ( listElement )*
				loop27:
				while (true) {
					int alt27=2;
					int LA27_0 = input.LA(1);
					if ( ((LA27_0 >= ID && LA27_0 <= STRING)||(LA27_0 >= TRUE && LA27_0 <= FALSE)||(LA27_0 >= PROP && LA27_0 <= SUBTEMPLATE)||LA27_0==NULL) ) {
						alt27=1;
					}

					switch (alt27) {
					case 1 :
						// src/org/stringtemplate/v4/compiler/CodeGenerator.g:443:15: listElement
						{
						pushFollow(FOLLOW_listElement_in_list1289);
						listElement47=listElement();
						state._fsp--;

						emit((listElement47!=null?((CommonTree)listElement47.start):null), Bytecode.INSTR_ADD);
						}
						break;

					default :
						break loop27;
					}
				}

				match(input, Token.UP, null); 
			}

			}

		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
		return retval;
	}
	// $ANTLR end "list"


	public static class listElement_return extends TreeRuleReturnScope {
	};


	// $ANTLR start "listElement"
	// src/org/stringtemplate/v4/compiler/CodeGenerator.g:447:1: listElement : ( expr | NULL );
	public final CodeGenerator.listElement_return listElement() throws RecognitionException {
		CodeGenerator.listElement_return retval = new CodeGenerator.listElement_return();
		retval.start = input.LT(1);

		CommonTree NULL48=null;

		try {
			// src/org/stringtemplate/v4/compiler/CodeGenerator.g:447:12: ( expr | NULL )
			int alt28=2;
			int LA28_0 = input.LA(1);
			if ( ((LA28_0 >= ID && LA28_0 <= STRING)||(LA28_0 >= TRUE && LA28_0 <= FALSE)||(LA28_0 >= PROP && LA28_0 <= SUBTEMPLATE)) ) {
				alt28=1;
			}
			else if ( (LA28_0==NULL) ) {
				alt28=2;
			}

			else {
				NoViableAltException nvae =
					new NoViableAltException("", 28, 0, input);
				throw nvae;
			}

			switch (alt28) {
				case 1 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:448:5: expr
					{
					pushFollow(FOLLOW_expr_in_listElement1311);
					expr();
					state._fsp--;

					}
					break;
				case 2 :
					// src/org/stringtemplate/v4/compiler/CodeGenerator.g:449:7: NULL
					{
					NULL48=(CommonTree)match(input,NULL,FOLLOW_NULL_in_listElement1319); 
					emit(NULL48,Bytecode.INSTR_NULL);
					}
					break;

			}
		}
		catch (RecognitionException re) {
			reportError(re);
			recover(input,re);
		}
		finally {
			// do for sure before leaving
		}
		return retval;
	}
	// $ANTLR end "listElement"

	// Delegated rules



	public static final BitSet FOLLOW_template_in_templateAndEOF69 = new BitSet(new long[]{0x0000000000000000L});
	public static final BitSet FOLLOW_EOF_in_templateAndEOF72 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_chunk_in_template106 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_element_in_chunk120 = new BitSet(new long[]{0x0500008100400012L});
	public static final BitSet FOLLOW_INDENTED_EXPR_in_element143 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_INDENT_in_element145 = new BitSet(new long[]{0x0100000000000010L});
	public static final BitSet FOLLOW_compoundElement_in_element147 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_compoundElement_in_element163 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_INDENTED_EXPR_in_element182 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_INDENT_in_element184 = new BitSet(new long[]{0x0000008100400008L});
	public static final BitSet FOLLOW_singleElement_in_element188 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_singleElement_in_element205 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_exprElement_in_singleElement217 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_TEXT_in_singleElement225 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_NEWLINE_in_singleElement235 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_ifstat_in_compoundElement250 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_region_in_compoundElement259 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_EXPR_in_exprElement282 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_expr_in_exprElement284 = new BitSet(new long[]{0x0000010000000008L});
	public static final BitSet FOLLOW_exprOptions_in_exprElement287 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_REGION_in_region342 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_ID_in_region344 = new BitSet(new long[]{0x0500008100400010L});
	public static final BitSet FOLLOW_template_in_region348 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_SUBTEMPLATE_in_subtemplate395 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_ARGS_in_subtemplate399 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_ID_in_subtemplate402 = new BitSet(new long[]{0x0000000002000008L});
	public static final BitSet FOLLOW_template_in_subtemplate413 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_SUBTEMPLATE_in_subtemplate430 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_IF_in_ifstat482 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_conditional_in_ifstat484 = new BitSet(new long[]{0x0500008100400078L});
	public static final BitSet FOLLOW_chunk_in_ifstat488 = new BitSet(new long[]{0x0000000000000068L});
	public static final BitSet FOLLOW_ELSEIF_in_ifstat526 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_conditional_in_ifstat534 = new BitSet(new long[]{0x0500008100400018L});
	public static final BitSet FOLLOW_chunk_in_ifstat538 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_ELSE_in_ifstat601 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_chunk_in_ifstat605 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_OR_in_conditional651 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_conditional_in_conditional653 = new BitSet(new long[]{0x003FFE1866000400L});
	public static final BitSet FOLLOW_conditional_in_conditional655 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_AND_in_conditional667 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_conditional_in_conditional669 = new BitSet(new long[]{0x003FFE1866000400L});
	public static final BitSet FOLLOW_conditional_in_conditional671 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_BANG_in_conditional683 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_conditional_in_conditional685 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_expr_in_conditional696 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_OPTIONS_in_exprOptions712 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_option_in_exprOptions714 = new BitSet(new long[]{0x0000000000001008L});
	public static final BitSet FOLLOW_EQUALS_in_option729 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_ID_in_option731 = new BitSet(new long[]{0x003FFE1806000000L});
	public static final BitSet FOLLOW_expr_in_option733 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_ZIP_in_expr758 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_ELEMENTS_in_expr761 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_expr_in_expr764 = new BitSet(new long[]{0x003FFE1806000008L});
	public static final BitSet FOLLOW_mapTemplateRef_in_expr771 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_MAP_in_expr784 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_expr_in_expr786 = new BitSet(new long[]{0x0020180000000000L});
	public static final BitSet FOLLOW_mapTemplateRef_in_expr789 = new BitSet(new long[]{0x0020180000000008L});
	public static final BitSet FOLLOW_prop_in_expr805 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_includeExpr_in_expr813 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_PROP_in_prop826 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_expr_in_prop828 = new BitSet(new long[]{0x0000000002000000L});
	public static final BitSet FOLLOW_ID_in_prop830 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_PROP_IND_in_prop842 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_expr_in_prop844 = new BitSet(new long[]{0x003FFE1806000000L});
	public static final BitSet FOLLOW_expr_in_prop846 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_INCLUDE_in_mapTemplateRef872 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_qualifiedId_in_mapTemplateRef874 = new BitSet(new long[]{0x003FFE1806001808L});
	public static final BitSet FOLLOW_args_in_mapTemplateRef878 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_subtemplate_in_mapTemplateRef894 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_INCLUDE_IND_in_mapTemplateRef914 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_expr_in_mapTemplateRef916 = new BitSet(new long[]{0x003FFE1806001808L});
	public static final BitSet FOLLOW_args_in_mapTemplateRef920 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_EXEC_FUNC_in_includeExpr941 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_ID_in_includeExpr943 = new BitSet(new long[]{0x003FFE1806000008L});
	public static final BitSet FOLLOW_expr_in_includeExpr945 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_INCLUDE_in_includeExpr958 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_qualifiedId_in_includeExpr960 = new BitSet(new long[]{0x003FFE1806001808L});
	public static final BitSet FOLLOW_args_in_includeExpr962 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_INCLUDE_SUPER_in_includeExpr974 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_ID_in_includeExpr976 = new BitSet(new long[]{0x003FFE1806001808L});
	public static final BitSet FOLLOW_args_in_includeExpr978 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_INCLUDE_REGION_in_includeExpr990 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_ID_in_includeExpr992 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_INCLUDE_SUPER_REGION_in_includeExpr1004 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_ID_in_includeExpr1006 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_primary_in_includeExpr1017 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_ID_in_primary1029 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_STRING_in_primary1039 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_TRUE_in_primary1049 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_FALSE_in_primary1059 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_subtemplate_in_primary1069 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_list_in_primary1084 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_INCLUDE_IND_in_primary1102 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_expr_in_primary1104 = new BitSet(new long[]{0x003FFE1806001808L});
	public static final BitSet FOLLOW_args_in_primary1108 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_TO_STR_in_primary1125 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_expr_in_primary1127 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_SLASH_in_qualifiedId1143 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_qualifiedId_in_qualifiedId1145 = new BitSet(new long[]{0x0000000002000000L});
	public static final BitSet FOLLOW_ID_in_qualifiedId1147 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_SLASH_in_qualifiedId1157 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_ID_in_qualifiedId1159 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_ID_in_qualifiedId1168 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_expr_in_arg1180 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_arg_in_args1196 = new BitSet(new long[]{0x003FFE1806000002L});
	public static final BitSet FOLLOW_EQUALS_in_args1225 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_ID_in_args1227 = new BitSet(new long[]{0x003FFE1806000000L});
	public static final BitSet FOLLOW_expr_in_args1229 = new BitSet(new long[]{0x0000000000000008L});
	public static final BitSet FOLLOW_ELLIPSIS_in_args1242 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_ELLIPSIS_in_args1254 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_LIST_in_list1286 = new BitSet(new long[]{0x0000000000000004L});
	public static final BitSet FOLLOW_listElement_in_list1289 = new BitSet(new long[]{0x023FFE1806000008L});
	public static final BitSet FOLLOW_expr_in_listElement1311 = new BitSet(new long[]{0x0000000000000002L});
	public static final BitSet FOLLOW_NULL_in_listElement1319 = new BitSet(new long[]{0x0000000000000002L});
}
