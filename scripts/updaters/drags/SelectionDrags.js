'use strict';

function SelectionDrags( 
        arrow_positions_resource, 
        object_position_resource,
        resource_operations,
        position_map_operations,
        object_set_ops){
    return {
        move: function(initial_diagram) {
            return {
                id: DragState.object,
                initialize: () => {
                    return resource_operations.update(
                        arrow_positions_resource.get(initial_diagram.arrow_selections.map(id => initial_diagram.arrows[id])),
                        object_position_resource.get(initial_diagram.object_selections.map(id => initial_diagram.objects[id])),
                        object_position_resource.get(initial_diagram.inferred_object_selections),
                    );
                },
                move: (cell_positions, model_position, model_offset) => 
                    position_map_operations.offset(cell_positions, model_offset),
                wheel: (cell_positions, screen_focus, scroll_count) => cell_positions,
                arrowenter: (replacement_arrow, arrow) => replacement_arrow,
                objectenter: (replacement_arrow, object) => replacement_arrow,
                // delete the object and its arrows if canceled, otherwise move the object and its arrows
                command: (cell_positions, is_released, is_canceled) => diagram => 
                    (is_canceled? 
                        diagram.with({
                            arrows:                     arrow_positions_resource.delete(initial_diagram.arrows, cell_positions),
                            objects:                    object_position_resource.delete(initial_diagram.objects, cell_positions),
                            arrow_selections:  [], 
                            object_selections: [],
                            inferred_object_selections: [],
                        })
                      : diagram.with({
                            arrows:                     arrow_positions_resource.put(initial_diagram.arrows, cell_positions, !is_released),
                            objects:                    object_position_resource.put(initial_diagram.objects, cell_positions, !is_released),
                            inferred_object_selections: object_position_resource.put(initial_diagram.inferred_object_selections, cell_positions, !is_released),
                        })
                    )
            };
        },
    };
}
