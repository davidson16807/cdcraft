'use strict';

/*
`*ResourceOperations` uses single operations to potentially get or set many positions,
so the position object that it gets or sets cannot be a simple `glm.vec2`.
For this reason, we need a namespace of operations that are analogous to operations in `glm.vec2`,
but for maps between position hashes and their updated positions.
*/
function ResourceOperations(){

    return {

        /*
        `post` appends maps together.
        */
        post: function(...maps) {
            return Object.assign({}, ...maps);
        },

        /*
        `delete` removes all positions indexed by `map2` from `map1`.
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

    };
}
