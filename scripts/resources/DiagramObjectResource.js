'use strict';

/*
A `DiagramObjectResource` implements a REST-like interface
on objects in a diagram, regardless of whether they are expressed or implied.
*/
function DiagramObjectResource(array_resource){
    const arrays = array_resource;

    return {

        explicit: {

            get: (diagram_in, object_id) => 
                diagram_in.objects[object_id],

            put: (diagram_in, object_id, object_in) => 
                diagram_in.with({
                    objects: arrays.put(diagram_in.objects, object_id, object_in),
                }),

            delete: (diagram_in, object_id) => 
                diagram_in.with({
                    objects: arrays.delete(diagram_in.objects, object_id),
                }),

        },

        inferred: {

            get: (diagram_in, object_id) => 
                diagram_in.objects[object_id],
            
            put: (diagram_in, object_id, object_in) => 
                diagram_in.with({
                    objects: arrays.post(diagram_in.objects, object_in),
                    object_selections: arrays.post(diagram_in.object_selections, diagram_in.objects.length),
                    inferred_object_selections: arrays.delete(diagram_in.inferred_object_selections, object_id),
                }),

            delete: (diagram_in, object_id) => 
                diagram_in.with({
                    inferred_object_selections: arrays.delete(diagram_in.inferred_object_selections, object_id),
                }),

        },

    };
}
