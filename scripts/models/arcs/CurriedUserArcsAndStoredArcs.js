'use strict';

/*
`CurriedUserArcsAndStoredArcs` returns a namespace of pure functions that describe maps between `UserArc`s and `StoredArc`s
*/
function CurriedUserArcsAndStoredArcs(
    curried_stored_arcs_and_point_arcs,
    point_arcs_properties,
    node_metric_bundle, 
    diagram_ids,
    glm,
    math,
    min_loop_chord_length, 
    max_loop_chord_length, 
    max_loop_snap_distance, 
    max_nonloop_snap_distance,
    target_offset_distance,
) {
    return arrows => {
        const stored_arcs_and_point_arcs = curried_stored_arcs_and_point_arcs(arrows);
        return {
            user_arc_to_stored_arc: (arc, default_offset_id) => {
                default_offset_id = default_offset_id || glm.vec2();

                const source_cell = node_metric_bundle.bundle(arc.source);
                const target_cell = node_metric_bundle.bundle(arc.target);

                const chord_length = node_metric_bundle.distance(arc.source, arc.target);
                const is_loop = chord_length < max_loop_chord_length;
                const is_hidden = arc.source.reference == null && chord_length < min_loop_chord_length;
                const max_snap_distance = (is_loop? max_loop_snap_distance : max_nonloop_snap_distance)
                const is_snapped = (
                    node_metric_bundle.distance(arc.source, source_cell) < max_snap_distance && 
                    node_metric_bundle.distance(arc.target, target_cell) < max_snap_distance);
                const is_valid = is_snapped && !is_hidden;

                const chord_offset = glm.sub(arc.target.position, arc.source.position);
                const target_offset_id = 
                     !is_valid?  default_offset_id
                    : is_loop?   
                        diagram_ids.offset_to_offset_id(
                            arc.source.reference != null?
                                glm.vec2(
                                    glm.dot(
                                        point_arcs_properties.chord_offset(
                                            stored_arcs_and_point_arcs.stored_arc_to_point_arc(
                                                arrows[arc.source.reference].arc)), 
                                        chord_offset), 
                                    0)
                              : chord_offset)
                    : glm.vec2();

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
            stored_arc_to_user_arc: (arc) => {
                return new UserArc(
                    arc.source.with({position: arc.target_offset_id.mul(-target_offset_distance).add(arc.source.position)}),
                    arc.target.with({position: arc.target_offset_id.mul( target_offset_distance).add(arc.target.position)}),
                    arc.min_length_clockwise
                );
            }
        };
    };
}
