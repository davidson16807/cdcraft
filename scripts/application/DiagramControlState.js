'use strict';

/*
`DiagramControlState` is a data structure that contains all control state within the application.
It tracks all state that is not modified using `Command` objects.
This includes the state of mouse drags, and the undo/redo history itself.
*/
class DiagramControlState {
    constructor(drag_type, drag_state, command_history){
        this.drag_type = drag_type;
        this.drag_state = drag_state;
        this.command_history = command_history;
    }
}
