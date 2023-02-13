'use strict';


function NodeMetricBundle(position_metric_bundle){
    const vectors = position_metric_bundle;
    return {
        /*
        Returns a nonnegative number indicating the difference between two nodes,
        such that 0 indicates equality, the distance is symmetric, and the triangle inequality holds.
        */
        distance: (node1, node2) => {
            return (node1.reference == null && node2.reference == null? 
                        position_metric_bundle.distance(node1.position, node2.position) : 
                    node1.reference == node2.reference? 0 : Infinity);
        },
        /*
        Returns the respresentative of a node's equivalence class 
        such that `distance(node, representative(node))` falls below a certain threshold.
        */
        bundle: (node) => {
            return (node.reference == null? 
                new Node(position_metric_bundle.bundle(node.position), null) : 
                node);
        },
    }
}
