'use strict';

function UserNodePointIndication(
        meta_arc_point_indication,
    ) {
    const namespace = {}
    /*
    Returns a position vector that visually represents the node to the user.
    */
    namespace.point = (node) => node.reference == null? node.position : 
        meta_arc_point_indication.instantiate(namespace).point(node.reference);
    return namespace;
}