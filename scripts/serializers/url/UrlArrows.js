'use strict';

/*
`UrlArrows` results in a namespace of pure functions 
that describe maps between `DiagramArrow`s and their representation in a url querystring.
See README.md for more information.
*/
const UrlArrows = (
        url_arrays,
        url_numbers,
        url_strings,
        url_uint_arrays, 
        url_vectors, 
        url_colors) => {
    const url_style = url_uint_arrays(4, 8);
    const string_base = 36;
    return {

        export: (arrow) => 
            url_arrays.export([
                url_style.export([
                    arrow.line_style_id,
                    arrow.head_style_id,
                    arrow.body_style_id,
                    arrow.tail_style_id,
                    arrow.line_count,
                    arrow.head_count,
                    arrow.body_count,
                    arrow.tail_count,
                ]),
                url_vectors.export(arrow.arc.source.position),
                url_vectors.export(arrow.arc.target.position),
                url_numbers.export(arrow.arc.min_length_clockwise),
                url_vectors.export(arrow.arc.target_offset_id),
                url_numbers.export(arrow.arc.source.reference),
                url_numbers.export(arrow.arc.target.reference),
                url_colors.export(arrow.color),
                url_strings.export(arrow.label),
                url_vectors.export(arrow.arc.label_offset_id),
            ]),

        import: (string) => 
            (array => new DiagramArrow(
                new StoredArc(
                    new Node(url_vectors.import(array[1]), url_numbers.import(array[5])),
                    new Node(url_vectors.import(array[2]), url_numbers.import(array[6])),
                    url_numbers.import(array[3]),
                    url_vectors.import(array[4]),
                ),
                ...url_style.import(array[0]),
                url_colors.import(array[7]),
                url_strings.import(array[8]),
                url_vectors.import(array[9]),
            )) (url_arrays.import(string)),

        updates: {},
    };
}
