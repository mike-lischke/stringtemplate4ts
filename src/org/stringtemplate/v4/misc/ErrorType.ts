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

import { java, S } from "jree";

export class ErrorType extends java.lang.Enum<ErrorType> {
    // RUNTIME SEMANTIC ERRORS
    public static readonly NO_SUCH_TEMPLATE: ErrorType = new class extends ErrorType {
}("no such template: %s",S`NO_SUCH_TEMPLATE`, 0);
    public static readonly NO_IMPORTED_TEMPLATE: ErrorType = new class extends ErrorType {
}("no such template: super.%s",S`NO_IMPORTED_TEMPLATE`, 1);
    public static readonly NO_SUCH_ATTRIBUTE: ErrorType = new class extends ErrorType {
}("attribute %s isn't defined",S`NO_SUCH_ATTRIBUTE`, 2);
    public static readonly NO_SUCH_ATTRIBUTE_PASS_THROUGH: ErrorType = new class extends ErrorType {
}("could not pass through undefined attribute %s",S`NO_SUCH_ATTRIBUTE_PASS_THROUGH`, 3);
    public static readonly REF_TO_IMPLICIT_ATTRIBUTE_OUT_OF_SCOPE: ErrorType = new class extends ErrorType {
}("implicitly-defined attribute %s not visible",S`REF_TO_IMPLICIT_ATTRIBUTE_OUT_OF_SCOPE`, 4);
    public static readonly MISSING_FORMAL_ARGUMENTS: ErrorType = new class extends ErrorType {
}("missing argument definitions",S`MISSING_FORMAL_ARGUMENTS`, 5);
    public static readonly NO_SUCH_PROPERTY: ErrorType = new class extends ErrorType {
}("no such property or can't access: %s",S`NO_SUCH_PROPERTY`, 6);
    public static readonly MAP_ARGUMENT_COUNT_MISMATCH: ErrorType = new class extends ErrorType {
}("iterating through %s values in zip map but template has %s declared arguments",S`MAP_ARGUMENT_COUNT_MISMATCH`, 7);
    public static readonly ARGUMENT_COUNT_MISMATCH: ErrorType = new class extends ErrorType {
}("passed %s arg(s) to template %s with %s declared arg(s)",S`ARGUMENT_COUNT_MISMATCH`, 8);
    public static readonly EXPECTING_STRING: ErrorType = new class extends ErrorType {
}("function %s expects a string not %s",S`EXPECTING_STRING`, 9);
    public static readonly WRITER_CTOR_ISSUE: ErrorType = new class extends ErrorType {
}("%s(Writer) constructor doesn't exist",S`WRITER_CTOR_ISSUE`, 10);
    public static readonly CANT_IMPORT: ErrorType = new class extends ErrorType {
}("can't find template(s) in import \"%s\"",S`CANT_IMPORT`, 11);

    // COMPILE-TIME SYNTAX/SEMANTIC ERRORS
    public static readonly SYNTAX_ERROR: ErrorType = new class extends ErrorType {
}("%s",S`SYNTAX_ERROR`, 12);
    public static readonly TEMPLATE_REDEFINITION: ErrorType = new class extends ErrorType {
}("redefinition of template %s",S`TEMPLATE_REDEFINITION`, 13);
    public static readonly EMBEDDED_REGION_REDEFINITION: ErrorType = new class extends ErrorType {
}("region %s is embedded and thus already implicitly defined",S`EMBEDDED_REGION_REDEFINITION`, 14);
    public static readonly REGION_REDEFINITION: ErrorType = new class extends ErrorType {
}("redefinition of region %s",S`REGION_REDEFINITION`, 15);
    public static readonly MAP_REDEFINITION: ErrorType = new class extends ErrorType {
}("redefinition of dictionary %s",S`MAP_REDEFINITION`, 16);
    public static readonly PARAMETER_REDEFINITION: ErrorType = new class extends ErrorType {
}("redefinition of parameter %s",S`PARAMETER_REDEFINITION`, 17);
    public static readonly ALIAS_TARGET_UNDEFINED: ErrorType = new class extends ErrorType {
}("cannot alias %s to undefined template: %s",S`ALIAS_TARGET_UNDEFINED`, 18);
    public static readonly TEMPLATE_REDEFINITION_AS_MAP: ErrorType = new class extends ErrorType {
}("redefinition of template %s as a map",S`TEMPLATE_REDEFINITION_AS_MAP`, 19);
    public static readonly LEXER_ERROR: ErrorType = new class extends ErrorType {
}("%s",S`LEXER_ERROR`, 20);
    public static readonly NO_DEFAULT_VALUE: ErrorType = new class extends ErrorType {
}("missing dictionary default value",S`NO_DEFAULT_VALUE`, 21);
    public static readonly NO_SUCH_FUNCTION: ErrorType = new class extends ErrorType {
}("no such function: %s",S`NO_SUCH_FUNCTION`, 22);
    public static readonly NO_SUCH_REGION: ErrorType = new class extends ErrorType {
}("template %s doesn't have a region called %s",S`NO_SUCH_REGION`, 23);
    public static readonly NO_SUCH_OPTION: ErrorType = new class extends ErrorType {
}("no such option: %s",S`NO_SUCH_OPTION`, 24);
    public static readonly INVALID_TEMPLATE_NAME: ErrorType = new class extends ErrorType {
}("invalid template name or path: %s",S`INVALID_TEMPLATE_NAME`, 25);
    public static readonly ANON_ARGUMENT_MISMATCH: ErrorType = new class extends ErrorType {
}("anonymous template has %s arg(s) but mapped across %s value(s)",S`ANON_ARGUMENT_MISMATCH`, 26);
    public static readonly REQUIRED_PARAMETER_AFTER_OPTIONAL: ErrorType = new class extends ErrorType {
}("required parameters (%s) must appear before optional parameters",S`REQUIRED_PARAMETER_AFTER_OPTIONAL`, 27);
    public static readonly UNSUPPORTED_DELIMITER: ErrorType = new class extends ErrorType {
}("unsupported delimiter character: %s",S`UNSUPPORTED_DELIMITER`, 28);

    // INTERNAL ERRORS
    public static readonly INTERNAL_ERROR: ErrorType = new class extends ErrorType {
}("%s",S`INTERNAL_ERROR`, 29);
    public static readonly WRITE_IO_ERROR: ErrorType = new class extends ErrorType {
}("error writing output caused by",S`WRITE_IO_ERROR`, 30);
    public static readonly CANT_LOAD_GROUP_FILE: ErrorType = new class extends ErrorType {
}("can't load group file %s",S`CANT_LOAD_GROUP_FILE`, 31);

    public  message:  string;

    protected constructor(m: string, $name$: java.lang.String, $index$: number) { super($name$, $index$);
this.message = m; }
}
