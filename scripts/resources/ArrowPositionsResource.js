'use strict';

/*
A `ArrowPositionsResource` implements a REST-like interface
on source and target positions within a list of arrows.
*/
function ArrowPositionsResource(
    diagram_ids, 
    user_arcs_and_stored_arcs,
    show_invalid
){
    return {

        get: function(arrows){
            let position_map = {};
            for(let arrow of arrows){
                const arc = arrow.arc;
                const source_hash = diagram_ids.cell_id_to_cell_hash(arc.source);
                const target_hash = diagram_ids.cell_id_to_cell_hash(arc.target);
                position_map[source_hash] = arc.source;
                position_map[target_hash] = arc.target;
            }
            return position_map;
        },

        put: function(arrows, position_map) {
            const updated = [];
            for(let arrow of arrows){
                const arc = arrow.arc;
                const source_hash = diagram_ids.cell_id_to_cell_hash(arc.source);
                const target_hash = diagram_ids.cell_id_to_cell_hash(arc.target);
                const updated_source = position_map[source_hash] || arc.source;
                const updated_target = position_map[target_hash] || arc.target;
                const source_cell = diagram_ids.cell_position_to_cell_id(updated_source);
                const target_cell = diagram_ids.cell_position_to_cell_id(updated_target);
                const is_snapped = (
                    glm.distance(updated_source, source_cell) < 0.25 && 
                    glm.distance(updated_target, target_cell) < 0.25);  //(is_loop? max_loop_snap_distance : max_nonloop_snap_distance);
                const is_hidden = glm.distance(updated_target, source_cell) < 0.07;//min_loop_chord_length;
                const is_valid = is_snapped;// && !is_hidden;

                const updated_arc = new StoredArc(
                    is_snapped? source_cell : updated_source, 
                    is_snapped? target_cell : updated_target, 
                    arc.min_length_clockwise, 
                    arc.target_offset_id,
                    is_snapped
                );
                if(updated_arc.is_valid || show_invalid){
                    updated.push(new DiagramArrow(
                            updated_arc,
                            arrow.is_edited,
                            arrow.label,
                            arrow.label_offset,
                            arrow.source_style_id,
                            arrow.end_style_id,
                            arrow.line_style_id,
                        ));
                }
            }
            return updated;
        },

        delete: function(arrows, position_map) {
            const filtered = [];
            for(let arrow of arrows){
                const arc = arrow.arc;
                const source_hash = diagram_ids.cell_id_to_cell_hash(arc.source);
                const target_hash = diagram_ids.cell_id_to_cell_hash(arc.target);
                if (position_map[source_hash] == null && position_map[target_hash] == null) {
                    filtered.push(arrow);
                }
            }
            return filtered;
        },

    };
}
