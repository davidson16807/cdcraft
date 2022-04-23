'use strict';

/*
`AppDragOperations` returns a namespace of *conceptually* pure functions 
that describe how ApplicationState changes in response to drag operations: 
its modifications to the ModelView, its transitions in drag state, and its update to the undo/redo history
as drags are initialized, transformed, and released.
*/
function AppDragOperations(
        PanZoomMapping,
        screen_frame_storage,  
        application_history_traversal,
    ) {
    const storage = screen_frame_storage;
    const history = application_history_traversal;
    return {

        wheel: function(screen_focus, scroll_count, app_io) {
            const screen_frame_store = app_io.diagram.screen_frame_store;
            const screen_frame = storage.unpack(screen_frame_store);
            const screen_mapping = PanZoomMapping(screen_frame);
            const model_focus = screen_mapping.position.revert(screen_focus);

            app_io.drag_state = app_io.drag_type.wheel(app_io.drag_state, model_focus, scroll_count);
            history.do(app_io, 
                app_io.drag_type.command(app_io.drag_state, false, false)(app_io.diagram), false);
        },

        move: function (screen_position, screen_offset, app_io) {
            const screen_frame_store = app_io.diagram.screen_frame_store;
            const screen_frame = storage.unpack(screen_frame_store);
            const screen_mapping = PanZoomMapping(screen_frame);
            const model_position = screen_mapping.position.revert(screen_position);
            const model_offset = screen_mapping.offset.revert(screen_offset);

            app_io.drag_state = app_io.drag_type.move(app_io.drag_state, model_position, model_offset);
            history.do(app_io, 
                app_io.drag_type.command(app_io.drag_state, false, false)(app_io.diagram), false);
        },

        transition: function(drag_type, app_io) {
            const screen_frame_store = app_io.diagram.screen_frame_store;

            const is_released = drag_type.id == DragState.released;
            const is_canceled = drag_type.id != DragState.released && drag_type.id != app_io.drag_type.id;

            if (is_released || is_canceled) { 
                history.do(app_io, 
                    app_io.drag_type.command(app_io.drag_state, is_released, is_canceled)(app_io.diagram), !is_released);
                app_io.drag_type = drag_type;
                app_io.drag_state = drag_type.initialize();
            } else {
                history.do(app_io, 
                    app_io.drag_type.command(app_io.drag_state, is_released, is_canceled)(app_io.diagram), false);
            }
        }

    };
}

