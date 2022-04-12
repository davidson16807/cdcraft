'use strict';


/*
`FunctorArc` is a data structure that represents a directed arc in a way that allows easy storage and manipulation by the application.
`source` and `target` are vec2s indicating source and target in cell coordinates. Their components are integers if `is_valid == true`.
`min_length_clockwise` is the minimum length of an arc, where sign inidicates arc chirality (positive values are clockwise).
`target_offset_id` is an ivec2 that represents the direction of an offset applied to the target position to indicate the direction of loops.
`is_valid` is a boolean indicating whether the arc has been associated with a definite source and target cell and should be included in the diagram.
*/
class FunctorArc {
    constructor(source_id, target_id, min_length_clockwise, target_offset_id, is_valid){
        this.source_id = source_id;
        this.target_id = target_id;
        this.min_length_clockwise = min_length_clockwise;
        this.is_valid = is_valid;
    }
    copy(){
        return new FunctorArc(
            this.source_id,
            this.target_id,
            this.min_length_clockwise,
            this.is_valid,
        );
    }
}

