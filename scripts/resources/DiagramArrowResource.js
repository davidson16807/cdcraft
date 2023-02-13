'use strict';

/*
A `DiagramArrowResource` implements a REST-like interface for arrows in a diagram
*/
function DiagramArrowResource(array_resource){
    const arrays = array_resource;

    return {

        get: (diagram_in, arrow_id) =>
            diagram_in.arrows[arrow_id],

        put: (diagram_in, arrow_id, arrow_in) =>
            diagram_in.with({
                arrows: arrays.put(diagram_in.arrows, arrow_id, arrow_in),
            }),

        delete: (diagram_in, arrow_id) =>
            diagram_in.with({
                arrows: arrays.delete(diagram_in.arrows, arrow_id),
            }),

    };
}
