'use strict';

/*
`UrlObjects` results in a namespace of pure functions 
that describe maps between `DiagramObject`s and their representation in a url querystring.
See README.md for more information.
*/
const UrlObjects = (
        url_arrays, 
        url_strings, 
        url_vectors, 
        url_colors) => {
    return {

        export: (object) => 
            url_arrays.export([
                url_vectors.export(object.position),
                url_colors.export(object.color),
                url_strings.export(object.symbol),
                url_strings.export(object.label),
                url_vectors.export(object.label_offset_id),
            ]),

        import: (string) => 
            (array => new DiagramObject(
                url_vectors.import(array[0]),
                url_colors.import(array[1]),
                url_strings.import(array[2]),
                url_strings.import(array[3]),
                url_vectors.import(array[4]),
            ))(url_arrays.import(string)),

        updates: {},
    }
};
