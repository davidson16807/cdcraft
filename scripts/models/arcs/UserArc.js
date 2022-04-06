'use strict';

/*
`UserArc` is a data structure that represents a directed arc in a way that can be easily manipulated by user input.
`source` and `target` are vec2 indicating source and target in either cell or screen coordinates.
`min_length_clockwise` is the minimum length of an arc, where sign inidicates arc chirality (positive values are clockwise).
*/
class UserArc {
    constructor(source, target, min_length_clockwise){
        this.source = source;
        this.target = target;
        this.min_length_clockwise = min_length_clockwise;
    }
    copy(){
        return new UserArc(
            this.source,
            this.target,
            this.min_length_clockwise,
        );
    }
}


