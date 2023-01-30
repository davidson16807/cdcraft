'use strict';

function CurriedNodePointIndication(curried_arc_point_indication) {
    return (user_arcs_and_flat_arcs, arrows) => {
        return {
            point: (node) => node.reference == null? node.position : 
                curried_arc_point_indication(user_arcs_and_flat_arcs).point(arrows[node.reference].arc),
        };
    }
}
