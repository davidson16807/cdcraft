'use strict';


/*
`UrlArrays` results in a namespace of pure functions 
that describe maps between arrays of nullable primitives and their representation in a url querystring.
See README.md for more information.
*/

const UrlArrays = (array_delimiters, tuple_delimiter) => {
    return {

        export: (array) => {
            const first_null_id = array.findIndex(element => element == null);
            return array
                .map((element, i) => [element, i])
                .filter(([element, i]) => element != null)
                .map(([element, i]) => i > first_null_id && first_null_id > 0? `${i}${tuple_delimiter}${element}` : element)
                .join(array_delimiters);
        },

        import: (string) => {
            const split = string == null || string.length<1? [] : string.split(array_delimiters).map(element => element.split(tuple_delimiter, 2));
            const array = split.filter(element => element.length == 1).map(element => element[0]);
            split.filter(element => element.length == 2).forEach(element => array[element[0]] = element[1]);
            return array;
        },

        updates: [],
    };
};

// const urls = UrlArrayStrings(',', ':', '*');
// url = urls.export([1,'a',null,2]);
// urls.import(url);
