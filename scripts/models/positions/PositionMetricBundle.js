'use strict';


function PositionMetricBundle(diagram_ids, glm){
    return {
        /*
        Returns a nonnegative number indicating the difference between two nodes,
        such that 0 indicates equality, the distance is symmetric, and the triangle inequality holds.
        */
        distance: (position1, position2) => {
            return glm.distance(position1, position2);
        },
        /*
        Returns the respresentative of a node's equivalence class 
        such that `distance(node, representative(node))` falls below a certain threshold.
        */
        bundle: (position) => {
            return diagram_ids.cell_position_to_cell_id(position);
        },
    }
}
