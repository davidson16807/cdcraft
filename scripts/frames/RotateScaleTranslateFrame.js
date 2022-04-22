'use strict';

/*
`RotateScaleTranslateFrame` is a reference frame defined by taking an orthogonal transformation 
on an implicitly defined reference frame, followed by a translation.
All attributes are stored in terms of the implicitly defined reference frame.
*/
class RotateScaleTranslateFrame {
    constructor(x, origin, unit_length){
        this.x = x;
        this.origin = origin;
    }
    with(attributes){ 
        return new RotateScaleTranslateFrame(
            attributes.x               != null? attributes.x               : this.x, 
            attributes.origin          != null? attributes.origin          : this.origin, 
        );
    }
}
