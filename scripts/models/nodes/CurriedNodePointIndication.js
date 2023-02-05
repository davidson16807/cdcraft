'use strict';

function CurriedNodePointIndication(curried_arc_point_indication) {
    return (stored_arcs_and_point_arcs, arrows) => {
        return {
            point: (node) => node.reference == null? node.position : 
                curried_arc_point_indication(stored_arcs_and_point_arcs).point(arrows[node.reference].arc),
        };
    }
}
