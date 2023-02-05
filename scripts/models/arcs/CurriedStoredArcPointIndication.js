'use strict';

function CurriedStoredArcPointIndication(point_arc_point_indication) {
    /*
    the `stored_arcs_and_point_arcs` dependency must be provided separate from other dependencies
    since it may recursively use CurriedArcPointIndication as a dependency.
    */
    return (stored_arcs_and_point_arcs) => {
        return {
            /*
            Returns a position vector that visually represents the node to the user.
            */
            point: (arc) => point_arc_point_indication.point(
                                stored_arcs_and_point_arcs.stored_arc_to_point_arc(arc)),
        };
    }
}
