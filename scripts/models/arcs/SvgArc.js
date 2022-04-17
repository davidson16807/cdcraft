'use strict';

/*
`SvgArc` is a data structure that represents a directed arc using the same method as an svg path
*/
class SvgArc{
    constructor(source, target, radius, is_large_arc, is_clockwise){
        Object.defineProperty(this, 'source',  {get: ()=> source});
        Object.defineProperty(this, 'target',  {get: ()=> target});
        Object.defineProperty(this, 'radius',  {get: ()=> radius});
        Object.defineProperty(this, 'is_large_arc',  {get: ()=> is_large_arc});
        Object.defineProperty(this, 'is_clockwise',  {get: ()=> is_clockwise});
    }
    with(attributes){
        return new SvgArc(
            attributes.source       != null? attributes.source       : this.source,
            attributes.target       != null? attributes.target       : this.target,
            attributes.radius       != null? attributes.radius       : this.radius,
            attributes.is_large_arc != null? attributes.is_large_arc : this.is_large_arc,
            attributes.is_clockwise != null? attributes.is_clockwise : this.is_clockwise,
        );
    }
};
