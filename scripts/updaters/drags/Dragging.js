'use strict';

function Dragging(){
    return {
        initialize: (dragtype) => new Drag(dragtype, dragtype.initialize()),
        id: (drag) => drag.drag_behavior.id,
        move: (drag, screen_positions, cell_to_pixel)               => new Drag(drag, drag.drag_behavior.move(drag.state, screen_positions, cell_to_pixel)),
        wheel: (drag, screen_focus, scroll_count)                   => new Drag(drag, drag.drag_behavior.wheel(drag.state, screen_focus, scroll_count)),
        arrowenter: (drag, screen_position, model_to_screen, arrow) => new Drag(drag, drag.drag_behavior.arrowenter(drag.state, arrow)),
        arrowleave: (drag, screen_position, model_to_screen)        => new Drag(drag, drag.drag_behavior.arrowleave(drag.state, screen_position, model_to_screen)),
        objectenter: (drag, object)                                 => new Drag(drag, drag.drag_behavior.objectenter(drag.state, object)),
        command: (drag, is_released, is_canceled)                   => new Drag(drag, drag.drag_behavior.command(drag.state, is_released, is_canceled)),
    };
}

/* 
`NodeHashing` generates a namspace with a single pure function exposed, `hash()`.
The function maps any `Node` to a unique positive integer.
It is bijective in principle, however its inverse is not implemented.
`NodeHashing.hash(new Node(position))` is equivalent to `UnboundedCellHashing.hash(position)` 
*/
function NodeHashing() {
    return {
        // A node can be either a position or an arrow reference, 
        // so multiply the hash of either by two and offset by a unique id for the quadrant
        // hash: (node) => (node.position == null? 0 : unbounded_cell_hashing.hash(node.position)) - (node.reference || 0),
        hash: (node) => node.hashing.hash(node.state),
    };
}

function NodeMetricBundle(){
    return {
        /*
        Returns a nonnegative number indicating the difference between two nodes,
        such that 0 indicates equality, the distance is symmetric, and the triangle inequality holds.
        */
        distance: (node1, node2) => 
            node1.metric_bundle != node2.metric_bundle? Infinity : node1.metric_bundle.distance(node1.state, node2.state),
        /*
        Returns the respresentative of a node's equivalence class 
        such that `distance(node, representative(node))` falls below a certain threshold.
        */
        bundle: (node) => node.metric_bundle.bundle(node.state),
    }
}

function NodePointIndicationCurried(arc_curried_point_indication) {
    return (stored_arcs_and_point_arcs, arrows) => {
        return {
            point: (node) => node.node_curried_point_indication(stored_arcs_and_point_arcs, arrows).point(node.state),
        };
    }
}
