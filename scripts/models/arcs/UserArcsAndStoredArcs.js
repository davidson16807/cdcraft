'use strict';

function ArrowIdDummyRounding() {
    return {
        round: (arrow_id) => arrow_id,
        ceil:  (arrow_id) => arrow_id,
        floor: (arrow_id) => arrow_id,
    }
}

function PositionRounding() {
    const round = Math.round;
    const ceil  = Math.ceil;
    const floor = Math.floor;
    return {
        round: (position) => glm.vec2(round(position.x), round(position.y)),
        ceil:  (position) => glm.vec2(ceil (position.x), ceil (position.y)),
        floor: (position) => glm.vec2(floor(position.x), floor(position.y)),
    }
}

function NodeRounding(type_to_rounding_lookup) {
    return {
        round: (node) => node.with({ value: type_to_rounding_lookup[node.type].round(node.value) }),
        ceil:  (node) => node.with({ value: type_to_rounding_lookup[node.type].ceil (node.value) }),
        floor: (node) => node.with({ value: type_to_rounding_lookup[node.type].floor(node.value) }),
    };
}

function ArrowNodeOffsets() {
    return {
        distance: (node1, node2) => node1.value == node2.value? 0 : Infinity,
        sub: (node1, node2)  => glm.vec2(0,0),
        add: (node1, offset) => node1,
    };
}

function CellNodeOffsets() {
    return {
        distance: (node1, node2) => glm.distance(node1.value, node2.value),
        sub: (node1, node2)  => glm.sub(node1.value, node2.value),
        add: (node1, offset) => Node('cell', glm.add(node1.value, offset)),
    };
}

function NodeOffsets(type_to_offsets_lookup) {
    return {
        distance: (node1, node2) => 
            node1.type != node2.type? Infinity
              : type_to_offsets_lookup[node1.type].distance(node1, node2),
        get:   (node1, node2)  => 
            node1.type != node2.type? glm.vec2(0.0)
              : type_to_offsets_lookup[node1.type].get(node1, node2),
        apply: (node1, offset) => type_to_offsets_lookup[node1.type].apply(node1, offset),
    };
}


/*
`UserArcsAndStoredArcs` returns a namespace of pure functions that describe maps between `UserArc`s and `StoredArc`s
*/
function UserArcsAndStoredArcs(
    node_offsets,
    node_rounding,
    min_loop_chord_length, 
    max_loop_chord_length, 
    max_snap_distance, 
    target_offset_distance
) {
    return {
        user_arc_to_stored_arc: function(arc, default_offset_id) {
            default_offset_id = default_offset_id || glm.vec2();
            console.log(arc.source, arc.target);
            const rounded_source = node_rounding.round(arc.source);
            const rounded_target = node_rounding.round(arc.target);

            const chord_length = node_offsets.distance(arc.source, arc.target);
            const is_loop   = chord_length < max_loop_chord_length;
            const is_hidden = chord_length < min_loop_chord_length;
            const is_snapped = (
                node_offsets.distance(arc.source, rounded_source) < max_snap_distance && 
                node_offsets.distance(arc.target, rounded_target) < max_snap_distance);
            const is_valid = is_snapped && !is_hidden;

            const chord_direction = 
                 !is_valid?  default_offset_id
                : is_loop?   node_offsets.get(arc.target, arc.source) 
                :            glm.vec2();

            const source = 
                  is_hidden?     rounded_source
                : is_snapped?    rounded_source
                :                arc.source;

            const target = 
                  is_hidden?  rounded_source
                : is_snapped? rounded_target
                :             arc.target;

            console.log(source, target);
            return new StoredArc(
                source, 
                target, 
                arc.min_length_clockwise, 
                chord_direction,
                is_valid
            );
        },
        stored_arc_to_user_arc: function(arc){
            return new UserArc(
                    node_offsets.apply(arc.source, arc.chord_direction.mul(-target_offset_distance)), 
                    node_offsets.apply(arc.target, arc.chord_direction.mul( target_offset_distance)), 
                    arc.min_length_clockwise
                );
        }
    };
}
