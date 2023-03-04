'use strict';


/*
`LatexArc` is a data structure that represents a directed arc in the same manner as in LaTeX
*/
class LatexArc {
    constructor(source, target, angle){
        this.source = Object.freeze(source);
        this.target = Object.freeze(target);
        this.angle = Object.freeze(angle);
        this.bends_right = Object.freeze(bends_right);
    }
    with(attributes){
        return new LatexArc(
            attributes.origin      != null? attributes.origin      : this.origin,
            attributes.target      != null? attributes.target      : this.target,
            attributes.angle       != null? attributes.angle       : this.angle,
            attributes.bends_right != null? attributes.bends_right : this.bends_right,
        );
    }
}
