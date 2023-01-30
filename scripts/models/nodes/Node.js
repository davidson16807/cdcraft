'use strict';

/*
`Node` is a data structure that represents the source or target of a `UserArc`.
It stores both a `position` selected by the user with a mouse/touchpad
as well as an object `reference` that is indicated by that position.
Currently only `UserArc` is used in practice as the reference,
and no need is foreseen to support other objects, however other data types are possible.
`reference` is undefined if no object is represented by `position`.
*/
class Node {

    constructor(position, reference){
        typecheck(position, 'glm_vec2$class+glm_ivec2$class+1');
        typecheck(reference, 'Number+1');
        this.position = Object.freeze(position);
        this.reference = Object.freeze(reference);
    }

    with(attributes){
        return new Node(
            attributes.position  != null? attributes.position  : this.position,
            attributes.reference != null? attributes.reference : this.reference,
        );
    }

}
