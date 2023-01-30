'use strict';

function CurriedUserArcPointIndication(flat_arc_point_indication) {
    /*
    the `user_arcs_and_flat_arcs` dependency must be provided separate from other dependencies
    since it may recursively use CurriedArcPointIndication as a dependency.
    */
    return (user_arcs_and_flat_arcs) => {
        return {
            /*
            Returns a position vector that visually represents the node to the user.
            */
            point: (arc) => flat_arc_point_indication.point(
                                user_arcs_and_flat_arcs.user_arc_to_flat_arc(arc)),
        };
    }
}
