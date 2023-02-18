'use strict';

/*
`UrlScreenState` results in a namespace of pure functions 
that describe maps between `ScreenStateStore`s and their representation in a url querystring.
See README.md for more information.
*/

const UrlScreenState = (url_arrays, url_numbers, url_vectors) => ({

    export: (state) => 
        url_arrays.export([
            url_vectors.export(state.topleft_cell_position), 
            url_numbers.export(state.log2_cell_width|0)
        ]),

    import: (string) => 
        (array => new ScreenStateStore(
            url_vectors.import(array[0]), 
            url_numbers.import(array[1]),
        ))(url_arrays.import(string)),

    updates: {},
});
