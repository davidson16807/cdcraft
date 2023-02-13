'use strict';

/*
`StoredArcsAndPointArcsCurried` returns a namespace of pure functions that describe maps between `SamplerArc`s and `UserArc`s
*/
function StoredArcsAndPointArcsCurried(
        node_curried_point_indication, 
        stored_curried_arc_properties) {
    return (arrows) => {
        const stored_arcs_and_point_arcs = {};
        const stored_arc_properties = stored_curried_arc_properties(stored_arcs_and_point_arcs, arrows);
        /*
        TODO:
        The logic concerning `target_offset_distance` here is duplicated from `UserArcsAndStoredArcsCurried.stored_arc_to_user_arc()`.
        There's something fishy going on here, see if we can't better understand the relationship 
        between `StoredArcs`, `UserArcs`, and `PointArcs`, and resolve this duplication.
        At the very least, there needs to be a new namespace that consolidates logic surrounding `target_offset_distance`,
        and it should be a dependency for both `StoredArcsAndPointArcsCurried` and `UserArcsAndStoredArcsCurried`.
        */
        stored_arcs_and_point_arcs.stored_arc_to_point_arc = 
            (arc) => {
                const target_offset = 
                    stored_arc_properties.target_offset_to_global_mapping(arc, arc.source.reference == arc.target.reference)
                        .offset.revert(arc.target_offset_id);
                return new PointArc(
                    node_curried_point_indication(stored_arcs_and_point_arcs, arrows).point(arc.source).sub(target_offset),
                    node_curried_point_indication(stored_arcs_and_point_arcs, arrows).point(arc.target).add(target_offset),
                    arc.min_length_clockwise
                )
            };
        return stored_arcs_and_point_arcs;
    }
}
