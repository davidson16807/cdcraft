'use strict';


/*
`MetaUserArcsAndFlatArcs` returns a namespace of pure functions that describe maps between `SamplerArc`s and `UserArc`s
*/
function MetaUserArcsAndFlatArcs(meta_user_node_point_indication) {
    return {
        instantiate: (arrows) => {
            const user_arcs_and_flat_arcs = {};
            user_arcs_and_flat_arcs.user_arc_to_flat_arc = (user_arc) => 
                new FlatArc(
                    meta_user_node_point_indication.instantiate(user_arcs_and_flat_arcs, arrows).point(user_arc.source),
                    meta_user_node_point_indication.instantiate(user_arcs_and_flat_arcs, arrows).point(user_arc.target),
                    user_arc.min_length_clockwise
                );
            return user_arcs_and_flat_arcs;
        }
    }
}
