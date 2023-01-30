'use strict';

function MetaUserNodePointIndication(meta_arc_point_indication) {
    return {
        instantiate: (user_arcs_and_flat_arcs, arrows) => {
            return {
                point: (node) => node.reference == null? node.position : 
                    meta_arc_point_indication.instantiate(user_arcs_and_flat_arcs).point(arrows[node.reference].arc),
            };
        }
    }
}
