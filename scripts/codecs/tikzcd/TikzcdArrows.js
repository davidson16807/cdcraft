'use strict';


/*
`LatexArrows` results in a namespace of pure functions 
that describe maps between `DiagramArrow`s and their representations in LaTeX.
*/

const LatexArrows = () => {

    const id = x => x;

    const offsetters = {
        arrow_arc: (key, mod) => (arrow, value) => arrow.with({ arc: arrow.arc.with(Object.fromEntries([[key, mod(arrow.arc)]])) }),
    }
    const setters = {
        arrow_arc: (key, get) => (arrow, value) => arrow.with({ arc: arrow.arc.with(Object.fromEntries([[key,get(value)]])) }),
        arrow:     (key, get) => (arrow, value) => arrow.with( Object.fromEntries([[key,get(value)]]) ),
    }

    const color_lookup = Object.fromEntries(
        color_code_ids.map(([code, id]) => [code, setters.arrow('color', 0)])
    );

    const parameter_lookup = {
        l:          offsetters.arrow_arc('target', arc=>arc.source.add(glm.vec2(-1, 0))),
        r:          offsetters.arrow_arc('target', arc=>arc.source.add(glm.vec2( 1, 0))),
        ld:         offsetters.arrow_arc('target', arc=>arc.source.add(glm.vec2(-1,-1))),
        rd:         offsetters.arrow_arc('target', arc=>arc.source.add(glm.vec2( 1,-1))),
        lu:         offsetters.arrow_arc('target', arc=>arc.source.add(glm.vec2(-1, 1))),
        ru:         offsetters.arrow_arc('target', arc=>arc.source.add(glm.vec2( 1, 1))),
        to:         setters.arrow_arc('source', value=>latex_vectors.import(value) ),
        from:       setters.arrow_arc('target', value=>latex_vectors.import(value) ),
        bend_left:  setters.arrow_arc('min_length_clockwise', value=>-value),
        bend_right: setters.arrow_arc('min_length_clockwise', value=> value),
        dashed:     setters.arrow    ('line_style_id', value=>1),
        dotted:     setters.arrow    ('line_style_id', value=>2),
    }

    return {

        encode: (arrow) => 
            ((args, kwargs) => `\\arrow[${kwargs.map(keyvalue=>keyvalue.join('=')).join(', ')} ${args.filter(arg => arg.length>0).join(', ')}]`)
                ([
                    ['to',   latex_vectors.export(arrow.arc.source)],
                    ['from', latex_vectors.export(arrow.arc.target)],
                ],
                [
                    latex_colors.export(arrow.color),
                ]),

        decode: (tag) => tag.tags
            .slice(1)
            .filter(subtag => !subtag.fluff)
            .map(subtag => )
        // decode: (string) => 
        //     ((args, kwargs) => 
        //         kwargs.reduce((arrow, keyvalue)=>(parameter_lookup[keyvalue[0]] ?? id)(arrow, value), 
        //             args.reduce((arrow, value)=>(parameter_lookup[value] ?? id)(arrow), 
        //                 DiagramArrow())))
        //         (string.split(',')
        //             .map(section => section.split('=',2))
        //             .map(keyvalue => keyvalue.length>1? keyvalue : [keyvalue, undefined])),

    };

};

const TizcdArrows = () => {

    return {

        // encode:(arrow) =>

        decode:(tag) => {
            let arrow = DiagramArrow();
            const directive = tag.tags[0];
            const directive_offset = directive.replace("arrow", '');
            
        }

    };

};
