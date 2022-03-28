'use strict';

/*
`ApplicationUpdater` returns a namespace of functions that reflect how events map to state operations.
All functions represent the transformation of state in reponse to controller events. 
It resembles an "Updater" within the "Model-View-Updater" pattern (A.K.A. "Elm" architecture)
*/
function ApplicationUpdater(
        selection_drags,
        arrow_drags,
        view_drags,
        screen_frame_storage,
        position_shifting,
        drag_state_operations
    ){
    const operations = drag_state_operations;
    const storage = screen_frame_storage;
    const mouse_actions = {
        pan: function(state_in, event){
            const screen_offset = glm.vec2(event.movementX, event.movementY);
            const screen_frame_store = state_in.view.screen_frame_store;
            return view_drags.pan(screen_frame_store);
        },
        arrow: function(state_in, event){
            const screen_position = glm.vec2(event.clientX, event.clientY);
            const screen_frame_store = state_in.view.screen_frame_store;
            const screen_frame = storage.unpack(screen_frame_store);
            const model_position = position_shifting.leave(screen_position, screen_frame);
            return arrow_drags.create(state_in.diagram.arrows, model_position);
        },
    };
    return {
        wheel: function(view_inout, app_inout, event){
            operations.wheel(state_in, glm.vec2(event.clientX, event.clientY), event.deltaY, state_out);
        },
        mousedown: function(view_inout, app_inout, event){
            if (event.button < 2) {
                const state = [DragState.arrow, DragState.pan][event.button];
                const screen_frame_store = state_in.view.screen_frame_store;
                operations.transition(state_in, mouse_actions[state](state_in, event), state_out);
                state_out.view.arrow_selections = [];
                state_out.view.object_selections = [];
            } else if (event.button == 2 && !event.shiftKey) {
                // rmb handles selections, cancel if nothing is selected
                state_out.view.arrow_selections = [];
                state_out.view.object_selections = [];
            }
        },
        mousemove: function(view_inout, app_inout, event){
            // mouse motion is a degenerate case of touchscreen motion where the number of touchpoints is one
            operations.move(state_in, glm.vec2(event.clientX, event.clientY), glm.vec2(event.movementX, event.movementY), state_out);
        },
        mouseup: function(view_inout, app_inout, event){
            operations.transition(state_in, view_drags.release(state_in.view.screen_frame_store), state_out);
        },
        touchsource: function(view_inout, app_inout, event){

        },
        touchend: function(view_inout, app_inout, event){

        },
        touchmove: function(view_inout, app_inout, event){

        },
        arrowclick: function(view_inout, app_inout, arrow_inout, event){
            if (state_in.view.object_selections.length > 0 || state_in.view.arrow_selections.length > 0) {
                operations.transition(state_in, selection_drags.move(state_in.diagram.arrows, state_in.view.arrow_selections, state_in.diagram.objects, state_in.view.object_selections), state_out);
            } else {
                operations.transition(state_in, arrow_drags.edit(state_in.diagram.arrows, arrow), state_out);
            }
        },
        objectclick: function(view_inout, app_inout, object_inout, event){
            if (state_in.view.object_selections.length > 0 || state_in.view.arrow_selections.length > 0) {
                operations.transition(state_in, selection_drags.move(state_in.diagram.arrows, state_in.view.arrow_selections, state_in.diagram.objects, state_in.view.object_selections), state_out);
            } else {
                state_out.view.object_selections = [object];
                operations.transition(state_in, selection_drags.move(state_in.diagram.arrows, [], state_in.diagram.objects, state_out.view.object_selections), state_out);
            }
        },
        arrowselect: function(view_inout, app_inout, arrow_inout, event){
            state_out.view.arrow_selections.push(arrow);
        },
        objectselect: function(view_inout, app_inout, object_inout, event){
            state_out.view.object_selections.push(object);
        },
    }
}
