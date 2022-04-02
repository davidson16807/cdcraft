'use strict';

/*
`ApplicationState` is a data structure that contains all state within the application. 
It guarantees that for any combination of real numbered attribute values there is a valid application state.
*/
class ApplicationState {
    constructor(model, view, dragging, drag_state){
        this.diagram = model;
        this.view = view;
        this.drag_type = dragging;
        this.drag_state = drag_state;
        // this.undo_history = undo_history;
        // this.redo_history = redo_history;
    }
}

