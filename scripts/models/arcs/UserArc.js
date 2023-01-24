'use strict';

/*
`UserArc` is a data structure that represents a directed arc in a way that can be easily manipulated by user input.
`source` and `target` are `UserNode` objects that indicate both the mouse/touchpad position 
selected by the user and the object that point refers to, if any.
`min_length_clockwise` is the minimum length of an arc, where sign inidicates arc chirality (positive values are clockwise).
*/
class UserArc {
    constructor(source, target, min_length_clockwise){
        this.source = Object.freeze(source);
        this.target = Object.freeze(target);
        this.min_length_clockwise = Object.freeze(min_length_clockwise);
        if(this.source.constructor.name != 'UserNode') { console.log(this.source.constructor.name); throw new Error();}
        if(this.target.constructor.name != 'UserNode') { console.log(this.target.constructor.name); throw new Error();}
    }
    with(attributes){
        return new UserArc(
            attributes.source                != null? attributes.source                : this.source,
            attributes.target                != null? attributes.target                : this.target,
            attributes.min_length_clockwise  != null? attributes.min_length_clockwise  : this.min_length_clockwise,
        );
    }
}


