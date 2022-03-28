'use strict';

/*
`ApplicationStateDragOperations` returns a namespace of *conceptually* pure functions 
that describe how ApplicationState changes in response to drag operations: 
its modifications to the ModelView, its transitions in drag state, and its update to the undo/redo history
as drags are initialized, transformed, and released.
*/
function ApplicationStateDragOperations(
        screen_frame_storage,  
        offset_frame_shifting, 
        position_frame_shifting, 
    ) {
    const storage = screen_frame_storage;
    const offset_shifting = offset_frame_shifting;
    const position_shifting = position_frame_shifting;
    return {
        wheel: function(app_in, screen_focus, scroll_count, app_out) {
            const screen_frame_store = app_in.view.screen_frame_store;
            const screen_frame = storage.unpack(screen_frame_store);
            const model_focus = position_shifting.leave(screen_focus, screen_frame);

            app_out.view.screen_frame_store = screen_frame_store;
            app_out.diagram.arrows = [ ...app_in.diagram.arrows];
            app_out.diagram.objects = [ ...app_in.diagram.objects];
            app_out.drag_type = app_in.drag_type;
            app_out.drag_state = app_in.drag_type.wheel(app_in.drag_state, model_focus, scroll_count);

            app_in.drag_type.command(app_in.drag_state, false, false).forward(app_out.diagram, app_out.view);
        },
        move: function (app_in, screen_position, screen_offset, app_out) {
            const screen_frame_store = app_in.view.screen_frame_store;
            const screen_frame = storage.unpack(screen_frame_store);
            const model_position = position_shifting.leave(screen_position, screen_frame);
            const model_offset = offset_shifting.leave(screen_offset, screen_frame);

            app_out.view.screen_frame_store = screen_frame_store;
            app_out.diagram.arrows = [ ...app_in.diagram.arrows];
            app_out.diagram.objects = [ ...app_in.diagram.objects];
            app_out.drag_type = app_in.drag_type;
            app_out.drag_state = app_in.drag_type.move(app_in.drag_state, model_position, model_offset);

            app_in.drag_type.command(app_in.drag_state, false, false).forward(app_out.diagram, app_out.view);
        },
        transition: function(app_in, drag_type, app_out) {
            const screen_frame_store = app_in.view.screen_frame_store;

            const drag_arrow = drag_type.initialize();

            const is_released = drag_type.id == DragState.released;
            const is_canceled = drag_type.id != DragState.released && drag_type.id != app_in.drag_type.id;

            app_out.view.screen_frame_store = app_in.view.screen_frame_store;
            app_out.diagram.arrows = [ ...app_in.diagram.arrows];
            app_out.diagram.objects = [ ...app_in.diagram.objects];

            if (is_released || is_canceled) { 
                app_in.drag_type.command(app_in.drag_state, is_released, is_canceled).forward(app_out.diagram, app_out.view); 
            }

            app_out.drag_type = drag_type;
            app_out.drag_state = drag_arrow;

            if (!(is_released || is_canceled)) {
                app_in.drag_type.command(app_in.drag_state, is_released, is_canceled).forward(app_out.diagram, app_out.view);
            }
        }
    };
}
