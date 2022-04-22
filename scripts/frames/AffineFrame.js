'use strict';

/*
`AffineFrame` represents a 2d affine transform.
It exists to simplify affine transforms in the 2d case, 
since glm-js does not support multiplication between vec2 and mat3.
*/
class AffineFrame {
    constructor(x, y, origin){
        this.x = x;
        this.y = y;
        this.origin = origin;
    }
    with(attributes){ 
        return new AffineFrame(
            attributes.x      != null? attributes.x      : this.x, 
            attributes.y      != null? attributes.y      : this.y, 
            attributes.origin != null? attributes.origin : this.origin, 
        );
    }
}
