'use strict';

/*
`UrlVectorsCurried` results in a namespace of pure functions 
that describe maps between `glm.ivec2`s and their representation in a url querystring.
See README.md for more information.
*/

const UrlVectorsCurried = (constructor, url_numbers, url_arrays) => 
    (minimum=0, precision=1) => ({
        export: (vector) => vector == null? null : 
            url_arrays.export([
                url_numbers(minimum, precision).export(vector.x), 
                url_numbers(minimum, precision).export(vector.y)]),
        import: (string) => string == null? null : 
            (array=>new constructor(
                url_numbers(minimum, precision).import(array[0]), 
                url_numbers(minimum, precision).import(array[1])))
            (url_arrays.import(string)),
        updates: (version, string) => string,
    });
