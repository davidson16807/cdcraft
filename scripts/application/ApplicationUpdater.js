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
        pan: function(app_in, event){
            const screen_offset = glm.vec2(event.movementX, event.movementY);
            const screen_frame_store = app_in.view.screen_frame_store;
            return view_drags.pan(screen_frame_store);
        },
        arrow: function(app_in, event){
            const screen_position = glm.vec2(event.clientX, event.clientY);
            const screen_frame_store = app_in.view.screen_frame_store;
            const screen_frame = storage.unpack(screen_frame_store);
            const model_position = position_shifting.leave(screen_position, screen_frame);
            return arrow_drags.create(app_in.diagram.arrows, model_position);
        },
    };
    return {
        wheel: function(view_inout, app_inout, event){
            operations.wheel(app_inout, glm.vec2(event.clientX, event.clientY), event.deltaY, app_inout);
        },
        mousedown: function(view_inout, app_inout, event){
            if (event.button < 2) {
                const state = [DragState.arrow, DragState.pan][event.button];
                const screen_frame_store = app_inout.view.screen_frame_store;
                operations.transition(app_inout, mouse_actions[state](app_inout, event), app_inout);
                app_inout.view.arrow_selections = [];
                app_inout.view.object_selections = [];
            } else if (event.button == 2 && !event.shiftKey) {
                // rmb handles selections, cancel if nothing is selected
                app_inout.view.arrow_selections = [];
                app_inout.view.object_selections = [];
            }
        },
        mousemove: function(view_inout, app_inout, event){
            // mouse motion is a degenerate case of touchscreen motion where the number of touchpoints is one
            operations.move(app_inout, glm.vec2(event.clientX, event.clientY), glm.vec2(event.movementX, event.movementY), app_inout);
        },
        mouseup: function(view_inout, app_inout, event){
            operations.transition(app_inout, view_drags.release(app_inout.view.screen_frame_store), app_inout);
        },
        touchsource: function(view_inout, app_inout, event){

        },
        touchend: function(view_inout, app_inout, event){

        },
        touchmove: function(view_inout, app_inout, event){

        },
        arrowclick: function(view_inout, app_inout, arrow_inout, event){
            if (app_inout.view.object_selections.length > 0 || app_inout.view.arrow_selections.length > 0) {
                operations.transition(app_inout, selection_drags.move(app_inout.diagram.arrows, app_inout.view.arrow_selections, app_inout.diagram.objects, app_inout.view.object_selections), app_inout);
            } else {
                operations.transition(app_inout, arrow_drags.edit(app_inout.diagram.arrows, arrow), app_inout);
            }
        },
        objectclick: function(view_inout, app_inout, object_inout, event){
            if (app_inout.view.object_selections.length > 0 || app_inout.view.arrow_selections.length > 0) {
                operations.transition(app_inout, selection_drags.move(app_inout.diagram.arrows, app_inout.view.arrow_selections, app_inout.diagram.objects, app_inout.view.object_selections), app_inout);
            } else {
                app_inout.view.object_selections = [object];
                operations.transition(app_inout, selection_drags.move(app_inout.diagram.arrows, [], app_inout.diagram.objects, app_inout.view.object_selections), app_inout);
            }
        },
        arrowselect: function(view_inout, app_inout, arrow_inout, event){
            app_inout.view.arrow_selections.push(arrow);
        },
        objectselect: function(view_inout, app_inout, object_inout, event){
            app_inout.view.object_selections.push(object);
        },
    }
}
