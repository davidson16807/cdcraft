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
        this.source = source;
        this.target = target;
        this.min_length_clockwise = min_length_clockwise;
        this.target_offset_id = target_offset_id;
        this.is_valid = is_valid;
    }
    copy(){
        return new StoredArc(
            this.source,
            this.target,
            this.min_length_clockwise,
            this.target_offset_id,
            this.is_valid,
        );
    }
}
