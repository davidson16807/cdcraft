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
        default_screen_frame_store,
        version) => {
    return {
        export: (diagram) => 
            '?'+url_outer_arrays.export([
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
                    array <= 1? 
                        default_screen_frame_store : 
                        url_screen_state.import(array[1]),
                )
            )(url_outer_arrays.import(string.replace('?',''))),
        updates: {},
    };
}
