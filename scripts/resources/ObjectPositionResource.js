'use strict';

/*
A `ObjectPositionResource` implements a REST-like interface
on source and target positions within a list of arrows.
*/
function ObjectPositionResource(diagram_ids){
    return {

        get: function(objects){
            let position_map = {};
            for(let object of objects){
                const position_hash = diagram_ids.cell_id_to_cell_hash(object.position);
                position_map[position_hash] = object.position;
            }
            return position_map;
        },

        post: function(position_map) {
            return Object.values(position_map).map(position => new DiagramObject(position));
        },

        put: function(objects, position_map, show_invalid) {
            const updated = [];
            for(let object of objects){
                const position_hash = diagram_ids.cell_id_to_cell_hash(object.position);
                const updated_position = position_map[position_hash] || object.position;
                const updated_cell = diagram_ids.cell_position_to_cell_id(updated_position);
                const is_snapped = glm.distance(updated_position, updated_cell) < 0.25; 
                if(is_snapped || show_invalid)
                {
                    updated.push(object.with({
                        position: is_snapped? updated_cell : updated_position, 
                        is_valid: is_snapped
                    }));
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
