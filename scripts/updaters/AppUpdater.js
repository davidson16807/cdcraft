'use strict';


/*
`AppUpdater` returns a namespace of functions that reflect how events map to state operations.
All functions represent the transformation of state in reponse to controller events. 
Its name is in reference to the "Updater" within the "Model-View-Updater" pattern (A.K.A. "Elm" architecture)
*/
function AppUpdater(
        dependencies
    ){
    const PanZoomMapping            = dependencies.PanZoomMapping;
    const selection_drags           = dependencies.selection_drags;
    const arrow_drags               = dependencies.arrow_drags;
    const view_drags                = dependencies.view_drags;
    const screen_state_storage      = dependencies.screen_state_storage;
    const object_position_resources = dependencies.object_position_resources;
    const drag_ops                  = dependencies.drag_state_ops;
    const history                   = dependencies.app_history_traversal;

    /* 
    functions mapping app×event→app 
    where the event must represent the pressing of a mouse key
    */
    const mouse_actions = {

        pan: function(app_io, event){
            drag_ops.transition( view_drags.pan(
                    app_io.diagram.screen_frame_store, 
                    [glm.vec2(event.clientX, event.clientY)]), 
                app_io);
        },

        arrow: function(app_io, event){
            const screen_position = glm.vec2(event.clientX, event.clientY);
            const screen_state = screen_state_storage.unpack(app_io.diagram.screen_frame_store);
            const model_position = PanZoomMapping(screen_state).position.revert(screen_position);
            drag_ops.transition( arrow_drags.create(app_io.diagram.arrows, model_position), app_io);
        },

    };

    /* 
    functions mapping app×event→app 
    where the event must represent the pressing of a mouse key
    */
    const touch_actions = {

        pan: function(app_io, event){
            drag_ops.transition( view_drags.pan(
                    app_io.diagram.screen_frame_store, 
                    [glm.vec2(event.touches[0].clientX, event.touches[0].clientY)]), 
                app_io);
        },

        arrow: function(app_io, event){
            const screen_position = glm.vec2(event.touches[0].clientX, event.touches[0].clientY);
            const screen_state = screen_state_storage.unpack(app_io.diagram.screen_frame_store);
            const model_position = PanZoomMapping(screen_state).position.revert(screen_position);
            drag_ops.transition( arrow_drags.create(app_io.diagram.arrows, model_position), app_io);
        },

    };

    /* 
    functions mapping app×text→app 
    where the event must represent a change in a text field
    */
    const text_actions = {

        object_text: function(app_io, event) {
            const diagram_in = app_io.diagram;
            const objects_in = diagram_in.objects;
            if (diagram_in.inferred_object_selections.length == 1) {
                // promote the inferred object to a discrete object
                const object_in = diagram_in.inferred_object_selections[0];
                const object_out = object_in.with({ 
                    depiction: event.currentTarget.value, 
                });
                const diagram_out = diagram_in.with({
                    objects: [...objects_in, object_out],
                    inferred_object_selections: [],
                    object_selections: [objects_in.length],
                });
                history.do(app_io, diagram_out, true);
            } else if (diagram_in.object_selections.length == 1) {
                // change the inferred object in place
                const object_id = diagram_in.object_selections[0];
                const objects_before = objects_in.slice(0,object_id);
                const objects_after = objects_in.slice(object_id+1);
                const object_in = objects_in[object_id];
                const object_out = object_in.with({ 
                    depiction: event.currentTarget.value, 
                });
                const diagram_out = diagram_in.with({
                    objects: [...objects_before, object_out, ...objects_after],
                });
                history.do(app_io, diagram_out, true);
            }
        },

        arrow_text: function(app_io, event) {
            const diagram_in = app_io.diagram;
            const arrows_in = diagram_in.arrows;
            if (diagram_in.arrow_selections.length == 1) {
                const arrow_id = diagram_in.arrow_selections[0];
                const arrow_in = diagram_in.arrows[arrow_id];
                const arrows_before = arrows_in.slice(0,arrow_id);
                const arrows_after = arrows_in.slice(arrow_id+1);
                const arrow_out = arrow_in.with({ 
                    label: event.currentTarget.value 
                });
                const diagram_out = diagram_in.with({
                    arrows: [...arrows_before, arrow_out, ...arrows_after],
                });
                history.do(app_io, diagram_out, true);
            }
        }
    };

    /*
    // functions mapping app×event→app 
    where the event needs no specialization
    */
    const generic_actions = {

        undo: (app_io, event) => {
            drag_ops.transition( view_drags.release(app_io.diagram.screen_frame_store), app_io);
            history.undo(app_io);
        },

        redo: (app_io, event) => {
            drag_ops.transition( view_drags.release(app_io.diagram.screen_frame_store), app_io);
            history.redo(app_io);
        },

        toggle_grid: (app_io, event) => {
            app_io.is_grid_hidden = !app_io.is_grid_hidden;
        },

        deselect: function(app_io, event){
            if (!event.shiftKey && !event.ctrlKey) {
                // rmb handles selections, cancel if nothing is selected
                history.do(app_io, app_io.diagram.with({
                    arrow_selections: [], 
                    object_selections: [],
                    inferred_object_selections: [],
                }), false);
            }
        },
    }

    const key_bindings = {
        'ctrl+z': 'undo',
        'ctrl+y': 'redo',
        'ctrl+shift+z': 'redo',
    }

    const text_bindings = {
        'object-text': 'object_text',
        'arrow-text': 'arrow_text',
    }

    const button_bindings = {
        'undo': 'undo',
        'redo': 'redo',
        'toggle-grid': 'toggle_grid',
    }

    const mousedown_bindings = [
        'arrow',
        'pan',
        'deselect'
    ];

    const touchstart_bindings = [
        'arrow',
        'pan',
        'select'
    ];

    return {

        contextmenu: function(event, drawing, app_io, dom_io){
        },

        wheel: function(event, drawing, app_io, dom_io){
            drag_ops.wheel( glm.vec2(event.clientX, event.clientY), event.deltaY, app_io);
            drawing.redraw(undefined, app_io, dom_io);
        },

        mousedown: function(event, drawing, app_io, dom_io){
            const action_id = mousedown_bindings[event.button];
            (mouse_actions[action_id] || generic_actions[action_id])(app_io, event);
            drawing.redraw(undefined, app_io, dom_io);
        },

        mousemove: function(event, drawing, app_io, dom_io){
            // mouse motion is a degenerate case of touchscreen motion where the number of touchpoints is one
            drag_ops.move( [glm.vec2(event.clientX, event.clientY)], app_io);
            drawing.redraw(undefined, app_io, dom_io);
        },

        mouseup: function(event, drawing, app_io, dom_io){
            drag_ops.transition( view_drags.release(app_io.diagram.screen_frame_store), app_io);
            drawing.redraw(undefined, app_io, dom_io);
        },

        touchstart: function(event, drawing, app_io, dom_io){
            const action_id = touchstart_bindings[event.touches.length-1];
            (touch_actions[action_id] || generic_actions[action_id])(app_io, event);
            drawing.redraw(undefined, app_io, dom_io);
        },

        touchmove: function(event, drawing, app_io, dom_io){
            const positions = [];
            for (var i = 0; i < event.touches.length; i++) {
                positions.push(glm.vec2(event.touches[i].clientX, event.touches[i].clientY));
            }
            drag_ops.move( positions, app_io);
            drawing.redraw(undefined, app_io, dom_io);
        },

        touchend: function(event, drawing, app_io, dom_io){
            drag_ops.transition( view_drags.release(app_io.diagram.screen_frame_store), app_io);
            drawing.redraw(undefined, app_io, dom_io);
        },

        touchcancel: function(event, drawing, app_io, dom_io){
            drag_ops.transition( view_drags.release(app_io.diagram.screen_frame_store), app_io);
            drawing.redraw(undefined, app_io, dom_io);
        },

        keydown: function(event, drawing, app_io, dom_io){
            const keycode = `${event.ctrlKey?'ctrl+':''}${event.shiftKey?'shift+':''}${event.key.toLowerCase()}`
            const action_id = key_bindings[keycode];
            if (action_id!=null) {
                const action = generic_actions[action_id];
                if (action!=null) {
                    action(app_io, event);
                    drawing.redraw(undefined, app_io, dom_io);
                }
            }
        },

        buttonclick: function(event, drawing, app_io, dom_io){
            const action_id = button_bindings[event.currentTarget.id];
            if (action_id!=null) {
                const action = generic_actions[action_id];
                if (action!=null) {
                    action(app_io, event);
                    drawing.redraw(undefined, app_io, dom_io);
                }
            }
        },

        textinput: function(event, drawing, app_io, dom_io){
            const action_id = text_bindings[event.currentTarget.id];
            if (action_id!=null) {
                const action = text_actions[action_id];
                if (action!=null) {
                    action(app_io, event);
                    drawing.redraw(undefined, app_io, dom_io, event.currentTarget.id);
                }
            }
        },

        arrowdown: function(event, drawing, arrow, app_io, dom_io){
            if (event.buttons == 1 && !arrow.is_edited) {
                event.stopPropagation();
                drag_ops.transition( arrow_drags.edit(app_io.diagram.arrows, arrow), app_io);
                drawing.redraw(undefined, app_io, dom_io);
            }
        },

        arrowenter: function(event, drawing, arrow, app_io, dom_io){
            if (event.buttons == 2 && !arrow.is_edited) {
                event.stopPropagation();
                const arrow_id = app_io.diagram.arrows.indexOf(arrow);
                history.do(app_io, app_io.diagram.with({arrow_selections: [...app_io.diagram.arrow_selections, arrow_id]}), true);
                drawing.redraw(undefined, app_io, dom_io);
            }
        },

        midpointdown: function(event, drawing, arrow, app_io, dom_io){
            if (event.buttons == 1 && !arrow.is_edited) {
                event.stopPropagation();
                console.log('midpointdown')
                drag_ops.transition( arrow_drags.create_2arrow(app_io.diagram.arrows, glm.vec2(0,0), arrow), app_io);
                drawing.redraw(undefined, app_io, dom_io);
            }
        },

        midpointenter: function(event, drawing, arrow, app_io, dom_io){
            if (event.buttons == 1 && !arrow.is_edited) {
                event.stopPropagation();
                const arrow_id = app_io.diagram.arrows.indexOf(arrow);
                console.log('midpointenter')
                // history.do(app_io, app_io.diagram.with({arrow_selections: [...app_io.diagram.arrow_selections, arrow_id]}), true);
                drawing.redraw(undefined, app_io, dom_io);
            }
        },

        midpointexit: function(event, drawing, arrow, app_io, dom_io){
            if (event.buttons == 1 && !arrow.is_edited) {
                event.stopPropagation();
                const arrow_id = app_io.diagram.arrows.indexOf(arrow);
                console.log('midpointexit')
                // history.do(app_io, app_io.diagram.with({arrow_selections: [...app_io.diagram.arrow_selections, arrow_id]}), true);
                drawing.redraw(undefined, app_io, dom_io);
            }
        },

        objectdown: function(event, drawing, object_, app_io, dom_io){
            if (event.buttons == 1 && !object_.is_edited) {
                event.stopPropagation();
                const object_id = app_io.diagram.objects.indexOf(object_);
                const selected_diagram = object_id >= 0?
                      app_io.diagram.with({ 
                            arrow_selections:[], 
                            object_selections: [object_id],
                            inferred_object_selections: []
                        })
                    : app_io.diagram.with({ 
                            arrow_selections:[], 
                            object_selections: [],
                            inferred_object_selections: [object_],
                        });
                history.do(app_io, selected_diagram, false);
                drag_ops.transition( 
                    selection_drags.move(selected_diagram, glm.vec2(event.clientX, event.clientY)), 
                    app_io);
                drawing.redraw(undefined, app_io, dom_io);
            }
        },

        objectenter: function(event, drawing, object_, app_io, dom_io){
            if (event.buttons == 2 && !object_.is_edited) {
                event.stopPropagation();
                const object_id = app_io.diagram.objects.indexOf(object_);
                const selected_diagram = object_id >= 0?
                      app_io.diagram.with({ 
                            object_selections: [...app_io.diagram.object_selections, object_id] })
                    : app_io.diagram.with({ 
                            inferred_object_selections: [...app_io.diagram.inferred_object_selections, object_] });
                history.do(app_io, selected_diagram, true);
                drawing.redraw(undefined, app_io, dom_io);
            }
        },

        selection_click: function(event, drawing, app_io, dom_io){
            if (event.button == 0) {
                event.stopPropagation();
                drag_ops.transition( 
                    selection_drags.move(app_io.diagram, glm.vec2(event.clientX, event.clientY)), 
                    app_io);
                drawing.redraw(undefined, app_io, dom_io);
            }
        },

    }
}
