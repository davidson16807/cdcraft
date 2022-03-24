'use strict';

/*
`SvgArc` is a data structure that represents a directed arc using the same method as an svg path
*/
class SvgArc{
    constructor(source, target, radius, is_large_arc, is_clockwise){
        this.source = source;
        this.target = target;
        this.radius = radius;
        this.is_large_arc = is_large_arc;
        this.is_clockwise = is_clockwise;
    }
    copy(){
        return new SvgArc(
            this.source,
            this.target,
            this.radius,
            this.is_large_arc,
            this.is_clockwise,
        );
    }
};
