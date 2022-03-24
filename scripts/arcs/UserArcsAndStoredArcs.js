'use strict';

/*
`UserArcsAndStoredArcs` returns a namespace of pure functions that describe maps between `UserArc`s and `StoredArc`s
*/
function UserArcsAndStoredArcs(
    diagram_ids, 
    min_loop_chord_length, 
    max_loop_chord_length, 
    max_loop_snap_distance, 
    max_nonloop_snap_distance,
    cell_to_target_distance
) {
    const ids = diagram_ids;
    return {
        user_arc_to_stored_arc: function(arc) {
            const source_cell = ids.cell_position_to_cell_id(arc.source);
            const target_cell = ids.cell_position_to_cell_id(arc.target);

            const is_loop = glm.distance(arc.source, arc.target) < max_loop_chord_length;
            const is_snapped = glm.distance(arc.target, target_cell) < (is_loop? max_loop_snap_distance : max_nonloop_snap_distance);
            const is_canceled = glm.distance(arc.target, source_cell) < min_loop_chord_length;
            const is_valid = is_snapped && !is_canceled;

            const target = 
                  is_canceled?       source_cell
                : is_snapped? target_cell
                :                    arc.target;

            const target_offset_id = 
                  !is_valid?  glm.vec2()
                : is_loop?      ids.offset_to_offset_id(ids.cell_position_and_cell_id_to_offset(arc.target, target_cell)) 
                :               glm.vec2();

            return new StoredArc(
                source_cell, 
                target, 
                arc.min_length_clockwise, 
                target_offset_id,
                is_valid
            );
        },
        stored_arc_to_user_arc: function(arc){
            return new UserArc(
                arc.source, 
                arc.target_offset_id.mul(cell_to_target_distance).add(arc.target),
                arc.min_length_clockwise
            );
        }
    };
}