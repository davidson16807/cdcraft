'use strict';


/*
`CurriedUserArcsAndPointArcs` returns a namespace of pure functions that describe maps between `SamplerArc`s and `UserArc`s
*/
function CurriedUserArcsAndPointArcs(curried_node_point_indication) {
    return (arrows) => {
            const user_arcs_and_point_arcs = {};
            user_arcs_and_point_arcs.user_arc_to_point_arc = (user_arc) => 
                new PointArc(
                    curried_node_point_indication(user_arcs_and_point_arcs, arrows).point(user_arc.source),
                    curried_node_point_indication(user_arcs_and_point_arcs, arrows).point(user_arc.target),
                    user_arc.min_length_clockwise
                );
            return user_arcs_and_point_arcs;
    }
}
