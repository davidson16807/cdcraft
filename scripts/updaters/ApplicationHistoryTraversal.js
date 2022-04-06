
function ApplicationHistoryTraversal() {
    return {

        do: function(app_io, command, is_recorded){
            command.forward(app_io.diagram, app_io.view);
            if (is_recorded) {
                app_io.redo_history = [];
                app_io.undo_history.push(command);
            }
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