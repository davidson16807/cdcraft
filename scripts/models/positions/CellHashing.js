'use strict';

/* 
`PositiveCellHashing` generates a namspace with a single pure function exposed, `hash()`.
The function maps any positive whole number 2d coordinates to a unique positive integer.
It is bijective in principle, however its inverse is not implemented.
*/
function PositiveCellHashing() {
    return {
        hash: (x,y) => ((x+y)+1)*((x+y)/2) + y,
    };
}

/* 
`UnboundedCellHashing` generates a namspace with a single pure function exposed, `hash()`.
The function maps any whole number 2d coordinates, regardless of sign, to a unique positive integer.
It is bijective in principle, however its inverse is not implemented.
*/
function UnboundedCellHashing(positive_cell_hashing, math) {
    const abs = math.abs;
    return {
        // there are four quadrants on an unbounded 2d grid, 
        // so multiply the hash for the absolute values by four and offset by a unique id for the quadrant
        hash: (x,y) => 4*positive_cell_hashing.hash(abs(x),abs(y)) + 2*(y<0) + (x<0),
    };
}

/* 
`NodeHashing` generates a namspace with a single pure function exposed, `hash()`.
The function maps any `UserNode` to a unique positive integer.
It is bijective in principle, however its inverse is not implemented.
*/
function NodeHashing(unbounded_cell_hashing) {
    return {
        // A node can be either a position or an arrow reference, 
        // so multiply the hash of either by two and offset by a unique id for the quadrant
        // hash: (node) => (node.position == null? 0 : unbounded_cell_hashing.hash(node.position)) - (node.reference || 0),
        hash: (node) => unbounded_cell_hashing.hash(node.position),
    };
}