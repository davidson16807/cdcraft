'use strict';

function CurriedStoredArcProperties(
        point_arcs_properties,
        LinearMapping, 
        IdentityMapping,
    ) {
    return (stored_arcs_and_point_arcs, arrows) => 
        ({
            target_offset_to_global_map: (arc, is_loop) =>
                is_loop && arc.source.reference != null? 
                    LinearMapping(
                        new LinearMap(
                            point_arcs_properties.chord_direction(
                                stored_arcs_and_point_arcs.stored_arc_to_point_arc(
                                    arrows[arc.source.reference].arc)),
                            glm.vec2(0)
                        ))
                  : IdentityMapping(),
        });
}

