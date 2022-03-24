'use strict';

/*
`DiagramControlState` is a data structure that contains all state relating to the presentation of a diagram.
It expresses control state such as the kind of drag applied, and the undo/redo history that can be traversed.
*/
class DiagramControlState {
    constructor(drag_type, drag_state, command_history){
        this.drag_type = drag_type;
        this.drag_state = drag_state;
        this.command_history = command_history;
    }
}
