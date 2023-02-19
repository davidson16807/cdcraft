'use strict';

/*
`UrlScreenState` results in a namespace of pure functions 
that describe maps between `ScreenStateStore`s and their representation in a url querystring.
See README.md for more information.
*/

const UrlScreenState = (dependencies) => {
    const url_floats = dependencies.url_floats_curried;
    const url_arrays = dependencies.url_arrays;
    const url_vec2s = dependencies.url_vec2s_curried;
    return ({

        export: (state) => 
            url_arrays.export([
                url_vec2s(0,0.001).export(state.topleft_cell_position), 
                url_floats(0,0.001).export(state.log2_cell_width)
            ]),

        import: (string) => 
            (array => new ScreenStateStore(
                url_vec2s(0,0.001).import(array[0]), 
                url_floats(0,0.001).import(array[1]),
            ))(url_arrays.import(string)),

        updates: (version, string) => string,
    });
}