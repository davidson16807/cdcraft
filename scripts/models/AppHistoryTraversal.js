
function AppHistoryTraversal() {
    return {

        do: function(app_io, diagram, is_recorded){
            if (diagram != app_io.diagram) {
                if (is_recorded) {
                    app_io.undo_history.push(app_io.diagram);
                    if (diagram.arrows != app_io.diagram.arrows ||
                        diagram.objects != app_io.diagram.objects) {
                        // only reset redo history if change is hard
                        app_io.redo_history = [];
                    }
                }
                app_io.diagram = diagram;
            }
        },

        undo: function(app_io, is_soft){
            let is_done = false;
            let diagram;
            while(!is_done && app_io.undo_history.length > 0) {
                diagram = app_io.undo_history.pop();
                is_done = (is_soft || 
                    diagram.arrows != app_io.diagram.arrows ||
                    diagram.objects != app_io.diagram.objects);
                app_io.redo_history.push(app_io.diagram);
                app_io.diagram = diagram;
            }
        },

        redo: function(app_io, is_soft){
            let is_done = false;
            let diagram;
            while(!is_done && app_io.redo_history.length > 0) {
                diagram = app_io.redo_history.pop();
                is_done = (is_soft || 
                    diagram.arrows != app_io.diagram.arrows ||
                    diagram.objects != app_io.diagram.objects);
                app_io.undo_history.push(app_io.diagram);
                app_io.diagram = diagram;
            }
        },

    }
}