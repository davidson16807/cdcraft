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
        wheel: function(state_in, screen_focus, scroll_count, state_out) {
            const screen_frame_store = state_in.view.screen_frame_store;
            const screen_frame = storage.unpack(screen_frame_store);
            const model_focus = position_shifting.leave(screen_focus, screen_frame);

            state_out.view.screen_frame_store = screen_frame_store;
            state_out.diagram.arrows = [ ...state_in.diagram.arrows];
            state_out.drag_type = state_in.drag_type;
            state_out.drag_state = state_in.drag_type.wheel(state_in.drag_state, model_focus, scroll_count);

            state_in.drag_type.command(state_out.drag_state, false, false).forward(state_out.diagram, state_out.view);
        },
        move: function (state_in, screen_position, screen_offset, state_out) {
            const screen_frame_store = state_in.view.screen_frame_store;
            const screen_frame = storage.unpack(screen_frame_store);
            const model_position = position_shifting.leave(screen_position, screen_frame);
            const model_offset = offset_shifting.leave(screen_offset, screen_frame);

            state_out.view.screen_frame_store = screen_frame_store;
            state_out.diagram.arrows = [ ...state_in.diagram.arrows];
            state_out.drag_type = state_in.drag_type;
            state_out.drag_state = state_in.drag_type.move(state_in.drag_state, model_position, model_offset);

            state_in.drag_type.command(state_in.drag_state, false, false).forward(state_out.diagram, state_out.view);
        },
        transition: function(state_in, drag_type, state_out) {
            const screen_frame_store = state_in.view.screen_frame_store;

            const drag_arrow = drag_type.initialize();

            const is_released = drag_type.id == DragState.released;
            const is_canceled = drag_type.id != DragState.released && drag_type.id != state_in.drag_type.id;

            state_out.view.screen_frame_store = state_in.view.screen_frame_store;
            state_out.diagram.arrows = [ ...state_in.diagram.arrows];

            if (is_released || is_canceled) { 
                state_in.drag_type.command(state_in.drag_state, is_released, is_canceled).forward(state_out.diagram, state_out.view); 
            }

            state_out.drag_type = drag_type;
            state_out.drag_state = drag_arrow;

            if (!(is_released || is_canceled)) {
                state_in.drag_type.command(state_out.drag_state, is_released, is_canceled).forward(state_out.diagram, state_out.view);
            }
        }
    };
}