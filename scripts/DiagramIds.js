'use strict';

/*
`DiagramIds` is a namespace describing a small category of pure functions mapping between position indicators in model space
*/
function DiagramIds(cell_hashing){
    const floor = Math.floor;
    const round = Math.round;
    const abs = Math.abs;
    return {
        cell_position_to_border_id: cell_position => glm.vec2(floor(cell_position.x), floor(cell_position.y)),
        border_id_to_cell_position: border_id => border_id.add(0.5),
        cell_position_to_cell_id: cell_position => glm.vec2(round(cell_position.x), round(cell_position.y)),
        cell_id_to_cell_hash: cell_id => cell_hashing.hash(cell_id.x, cell_id.y),
        cell_position_and_cell_id_to_offset: (cell_position, cell_id) => cell_position.sub(cell_id),
        offset_to_offset_id: offset => glm.sign(offset).mul(glm.vec2(glm.bvec2(abs(offset.x) > abs(offset.y), abs(offset.x) < abs(offset.y)))),
        offset_id_to_offset_hash: offset_id => ((offset_id.x > offset_id.y) << 1) + (-offset_id.x > offset_id.y),
        offset_hash_to_offset_id: offset_hash => glm.normalize(glm.vec2(1,-1).mul(2*floor(offset_hash / 2)-1).add(glm.vec2(-1,-1).mul(2*(offset_hash % 2)-1))),
        cell_pair_to_cell_pair_hash: (cell_position1, cell_position2) => 
            cell_hashing.hash(
                cell_hashing.hash(round(cell_position1.x), round(cell_position1.y)), 
                cell_hashing.hash(round(cell_position2.x), round(cell_position2.y))),
    };
}
