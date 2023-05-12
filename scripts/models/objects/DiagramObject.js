'use strict';

/*
`DiagramObject` is a data structure that represents every property of an object that can be depicted within the application.
*/
class DiagramObject {
    constructor(position, color, symbol, label, label_offset_id, is_edited, is_valid){
        typecheck(position, 'glm_vec2$class+glm_ivec2$class');
        typecheck(color,           '1+String');
        typecheck(symbol,          '1+String');
        typecheck(label,           '1+String');
        typecheck(label_offset_id, '1+glm_ivec2$class');
        typecheck(is_edited,       '1+Boolean');
        typecheck(is_valid,        '1+Boolean');
        this.position = Object.freeze(position);
        this.symbol = Object.freeze(symbol);
        this.label = Object.freeze(label);
        this.label_offset_id = Object.freeze(label_offset_id);
        this.color = Object.freeze(color);
        this.is_edited = Object.freeze(is_edited??false);
        this.is_valid = Object.freeze(is_valid??true);
    }

    with(attributes){
        return new DiagramObject(
            attributes.position        !=  null?      attributes.position        : this.position, 
            attributes.color           !== undefined? attributes.color           : this.color, 
            attributes.symbol          !== undefined? attributes.symbol          : this.symbol, 
            attributes.label           !== undefined? attributes.label           : this.label, 
            attributes.label_offset_id !== undefined? attributes.label_offset_id : this.label_offset_id, 
            attributes.is_edited       !== undefined? attributes.is_edited       : this.is_edited,
            attributes.is_valid        !== undefined? attributes.is_valid        : this.is_valid,
        );
    }

}
