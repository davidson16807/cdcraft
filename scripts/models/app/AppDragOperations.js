'use strict';

/*
`AppDragOperations` returns a namespace of *conceptually* pure functions 
that describe how ApplicationState changes in response to drag operations: 
its modifications to the ModelView, its transitions in drag state, and its update to the undo/redo history
as drags are initialized, transformed, and released.
*/
function AppDragOperations(
        PanZoomMapping,
        model_to_screen_storage,  
        application_history_traversal,
    ) {
    const storage = model_to_screen_storage;
    const history = application_history_traversal;
    return {

        wheel: function(screen_focus, scroll_count, app_io) {
            const model_to_screen_store = app_io.diagram.screen_frame_store;
            const model_to_screen = storage.unpack(model_to_screen_store);
            const model_focus = PanZoomMapping(model_to_screen).position.revert(screen_focus);

            app_io.drag_state = app_io.drag_type.wheel(app_io.drag_state, model_focus, scroll_count);
            history.do(app_io, 
                app_io.drag_type.command(app_io.drag_state, false, false)(app_io.diagram), false);
        },

        move: function (screen_positions, app_io) {
            const model_to_screen_store = app_io.diagram.screen_frame_store;
            const model_to_screen = storage.unpack(model_to_screen_store);

            app_io.drag_state = app_io.drag_type.move(app_io.drag_state, screen_positions, model_to_screen);
            history.do(app_io, 
                app_io.drag_type.command(app_io.drag_state, false, false)(app_io.diagram), false);
        },

        arrowenter: function (arrow, app_io) {
            // console.log('arrowenter', app_io.drag_state);
            // console.log('arrowenter', app_io.drag_state, app_io.drag_type.arrowenter(app_io.drag_state, arrow).arc);
            app_io.drag_state = app_io.drag_type.arrowenter(app_io.drag_state, arrow);
            history.do(app_io, 
                app_io.drag_type.command(app_io.drag_state, false, false)(app_io.diagram), false);
        },

        arrowleave: function (screen_positions, app_io) {
            // console.log('arrowleave', app_io.drag_state);
            const model_to_screen_store = app_io.diagram.screen_frame_store;
            const model_to_screen = storage.unpack(model_to_screen_store);
            // console.log('arrowleave', app_io.drag_state, app_io.drag_type.arrowleave(app_io.drag_state, screen_positions, model_to_screen).arc);
            app_io.drag_state = app_io.drag_type.arrowleave(app_io.drag_state, screen_positions, model_to_screen);
            history.do(app_io, 
                app_io.drag_type.command(app_io.drag_state, false, false)(app_io.diagram), false);
        },

        transition: function(drag_type, app_io) {
            const model_to_screen_store = app_io.diagram.screen_frame_store;

            const is_released = drag_type.id == DragState.released;
            const is_canceled = drag_type.id != DragState.released && drag_type.id != app_io.drag_type.id;

            if (is_released || is_canceled) { 
                // first commit existing state to the history so that it can be later retrieved
                history.do(app_io, 
                    app_io.drag_type.command(app_io.drag_state, is_released, is_canceled)(app_io.diagram), 
                    !is_released);
                // next modify application state that is not covered by the command history
                app_io.drag_type = drag_type;
                app_io.drag_state = drag_type.initialize();
                // finally, modify the application state that's covered by history to reflect changes imposed by the new drag type
                history.do(app_io, 
                    app_io.drag_type.command(app_io.drag_state, false, false)(app_io.diagram), false);
            } else {
                history.do(app_io, 
                    app_io.drag_type.command(app_io.drag_state, is_released, is_canceled)(app_io.diagram), false);
            }
        }

    };
}

