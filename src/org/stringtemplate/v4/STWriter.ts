/* java2ts: keep */

/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/** Generic StringTemplate output writer filter.
 * <p>
 *  Literals and the elements of expressions are emitted via {@link #write(String)}.
 *  Separators are emitted via {@link #writeSeparator(String)} because they must be
 *  handled specially when wrapping lines (we don't want to wrap
 *  in between an element and it's separator).</p>
 */
export interface STWriter {
    pushIndentation(indent: string): void;
    popIndentation(): string | null;
    pushAnchorPoint(): void;
    popAnchorPoint(): void;
    setLineWidth(lineWidth: number): void;

    /** Write the string and return how many actual characters were written.
     *  With auto-indentation and wrapping, more chars than {@code str.length()}
     *  can be emitted.  No wrapping is done.
     */
    write(str: string): number;

    /** Same as write, but wrap lines using the indicated string as the
     *  wrap character (such as {@code "\n"}).
     */
    write(str: string, wrap: string): number;

    /**
     * Because we evaluate ST instance by invoking
     * {@link Interpreter#exec(STWriter, InstanceScope)} again, we can't pass options in.
     * So the {@link Bytecode#INSTR_WRITE} instruction of an applied template
     * (such as when we wrap in between template applications like
     * {@code <data:{v|[<v>]}; wrap>}) we need to write the {@code wrap} string
     * before calling {@link Interpreter#exec}. We expose just like for the
     * separator. See {@link Interpreter#writeObject} where it checks for ST
     * instance. If POJO, {@link Interpreter#writePOJO} passes {@code wrap} to
     * {@link STWriter#write(String str, String wrap)}. Can't pass to
     * {@link Interpreter#exec}.
     */
    writeWrap(wrap: string): number;

    /** Write a separator.  Same as {@link #write(String)} except that a {@code "\n"}
     *  cannot be inserted before emitting a separator.
     */
    writeSeparator(str: string): number;

    /** Return the absolute char index into the output of the char
     *  we're about to write.  Returns 0 if no char written yet.
     */
    index(): number;
}

export namespace STWriter {
    export const NO_WRAP: number = -1;
}
