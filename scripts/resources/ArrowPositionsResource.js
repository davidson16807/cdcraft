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
                const updated_arc = 
                    user_arcs_and_stored_arcs.user_arc_to_stored_arc(
                        new UserArc(
                            position_map[source_hash] || arc.source,
                            position_map[target_hash] || arc.target,
                            arc.min_length_clockwise,
                        )
                    );
                if(updated_arc.is_valid || show_invalid){
                    updated.push(new DiagramArrow(
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
