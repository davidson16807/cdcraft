'use strict';

/*
`ScaleTranslateFrame` is a data structure represents a reference frame defined by a scale and translation operation.
Its origin and unit length are each stored in terms of another reference frame that the user must define.
*/
class ScaleTranslateFrame {
    constructor(origin, unit_length){
        this.origin = origin;
        this.unit_length = unit_length;
    }
    with(attributes){ 
        return new ScaleTranslateFrame(
            attributes.origin      != null? attributes.origin      : this.origin, 
            attributes.unit_length != null? attributes.unit_length : this.unit_length);
    }
}
