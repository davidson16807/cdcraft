
function AppHistoryTraversal() {
    return {

        do: function(app_io, command, is_recorded){
            command.forward(app_io.diagram);
            if (is_recorded) {
                app_io.redo_history = [];
                app_io.undo_history.push(command);
            }
        },

        undo: function(app_io){
            const command = app_io.undo_history.pop();
            if (command) {
                command.backward(app_io.diagram);
                app_io.redo_history.push(command);
            }
        },

        redo: function(app_io){
            const command = app_io.redo_history.pop();
            if (command) {
                command.forward(app_io.diagram);
                app_io.undo_history.push(command);
            }
        },

    }
}