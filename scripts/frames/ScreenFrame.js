'use strict';

/*
`ScreenFrame` is a reference frame that defines the contents of a screen. 
It is defined as a combination of scaling and translation.
Its origin and unit length are each stored in terms of another reference frame that the user must define.
*/
class ScreenFrame {
    constructor(origin, unit_length){
        this.origin = origin;
        this.unit_length = unit_length;
    }
    with(attributes){ 
        return new ScreenFrame(
            attributes.origin      != null? attributes.origin      : this.origin, 
            attributes.unit_length != null? attributes.unit_length : this.unit_length);
    }
}
