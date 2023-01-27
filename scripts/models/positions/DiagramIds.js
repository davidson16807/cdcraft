'use strict';

/*
`DiagramIds` is a namespace describing a small category of pure functions mapping between position indicators in model space
*/
function DiagramIds(cell_hashing, math){
    const floor = math.floor;
    const round = math.round;
    const abs = math.abs;
    return {
        cell_position_to_border_id: cell_position => glm.vec2(floor(cell_position.x), floor(cell_position.y)),
        border_id_to_cell_position: border_id => border_id.add(0.5),
        cell_position_to_cell_id: cell_position => glm.vec2(round(cell_position.x), round(cell_position.y)),
        cell_id_to_cell_hash: cell_id => cell_id == null? null : cell_hashing.hash(cell_id.x, cell_id.y),
        offset_to_offset_id: offset => glm.sign(offset).mul(glm.vec2(glm.bvec2(abs(offset.x) > abs(offset.y), abs(offset.x) < abs(offset.y)))),
        // don't delete the following two, they should be useful when reading/writing latex
        offset_id_to_offset_hash: offset_id => ((offset_id.x > offset_id.y) << 1) + (-offset_id.x > offset_id.y),
        offset_hash_to_offset_id: offset_hash => glm.normalize(glm.vec2(1,-1).mul(2*floor(offset_hash / 2)-1).add(glm.vec2(-1,-1).mul(2*(offset_hash % 2)-1))),
    };
}
