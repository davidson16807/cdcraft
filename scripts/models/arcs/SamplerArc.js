'use strict';


/*
`SamplerArc` is a data structure that represents a directed arc in a way that allows finding properties along the arc for use in rendering.
*/
class SamplerArc {
    constructor(origin, source_offset, length_clockwise){
        Object.defineProperty(this, 'origin',  {get: ()=> origin});
        Object.defineProperty(this, 'source_offset',  {get: ()=> source_offset});
        Object.defineProperty(this, 'length_clockwise',  {get: ()=> length_clockwise});
    }
    with(attributes){
        return new SamplerArc(
            attributes.origin           != null? attributes.origin           : this.origin,
            attributes.source_offset    != null? attributes.source_offset    : this.source_offset,
            attributes.length_clockwise != null? attributes.length_clockwise : this.length_clockwise,
        );
    }
}
