'use strict';

function SelectionDrags( 
        arrow_positions_resource, 
        object_position_resource,
        position_map_operations){
    return {
        move: function(initial_arrows, arrow_selections, initial_objects, object_selections) {
            return {
                id: DragState.object,
                is_model_drag: true,
                is_view_drag: false,
                initialize: () => {
                    const cell_positions = 
                        position_map_operations.update(
                            arrow_positions_resource.get(arrow_selections),
                            object_position_resource.get(object_selections),
                        );
                },
                move: (cell_positions, model_position, model_offset) => 
                    position_map_operations.offset(cell_positions, model_offset),
                wheel: (cell_positions, screen_focus, scroll_count) => cell_positions,
                // delete the object and its arrows if canceled, otherwise move the object and its arrows
                command: (cell_positions, is_released, is_canceled) => {
                    return is_canceled?
                        new Command(
                          // forward
                          (model_inout, view_inout) => {
                            model_inout.arrows = arrow_positions_resource.delete(initial_arrows, cell_positions);
                            model_inout.objects = object_position_resource.delete(initial_objects, cell_positions);
                            view_inout.arrow_selections = [];
                            view_inout.object_selections = [];
                          },
                          // backward
                          (model_inout, view_inout) => {
                            model_inout.arrows = initial_arrows;
                            model_inout.objects = initial_objects;
                            view_inout.arrow_selections = arrow_selections;
                            view_inout.object_selections = object_selections;
                          },
                        )
                      : new Command(
                          // forward
                          (model_inout, view_inout) => {
                            model_inout.arrows = arrow_positions_resource.put(initial_arrows, cell_positions);
                            model_inout.objects = object_position_resource.put(initial_objects, cell_positions);
                            view_inout.arrow_selections = arrow_positions_resource.put(view_inout.arrows_selections, cell_positions);
                            view_inout.object_selections = object_position_resource.put(view_inout.objects_selections, cell_positions);
                          },
                          // backward
                          (model_inout, view_inout) => {
                            model_inout.arrows = initial_arrows;
                            model_inout.objects = initial_objects;
                            view_inout.arrow_selections = arrow_selections;
                            view_inout.object_selections = object_selections;
                          },
                        )
                }
            };
        },
    };
}
