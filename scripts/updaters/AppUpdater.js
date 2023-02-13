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
    const drag_ops                  = dependencies.drag_state_ops;
    const history                   = dependencies.app_history_traversal;
    const diagram_object_resources  = dependencies.diagram_object_resources;
    const diagram_arrow_resources   = dependencies.diagram_arrow_resources;

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
    functions mapping function→app×event→app
    where the function app×event→app is an action that represents a change to a selection of some kind
    */
    const selection_actions_curried = {
        object: update_object => (app_io, event) => {
            const diagram = app_io.diagram;
            const inferred = diagram.inferred_object_selections;
            const explicit = diagram.object_selections;
            history.do(app_io, 
                inferred.length == 1?
                    diagram_object_resources.inferred.put(diagram, 0, 
                        update_object(inferred[0], event))
              : explicit.length == 1?
                    diagram_object_resources.explicit.put(diagram, explicit[0],
                        update_object(diagram.objects[explicit[0]], event))
              : diagram,
                true);
        },
        arrow: update_arrow => (app_io, event) => {
            const diagram = app_io.diagram;
            const arrows = diagram.arrow_selections;
            history.do(app_io, 
                arrows.length == 1?
                    diagram_arrow_resources.put(diagram, arrows[0],
                        update_arrow(diagram.arrows[arrows[0]], event))
              : diagram,
                true);
        },
        multientity: update_entity => (app_io, event) => {
            const diagram = app_io.diagram;
            const arrows = [...diagram.arrows];
            const objects = [...diagram.objects];
            const object_selections = [...diagram.object_selections];
            const inferred_object_selections = [...diagram.inferred_object_selections];
            diagram.arrow_selections.forEach(id => { arrows[id] = update_entity(arrows[id], event); });
            diagram.object_selections.forEach(id => { objects[id] = update_entity(objects[id], event) });
            diagram.inferred_object_selections.forEach((object, i) => { 
                inferred_object_selections.splice(i, 1);
                object_selections.push(objects.length);
                objects.push(update_entity(object, event));
            });
            history.do(app_io, 
                diagram.with({
                    arrows: arrows,
                    objects: objects,
                    object_selections: object_selections,
                    inferred_object_selections: inferred_object_selections,
                }), true);
        }
    }

    /* 
    functions mapping app×text→app 
    where the event must represent a change in a text field
    */
    const text_actions = {
        arrow_label: selection_actions_curried.arrow((arrow,event) => arrow.with({label: event.currentTarget.value})),
        object_symbol: selection_actions_curried.object((object,event) => object.with({symbol: event.currentTarget.value})),
        object_label: selection_actions_curried.object((object,event) => object.with({label: event.currentTarget.value})),
    };

    /* 
    functions mapping entity×text→app 
    where `entity` is some entity in the diagram (e.g. an arrow or object)
    */
    const entity_actions_curried = {
        label_offset_id_toggle: label_offset_id => (entity, event) => 
            entity.with({
                label_offset_id: 
                    entity.label_offset_id == null || 
                    entity.label_offset_id.x != label_offset_id.x || 
                    entity.label_offset_id.y != label_offset_id.y? 
                        label_offset_id : null
            }),
        set_property: (property, value) => (arrow, event) => arrow.with(Object.fromEntries([[property, value]])),
    }

    /*
    // functions mapping app×event→app 
    where the event need carry no information beyond the fact that it occurred, such as a button press
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

        object_label_left:          selection_actions_curried.object(entity_actions_curried.label_offset_id_toggle(glm.ivec2(-1,0))),
        object_label_right:         selection_actions_curried.object(entity_actions_curried.label_offset_id_toggle(glm.ivec2(1,0))),
        object_label_topleft:       selection_actions_curried.object(entity_actions_curried.label_offset_id_toggle(glm.ivec2(-1,1))),
        object_label_topright:      selection_actions_curried.object(entity_actions_curried.label_offset_id_toggle(glm.ivec2(1,1))),
        object_label_bottomleft:    selection_actions_curried.object(entity_actions_curried.label_offset_id_toggle(glm.ivec2(-1,-1))),
        object_label_bottomright:   selection_actions_curried.object(entity_actions_curried.label_offset_id_toggle(glm.ivec2(1,-1))),

        arrow_label_outside:        selection_actions_curried.arrow(entity_actions_curried.label_offset_id_toggle(glm.ivec2(0,1))),
        arrow_label_inside:         selection_actions_curried.arrow(entity_actions_curried.label_offset_id_toggle(glm.ivec2(0,-1))),

        arrow_head_style0:          selection_actions_curried.arrow(entity_actions_curried.set_property('head_style_id', 0)),
        arrow_head_style1:          selection_actions_curried.arrow(entity_actions_curried.set_property('head_style_id', 1)),
        arrow_head_style2:          selection_actions_curried.arrow(entity_actions_curried.set_property('head_style_id', 2)),
        arrow_head_style3:          selection_actions_curried.arrow(entity_actions_curried.set_property('head_style_id', 3)),
        arrow_head_style4:          selection_actions_curried.arrow(entity_actions_curried.set_property('head_style_id', 4)),

        arrow_line_count0:          selection_actions_curried.arrow(entity_actions_curried.set_property('line_count', 0)),
        arrow_line_count1:          selection_actions_curried.arrow(entity_actions_curried.set_property('line_count', 1)),
        arrow_line_count2:          selection_actions_curried.arrow(entity_actions_curried.set_property('line_count', 2)),
        arrow_line_count3:          selection_actions_curried.arrow(entity_actions_curried.set_property('line_count', 3)),

        arrow_line_style0:          selection_actions_curried.arrow(entity_actions_curried.set_property('line_style_id', 0)),
        arrow_line_style1:          selection_actions_curried.arrow(entity_actions_curried.set_property('line_style_id', 1)),
        arrow_line_style2:          selection_actions_curried.arrow(entity_actions_curried.set_property('line_style_id', 2)),
        
        arrow_tail_style0:          selection_actions_curried.arrow(entity_actions_curried.set_property('tail_style_id', 0)),
        arrow_tail_style1:          selection_actions_curried.arrow(entity_actions_curried.set_property('tail_style_id', 1)),
        arrow_tail_style2:          selection_actions_curried.arrow(entity_actions_curried.set_property('tail_style_id', 2)),
        arrow_tail_style3:          selection_actions_curried.arrow(entity_actions_curried.set_property('tail_style_id', 3)),
        arrow_tail_style4:          selection_actions_curried.arrow(entity_actions_curried.set_property('tail_style_id', 4)),
        
        multientity_color_green:    selection_actions_curried.multientity(entity_actions_curried.set_property('color', 'green')),
        multientity_color_blue:     selection_actions_curried.multientity(entity_actions_curried.set_property('color', 'blue')),
        multientity_color_red:      selection_actions_curried.multientity(entity_actions_curried.set_property('color', 'red')),
        multientity_color_yellow:   selection_actions_curried.multientity(entity_actions_curried.set_property('color', 'yellow')),
        multientity_color_contrast: selection_actions_curried.multientity(entity_actions_curried.set_property('color', 'contrast')),
    }

    const key_bindings = {
        'ctrl+z': 'undo',
        'ctrl+y': 'redo',
        'ctrl+shift+z': 'redo',
    }

    const text_bindings = {
        'object-symbol': 'object_symbol',
        'object-label': 'object_label',
        'arrow-label': 'arrow_label',
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
            const action = generic_actions[event.currentTarget.id.replaceAll('-','_')];
            if (action!=null) {
                action(app_io, event);
                drawing.redraw(undefined, app_io, dom_io);
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
            /*
            Do not consider arrows unless they are found in the current diagram.
            Some arrows may not occur in the diagram if they were updated by an earlier event.
            These arrows do not reflect the most current state and should not be considered.
            */
            const arrow_id = app_io.diagram.arrows.indexOf(arrow);
            if (arrow_id >= 0) {
                if (event.buttons == 2 && !arrow.is_edited) {
                    event.stopPropagation();
                    history.do(app_io, app_io.diagram.with({arrow_selections: [...app_io.diagram.arrow_selections, arrow_id]}), true);
                    drawing.redraw(undefined, app_io, dom_io);
                }
                if (event.buttons == 1 && !arrow.is_edited) {
                    event.stopPropagation();
                    drag_ops.arrowenter([glm.vec2(event.clientX, event.clientY)], arrow, app_io);
                    drawing.redraw(undefined, app_io, dom_io);
                }
            }
        },

        arrowleave: function(event, drawing, arrow, app_io, dom_io){
            if (event.buttons == 1 && !arrow.is_edited) {
                event.stopPropagation();
                drag_ops.arrowleave([glm.vec2(event.clientX, event.clientY)], app_io);
                drawing.redraw(undefined, app_io, dom_io);
            }
        },

        midpointdown: function(event, drawing, arrow, app_io, dom_io){
            if (event.buttons == 1 && !arrow.is_edited) {
                event.stopPropagation();
                const screen_position = glm.vec2(event.clientX, event.clientY);
                const screen_state = screen_state_storage.unpack(app_io.diagram.screen_frame_store);
                const model_position = PanZoomMapping(screen_state).position.revert(screen_position);
                // drag_ops.transition(arrow_drags.create_2arrow(app_io.diagram.arrows, model_position, arrow), app_io);
                drag_ops.transition(arrow_drags.create(app_io.diagram.arrows, model_position, arrow), app_io);
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
