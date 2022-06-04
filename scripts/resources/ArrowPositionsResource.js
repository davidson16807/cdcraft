'use strict';

/*
A `ArrowPositionsResource` implements a REST-like interface
on source and target positions within a list of arrows.
*/
function ArrowPositionsResource(user_arcs_and_stored_arcs, arc_position_resource){
    return {

        get: function(arrow_state, position_map){
            let updated_position_map = {};
            for(let arrow of arrow_state.arrows){
                updated_position_map = {
                    ...updated_position_map, 
                    ...arc_position_resource.get(arrow.arc, position_map),
                };
            }
            return updated_position_map;
        },

        put: function(arrow_state, position_map, show_invalid) {
            const arrows = [];
            const arrow_selections = [];
            const arrow_selection_set = {};
            for(let id of arrow_state.arrow_selections){
                arrow_selection_set[id] = id;
            }
            for(let i = 0; i<arrow_state.arrows.length; i++){
                const arrow = arrow_state.arrows[i];
                const old_stored = arrow.arc;
                const old_users = user_arcs_and_stored_arcs.stored_arc_to_user_arc(old_stored);
                let new_users = arc_position_resource.offset(
                    arc_position_resource.get(old_users, position_map),
                    old_stored.chord_direction.mul(0.15));
                const new_stored = user_arcs_and_stored_arcs.user_arc_to_stored_arc(new_users, old_stored.chord_direction);
                if(new_stored.is_valid || show_invalid){
                    if (arrow_selection_set[i] != null) {
                        arrow_selections.push(arrows.length);
                    }
                    arrows.push(arrow.with({arc:new_stored}));
                }
            }
            return new ArrowState(arrows, arrow_selections);
        },

        delete: function(arrow_state, position_map) {
            const arrows = [];
            const arrow_selections = [];
            const arrow_selection_set = {};
            for(let id of arrow_state.arrow_selections){
                arrow_selection_set[id] = id;
            }
            for(let i = 0; i<arrow_state.arrows.length; i++){
                const arrow = arrow_state.arrows[i];
                if(!arc_position_resource.in(arrow.arc, position_map)){
                    if (arrow_selection_set[i] != null) {
                        arrow_selections.push(arrows.length);
                    }
                    arrows.push(arrow);
                }
            }
            return new ArrowState(arrows, arrow_selections);
        },

    };
}
