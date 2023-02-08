'use strict';

/*
`CurriedStoredArcsAndPointArcs` returns a namespace of pure functions that describe maps between `SamplerArc`s and `UserArc`s
*/
function CurriedStoredArcsAndPointArcs(
        curried_node_point_indication, 
        point_arcs_properties,
        target_offset_distance) {
    return (arrows) => {
        // TODO: consolidate this with the copy in CurriedUserArcsAndStoredArcs
        const target_offset_map = 
            (node, is_loop) =>
                is_loop && node.reference != null? 
                    LinearMapping(
                        new LinearMap(
                            point_arcs_properties.chord_direction(
                                stored_arcs_and_point_arcs.stored_arc_to_point_arc(
                                    arrows[node.reference].arc)),
                            glm.vec2(0)
                        ))
                  : IdentityMapping();
        const stored_arcs_and_point_arcs = {};
        /*
        TODO:
        The logic concerning `target_offset_distance` here is duplicated from `CurriedUserArcsAndStoredArcs.stored_arc_to_user_arc()`.
        There's something fishy going on here, see if we can't better understand the relationship 
        between `StoredArcs`, `UserArcs`, and `PointArcs`, and resolve this duplication.
        At the very least, there needs to be a new namespace that consolidates logic surrounding `target_offset_distance`,
        and it should be a dependency for both `CurriedStoredArcsAndPointArcs` and `CurriedUserArcsAndStoredArcs`.
        */
        stored_arcs_and_point_arcs.stored_arc_to_point_arc = 
            (arc) => {
                const target_offset = 
                    target_offset_map(arc.source, arc.source.reference == arc.target.reference).offset
                        .revert(arc.target_offset_id)
                        .mul(target_offset_distance);
                return new PointArc(
                    curried_node_point_indication(stored_arcs_and_point_arcs, arrows).point(arc.source).sub(target_offset),
                    curried_node_point_indication(stored_arcs_and_point_arcs, arrows).point(arc.target).add(target_offset),
                    arc.min_length_clockwise
                )
            };
        return stored_arcs_and_point_arcs;
    }
}
