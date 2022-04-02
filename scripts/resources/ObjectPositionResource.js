'use strict';

/*
A `ObjectPositionResource` implements a REST-like interface
on source and target positions within a list of arrows.
*/
function ObjectPositionResource(
    diagram_ids, 
    show_invalid
){
    return {

        get: function(objects){
            let position_map = {};
            for(let object of objects){
                const position_hash = diagram_ids.cell_id_to_cell_hash(object.position);
                position_map[position_hash] = object.position;
            }
            return position_map;
        },

        put: function(objects, position_map) {
            const updated = [];
            for(let object of objects){
                const position_hash = diagram_ids.cell_id_to_cell_hash(object.position);
                const updated_position = position_map[position_hash];
                if(updated_position || show_invalid)
                {
                    updated.push(new DiagramObject(
                        updated_position,
                        object.depiction,
                        object.annotation,
                        object.is_edited,
                        true // is_snapped
                    ));
                }
            }
            return updated;
        },

        delete: function(objects, position_map) {
            const filtered = [];
            for(let object of objects){
                const position_hash = diagram_ids.cell_id_to_cell_hash(object.position);
                if (position_map[position_hash] == null) {
                    filtered.push(arrow);
                }
            }
            return filtered;
        },

    };
}
