'use strict';


/*
`SamplerArc` is a data structure that represents a directed arc in a way that allows finding properties along the arc for use in rendering.
*/
class SamplerArc {
    constructor(origin, source_offset, length_clockwise){
        this.origin = origin;
        this.source_offset = source_offset;
        this.length_clockwise = length_clockwise;
    }
    copy(){
        return new SamplerArc(
            this.origin,
            this.source_offset,
            this.length_clockwise,
        );
    }
}
