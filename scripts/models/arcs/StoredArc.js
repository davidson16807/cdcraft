'use strict';


/*
`StoredArc` is a data structure that represents a directed arc in a way that allows easy storage and manipulation by the application.
`source` and `target` are instances of `ArcHandle` that represent a handle chosen to represent for source and target,
 either as glm.vec2s indicating coordinates in cell space (if is_valid == true), 
 cell ids (ids if `is_valid == true`), or arrow ids (if the arrow is a functor).
`min_length_clockwise` is the minimum length of an arc, where sign inidicates arc chirality (positive values are clockwise).
`chord_direction` is an ivec2 that represents the direction of an offset applied to the target position to indicate the direction of loops.
`is_valid` is a boolean indicating whether the arc has been associated with a definite source and target cell and should be included in the diagram.
*/
class StoredArc {
    constructor(source, target, min_length_clockwise, chord_direction, is_valid){
        Object.defineProperty(this, 'source',  {get: ()=> source});
        Object.defineProperty(this, 'target',  {get: ()=> target});
        Object.defineProperty(this, 'min_length_clockwise',  {get: ()=> min_length_clockwise});
        Object.defineProperty(this, 'chord_direction',  {get: ()=> chord_direction});
        Object.defineProperty(this, 'is_valid',  {get: ()=> is_valid});
    }
    with(attributes){
        return new StoredArc(
            attributes.source               != null? attributes.source               : this.source,
            attributes.target               != null? attributes.target               : this.target,
            attributes.min_length_clockwise != null? attributes.min_length_clockwise : this.min_length_clockwise,
            attributes.chord_direction     != null? attributes.chord_direction     : this.chord_direction,
            attributes.is_valid             != null? attributes.is_valid             : this.is_valid,
        );
    }
}

