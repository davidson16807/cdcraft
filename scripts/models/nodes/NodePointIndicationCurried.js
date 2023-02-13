'use strict';

function NodePointIndicationCurried(arc_curried_point_indication) {
    return (stored_arcs_and_point_arcs, arrows) => {
        return {
            point: (node) => node.reference == null? node.position : 
                arc_curried_point_indication(stored_arcs_and_point_arcs).point(arrows[node.reference].arc),
        };
    }
}
