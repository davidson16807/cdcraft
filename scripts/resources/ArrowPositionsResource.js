'use strict';

/*
A `ArrowPositionsResource` implements a REST-like interface
on source and target positions within a list of arrows.
*/
function ArrowPositionsResource(diagram_ids, user_arcs_and_stored_arcs){
    return {

        get: function(arrows){
            let position_map = {};
            for(let arrow of arrows){
                const stored_arc = arrow.arc;
                const source_hash = diagram_ids.cell_id_to_cell_hash(stored_arc.source);
                const target_hash = diagram_ids.cell_id_to_cell_hash(stored_arc.target);
                position_map[source_hash] = stored_arc.source;
                position_map[target_hash] = stored_arc.target;
            }
            return position_map;
        },

        put: function(arrows, position_map, show_invalid) {
            const updated_arrows = [];
            for(let arrow of arrows){
                const old_stored = arrow.arc;
                const old_users = user_arcs_and_stored_arcs.stored_arc_to_user_arc(old_stored);
                const source_hash = diagram_ids.cell_id_to_cell_hash(old_stored.source);
                const target_hash = diagram_ids.cell_id_to_cell_hash(old_stored.target);
                const new_users = new UserArc(
                    position_map[source_hash] != null? 
                        old_stored.target_offset_id.mul(-0.015).add(position_map[source_hash]) 
                      : old_users.source, 
                    position_map[target_hash] != null? 
                        old_stored.target_offset_id.mul( 0.015).add(position_map[target_hash]) 
                      : old_users.target,
                    old_users.min_length_clockwise);
                const new_stored = user_arcs_and_stored_arcs.user_arc_to_stored_arc(new_users, old_stored.target_offset_id);
                if(new_stored.is_valid || show_invalid){
                    updated_arrows.push(new DiagramArrow(
                            new_stored,
                            arrow.is_edited,
                            arrow.label,
                            arrow.label_offset,
                            arrow.source_style_id,
                            arrow.end_style_id,
                            arrow.line_style_id,
                        ));
                }
            }
            return updated_arrows;
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
