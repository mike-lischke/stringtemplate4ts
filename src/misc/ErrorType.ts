/*
 * Copyright (c) Terence Parr. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

export class ErrorType {
    // RUNTIME SEMANTIC ERRORS
    public static readonly NO_SUCH_TEMPLATE = new class extends ErrorType {
    }("no such template: %s", "NO_SUCH_TEMPLATE", 0);

    public static readonly NO_IMPORTED_TEMPLATE = new class extends ErrorType {
    }("no such template: super.%s", "NO_IMPORTED_TEMPLATE", 1);

    public static readonly NO_SUCH_ATTRIBUTE = new class extends ErrorType {
    }("attribute %s isn't defined", "NO_SUCH_ATTRIBUTE", 2);

    public static readonly NO_SUCH_ATTRIBUTE_PASS_THROUGH = new class extends ErrorType {
    }("could not pass through undefined attribute %s", "NO_SUCH_ATTRIBUTE_PASS_THROUGH", 3);

    public static readonly REF_TO_IMPLICIT_ATTRIBUTE_OUT_OF_SCOPE = new class extends ErrorType {
    }("implicitly-defined attribute %s not visible", "REF_TO_IMPLICIT_ATTRIBUTE_OUT_OF_SCOPE", 4);

    public static readonly MISSING_FORMAL_ARGUMENTS = new class extends ErrorType {
    }("missing argument definitions", "MISSING_FORMAL_ARGUMENTS", 5);

    public static readonly NO_SUCH_PROPERTY = new class extends ErrorType {
    }("no such property or can't access: %s", "NO_SUCH_PROPERTY", 6);

    public static readonly MAP_ARGUMENT_COUNT_MISMATCH = new class extends ErrorType {
    }("iterating through %s values in zip map but template has %s declared arguments",
        "MAP_ARGUMENT_COUNT_MISMATCH", 7);

    public static readonly ARGUMENT_COUNT_MISMATCH = new class extends ErrorType {
    }("passed %s arg(s) to template %s with %s declared arg(s)", "ARGUMENT_COUNT_MISMATCH", 8);

    public static readonly EXPECTING_STRING = new class extends ErrorType {
    }("function %s expects a string not a %s", "EXPECTING_STRING", 9);

    public static readonly WRITER_CTOR_ISSUE = new class extends ErrorType {
    }("%s(Writer) constructor doesn't exist", "WRITER_CTOR_ISSUE", 10);

    public static readonly CANT_IMPORT = new class extends ErrorType {
    }("can't find template(s) in import \"%s\"", "CANT_IMPORT", 11);

    // COMPILE-TIME SYNTAX/SEMANTIC ERRORS
    public static readonly SYNTAX_ERROR = new class extends ErrorType {
    }("%s", "SYNTAX_ERROR", 12);

    public static readonly TEMPLATE_REDEFINITION = new class extends ErrorType {
    }("redefinition of template %s", "TEMPLATE_REDEFINITION", 13);

    public static readonly EMBEDDED_REGION_REDEFINITION = new class extends ErrorType {
    }("region %s is embedded and thus already implicitly defined", "EMBEDDED_REGION_REDEFINITION", 14);

    public static readonly REGION_REDEFINITION = new class extends ErrorType {
    }("redefinition of region %s", "REGION_REDEFINITION", 15);

    public static readonly MAP_REDEFINITION = new class extends ErrorType {
    }("redefinition of dictionary %s", "MAP_REDEFINITION", 16);

    public static readonly PARAMETER_REDEFINITION = new class extends ErrorType {
    }("redefinition of parameter %s", "PARAMETER_REDEFINITION", 17);

    public static readonly ALIAS_TARGET_UNDEFINED = new class extends ErrorType {
    }("cannot alias %s to undefined template: %s", "ALIAS_TARGET_UNDEFINED", 18);

    public static readonly TEMPLATE_REDEFINITION_AS_MAP = new class extends ErrorType {
    }("redefinition of template %s as a map", "TEMPLATE_REDEFINITION_AS_MAP", 19);

    public static readonly LEXER_ERROR = new class extends ErrorType {
    }("%s", "LEXER_ERROR", 20);

    public static readonly NO_DEFAULT_VALUE = new class extends ErrorType {
    }("missing dictionary default value", "NO_DEFAULT_VALUE", 21);

    public static readonly NO_SUCH_FUNCTION = new class extends ErrorType {
    }("no such function: %s", "NO_SUCH_FUNCTION", 22);

    public static readonly NO_SUCH_REGION = new class extends ErrorType {
    }("template %s doesn't have a region called %s", "NO_SUCH_REGION", 23);

    public static readonly NO_SUCH_OPTION = new class extends ErrorType {
    }("no such option: %s", "NO_SUCH_OPTION", 24);

    public static readonly INVALID_TEMPLATE_NAME = new class extends ErrorType {
    }("invalid template name or path: %s", "INVALID_TEMPLATE_NAME", 25);

    public static readonly ANON_ARGUMENT_MISMATCH = new class extends ErrorType {
    }("anonymous template has %s arg(s) but mapped across %s value(s)", "ANON_ARGUMENT_MISMATCH", 26);

    public static readonly REQUIRED_PARAMETER_AFTER_OPTIONAL = new class extends ErrorType {
    }("required parameters (%s) must appear before optional parameters", "REQUIRED_PARAMETER_AFTER_OPTIONAL", 27);

    public static readonly UNSUPPORTED_DELIMITER = new class extends ErrorType {
    }("unsupported delimiter character: %s", "UNSUPPORTED_DELIMITER", 28);

    // INTERNAL ERRORS
    public static readonly INTERNAL_ERROR = new class extends ErrorType {
    }("%s", "INTERNAL_ERROR", 29);

    public static readonly WRITE_IO_ERROR = new class extends ErrorType {
    }("error writing output caused by", "WRITE_IO_ERROR", 30);

    public static readonly CANT_LOAD_GROUP_FILE = new class extends ErrorType {
    }("can't load group file %s", "CANT_LOAD_GROUP_FILE", 31);

    protected constructor(public message: string, public name: string, public index: number) {
    }
}
