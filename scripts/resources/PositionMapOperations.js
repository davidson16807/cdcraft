'use strict';

/*
`*PositionMapOperations` uses single operations to potentially get or set many positions,
so the position object that it gets or sets cannot be a simple `glm.vec2`.
For this reason, we need a namespace of operations that are analogous to operations in `glm.vec2`,
but for maps between position hashes and their updated positions.
*/
function PositionMapOperations(diagram_ids){

    return {

        /*
        `offset` offsets all positions within a `position_map`.
        */
        offset: function(position_map, offset) {
            let offset_position_lookup = {};
            for (let id in position_map){
                offset_position_lookup[id] = position_map[id].add(offset);
            }
            return offset_position_lookup;
        },

    };
}
