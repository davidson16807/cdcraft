'use strict';

/*
`*PositionResources` uses single operations to potentially get or set many positions,
so the position object that it gets or sets cannot be a simple `glm.vec2`.
For this reason, we need a namespace of operations that are analogous to operations in `glm.vec2`,
but for maps between position hashes and their updated positions.
*/
function PositionMapOperations(diagram_ids){

    return {

        /*
        `offset` offsets all positions within a `position_lookup`.
        */
        offset: function(position_lookup, offset) {
            let offset_position_lookup = {};
            for (let id in position_lookup){
                offset_position_lookup[id] = position_lookup[id].add(offset);
            }
            return offset_position_lookup;
        },

        /*
        `update` offsets all positions within a `position_lookup`.
        */
        update: function(position_lookup1, position_lookup2) {
            return Object.assign(position_lookup1, position_lookup2);
        },

    };
}
