'use strict';

/*
`UserArcsAndFunctorArcs` returns a namespace of pure functions that describe maps between `UserArc`s and `StoredArc`s
*/
function UserArcsAndFunctorArcs(
    diagram_ids, 
    min_loop_chord_length, 
    max_loop_chord_length, 
    max_loop_snap_distance, 
    max_nonloop_snap_distance,
    target_offset_distance
) {
    const ids = diagram_ids;
    return {
        user_arc_to_stored_arc: function(arc, default_offset_id) {
            default_offset_id = default_offset_id || glm.vec2();
            const source_cell = ids.cell_position_to_cell_id(arc.source);
            const target_cell = ids.cell_position_to_cell_id(arc.target);

            const is_loop = glm.distance(arc.source, arc.target) < max_loop_chord_length;
            const is_hidden = glm.distance(arc.target, arc.source) < min_loop_chord_length;
            const max_snap_distance = (is_loop? max_loop_snap_distance : max_nonloop_snap_distance)
            const is_snapped = (
                glm.distance(arc.source, source_cell) < max_snap_distance && 
                glm.distance(arc.target, target_cell) < max_snap_distance);
            const is_valid = is_snapped && !is_hidden;

            const target_offset_id = 
                 !is_valid?  default_offset_id
                : is_loop?   ids.offset_to_offset_id(arc.target.sub(arc.source)) 
                :            glm.vec2();

            const source = 
                  is_hidden?     source_cell
                : is_snapped?    source_cell
                :                arc.source;

            const target = 
                  is_hidden?  source_cell
                : is_snapped? target_cell
                :             arc.target;

            return new StoredArc(
                source, 
                target, 
                arc.min_length_clockwise, 
                target_offset_id,
                is_valid
            );
        },
        stored_arc_to_user_arc: function(arc){
            return new UserArc(
                arc.target_offset_id.mul(-target_offset_distance).add(arc.source), 
                arc.target_offset_id.mul( target_offset_distance).add(arc.target),
                arc.min_length_clockwise
            );
        }
    };
}
