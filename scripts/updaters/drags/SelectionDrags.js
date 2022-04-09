'use strict';

function SelectionDrags( 
        arrow_positions_resource, 
        object_position_resource,
        position_map_operations){
    return {
        move: function(initial_diagram) {
            initial_diagram = initial_diagram.copy();
            return {
                id: DragState.object,
                is_model_drag: true,
                is_view_drag: false,
                initialize: () => {
                    const cell_positions = 
                        position_map_operations.update(
                            arrow_positions_resource.get(initial_diagram.arrow_selections),
                            object_position_resource.get(initial_diagram.object_selections),
                        );
                    return cell_positions;
                },
                move: (cell_positions, model_position, model_offset) => 
                    position_map_operations.offset(cell_positions, model_offset),
                wheel: (cell_positions, screen_focus, scroll_count) => cell_positions,
                // delete the object and its arrows if canceled, otherwise move the object and its arrows
                command: (cell_positions, is_released, is_canceled) => {
                    return is_canceled?
                        new Command(
                          // forward
                          (diagram_io) => {
                            diagram_io.arrows = arrow_positions_resource.delete(initial_diagram.arrows, cell_positions);
                            diagram_io.objects = object_position_resource.delete(initial_diagram.objects, cell_positions);
                            diagram_io.arrow_selections = [];
                            diagram_io.object_selections = [];
                          },
                          // backward
                          (diagram_io) => {
                            diagram_io.arrows = initial_diagram.arrows;
                            diagram_io.objects = initial_diagram.objects;
                            diagram_io.arrow_selections = initial_diagram.arrow_selections;
                            diagram_io.object_selections = initial_diagram.object_selections;
                          },
                        )
                      : new Command(
                          // forward
                          (diagram_io) => {
                            diagram_io.arrows = arrow_positions_resource.put(initial_diagram.arrows, cell_positions, !is_released);
                            diagram_io.objects = object_position_resource.put(initial_diagram.objects, cell_positions, !is_released);
                            diagram_io.arrow_selections = arrow_positions_resource.put(initial_diagram.arrow_selections, cell_positions, !is_released);
                            diagram_io.object_selections = object_position_resource.put(initial_diagram.object_selections, cell_positions, !is_released);
                          },
                          // backward
                          (diagram_io) => {
                            diagram_io.arrows = initial_diagram.arrows;
                            diagram_io.objects = initial_diagram.objects;
                            diagram_io.arrow_selections = initial_diagram.arrow_selections;
                            diagram_io.object_selections = initial_diagram.object_selections;
                          },
                        )
                }
            };
        },
    };
}
