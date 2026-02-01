'use strict';


/*
`TikzcdDiagrams` results in a namespace of pure functions 
that describe maps between `DiagramArrow`s and their representations in LaTeX using the Tikzcd plugin.

TODO: 
    decode color 
    implement encode()
*/

const TikzcdDiagrams = (
        object_position_resource, 
        resource_operations, 
        tikzcd_arrows, 
        tikzcd_objects, 
        default_screen_frame_store
    ) => {

    const min2 = (u,v) => glm.vec2(Math.min(u.x,v.x), Math.min(u.y,v.y));
    const max2 = (u,v) => glm.vec2(Math.max(u.x,v.x), Math.max(u.y,v.y));

    const oo = Infinity;

    const beginning = Tag(['\\begin{tikzcd}'], undefined, true);
    const ending    = Tag(['\\end{tikzcd}'],   undefined, true);

    return {

        encode:(diagram) => {

            const inferred_objects = 
                object_position_resource.post([],
                    resource_operations.delete(
                        arrow_positions_resource.get(diagram.arrows),
                        object_position_resource.get(diagram.objects)
                    )
                );

            const objects = [...diagram.objects, ...inferred_objects];
            console.log(objects);

            const topleft = objects
                    .map(object => object.position)
                    .reduce(min2, glm.vec2(oo,oo));

            const bottomright = objects
                    .map(object => object.position)
                    .reduce(max2, glm.vec2(-oo,-oo));

            const rows = [];
            for(let j=topleft.y; j<=bottomright.y; j++){
                const cells = [];
                for(let i=topleft.x; i<=bottomright.x; i++){
                    const reference_cell = glm.vec2(i,j);
                    const cell = [];
                    diagram.arrows
                        .filter(arrow => glm.distance(arrow.arc.source.position, reference_cell) == 0)
                        .map(arrow => tikzcd_arrows.encode(arrow, topleft))
                        .forEach(subtag => cell.push(subtag));
                    objects
                        .filter(object => glm.distance(object.position, reference_cell) == 0)
                        .map(object => tikzcd_objects.encode(object))
                        .forEach(subtag => cell.push(subtag));
                    if (i!=topleft.x){
                        rows.push(Tag(['&'], undefined, true));
                    }
                    cells.push(Tag(cell, 'cell'));
                }
                if (j!=topleft.y){
                    rows.push(Tag(['\\\\'], undefined, true));
                }
                rows.push(Tag(cells, 'row'));
            }

            return Tag([beginning, ...rows, ending], 'diagram');

        },

        decode:(tag) => {

            const arrows = [];
            const objects = [];

            const rows = tag.tags.filter(subtag => subtag.type=='row');
            for(let j=0; j<rows.length; j++){
                const cells = rows[j].tags.filter(subtag => subtag.type=='cell');
                for(let i=0; i<cells.length; i++){
                    cells[i].tags
                        .filter(subtag => subtag.type=='arrow')
                        .map(subtag => tikzcd_arrows.decode(subtag, glm.vec2(i,j)))
                        .forEach(arrow => arrows.push(arrow));
                    cells[i].tags
                        .filter(subtag => subtag.type=='object')
                        .map(subtag => tikzcd_objects.decode(subtag, glm.vec2(i,j)))
                        .forEach(object => objects.push(object));
                }
            }

            return new Diagram(
                arrows, objects, 
                [], [], [], // selections
                default_screen_frame_store
            );

        }

    };

};

