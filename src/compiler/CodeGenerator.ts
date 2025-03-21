/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

import { ParseTree, TerminalNode, Token, TokenStream } from "antlr4ng";

import { IFormalArgument, RegionType } from "./common.js";

import { FormalArgument } from "./FormalArgument.js";
import { CompiledST } from "./CompiledST.js";
import { CompilationState } from "./CompilationState.js";
import { Bytecode } from "./Bytecode.js";
import { ErrorType } from "../misc/ErrorType.js";
import { STGroup } from "../STGroup.js";
import { ErrorManager } from "../misc/ErrorManager.js";
import { Stack } from "../support/Stack.js";
import { Compiler } from "./Compiler.js";
import {
    AndConditionalContext, ArgContext, ArgsContext, CompoundElementContext, ConditionalContext, ElementContext,
    ExprNoCommaContext, ExprOptionsContext, ExprTagContext, IfstatContext, IncludeExprContext, ListContext,
    ListElementContext, MapExprContext, MapTemplateRefContext, MemberExprContext, NotConditionalContext, OptionContext,
    PrimaryContext, RegionContext, SingleElementContext, SubtemplateContext,
    TemplateContext,
} from "./generated/STParser.js";
import { Misc } from "../misc/Misc.js";
import { STLexer } from "./STLexer.js";

interface IArgsResult {
    n: number;
    namedArgs: boolean;
    passThru: boolean;
};

export class CodeGenerator {
    #outermostTemplateName?: string;	// name of overall template
    #outermostImpl!: CompiledST;
    #templateToken?: Token;			// overall template token
    #errMgr?: ErrorManager;
    #templateStack = new Stack<CompilationState>();

    // overall template text
    #template?: string;
    #input: TokenStream;

    public constructor(input: TokenStream, errMgr?: ErrorManager, name?: string, template?: string,
        templateToken?: Token) {

        this.#input = input;
        this.#errMgr = errMgr;
        this.#outermostTemplateName = name;
        this.#template = template;
        this.#templateToken = templateToken;
    }

    public template(context: TemplateContext, name?: string, args?: IFormalArgument[]): CompiledST {
        this.#templateStack.push(new CompilationState(this.#errMgr!, name, this.#input));
        const impl = this.#templateStack.peek().impl;
        if (this.#templateStack.size() === 1) {
            this.#outermostImpl = impl;
        }

        impl.defineFormalArgs(args); // make sure args are defined prior to compilation
        if (name && name.startsWith(Compiler.SUBTEMPLATE_PREFIX)) {
            impl.addArg(new FormalArgument("i"));
            impl.addArg(new FormalArgument("i0"));
        }
        impl.template = this.#template ?? ""; // always forget the entire template; char indexes are relative to it

        try {
            this.handleElements(context.element());

            // finish off the CompiledST result
            if (this.#templateStack.peek().stringTable) {
                impl.strings.push(...this.#templateStack.peek().stringTable);
            }

            impl.codeSize = this.#templateStack.peek().ip;

        } finally {
            // do for sure before leaving
            this.#templateStack.pop();
        }

        return impl;
    }

    private handleElements(list: ElementContext[]): void {
        list.forEach((element) => {
            this.element(element);
        });
    }

    private element(context: ElementContext): void {
        if (context.singleElement() !== null) {
            const hasIndent = context.INDENT() !== null;
            if (hasIndent) {
                this.#templateStack.peek().indent(context.INDENT(), context.INDENT()?.getText() ?? "");
            }
            this.singleElement(context.singleElement()!);

            if (hasIndent) {
                this.#templateStack.peek().emit(Bytecode.INSTR_DEDENT);
            }
        } else if (context.compoundElement() !== null) {
            // Ignore the indent token, it's only used for singleElement.
            this.compoundElement(context.compoundElement()!);
        }
    }

    private singleElement(context: SingleElementContext): void {
        if (context.exprTag() !== null) {
            this.exprTag(context.exprTag()!);
        } else if (context.TEXT() !== null) {
            const token = context.TEXT()!;

            const text = token.getText();
            if (text.length > 0) {
                this.emit1(token, Bytecode.INSTR_WRITE_STR, text);
            }
        } else if (context.NEWLINE() !== null) {
            this.emit(context.NEWLINE(), Bytecode.INSTR_NEWLINE);
        }

    }

    private compoundElement(context: CompoundElementContext): void {
        if (context.ifstat() !== null) {
            this.ifstat(context.ifstat()!);
        } else if (context.region() !== null) {
            this.region(context.region()!);
        }
    }

    private exprTag(context: ExprTagContext): void {
        let op = Bytecode.INSTR_WRITE;
        this.expr(context.expr().mapExpr());
        if (context.exprOptions() !== null) {
            this.exprOptions(context.exprOptions()!);
            op = Bytecode.INSTR_WRITE_OPT;
        }
        this.emit(context.expr(), op);

    }

    private region(context: RegionContext): void {
        if (context._indent) {
            this.#templateStack.peek().indent(context, context._indent.text ?? "");
        }

        const id = context.ID();
        const name = STGroup.getMangledRegionName(this.#outermostTemplateName!, id.getText() ?? "");
        const template = this.template(context.template(), name, []);

        template.isRegion = true;
        template.regionDefType = RegionType.EMBEDDED;
        template.templateDefStartToken = id.symbol;

        this.#outermostImpl.addImplicitlyDefinedTemplate(template);
        this.emit2(context, Bytecode.INSTR_NEW, name, 0);
        this.emit(context, Bytecode.INSTR_WRITE);

        if (context._indent) {
            this.#templateStack.peek().emit(Bytecode.INSTR_DEDENT);
        }
    }

    private subtemplate(context: SubtemplateContext): [number, string] {
        const name = Compiler.getNewSubtemplateName();
        const args = new Array<FormalArgument>();
        let argCount = 0;

        if (context.template() === null) {
            // Confusing original code: according to the grammar there can be no subtemplate without a template.
            // However, the original tree grammar had a case for this, so we keep it.
            const sub = new CompiledST();
            sub.name = name;
            sub.template = "";
            sub.addArg(new FormalArgument("i"));
            sub.addArg(new FormalArgument("i0"));
            sub.isAnonSubtemplate = true;
            sub.templateDefStartToken = context.start!;
            sub.tree = context;
            sub.tokens = this.#input;

            this.#outermostImpl.addImplicitlyDefinedTemplate(sub);
        } else {
            context.ID().forEach((id) => {
                this.addArgument(args, id.symbol);
            });

            argCount = args.length;
            const sub = this.template(context.template(), name, args);
            sub.isAnonSubtemplate = true;
            sub.templateDefStartToken = context.template().start!;
            sub.tree = context.template();
            sub.tokens = this.#input;

            this.#outermostImpl.addImplicitlyDefinedTemplate(sub);
        }

        return [argCount, name];
    }

    private ifstat(context: IfstatContext): void {
        /**
         * Tracks address of branch operand (in code block).  It's how
         *  we back-patch forward references when generating code for IFs.
         */
        let prevBranchOperand = -1;

        /**
         * Branch instruction operands that are forward refs to end of IF.
         *  We need to update them once we see the endif.
         */
        const endRefs = new Array<number>();
        if (context._indent) {
            this.#templateStack.peek().indent(context, context._indent.text ?? "");
        }

        this.conditional(context.conditional(0)!);

        prevBranchOperand = this.address() + 1;
        this.emit1(context.IF(), Bytecode.INSTR_BRF, -1); // write placeholder as branch target

        this.handleElements(context._t1!.element());

        if (context.ELSEIF().length > 0) {
            for (let i = 0; i < context.ELSEIF().length; ++i) {
                const eif = context.ELSEIF(i);
                endRefs.push(this.address() + 1);
                this.emit1(eif, Bytecode.INSTR_BR, -1); // br end

                // update previous branch instruction
                this.write(prevBranchOperand, this.address());
                prevBranchOperand = -1;

                const ec = context.conditional(i + 1)!; // +1 since we did first one already (for "if").
                this.conditional(ec);
                prevBranchOperand = this.address() + 1;

                // write placeholder as branch target
                this.emit1(ec, Bytecode.INSTR_BRF, -1);

                this.handleElements(context._t2[i]!.element());
            }
        }

        if (context.ELSE() !== null) {
            endRefs.push(this.address() + 1);
            this.emit1(context.ELSE(), Bytecode.INSTR_BR, -1); // br end

            // update previous branch instruction
            this.write(prevBranchOperand, this.address());
            prevBranchOperand = -1;

            this.handleElements(context._t3!.element());
        }

        if (prevBranchOperand >= 0) {
            this.write(prevBranchOperand, this.address());
        }

        for (const operand of endRefs) {
            this.write(operand, this.address());
        }

        if (context._indent) {
            this.#templateStack.peek().emit(Bytecode.INSTR_DEDENT);
        }

    }

    private conditional(context: ConditionalContext): void {
        // Strange handling in the original code: a single AND expression is handled as `expr`, which misses
        // handling for negation. This is fixed here.
        this.andConditional(context.andConditional(0)!);
        if (context.OR().length > 0) {
            for (let i = 0; i < context.andConditional().length - 1; ++i) {
                this.andConditional(context.andConditional(i + 1)!);
                this.emit(context.OR(i), Bytecode.INSTR_OR);
            }
        }
    }

    private andConditional(context: AndConditionalContext): void {
        this.notConditional(context.notConditional(0)!);
        if (context.AND().length > 0) {
            for (let i = 0; i < context.notConditional().length - 1; ++i) {
                this.notConditional(context.notConditional(i + 1)!);
                this.emit(context.AND(i), Bytecode.INSTR_AND);
            }
        }
    }

    private notConditional(context: NotConditionalContext): void {
        this.memberExpr(context.memberExpr()!);
        context.BANG().forEach((bang) => {
            this.emit(bang, Bytecode.INSTR_NOT);
        });
    }

    private exprOptions(context: ExprOptionsContext): void {
        this.emit(context, Bytecode.INSTR_OPTIONS);
        context.option().forEach((option) => {
            this.option(option);
        });
    }

    private option(context: OptionContext): void {
        const id = context.ID();
        if (context.exprNoComma()) {
            this.exprNoComma(context.exprNoComma()!);
        } else {
            // If no value is given use the default. The parser takes care not to allow invalid options.
            const defVal = Compiler.defaultOptionValues.get(id.getText());
            this.emit1(id, Bytecode.INSTR_LOAD_STR, defVal!);
        }
        this.setOption(id);
    }

    private expr(context: MapExprContext): void {
        let ne = 0;
        let colonIndex = -1;
        context.memberExpr().forEach((memberExpr) => {
            this.memberExpr(memberExpr);
            ne++;
        });

        if (ne > 1) { // More than one member expression. Must be a ZIP map.
            this.mapTemplateRef(context.mapTemplateRef(0)!, ne);
            this.emit1(context, Bytecode.INSTR_ZIP_MAP, ne);

            // Jump over the initial member expression and any following comma/member expression pair.
            // This takes us to the first colon token, which is followed by the first template ref.
            // Jump over these 2 too.
            colonIndex = 2 * (ne - 1) + 1 + 2;
        } else if (context.COLON().length > 0) {
            colonIndex = 1; // Must directly follow the (only) member expression.
        }

        // In the next step we need to count the template refs between colon tokens.
        if (colonIndex < 0 || colonIndex >= context.getChildCount()) {
            // No (more) colon tokens found, so we're done.
            return;
        }

        // Now walk over all child nodes, starting at the first colon, and handle the template refs.
        let nt = 0;
        for (let i = colonIndex + 1; i < context.getChildCount(); ++i) {
            const child = context.getChild(i);
            if (child instanceof TerminalNode) {
                if (child.symbol.type === STLexer.COLON) {
                    if (nt > 1) {
                        this.emit1(context, Bytecode.INSTR_ROT_MAP, nt);
                    } else {
                        this.emit(context, Bytecode.INSTR_MAP);
                    }

                    nt = 0;
                } // Otherwise it's a comma, which we can ignore.
            } else {
                this.mapTemplateRef(child as MapTemplateRefContext, 1);
                ++nt;
            }
        }

        if (nt > 0) {
            if (nt > 1) {
                this.emit1(context, Bytecode.INSTR_ROT_MAP, nt);
            } else {
                this.emit(context, Bytecode.INSTR_MAP);
            }
        }
    }

    private exprNoComma(context: ExprNoCommaContext): void {
        this.memberExpr(context.memberExpr());
        if (context.mapTemplateRef() !== null) {
            this.mapTemplateRef(context.mapTemplateRef()!, 1);
            this.emit(context, Bytecode.INSTR_MAP);
        }

    }

    private memberExpr(context: MemberExprContext): void {
        this.includeExpr(context.includeExpr()!);
        let index = 1;

        while (index < context.children.length) {
            // Jump over the dot.
            ++index;

            const child = context.children[index++] as TerminalNode;
            if (child.symbol.type === STLexer.ID) {
                // A simple ID.
                this.prop(child);
            } else {
                // A map expression in parentheses.
                this.prop(context.children[index]);
                index += 2;
            }
        }
    }

    private prop(context: ParseTree): void {
        if (context instanceof TerminalNode) {
            // Must be an ID.
            this.emit1(context, Bytecode.INSTR_LOAD_PROP, context.getText() ?? "");
        } else {
            // A map expression.
            const expression = context as MapExprContext;
            this.expr(expression);
            this.emit(expression, Bytecode.INSTR_LOAD_PROP_IND);

        }
    }

    private mapTemplateRef(context: MapTemplateRefContext, expressionCount: number): void {
        if (context.qualifiedId() !== null) {
            for (let i = 1; i <= expressionCount; i++) {
                this.emit(context.qualifiedId(), Bytecode.INSTR_NULL);
            }

            const args22 = this.args(context.args());

            if (args22.passThru) {
                this.emit1(context, Bytecode.INSTR_PASSTHRU, context.qualifiedId()?.getText() ?? "");
            }

            if (args22.namedArgs) {
                this.emit1(context, Bytecode.INSTR_NEW_BOX_ARGS, context.qualifiedId()?.getText() ?? "");
            } else {
                this.emit2(context, Bytecode.INSTR_NEW, context.qualifiedId()?.getText() ?? "",
                    args22.n + expressionCount);
            }
        } else if (context.subtemplate() !== null) {
            const [argCount, name] = this.subtemplate(context.subtemplate()!);

            if (argCount !== expressionCount) {
                this.#errMgr?.compileTimeError(ErrorType.ANON_ARGUMENT_MISMATCH, this.#templateToken,
                    context.subtemplate()!.start ?? undefined, argCount, expressionCount);
            }

            for (let i = 1; i <= expressionCount; i++) {
                this.emit(context.subtemplate(), Bytecode.INSTR_NULL);
            }

            this.emit2(context.subtemplate(), Bytecode.INSTR_NEW, name, expressionCount);
        } else {
            this.expr(context.mapExpr()!);

            this.emit(context, Bytecode.INSTR_TOSTR);
            for (let i = 1; i <= expressionCount; i++) {
                this.emit(context, Bytecode.INSTR_NULL);
            }

            let count = 0;
            context.argExprList()?.arg().forEach((arg) => {
                this.arg(arg);
                ++count;
            });

            this.emit1(context, Bytecode.INSTR_NEW_IND, count + expressionCount);
        }
    }

    private includeExpr(context: IncludeExprContext): void {
        if (context.ID() !== null) {
            const id = context.ID()!;
            if (context.SUPER() === null && context.AT() === null) {
                // A function call.
                this.expr(context.expr()!.mapExpr()!);
                this.func(id);
            } else if (context.SUPER() !== null) {
                if (context.AT() === null) {
                    // Include super ID.
                    const args = this.args(context.args());

                    if (args.passThru) {
                        this.emit1(context, Bytecode.INSTR_PASSTHRU, id.getText() ?? "");
                    }

                    if ((args !== null ? (args).namedArgs : false)) {
                        this.emit1(context, Bytecode.INSTR_SUPER_NEW_BOX_ARGS, id.getText() ?? "");
                    } else {
                        this.emit2(context, Bytecode.INSTR_SUPER_NEW, id.getText() ?? "", args.n);
                    }
                } else {
                    // Include super region ID.
                    const mangled = STGroup.getMangledRegionName(this.#outermostImpl.name!, id.getText() ?? "");
                    this.emit2(id, Bytecode.INSTR_SUPER_NEW, mangled, 0);
                }
            } else if (context.AT() !== null) {
                // Include region ID.
                const impl = Compiler.defineBlankRegion(this.#outermostImpl, id?.symbol);

                this.emit2(id, Bytecode.INSTR_NEW, impl.name!, 0);
            }
        } else {
            if (context.primary() !== null) {
                this.primary(context.primary()!);
            } else {
                // Include qualified args.
                const id = context.qualifiedId()!;
                const args = this.args(context.args());

                if (args.passThru) {
                    this.emit1(context, Bytecode.INSTR_PASSTHRU, id.getText());
                }

                if (args.namedArgs) {
                    this.emit1(id, Bytecode.INSTR_NEW_BOX_ARGS, id.getText());
                } else {
                    this.emit2(id, Bytecode.INSTR_NEW, id.getText(), args.n);
                }
            }
        }
    }

    private primary(context: PrimaryContext): void {
        if (context.ID() !== null) {
            this.refAttr(context.ID());
        } else if (context.STRING() !== null) {
            const s = context.STRING();
            this.emit1(s, Bytecode.INSTR_LOAD_STR, Misc.strip(s?.getText(), 1));
        } else if (context.TRUE() !== null) {
            this.emit(context.TRUE(), Bytecode.INSTR_TRUE);
        } else if (context.FALSE() !== null) {
            this.emit(context.FALSE(), Bytecode.INSTR_FALSE);
        } else if (context.subtemplate() !== null) {
            const [, name] = this.subtemplate(context.subtemplate()!);
            this.emit2(context, Bytecode.INSTR_NEW, name, 0);
        } else if (context.list() !== null) {
            this.list(context.list()!);
        } else if (context.conditional() !== null) {
            this.conditional(context.conditional()!);
        } else if (context.expr() !== null) {
            this.expr(context.expr()!.mapExpr()!);
            this.emit(context.expr(), Bytecode.INSTR_TOSTR);

            if (context.LPAREN().length > 1) {
                // Indirection. May have arguments.
                let count = 0;
                if (context.argExprList() !== null) {
                    context.argExprList()?.arg().forEach((arg) => {
                        this.arg(arg);
                        ++count;
                    });
                }
                this.emit1(context.expr(), Bytecode.INSTR_NEW_IND, count);
            }

        }
    }

    private arg(context: ArgContext): void {
        this.exprNoComma(context.exprNoComma());
    }

    private args(context?: ArgsContext | null): IArgsResult {
        const result = { n: 0, namedArgs: false, passThru: false };

        if (!context) {
            return result;
        }

        if (context.argExprList() !== null) {
            context.argExprList()?.arg().forEach((arg) => {
                this.arg(arg);
                result.n++;
            });
        } else if (context.namedArg().length > 0 || context.ELLIPSIS() !== null) {
            this.emit(context, Bytecode.INSTR_ARGS);
            result.namedArgs = true;

            context.namedArg().forEach((namedArg) => {
                this.arg(namedArg.arg());
                this.emit1(namedArg.EQUALS(), Bytecode.INSTR_STORE_ARG,
                    this.defineString(namedArg.ID().getText() ?? ""));
                result.n++;
            });
        }

        if (context.ELLIPSIS() !== null) {
            result.passThru = true;
        }

        return result;
    }

    private list(context: ListContext): void {
        this.emit(context, Bytecode.INSTR_LIST);
        context.listElement().forEach((listElement) => {
            this.listElement(listElement);
            this.emit(listElement, Bytecode.INSTR_ADD);
        });
    }

    private listElement(context: ListElementContext): void {
        if (context.exprNoComma() !== null) {
            this.exprNoComma(context.exprNoComma()!);
        } else {
            this.emit(context, Bytecode.INSTR_NULL);
        }
    }

    private addArgument(args: FormalArgument[], t: Token): void {
        const name = t.text!;
        for (const arg of args) {
            if (arg.name === name) {
                this.#errMgr?.compileTimeError(ErrorType.PARAMETER_REDEFINITION, this.#templateToken, t, name);

                return;
            }
        }

        args.push(new FormalArgument(name));
    }

    private emit1(opNode: ParseTree | null, opcode: number, arg: string | number): void {
        this.#templateStack.peek().emit1(opNode, opcode, arg);
    }

    private emit2(opNode: ParseTree | null, opcode: number, arg: number | string, arg2: number): void {
        this.#templateStack.peek().emit2(opNode, opcode, arg, arg2);
    }

    private emit(opTree: ParseTree | null, opcode: number): void {
        this.#templateStack.peek().emit(opTree, opcode);
    }

    private setOption(id: TerminalNode): void {
        this.#templateStack.peek().setOption(id);
    }

    private write(addr: number, value: number): void {
        this.#templateStack.peek().write(addr, value);
    }

    private address(): number {
        return this.#templateStack.peek().ip;
    }

    private func(id: TerminalNode | null): void {
        this.#templateStack.peek().func(this.#templateToken!, id);
    }

    private refAttr(id: TerminalNode | null): void {
        this.#templateStack.peek().refAttr(this.#templateToken, id);
    }

    private defineString(s: string): number {
        return this.#templateStack.peek().defineString(s);
    }
}
