
/* 
`NodeHashing` generates a namespace with a single pure function exposed, `hash()`.
The function maps any `Node` to a unique non-negative integer.
It is bijective in principle, however its inverse is not implemented.
`NodeHashing.hash(new Node(position))` is equivalent to `UnboundedCellHashing.hash(position)` 
*/
function NodeHashing(unbounded_cell_hashing) {
    return {
        // A node can be either a position or an arrow reference, 
        // so multiply the hash of either by two and offset by a unique id for the quadrant
        // hash: (node) => (node.position == null? 0 : unbounded_cell_hashing.hash(node.position)) - (node.reference || 0),
        hash: (node) => (node.position == null? (-node.reference-1) : unbounded_cell_hashing.hash(node.position.x, node.position.y)),
    };
}