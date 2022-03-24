'use strict';

/*
`DiagramReferenceFrame` is a data structure that can be considered a degenerate case of an affine transform.
It permits scaling and translation but forbids rotation and shearing.
Its origin and unit length are each stored in terms of another reference frame that the user must define.
*/
class DiagramReferenceFrame {
    constructor(origin, unit_length){
        this.origin = origin;
        this.unit_length = unit_length;
    }
    copy(){ 
        return new DiagramReferenceFrame(this.origin, this.unit_length);
    }
}
