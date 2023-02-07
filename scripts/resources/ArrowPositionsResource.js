'use strict';

/*
A `ArrowPositionsResource` implements a REST-like interface
on source and target positions within a list of arrows.
*/
function ArrowPositionsResource(
        arrow_reference_resource, 
        curried_user_arcs_and_stored_arcs, 
        node_hashing
    ){
    return {

        get: function(arrows, position_map){
            let updated_position_map = {};
            for(let arrow of arrows){
                const stored_arc = arrow.arc;
                const source_hash = node_hashing.hash(stored_arc.source);
                const target_hash = node_hashing.hash(stored_arc.target);
                if ((position_map == null || position_map[source_hash] != null) && stored_arc.source.reference == null) {
                    updated_position_map[source_hash] = stored_arc.source.position;
                }
                if ((position_map == null || position_map[target_hash] != null) && stored_arc.target.reference == null) {
                    updated_position_map[target_hash] = stored_arc.target.position;
                }
            }
            return updated_position_map;
        },

        put: function(arrows, position_map) {
            const user_arcs_and_stored_arcs = curried_user_arcs_and_stored_arcs(arrows);
            const updated_arrows = [];
            for(let arrow of arrows){
                /*
                Dragging objects and arrows will affect other objects and arrows whose positions or nodes share the same cells,
                so both keys and values of a resource window should be stored in a way that is agnostic between arrows and objects.
                The only way to satisfy this constraint is to represent positions 
                as they would appear in `StoredArc`s (what we call a "stored position"),
                where positions are standardized to fall at the midpoint of cells, where possible.
                Sources and targets of arrows can be dragged by the user, 
                and dragging these should allow users to change the directionality of loops represented by `target_offset_id`,
                so behavior must be expressed to account for this feature. 
                More specifically, if a user selects a loop without dragging it, the loop should not change its direction,
                meaning that `target_offset_id` would be used as input to dragging behavior,
                if at the very least to account for behavior where no drag occurs.
                `target_offset_id` is a property that is specific to individual arrows,
                and as mentioned above, resource windows (i.e. `position_map`) must represent positions in an arrow-neutral way, 
                using stored positions, so `target_offset_id` cannot be represented somehow using the window of the resource.

                The approach we take here is to use values from `position_map` to modify the `StoredArc`s of arrows,
                then convert the `StoredArc` to and from a `UserArc`.
                It is important to note here that the maps to and from `StoredArc` and `UserArc` 
                are not bijective and serve an important function - 
                applying these maps allow the `target_offset_id` of the initial `StoredArc`
                to be properly considered when determining the position of the `UserArc`,
                and by extension the `target_offset_id` of the final `StoredArc`.
                */
                const old_stored = arrow.arc;
                const source_hash = node_hashing.hash(old_stored.source);
                const target_hash = node_hashing.hash(old_stored.target);
                const new_users = 
                    user_arcs_and_stored_arcs.stored_arc_to_user_arc(
                        old_stored.with({
                            source: old_stored.source.with({position: position_map[source_hash] || old_stored.source.position}),
                            target: old_stored.target.with({position: position_map[target_hash] || old_stored.target.position}),
                        })
                    );
                const new_stored = user_arcs_and_stored_arcs.user_arc_to_stored_arc(new_users, old_stored.target_offset_id);
                updated_arrows.push(arrow.with({arc:new_stored}));
            }
            return updated_arrows;
        },

        delete: function(arrows, position_map) {
            let filtered = [];
            const updated_window = {};
            const deleted_window = {};
            for(let i = 0; i < arrows.length; i++){
                const arrow = arrows[i];
                const arc = arrow.arc;
                const source_hash = node_hashing.hash(arc.source);
                const target_hash = node_hashing.hash(arc.target);
                const arrow_hash = node_hashing.hash(new Node(null, i));
                if (position_map[source_hash] == null && position_map[target_hash] == null) {
                    filtered.push(arrow);
                    updated_window[arrow_hash] = filtered.length;
                } else {
                    const arrow_hash = node_hashing.hash(new Node(null, i));
                    deleted_window[arrow_hash] = filtered.length;
                }
            }
            /*
            The arrows that were removed may be referenced by other arrows,
            so recursively call `delete()` for as long as arrows have been removed and there are more arrows available.
            */
            filtered = arrow_reference_resource.put(filtered, updated_window);
            filtered = 0 < filtered.length && filtered.length < arrows.length? 
                arrow_reference_resource.delete(filtered, deleted_window) 
              : filtered;
            return filtered;
        },

    };
}
