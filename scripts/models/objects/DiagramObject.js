'use strict';

/*
`DiagramObject` is a data structure that represents every property of an object that can be depicted within the application.
*/
class DiagramObject {
    constructor(position, symbol, label, label_offset_id, is_edited, is_valid){
        typecheck(position, 'glm_vec2$class+glm_ivec2$class');
        this.position = Object.freeze(position);
        this.symbol = Object.freeze(symbol);
        this.label = Object.freeze(label);
        this.label_offset_id = Object.freeze(label_offset_id);
        this.is_edited = Object.freeze(is_edited);
        this.is_valid = Object.freeze(is_valid);
    }

    with(attributes){
        return new DiagramObject(
            attributes.position        != null? attributes.position        : this.position, 
            attributes.symbol          != null? attributes.symbol          : this.symbol, 
            attributes.label           != null? attributes.label           : this.label, 
            attributes.label_offset_id != null? attributes.label_offset_id : this.label_offset_id, 
            attributes.is_edited       != null? attributes.is_edited       : this.is_edited,
            attributes.is_valid        != null? attributes.is_valid        : this.is_valid,
        );
    }

}
