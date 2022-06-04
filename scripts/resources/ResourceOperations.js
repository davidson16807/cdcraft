'use strict';

/*
`*Resource` classes uses single operations to potentially get or set many values,
so the position object that it gets or sets cannot be a simple `glm.vec2`.
For this reason, we need a namespace of operations that are analogous to operations in `glm.vec2`,
but for maps between position hashes and their updated positions.
*/
function ResourceOperations(){

    return {

        /*
        `update` offsets all positions within a `position_map`.
        */
        update: function(...maps) {
            return Object.assign(...maps);
        },

        /*
        `delete` removes all positions indexed by from a `position_map`.
        */
        delete: (map1, map2) => {
            const result = {};
            for(let hash in map1){
                if (map2[hash] == null) {
                    result[hash] = map1[hash];
                }
            }
            return result;
        },

        post: function(map1) {
            return Object.values(map1);
        },

    };
}
