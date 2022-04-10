
function AppHistoryTraversal() {
    return {

        do: function(app_io, diagram, is_recorded){
            if (diagram != app_io.diagram) {
                if (is_recorded) {
                    app_io.undo_history.push(app_io.diagram);
                    app_io.redo_history = [];
                }
                app_io.diagram = diagram;
            }
        },

        undo: function(app_io){
            const diagram = app_io.undo_history.pop();
            if (diagram != null) {
                app_io.redo_history.push(app_io.diagram);
                app_io.diagram = diagram;
            }
        },

        redo: function(app_io){
            const diagram = app_io.redo_history.pop();
            if (diagram != null) {
                app_io.undo_history.push(app_io.diagram);
                app_io.diagram = diagram;
            }
        },

    }
}