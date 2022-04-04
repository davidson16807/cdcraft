'use strict';

function AppCommandeering() {
    return {

        do: function(app_io, command){
            command.forward(app_io.diagram, app_io.view);
            app_io.redo_history = [];
            app_io.undo_history.push(command);
        },

        undo: function(app_io){
            const command = app_io.undo_history.pop();
            command.forward(app_io.diagram, app_io.view);
            app_io.redo_history.push(command);
        },

        redo: function(app_io){
            const command = app_io.redo_history.pop();
            command.forward(app_io.diagram, app_io.view);
            app_io.undo_history.push(command);
        },

    }
}


function ModelDomBindScoping() {
    return {

        arrow: function (appbind, arrowbind) {
            return appbind;
        },

        object: function (appbind, objectbind) {
            return objectbind;
        },

        app: function (appbind, partbind_io) {
            return appbind;
        },

    };
}

/*
function AppDomBindCommandeering(modeldombind_scoping, app_commandeering) {
    return {

        do: function(appbind_io, partbind_io, command){
            app_commandeering.do(bind_io, command);
            const bind_io = modeldombind_scoping[command.scope];
            bind_io.binding.update(bind_io.dom, bind_io.model);
        },

        undo: function(bind_io){
            app_commandeering.undo(bind_io);
            const bind_io = modeldombind_scoping[command.scope];
            bind_io.binding.update(bind_io.dom, bind_io.model);
        },

        redo: function(bind_io){
            app_commandeering.undo(bind_io);
            const bind_io = modeldombind_scoping[command.scope];
            bind_io.binding.update(bind_io.dom, bind_io.model);
        },

    };
}
*/

/*
given a unary function defined as operations[opcode]→parameters→model→model,
return a Command that commutes model⇆model.
If `opcode` is within `inverse_opcode_lookup`, use the opcode it maps to as the inverse.
Otherwise, return a command that caches the input and returns it. 
*/
function CommandCreation(operations, inverse_opcode_lookup){
    return {
        create: function(opcode, parameters, model){
            const invert = inverse_opcode_lookup[opcode];
            return invert != null?
                Command(
                    opcode, invert,
                    (model) => operations[opcode](parameters)(model),
                    (model) => operations[invert](parameters)(model)
                ):
                Command(
                    opcode, opcode,
                    (model1) => operations[opcode](parameters)(model),
                    (model2) => model,
                );
        }
    };
}

function DomBinding(operations) {
    return {
        update: function(opcode, model, view_out){
            
        }
    };
}





/*
`ApplicationUpdater` returns a namespace of functions that reflect how events map to state operations.
All functions represent the transformation of state in reponse to controller events. 
Its name is in reference to the "Updater" within the "Model-View-Updater" pattern (A.K.A. "Elm" architecture)
*/
function ApplicationUpdater(
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

    const mouse_actions = {
        pan: function(app, event){
            const screen_offset = glm.vec2(event.movementX, event.movementY);
            const screen_frame_store = app.view.screen_frame_store;
            return view_drags.pan(screen_frame_store);
        },
        arrow: function(app, event){
            const screen_position = glm.vec2(event.clientX, event.clientY);
            const screen_frame_store = app.view.screen_frame_store;
            const screen_frame = screen_frame_storage.unpack(screen_frame_store);
            const model_position = position_shifting.leave(screen_position, screen_frame);
            return arrow_drags.create(app.diagram.arrows, model_position);
        },
    };
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
                app_io.view.arrow_selections = [];
                app_io.view.object_selections = [];
            } else if (event.button == 2 && !event.shiftKey) {
                // rmb handles selections, cancel if nothing is selected
                app_io.view.arrow_selections = [];
                app_io.view.object_selections = [];
            }
            drawing.redraw(app_io, dom_io);
        },

        mousemove: function(event, drawing, app_io, dom_io){
            // mouse motion is a degenerate case of touchscreen motion where the number of touchpoints is one
            drag_ops.move( glm.vec2(event.clientX, event.clientY), glm.vec2(event.movementX, event.movementY), app_io);
            drawing.redraw(app_io, dom_io);
        },

        mouseup: function(event, drawing, app_io, dom_io){
            drag_ops.transition( view_drags.release(app_io.view.screen_frame_store), app_io);
            drawing.redraw(app_io, dom_io);
        },

        touchsource: function(event, drawing, app_io, dom_io){
        },

        touchend: function(event, drawing, app_io, dom_io){
        },

        touchmove: function(event, drawing, app_io, dom_io){
        },

        arrowclick: function(event, drawing, arrow_io, app_io, dom_io){
            if (app_io.view.object_selections.length > 0 || app_io.view.arrow_selections.length > 0) {
                drag_ops.transition( selection_drags.move(app_io.diagram.arrows, app_io.view.arrow_selections, app_io.diagram.objects, app_io.view.object_selections), app_io);
            } else {
                drag_ops.transition( arrow_drags.edit(app_io.diagram.arrows, arrow_io), app_io);
            }
            drawing.redraw(app_io, dom_io);
        },

        objectclick: function(event, drawing, object_io, app_io, dom_io){
            const position_map = object_position_resources.get(app_io.view.object_selections);
            const position_hash = diagram_ids.cell_id_to_cell_hash(object_io.position);
            if (position_map[position_hash] != null) {
                drag_ops.transition( selection_drags.move(app_io.diagram.arrows, app_io.view.arrow_selections, app_io.diagram.objects, app_io.view.object_selections), app_io);
            } else {
                app_io.view.object_selections = [object_io];
                drag_ops.transition( selection_drags.move(app_io.diagram.arrows, [], app_io.diagram.objects, app_io.view.object_selections), app_io);
            }
            drawing.redraw(app_io, dom_io);
        },

        arrowselect: function(event, drawing, arrow_io, app_io, dom_io){
            app_io.view.arrow_selections.push(arrow_io);
            drawing.redraw(app_io, dom_io);
            
        },

        objectselect: function(event, drawing, object_io, app_io, dom_io){
            app_io.view.object_selections.push(object_io);
            drawing.redraw(app_io, dom_io);
        },

    }
}
