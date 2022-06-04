'use strict';


function ArrowNodePositionResource() {
    return {
        get: (arrow_id) => {},
        put: (arrow_id, cell_lookup) => arrow_id,
        in:  (arrow_id, cell_lookup) => false,

        add: (arrow_id, cell_offset) => arrow_id,
        sub: (arrow_id, cell_offset) => arrow_id,
        mul: (arrow_id, factor) => arrow_id,
        div: (arrow_id, factor) => arrow_id,
    };
}

function CellNodePositionResource(cell_hashing) {
    return {
        get: (cell_id) => { 
            const cell_lookup = {};
            cell_lookup[cell_hashing.hash(cell_id)] = cell_id
            return cell_lookup;
        },
        put: (cell_id, cell_lookup) => cell_lookup[cell_hashing.hash(cell_id)] || cell_id,
        in:  (cell_id, cell_lookup) => cell_lookup[cell_hashing.hash(cell_id)] != null,

        add: (cell_id, cell_offset) => glm.add(cell_id, cell_offset),
        sub: (cell_id, cell_offset) => glm.sub(cell_id, cell_offset),
        mul: (cell_id, factor) => glm.mul(cell_id, factor),
        div: (cell_id, factor) => glm.div(cell_id, factor),
    };
}

function NodePositionResource(type_lookup) {
    return {
        get: (node) => type_lookup[node.type].get(node.value),
        put: (node, cell_lookup) => type_lookup[node.type].put(node.value, id_lookup),
        in:  (node, cell_lookup) => type_lookup[node.type].in(node.value, id_lookup),

        add: (node, cell_offset) => type_lookup[node.type].add(node.value, cell_offset),
        sub: (node, cell_offset) => type_lookup[node.type].sub(node.value, cell_offset),
        mul: (node, factor) => type_lookup[node.type].mul(node.value, factor),
        div: (node, factor) => type_lookup[node.type].div(node.value, factor),
    };
}

function ArrowNodeArrowIdResource() {
    return {
        get: (arrow_id) => {arrow_id: arrow_id},
        put: (arrow_id, id_lookup) => id_lookup[arrow_id] != null? id_lookup[arrow_id] : arrow_id,
        in:  (arrow_id, id_lookup) => id_lookup[arrow_id] != null,
    };
}

function CellNodeArrowIdResource(cell_hashing) {
    return {
        get: (cell_id) => {},
        put: (cell_id, id_lookup) => cell_id,
        in:  (cell_id, id_lookup) => false,
    };
}

function NodeArrowIdResource(type_lookup) {
    return {
        get: (node) => type_lookup[node.type].get(node.value),
        put: (node, id_lookup) => type_lookup[node.type].put(node.value, id_lookup),
        in:  (node, id_lookup) => type_lookup[node.type].in(node.value, id_lookup),
    };
}

function ArcPositionResource(node_position_resource) {
    const dependency = node_position_resource;
    return {
        get: (arc, cell_lookup) => {
            console.log(arc.source)
            console.log(arc.target)
            return {
                ...cell_lookup == null || dependency.in(arc.source, cell_lookup)? dependency.get(arc.source) : {}, 
                ...cell_lookup == null || dependency.in(arc.target, cell_lookup)? dependency.get(arc.target) : {},
            };
        },
        put: (arc, cell_lookup) => arc.with({
            source: dependency.put(arc.source, cell_lookup), 
            target: dependency.put(arc.target, cell_lookup),}),
        in:  (arc, cell_lookup) => (
            dependency.in(arc.source, cell_lookup) || 
            dependency.in(arc.target, cell_lookup)),

        offset: (arc, target_offset) => 
            arc.with({
                source: node_positions_resource.add(new_users.source,-target_offset),
                target: node_positions_resource.add(new_users.target, target_offset),
            }),
    };
}

function ArcArrowIdResource(node_arrow_id_resource) {
    const dependency = node_arrow_id_resource;
    return {
        get: (arc, id_lookup) => {
            console.log(arc.source)
            console.log(arc.target)
            return {
                ...id_lookup == null || dependency.in(arc.source, id_lookup)? dependency.get(arc.source) : {}, 
                ...id_lookup == null || dependency.in(arc.target, id_lookup)? dependency.get(arc.target) : {},
            }
        },
        put: (arc, id_lookup) => arc.with({
            source: dependency.put(arc.source, id_lookup), 
            target: dependency.put(arc.target, id_lookup),}),
        in:  (arc, id_lookup) => (
            dependency.in(arc.source, id_lookup) || 
            dependency.in(arc.target, id_lookup)),
    };
}

/*
A `ArrowsResource` implements a REST-like interface on arrows within an `ArrowState`.
See README.md and ArrowState.js for more information. 
*/
function ArrowsResource(arc_arrow_id_resource){
    return {

        get: function(arrow_state, id_map){
            const result = {};
            for(let i = 0; i<arrow_state.arrows.length; i++){
                if (id_map[i] != null) {
                    result[i] = arrow;
                }
            }
            return result;
        },

        post: function(id_map) {
            return Object.values(id_map);
        },

        put: function(arrow_state, id_map) {
            const arrows = [...arrow_state.arrows];
            const arrow_selections = [...arrow_state.arrow_selections];
            for(let id in id_map){
                if (0 <= id&&id <arrow_state.arrows.length) {
                    arrows[id] = id_map[id];
                } else {
                    arrows.push(id_map[id]);
                }
            }
            return new ArrowState(arrows, arrow_selections);
        },

        delete: function(arrow_state, id_map) {
            const arrows = [];
            const arrow_selections = [];
            let arrow, arc;
            for(let i = 0; i<arrow_state.arrows.length; i++){
                if (id_map[i] != null) { continue; }
                arrow = arrow_state.arrows[i].arc;
                if (!arc_arrow_id_resource.in(arrow.arc, id_map)){
                    arrows.push(arrow);
                }
            }
            for(let i of arrow_state.arrow_selections){
                if (id_map[i] != null) { continue; }
                arrow = arrow_state.arrows[i].arc;
                if (!arc_arrow_id_resource.in(arrow.arc, id_map)){
                    arrow_selections.push(i);
                }
            }
            return new ArrowState(arrows, arrow_selections);
        },

    };
}
