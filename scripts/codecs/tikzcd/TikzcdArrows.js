'use strict';


/*
`TikzcdArrows` results in a namespace of pure functions 
that describe maps between `DiagramArrow`s and their representations in LaTeX using the Tikzcd plugin.

TODO: 
    decode color 
    implement encode()
*/

const TikzcdArrows = (tikzcd_codec) => {

    const offset_of_letter = {
        l: glm.vec2(-1, 0),
        r: glm.vec2( 1, 0),
        d: glm.vec2( 0,-1),
        u: glm.vec2( 0, 1),
    };

    const apply_offset = (arc, offset) => 
        arc.with({
            target: new Node(arc.target.position.add(offset))
        });

    const action_for_phrase = {
        'bend left':  arc => arc.with({min_length_clockwise: -1.5}),
        'bend right': arc => arc.with({min_length_clockwise:  1.5}),
        'dashed': arc => arc.with({line_style_id: 1}),
        'dotted': arc => arc.with({line_style_id: 2}),
    };

    const decode_vec2 = (latex) => glm.vec2(parseInt(value.split('-')[0]), parseInt(value.split('-')[1]));

    return {

        encode:(arrow, reference_cell) => {

            return Tag([
                '\\arrow', 
                Tag(['['], undefined, true),
                Tag([
                    Tag(['from'], 'key'),
                    Tag(['='], undefined, true),
                    Tag([`${arrow.arc.source.position.x}-${arrow.arc.source.position.y}`], 'value'),
                ], 'assignment'),
                Tag([
                    Tag(['to'], 'key'),
                    Tag(['='], undefined, true),
                    Tag([`${arrow.arc.target.position.x}-${arrow.arc.target.position.y}`], 'value'),
                ], 'assignment'),
                ...{
                    1: ['dashed'],
                    2: ['dotted'],
                }[arrow.arc.line_style_id] ?? [],
                Tag([']'], undefined, true),
            ], 'arrow');

        },

        decode:(tag, reference_cell) => {

            let arrow = new DiagramArrow(
                new StoredArc(new Node(reference_cell), new Node(reference_cell), 1.0, glm.vec2(0,0), true),
                0, 2, 0, 0, 1, 1, 0, 0
            );

            const tags = tag.tags;
            const control = tags[0];
            const control_offset = control.replace("arrow", '').replace("ar", '').replace('\\','');
            const offsets = tags.filter(subtag=>subtag.type=='offset');
            const assignments = tags.filter(subtag=>subtag.type=='assignment');
            const labels = tags.filter(subtag=>subtag.type=='label');
            const phrases = tags.filter(subtag=>subtag.type=='phrase');

            // each letter offset increments the target by a cardinal direction
            for(let letter of control_offset){
                const offset = offset_of_letter[letter];
                arrow = arrow.with({ arc: apply_offset(arrow.arc, offset_of_letter[letter]) });
            }

            for(let offset of offsets){
                const letters = offset.tags[0];
                for(let letter of letters){
                    arrow = arrow.with({ arc: apply_offset(arrow.arc, offset_of_letter[letter]) });
                }
            }

            for(let assignment of assignments){
                // directionality specified by assignments overrides all other direction modifier
                const key = tikzcd_codec.phrase.encode(assignment.tags[0]);
                console.log(key);
                const value = assignment.tags[2];
                const action = action_for_phrase[key];
                if(action != null){
                    arrow = arrow.with({arc: action(arc)});
                } else if (key == 'to') {
                    arrow = arrow.with({ arc: arrow.arc({source: new Node(decode_vec2(vector))}) });
                } else if (key == 'from') {
                    arrow = arrow.with({ arc: arrow.arc({target: new Node(decode_vec2(vector))}) });
                }
            }

            for(let phrase of phrases){
                const key = tikzcd_codec.phrase.encode(phrase);
                console.log(key);
                const action = action_for_phrase[key];
                if(action != null){
                    arrow = arrow.with({arc: action(arrow.arc)});
                } 
            }

            for(let label of labels){
                const text = label.tags.filter(subtag=>subtag.type=='string')[0].tags[0];
                const phrase = label.tags.filter(subtag=>subtag.type=='phrase')[0];
                // `phrase` typically expresses label postiion, but it is currently not supported
                // we only support arrows with single labels, so we override the last label
                arrow = arrow.with({label: `\\[${text}\\]`});
            }

            return arrow;

        }

    };

};

