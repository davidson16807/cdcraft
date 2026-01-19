'use strict';

/*
A `ArrowReferenceResource` implements a REST-like interface
on source and target positions within a list of arrows.
*/
function ArrowReferenceResource(
        user_arcs_curried_and_stored_arcs,
        node_hashing, 
    ){
    return {

        get: function(arrows, reference_to_reference){
            let updated_reference_to_reference = {};
            for(let arrow of arrows){
                const stored_arc = arrow.arc;
                const source_hash = node_hashing.hash(stored_arc.source);
                const target_hash = node_hashing.hash(stored_arc.target);
                if ((reference_to_reference == null || reference_to_reference[source_hash] != null) && stored_arc.source.reference != null) {
                    updated_reference_to_reference[source_hash] = stored_arc.source.reference;
                }
                if ((reference_to_reference == null || reference_to_reference[target_hash] != null) && stored_arc.target.reference != null) {
                    updated_reference_to_reference[target_hash] = stored_arc.target.reference;
                }
            }
            return updated_reference_to_reference;
        },

        put: function(arrows, reference_to_reference) {
            const user_arcs_and_stored_arcs = user_arcs_curried_and_stored_arcs(arrows);
            const updated_arrows = [];
            for(let arrow of arrows){
                const old_stored = arrow.arc;
                const source_hash = node_hashing.hash(old_stored.source);
                const target_hash = node_hashing.hash(old_stored.target);
                const new_users = 
                    user_arcs_and_stored_arcs.stored_arc_to_user_arc(
                        old_stored.with({
                            source: old_stored.source.with({reference: reference_to_reference[source_hash] || old_stored.source.reference}),
                            target: old_stored.target.with({reference: reference_to_reference[target_hash] || old_stored.target.reference}),
                        })
                    );
                const new_stored = user_arcs_and_stored_arcs.user_arc_to_stored_arc(new_users);
                updated_arrows.push(arrow.with({arc:new_stored}));
            }
            return updated_arrows;
        },

        delete: function(arrows, reference_to_reference) {
            let filtered = [];
            const updated_window = {};
            const deleted_window = {...reference_to_reference};
            for(let i = 0; i < arrows.length; i++){
                const arrow = arrows[i];
                const arc = arrow.arc;
                const source_hash = node_hashing.hash(arc.source);
                const target_hash = node_hashing.hash(arc.target);
                const arrow_hash = node_hashing.hash(new Node(null, i));
                if (reference_to_reference[source_hash] == null && reference_to_reference[target_hash] == null && reference_to_reference[arrow_hash] == null) {
                    filtered.push(arrow);
                    updated_window[arrow_hash] = filtered.length;
                } else {
                    deleted_window[arrow_hash] = i;
                }
            }
            /*
            The arrows that were removed may be referenced by other arrows,
            so recursively call `delete()` for as long as arrows have been removed.
            */
            if(Object.keys(deleted_window).length > Object.keys(reference_to_reference).length){
                return this.delete(arrows, {...deleted_window});
            } else {
                return this.put(filtered, updated_window);
            }
        },

    };
}