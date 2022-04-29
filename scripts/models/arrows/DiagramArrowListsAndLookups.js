'use strict';


/*
`DiagramArrowListsAndCellLookups` returns a namespace of pure functions that describe functions between
nonredundant lists of arrows and their equivalent representations as associative arrays of lists indexed by 
the hashes of source and target cells. (e.g. the arrow list [a→b, a→a] could be represented {a:[a→b, a→a], b:[a→b]})
*/
function DiagramArrowListsAndLookups(diagram_ids) {
    return {
        list_to_source_lookup: (arrow_list) => {
            const arrow_lookup = {};
            for(let arrow of arrow_list){
                const outbound_arrows = arrow_lookup[diagram_ids.cell_id_to_cell_hash(arrow.arc.source)] || [];
                outbound_arrows.push(arrow);
                arrow_lookup[diagram_ids.cell_id_to_cell_hash(arrow.arc.source)] = outbound_arrows;
            }
            return arrow_lookup;
        },
        list_to_target_lookup: (arrow_list) => {
            const arrow_lookup = {};
            for(let arrow of arrow_list){
                const inbound_arrows = arrow_lookup[diagram_ids.cell_id_to_cell_hash(arrow.arc.target)] || [];
                inbound_arrows.push(arrow); 
                arrow_lookup[diagram_ids.cell_id_to_cell_hash(arrow.arc.target)] = inbound_arrows;
            }
            return arrow_lookup;
        },
        lookup_to_set: (arrow_lookup) => {
            const arrow_set = [];
            for(let cell_hash in arrow_lookup){
                for(let arrow of arrow_lookup[cell_hash]){
                    arrow_set[diagram_ids.cell_pair_to_cell_pair_hash(arrow.arc.source, arc.arrow.target)] = arrow;
                }
            }
            return arrow_set;
        },
        list_to_set: (arrow_list) => {
            const arrow_set = [];
            for(let arrow of arrow_list){
                arrow_set[diagram_ids.cell_pair_to_cell_pair_hash(arrow.arc.source, arc.arrow.target)] = arrow;
            }
            return arrow_set;
        },
        set_to_list: (arrow_set) => {
            const arrow_list = [];
            for(let cell_hash in arrow_set){
                arrow_list.push(arrow_set[cell_hash]);
            }
            return arrow_list;
        }
    }
}
