'use strict';


/*
`SamplerArc` is a data structure that represents a directed arc in a way that allows finding properties along the arc for use in rendering.
*/
class SamplerArc {
    constructor(origin, source_offset, length_clockwise){
        this.origin = Object.freeze(origin);
        this.source_offset = Object.freeze(source_offset);
        this.length_clockwise = Object.freeze(length_clockwise);
    }
    with(attributes){
        return new SamplerArc(
            attributes.origin           != null? attributes.origin           : this.origin,
            attributes.source_offset    != null? attributes.source_offset    : this.source_offset,
            attributes.length_clockwise != null? attributes.length_clockwise : this.length_clockwise,
        );
    }
}
