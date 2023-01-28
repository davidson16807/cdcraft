'use strict';

/*
A `ArrowPositionsResource` implements a REST-like interface
on source and target positions within a list of arrows.
*/
function ArrowPositionsResource(node_hashing, user_arcs_and_stored_arcs){
    return {

        get: function(arrows, position_map){
            let updated_position_map = {};
            for(let arrow of arrows){
                const stored_arc = arrow.arc;
                const source_hash = node_hashing.hash(stored_arc.source);
                const target_hash = node_hashing.hash(stored_arc.target);
                if ((position_map == null || position_map[source_hash] != null) && stored_arc.source.position != null) {
                    updated_position_map[source_hash] = stored_arc.source.position;
                }
                if ((position_map == null || position_map[target_hash] != null) && stored_arc.target.position != null) {
                    updated_position_map[target_hash] = stored_arc.target.position;
                }
            }
            return updated_position_map;
        },

        put: function(arrows, position_map) {
            const updated_arrows = [];
            for(let arrow of arrows){
                const old_stored = arrow.arc;
                const old_users = user_arcs_and_stored_arcs.stored_arc_to_user_arc(old_stored);
                const source_hash = node_hashing.hash(old_stored.source);
                const target_hash = node_hashing.hash(old_stored.target);
                const new_users = new UserArc(
                    old_users.source.with({
                        position: position_map[source_hash] != null? 
                                    old_stored.target_offset_id.mul(-0.015).add(position_map[source_hash]) 
                                  : old_users.source.position
                    }),
                    old_users.target.with({
                        position: position_map[target_hash] != null? 
                                    old_stored.target_offset_id.mul( 0.015).add(position_map[target_hash]) 
                                  : old_users.target.position
                    }),
                    old_users.min_length_clockwise);
                const new_stored = user_arcs_and_stored_arcs.user_arc_to_stored_arc(new_users, old_stored.target_offset_id);
                updated_arrows.push(arrow.with({arc:new_stored}));
            }
            return updated_arrows;
        },

        delete: function(arrows, position_map) {
            const filtered = [];
            const node_map = {};
            for(let i = 0; i < arrows.length; i++){
                const arrow = arrows[i];
                const arc = arrow.arc;
                const source_hash = node_hashing.hash(arc.source);
                const target_hash = node_hashing.hash(arc.target);
                if (position_map[source_hash] == null && position_map[target_hash] == null) {
                    filtered.push(arrow);
                } else {
                    const arrow_hash = node_hashing.hash(new UserNode(null, i));
                    node_map[arrow_hash] = 0;
                }
            }
            /*
            The arrows that were removed may be referenced by other arrows,
            so recursively call `delete()` for as long as arrows have been removed and there are more arrows available.
            */
            return 0 < filtered.length && filtered.length < arrows.length? 
                  this.delete(filtered, node_map)
                : filtered;
        },

    };
}
