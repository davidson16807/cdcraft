'use strict';


/*
`UserArcsAndFlatArcs` returns a namespace of pure functions that describe maps between `SamplerArc`s and `UserArc`s
*/
function UserArcsAndFlatArcs(node_point_indication) {
    return {
        user_arc_to_flat_arc: (user_arc) => 
            new FlatArc(
                node_point_indication.point(user_arc.source),
                node_point_indication.point(user_arc.target),
                user_arc.min_length_clockwise
            ),
    };
}
