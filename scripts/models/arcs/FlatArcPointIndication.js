'use strict';

function FlatArcPointIndication(
        user_arcs_and_sampler_arcs, 
        sampler_arc_properties,
        representative_distance_along_arc) {
    return {
        /*
        Returns a single position vector that visually indicates the arc to the user.
        */
        point: (arc) => {
            const sampler_arc = user_arcs_and_sampler_arcs.flat_arc_to_sampler_arc(arc);
            return sampler_arc_properties.position(sampler_arc, representative_distance_along_arc * sampler_arc.length_clockwise)
        },
    };
}
