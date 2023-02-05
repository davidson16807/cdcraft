'use strict';

/*
`CurriedStoredArcsAndPointArcs` returns a namespace of pure functions that describe maps between `SamplerArc`s and `UserArc`s
*/
function CurriedStoredArcsAndPointArcs(curried_node_point_indication, target_offset_distance) {
    return (arrows) => {
            const stored_arcs_and_point_arcs = {};
            /*
            TODO:
            The logic concerning `target_offset_distance` here is duplicated from `UserArcsAndStoredArcs.stored_arc_to_user_arc()`.
            There's something fishy going on here, see if we can't better understand the relationship 
            between `StoredArcs`, `UserArcs`, and `PointArcs`, and resolve this duplication.
            At the very least, there needs to be a new namespace that consolidates logic surrounding `target_offset_distance`,
            and it should be a dependency for both `CurriedStoredArcsAndPointArcs` and `UserArcsAndStoredArcs`.
            */
            stored_arcs_and_point_arcs.stored_arc_to_point_arc = (stored_arc) => 
                new PointArc(
                    curried_node_point_indication(stored_arcs_and_point_arcs, arrows).point(stored_arc.source)
                        .add(stored_arc.target_offset_id.mul(-target_offset_distance)),
                    curried_node_point_indication(stored_arcs_and_point_arcs, arrows).point(stored_arc.target)
                        .add(stored_arc.target_offset_id.mul( target_offset_distance)),
                    stored_arc.min_length_clockwise
                );
            return stored_arcs_and_point_arcs;
    }
}
