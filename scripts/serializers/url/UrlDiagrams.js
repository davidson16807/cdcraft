'use strict';

/*
`UrlDiagrams` results in a namespace of pure functions 
that describe maps between `Diagram`s and their representation in a url querystring.
See README.md for more information.
*/

const UrlDiagrams = (
        url_outer_arrays, 
        url_inner_arrays, 
        url_arrows, 
        url_objects, 
        url_screen_state,
        version) => {
    return {
        export: (diagram) => 
            url_outer_arrays.export([
                version,
                url_screen_state.export(diagram.screen_frame_store),
                url_inner_arrays.export(diagram.arrows.map(arrow => url_arrows.export(arrow))),
                url_inner_arrays.export(diagram.objects.map(object => url_objects.export(object))),
            ]),
        import: (string) => 
            (array =>
                new Diagram(
                    url_inner_arrays.import(array[2]).map(element => url_arrows.import(element)),
                    url_inner_arrays.import(array[3]).map(element => url_objects.import(element)),
                    [], [], [],
                    url_screen_state.import(array[1]),
                )
            )(url_outer_arrays.import(string)),
        updates: {},
    };
}

const color_code_ids = [
    ['contrast', 0],
    ['red', 1],
    ['green', 2],
    ['yellow', 3],
    ['blue', 4],
];

const url_numbers = UrlNumbers(parseInt, 10);
const url_vectors = UrlVectors(url_numbers, UrlArrays('_'));
const url_colors = UrlColors(color_code_ids);
const url_arrays = UrlArrays(',', ':');
const url_strings = UrlStrings('*');
const url_uint_arrays = UrlUintArrays(UrlNumbers(parseInt, 36));

const url_diagrams = UrlDiagrams(
    UrlArrays('&='),
    UrlArrays(';'),
    UrlArrows(
        url_arrays,
        url_numbers,
        url_strings,
        url_uint_arrays, 
        url_vectors,
        url_colors,
    ), 
    UrlObjects(
        url_arrays,
        url_strings,
        url_vectors,
        url_colors,
    ),
    UrlScreenState(
        url_arrays,
        url_numbers,
        url_vectors),
    0
);

