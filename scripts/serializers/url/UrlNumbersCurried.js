'use strict';

/*
`UrlNumbersCurried` results in a namespace of pure functions 
that describe maps between `Number`s and their representation in a url querystring.
See README.md for more information.
*/

const UrlNumbersCurried = (parser, string_base=10) => 
    (minimum=0, precision=1) => ({
        export: (number) => number == null? null : (((number-minimum)/precision)|0).toString(string_base),
        import: (string) => string == null? null : (number => isNaN(number)? null:number*precision+minimum)(parser(string, string_base)),
        updates: (version, string) => string,
    });
