'use strict';

function StoredArcPropertiesCurried(
        point_arcs_properties,
        LinearMapping, 
        ZoomRotateMapping,
        target_offset_distance,
    ) {
    return (stored_arcs_and_point_arcs, arrows) => 
        ({
            target_offset_to_global_mapping: (arc, is_loop) =>
                is_loop && arc.source.reference != null? 
                    LinearMapping(
                        new LinearMap(
                            point_arcs_properties.chord_direction(
                                stored_arcs_and_point_arcs.stored_arc_to_point_arc(
                                    arrows[arc.source.reference].arc))
                                .mul(target_offset_distance),
                            glm.vec2(0)
                        ))
                  : ZoomRotateMapping(
                        new ZoomRotateMap(glm.vec2(target_offset_distance, 0))),
        });
}

