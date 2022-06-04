'use strict';

function SelectionDrags( 
        PanZoomMapping,
        arrow_positions_resource, 
        object_position_resource,
        resource_operations,
        position_map_operations,
        object_set_ops){
    return {
        move: function(initial_diagram, original_screen_position) {
            return {
                id: DragState.object,
                initialize: () => glm.vec2(0,0),
                move: (model_offset, screen_positions, cell_to_pixel) => 
                    PanZoomMapping(cell_to_pixel).offset.revert(screen_positions[0].sub(original_screen_position)),
                wheel: (model_offset, screen_focus, scroll_count) => model_offset,
                arrowenter: (model_offset, arrow) => model_offset,
                objectenter: (model_offset, object) => model_offset,
                // delete the object and its arrows if canceled, otherwise move the object and its arrows
                command: (model_offset, is_released, is_canceled) => diagram => {
                    const cell_positions = position_map_operations.offset(
                        resource_operations.update(
                            arrow_positions_resource.get(arrow_state_operations.selection(diagram.arrows)),
                            object_position_resource.get(initial_diagram.object_selections.map(id => initial_diagram.objects[id])),
                            object_position_resource.get(initial_diagram.inferred_object_selections),
                        ), 
                        model_offset);
                    return (is_canceled? 
                        diagram.with({
                            arrows:  arrow_positions_resource.delete(initial_diagram.arrows, cell_positions),
                            objects: object_position_resource.delete(initial_diagram.objects, cell_positions),
                            object_selections: [],
                            inferred_object_selections: [],
                        })
                      : diagram.with({
                            arrows:  arrow_positions_resource.put(initial_diagram.arrows, cell_positions, !is_released),
                            objects: object_position_resource.put(initial_diagram.objects, cell_positions, !is_released),
                            inferred_object_selections: object_position_resource.put(initial_diagram.inferred_object_selections, cell_positions, !is_released),
                        })
                    );
                }
            };
        },
    };
}
