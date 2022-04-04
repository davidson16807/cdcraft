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
                const arc = arrow.arc;
                const source_hash = diagram_ids.cell_id_to_cell_hash(arc.source);
                const target_hash = diagram_ids.cell_id_to_cell_hash(arc.target);
                position_map[source_hash] = arc.source;
                position_map[target_hash] = arc.target;
            }
            return position_map;
        },

        put: function(arrows, position_map, show_invalid) {
            const updated_arrows = [];
            for(let arrow of arrows){
                const arc = arrow.arc;
                // TODO: move this logic to a category, possibly something resembling UserArcsAndStoredArcs
                const source_hash = diagram_ids.cell_id_to_cell_hash(arc.source);
                const target_hash = diagram_ids.cell_id_to_cell_hash(arc.target);
                const user_update = new UserArc(
                    position_map[source_hash] || arc.source, 
                    position_map[target_hash] || arc.target,
                    arc.min_length_clockwise);
                const stored_update = user_arcs_and_stored_arcs.user_arc_to_stored_arc(user_update, true);
                if(stored_update.is_valid || show_invalid){
                    updated_arrows.push(new DiagramArrow(
                            stored_update,
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
