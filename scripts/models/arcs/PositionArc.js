'use strict';

/*
`PositionArc` represents an arc where the source and target are stored as 
vectors in cell space, rather than as nodes. 

A `Node` is a polymorphic interface that represents sources or targets 
in one of several ways. For instance, the node could indicate the index 
of an arrow in a list, in which case the arrow represents a higher level 
construct such as a functor, or the node could store the position of a
source or target directly in cell space. 

A user arc store its source and target as nodes, so the map from user arcs to 
position arcs is necessary to handle the case where the position of a source or 
target must be calculated from the positions of other entities in the diagram.
*/
class PositionArc {
    constructor(source, target, min_length_clockwise){
        Object.defineProperty(this, 'source',  {get: ()=> source});
        Object.defineProperty(this, 'target',  {get: ()=> target});
        Object.defineProperty(this, 'min_length_clockwise',  {get: ()=> min_length_clockwise});
    }
    with(attributes){
        return new PositionArc(
            attributes.source                != null? attributes.source                : this.source,
            attributes.target                != null? attributes.target                : this.target,
            attributes.min_length_clockwise  != null? attributes.min_length_clockwise  : this.min_length_clockwise,
        );
    }
}


