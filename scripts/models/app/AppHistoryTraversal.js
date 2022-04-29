'use strict';

function AppHistoryTraversal(diagram_metrics, max_history_size) {
    return {

        do: function(app_io, diagram, is_recorded){
            if (diagram != app_io.diagram) {
                if (is_recorded) {
                    app_io.undo_history.push(app_io.diagram);
                    if (app_io.undo_history.length > max_history_size) {
                        app_io.undo_history.shift();
                    }
                    if (diagram_metrics.is_model_different(diagram, app_io.diagram)) {
                        /*
                        do not reset redo history if only the view has changed, 
                        since it would otherwise be annoying
                        */
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
                is_done = is_soft || diagram_metrics.is_model_different(diagram, app_io.diagram);
                app_io.redo_history.push(app_io.diagram);
                app_io.diagram = diagram;
            }
        },

        redo: function(app_io, is_soft){
            let is_done = false;
            let diagram;
            while(!is_done && app_io.redo_history.length > 0) {
                diagram = app_io.redo_history.pop();
                is_done = is_soft || diagram_metrics.is_model_different(diagram, app_io.diagram);
                app_io.undo_history.push(app_io.diagram);
                app_io.diagram = diagram;
            }
        },

    }
}