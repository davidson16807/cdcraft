'use strict';


/*
`UserArcsAndFlatArcs` returns a namespace of pure functions that describe maps between `SamplerArc`s and `UserArc`s
*/
function UserArcsAndFlatArcs(meta_user_node_point_indication) {
    const user_arcs_and_flat_arcs = {};
    user_arcs_and_flat_arcs.user_arc_to_flat_arc = (user_arc) => 
        new FlatArc(
            meta_user_node_point_indication.instantiate(user_arcs_and_flat_arcs).point(user_arc.source),
            meta_user_node_point_indication.instantiate(user_arcs_and_flat_arcs).point(user_arc.target),
            user_arc.min_length_clockwise
        );
    return user_arcs_and_flat_arcs;
}
