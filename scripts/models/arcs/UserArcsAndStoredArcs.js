'use strict';

/*
`UserArcsAndStoredArcs` returns a namespace of pure functions that describe maps between `UserArc`s and `StoredArc`s
*/
function UserArcsAndStoredArcs(
    node_metric_bundle, 
    diagram_ids,
    glm,
    min_loop_chord_length, 
    max_loop_chord_length, 
    max_loop_snap_distance, 
    max_nonloop_snap_distance,
    target_offset_distance,
) {
    return {
        user_arc_to_stored_arc: (arc, default_offset_id) => {
            default_offset_id = default_offset_id || glm.vec2();

            const source_cell = node_metric_bundle.bundle(arc.source);
            const target_cell = node_metric_bundle.bundle(arc.target);

            const is_loop = node_metric_bundle.distance(arc.source, arc.target) < max_loop_chord_length;
            const max_snap_distance = (is_loop? max_loop_snap_distance : max_nonloop_snap_distance)
            const is_snapped = (
                node_metric_bundle.distance(arc.source, source_cell) < max_snap_distance && 
                node_metric_bundle.distance(arc.target, target_cell) < max_snap_distance);
            const is_valid = is_snapped;

            /*
            TODO: offsets should be calculated in *the reference frame determined by node.source.reference.
            This will allow 2-loops to be oriented relative to coordinate system at the midpoint of their source/target arc.
            */
            const target_offset_id = 
                 !is_valid?  default_offset_id
                : is_loop?   diagram_ids.offset_to_offset_id(arc.target.position.sub(arc.source.position))  
                :            glm.vec2();

            const source = 
                  is_snapped?    source_cell
                :                arc.source;

            const target = 
                  is_snapped? target_cell
                :             arc.target;

            const stored_arc = new StoredArc(
                source, 
                target, 
                arc.min_length_clockwise, 
                target_offset_id,
                is_valid
            );
            return stored_arc
        },
        stored_arc_to_user_arc: (arc) => {
            return new UserArc(
                new UserNode(arc.target_offset_id.mul(-target_offset_distance).add(arc.source.position), arc.source.reference), 
                new UserNode(arc.target_offset_id.mul( target_offset_distance).add(arc.target.position), arc.target.reference),
                arc.min_length_clockwise
            );
        }
    };
}
