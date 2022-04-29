'use strict';

/*
`AppState` is a data structure that contains all state within the application. 
It guarantees that for any combination of real numbered attribute values there is a valid application state.
*/
class AppState {
    constructor(diagram, dragging, drag_state, undo_history, redo_history){
        this.diagram = diagram;
        this.drag_type = dragging;
        this.drag_state = drag_state;
        this.undo_history = undo_history || [];
        this.redo_history = redo_history || [];
    }

    with(attributes) {
        return new AppState(
            attributes.diagram       != null? attributes.diagram       : this.diagram,
            attributes.drag_type     != null? attributes.drag_type     : this.drag_type,
            attributes.drag_state    != null? attributes.drag_state    : this.drag_state,
            attributes.undo_history  != null? attributes.undo_history  : this.undo_history,
            attributes.redo_history  != null? attributes.redo_history  : this.redo_history,
        );
    }

}

