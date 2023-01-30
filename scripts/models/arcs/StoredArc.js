'use strict';


/*
`StoredArc` is a data structure that represents a directed arc in a way that allows easy storage and manipulation by the application.
`source` and `target` are vec2s indicating source and target in cell coordinates. Their components are integers if `is_valid == true`.
`min_length_clockwise` is the minimum length of an arc, where sign inidicates arc chirality (positive values are clockwise).
`target_offset_id` is an ivec2 that represents the direction of an offset applied to the target position to indicate the direction of loops.
`is_valid` is a boolean indicating whether the arc has been associated with a definite source and target cell and should be included in the diagram.
*/
class StoredArc {
    constructor(source, target, min_length_clockwise, target_offset_id, is_valid){
        typecheck(source, 'Node')
        typecheck(target, 'Node')
        this.source = Object.freeze(source);
        this.target = Object.freeze(target);
        this.min_length_clockwise = Object.freeze(min_length_clockwise);
        this.target_offset_id = Object.freeze(target_offset_id);
        this.is_valid = Object.freeze(is_valid);
    }
    with(attributes){
        return new StoredArc(
            attributes.source               != null? attributes.source               : this.source,
            attributes.target               != null? attributes.target               : this.target,
            attributes.min_length_clockwise != null? attributes.min_length_clockwise : this.min_length_clockwise,
            attributes.target_offset_id     != null? attributes.target_offset_id     : this.target_offset_id,
            attributes.is_valid             != null? attributes.is_valid             : this.is_valid,
        );
    }
}

