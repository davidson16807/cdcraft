'use strict';

/*
`UrlNumbers` results in a namespace of pure functions 
that describe maps between `Number`s and their representation in a url querystring.
See README.md for more information.
*/

const UrlNumbers = (parser, string_base=10) => ({
    export: (number) => number == null? null : number.toString(string_base),
    import: (string) => string == null? null : (number => isNaN(number)? null:number)(parser(string, string_base)),
    updates: {},
});
