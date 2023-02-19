'use strict';

/*
`UrlVectors` results in a namespace of pure functions 
that describe maps between `glm.ivec2`s and their representation in a url querystring.
See README.md for more information.
*/

const UrlVectors = (constructor, url_numbers, url_arrays) => ({
    export: (vector) => vector == null? null : url_arrays.export([url_numbers.export(vector.x|0), url_numbers.export(vector.y|0)]),
    import: (string) => string == null? null : (array=>new constructor(url_numbers.import(array[0]), url_numbers.import(array[1]))) (url_arrays.import(string)),
    updates: {},
});
