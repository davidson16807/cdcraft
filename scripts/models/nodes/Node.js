'use strict';


/*
A `Node` is a data structure that represent the start or end position of an arc.
This includes "cell nodes" that store a `glm.vec2` indicating coordinates in cell space,
and "arrow nodes" that store an index in a list of arrows, 
indicating the source or target of a functor arrow.
`Node` can be considered a tuple `(type, value)`,
where `type` is the type of node (e.g. functor, position),
and `value` is a data structure associated with that type.
*/
class Node {
    constructor(type, value){
        Object.defineProperty(this, 'type',  {get: ()=> type});
        Object.defineProperty(this, 'value',  {get: ()=> value});
    }
    with(attributes){
        return new Node(
            attributes.type   != null? attributes.type   : this.type,
            attributes.value  != null? attributes.value  : this.value,
        );
    }
}
