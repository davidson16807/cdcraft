'use strict';

/*
An `ArrayResource` implements a REST-like interface on values in an array
*/
function ArrayResource(){
    return {

        get: (array_in, id) => array_in[id],

        put: (array_in, id, value) => {
            const array_out = array_in.slice(0);
            if (id >= 0) {
                array_out[id] = value;
            }
            return array_out;
        },

        delete: (array_in, id) => {
            const array_out = array_in.slice(0);
            if (id >=0) {
                array_out.splice(id, 1);
                return array_out;
            }
        },

        post: (array_in, value) => [...array_in, value],

    };
}
