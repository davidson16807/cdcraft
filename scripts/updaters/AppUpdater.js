'use strict';


/*
`AppUpdater` returns a namespace of functions that reflect how events map to state operations.
All functions represent the transformation of state in reponse to controller events. 
Its name is in reference to the "Updater" within the "Model-View-Updater" pattern (A.K.A. "Elm" architecture)
*/
function AppUpdater(
        dependencies
    ){
    const selection_drags = dependencies.selection_drags;
    const arrow_drags = dependencies.arrow_drags;
    const view_drags = dependencies.view_drags;
    const screen_frame_storage = dependencies.screen_frame_storage;
    const position_shifting = dependencies.position_shifting;
    const object_position_resources = dependencies.object_position_resources;
    const diagram_ids = dependencies.diagram_ids;
    const drag_ops = dependencies.drag_state_ops;
    const history = dependencies.app_history_traversal;

    const mouse_actions = {
        pan: function(app, event){
            const screen_offset = glm.vec2(event.movementX, event.movementY);
            const screen_frame_store = app.diagram.screen_frame_store;
            return view_drags.pan(screen_frame_store);
        },
        arrow: function(app, event){
            const screen_position = glm.vec2(event.clientX, event.clientY);
            const screen_frame_store = app.diagram.screen_frame_store;
            const screen_frame = screen_frame_storage.unpack(screen_frame_store);
            const model_position = position_shifting.leave(screen_position, screen_frame);
            return arrow_drags.create(app.diagram.arrows, model_position);
        },
    };
    const actions = {
        'undo': app_io => history.undo(app_io),
        'redo': app_io => history.redo(app_io),
    }
    const keydown = {
        'ctrl+z': 'undo',
        'ctrl+y': 'redo',
        'ctrl+shift+z': 'redo',
    }
    return {

        contextmenu: function(event, drawing, app_io, dom_io){
        },

        wheel: function(event, drawing, app_io, dom_io){
            drag_ops.wheel( glm.vec2(event.clientX, event.clientY), event.deltaY, app_io);
            drawing.redraw(app_io, dom_io);
        },

        mousedown: function(event, drawing, app_io, dom_io){
            if (event.button < 2) {
                const state = [DragState.arrow, DragState.pan][event.button];
                drag_ops.transition( mouse_actions[state](app_io, event), app_io);
                history.do(app_io, 
                    new Diagram(
                            app_io.diagram.arrows,
                            app_io.diagram.objects,
                            [], [],
                            app_io.diagram.screen_frame_store,
                        ), false);
            } else if (event.button == 2 && !event.shiftKey && !event.ctrlKey) {
                // rmb handles selections, cancel if nothing is selected
                history.do(app_io, 
                    new Diagram(
                            app_io.diagram.arrows,
                            app_io.diagram.objects,
                            [], [],
                            app_io.diagram.screen_frame_store,
                        ), false);
            }
            drawing.redraw(app_io, dom_io);
        },

        mousemove: function(event, drawing, app_io, dom_io){
            // mouse motion is a degenerate case of touchscreen motion where the number of touchpoints is one
            drag_ops.move( glm.vec2(event.clientX, event.clientY), glm.vec2(event.movementX, event.movementY), app_io);
            drawing.redraw(app_io, dom_io);
        },

        mouseup: function(event, drawing, app_io, dom_io){
            drag_ops.transition( view_drags.release(app_io.diagram.screen_frame_store), app_io);
            drawing.redraw(app_io, dom_io);
        },

        touchsource: function(event, drawing, app_io, dom_io){
        },

        touchend: function(event, drawing, app_io, dom_io){
        },

        touchmove: function(event, drawing, app_io, dom_io){
        },

        keydown: function(event, drawing, app_io, dom_io){
            const keycode = `${event.ctrlKey?'ctrl+':''}${event.shiftKey?'shift+':''}${event.key.toLowerCase()}`
            const action_id = keydown[keycode];
            if (action_id!=null) {
                const action = actions[action_id];
                if (action!=null) {
                    action(app_io);
                    drawing.redraw(app_io, dom_io);
                }
            }
        },

        arrowclick: function(event, drawing, arrow_io, app_io, dom_io){
            if (app_io.diagram.arrow_selections[app_io.diagram.arrows.indexOf(arrow_io)] != null) {
                drag_ops.transition( selection_drags.move(app_io.diagram), app_io);
            } else {
                drag_ops.transition( arrow_drags.edit(app_io.diagram.arrows, arrow_io), app_io);
            }
            drawing.redraw(app_io, dom_io);
        },

        objectclick: function(event, drawing, object_io, app_io, dom_io){
            const position_map = object_position_resources.get(app_io.diagram.object_selections);
            const position_hash = diagram_ids.cell_id_to_cell_hash(object_io.position);
            if (position_map[position_hash] != null) {
                drag_ops.transition( selection_drags.move(app_io.diagram), app_io);
            } else {
                history.do(app_io, 
                    new Diagram(
                            app_io.diagram.arrows,
                            app_io.diagram.objects,
                            [], [object_io],
                            app_io.diagram.screen_frame_store,
                        ), false);
                drag_ops.transition( selection_drags.move(app_io.diagram), app_io);
            }
            drawing.redraw(app_io, dom_io);
        },

        arrowselect: function(event, drawing, arrow_io, app_io, dom_io){
            const id = app_io.diagram.arrows.indexOf(arrow_io);
            const arrow_selections = event.ctrlKey? 
                  app_io.diagram.arrow_selections.filter(arrow => arrow != arrow_io) 
                : [...app_io.diagram.arrow_selections, arrow_io];
            history.do(app_io, 
                new Diagram(
                        app_io.diagram.arrows,
                        app_io.diagram.objects,
                        arrow_selections,
                        app_io.diagram.object_selections,
                        app_io.diagram.screen_frame_store,
                    ), true);
            drawing.redraw(app_io, dom_io);
        },

        objectselect: function(event, drawing, object_io, app_io, dom_io){
            const id = app_io.diagram.objects.indexOf(object_io);
            const object_selections = event.ctrlKey? 
                  app_io.diagram.object_selections.filter(object => object != object_io) 
                : [...app_io.diagram.object_selections, object_io];
            history.do(app_io, 
                new Diagram(
                        app_io.diagram.arrows,
                        app_io.diagram.objects,
                        app_io.diagram.arrow_selections,
                        object_selections,
                        app_io.diagram.screen_frame_store,
                    ), true);
            drawing.redraw(app_io, dom_io);
        },

    }
}
