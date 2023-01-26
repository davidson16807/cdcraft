'use strict';

function MetaUserNodePointIndication(
        meta_arc_point_indication,
    ) {
    const user_node_point_indication = {}
    user_node_point_indication.instantiate = (user_arcs_and_flat_arcs) => {
        return {
            point: (node) => node.reference == null? node.position : 
                meta_arc_point_indication.instantiate(user_arcs_and_flat_arcs).point(node.reference),
        };
    }
    return user_node_point_indication;
}
