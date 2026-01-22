'use strict';

/*
`UrlArrows` results in a namespace of pure functions 
that describe maps between `DiagramArrow`s and their representation in a url querystring.
See README.md for more information.
*/
const UrlArrows = (dependencies) => {
    const url_uint_arrays = dependencies.url_uint_arrays_curried;
    const url_ints    = dependencies.url_ints_curried;
    const url_floats  = dependencies.url_floats_curried;
    const url_ivec2s  = dependencies.url_ivec2s_curried;
    const url_vec2s   = dependencies.url_vec2s_curried;
    const url_arrays  = dependencies.url_arrays;
    const url_strings = dependencies.url_strings;
    const url_colors  = dependencies.url_colors;
    const url_style = url_uint_arrays(4, 8);
    const string_base = 36;
    return {

        export: (arrow) => 
            url_arrays.export([
                url_style.export([
                    arrow.head_style_id,
                    arrow.line_style_id,
                    arrow.body_style_id,
                    arrow.tail_style_id,
                    arrow.head_count,
                    arrow.line_count,
                    arrow.body_count,
                    arrow.tail_count,
                ]),
                url_vec2s(0,1).export(arrow.arc.source.position),
                url_vec2s(0,1).export(arrow.arc.target.position),
                url_floats(0,0.1).export(arrow.arc.min_length_clockwise),
                url_ivec2s(0,1).export(arrow.arc.target_offset_id),
                url_ints().export(arrow.arc.source.reference),
                url_ints().export(arrow.arc.target.reference),
                url_colors.export(arrow.color),
                url_strings.export(arrow.label),
                url_ivec2s(0,1).export(arrow.label_offset_id),
            ]),

        import: (string) => 
            (array => new DiagramArrow(
                new StoredArc(
                    new Node(url_vec2s(0,1).import(array[1]), url_ints().import(array[5])),
                    new Node(url_vec2s(0,1).import(array[2]), url_ints().import(array[6])),
                    url_floats(0,0.1).import(array[3]),
                    url_ivec2s(0,1).import(array[4]),
                ),
                ...url_style.import(array[0]),
                url_colors.import(array[7]),
                url_strings.import(array[8]),
                url_ivec2s(0,1).import(array[9]),
                false,
            )) (url_arrays.import(string)),

        updates: (version, string) => string,
    };
}
