'use strict';

/*
A `ObjectPositionResource` implements a REST-like interface
on source and target positions within a list of arrows.
*/
function ObjectPositionResource(diagram_ids){
    return {

        get: function(objects){
            let point_to_point = {};
            for(let object of objects){
                const position_hash = diagram_ids.cell_id_to_cell_hash(object.position);
                point_to_point[position_hash] = object.position;
            }
            return point_to_point;
        },

        put: function(objects, point_to_point) {
            const updated = [];
            for(let object of objects){
                const position_hash = diagram_ids.cell_id_to_cell_hash(object.position);
                const updated_position = point_to_point[position_hash] || object.position;
                const updated_cell = diagram_ids.cell_position_to_cell_id(updated_position);
                const is_snapped = glm.distance(updated_position, updated_cell) < 0.25; 
                updated.push(object.with({
                    position: is_snapped? updated_cell : updated_position, 
                    is_valid: is_snapped
                }));
            }
            return updated;
        },


        delete: function(objects, point_to_point) {
            const filtered = [];
            for(let object of objects){
                const position_hash = diagram_ids.cell_id_to_cell_hash(object.position);
                if (point_to_point[position_hash] == null) {
                    filtered.push(arrow);
                }
            }
            return filtered;
        },

        post: function(objects, point_to_point) {
            return [
                ...objects, 
                ...Object.values(point_to_point).map(position => new DiagramObject(position))
            ];
        }

    };
}
