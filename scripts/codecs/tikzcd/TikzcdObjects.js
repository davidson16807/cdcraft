'use strict';


/*
`TikzcdObjects` results in a namespace of pure functions 
that describe maps between `DiagramObject`s and their representations in LaTeX using the Tikzcd plugin.

TODO: 
    decode color 
    implement encode()
*/

const TikzcdObjects = (tikzcd_codec) => {

    const action_for_phrase = {
        'bend left':  arc => arc.with({min_length_clockwise: -1.5}),
        'bend right': arc => arc.with({min_length_clockwise:  1.5}),
        'dashed': arc => arc.with({line_style_id: 1}),
        'dotted': arc => arc.with({line_style_id: 2}),
    };

    return {

        decode:(tag, reference_cell) => {

            let object = new DiagramObject(
                reference_cell, 'black', ''
            );

            let text = tikzcd_codec.text.encode(tag);
            const color_text = tag.tags[0];
            if(color_text.type == 'color_text'){
                const content2 = color_text.tags.filter(subtag=>!subtag.fluff);
                object = object.with({color: tikzcd_codec.text.encode(content2[1])});
                text = tikzcd_codec.text.encode(content2[2]);
            }

            object.symbol = `\\[${text}\\]`;

            return object;

        }

    };

};
