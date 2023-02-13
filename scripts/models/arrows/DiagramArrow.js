'use strict';


/*
`DiagramArrow` is a data structure that represents every property of an arrow that can be depicted within the application
*/
class DiagramArrow {
    constructor(
        arc, is_edited, label, label_offset_id, 
        head_style_id, line_style_id, tail_style_id, 
        line_count, color
    ){
        typecheck(arc,             'StoredArc');
        typecheck(is_edited,       'Boolean');
        typecheck(label,           'String');
        typecheck(label_offset_id, '1+glm_ivec2$class');
        typecheck(head_style_id, 'Number');
        typecheck(line_style_id,   'Number');
        typecheck(tail_style_id, 'Number');
        typecheck(line_count,      'Number');
        typecheck(color,           '1+String');
        this.arc = Object.freeze(arc);
        this.is_edited = Object.freeze(is_edited);
        this.label = Object.freeze(label);
        this.label_offset_id = Object.freeze(label_offset_id);
        this.head_style_id = Object.freeze(head_style_id);
        this.line_style_id = Object.freeze(line_style_id);
        this.tail_style_id = Object.freeze(tail_style_id);
        this.line_count = Object.freeze(line_count);
        this.color = Object.freeze(color);
    }

    with(attributes){
        return new DiagramArrow(
            attributes.arc             != null? attributes.arc             : this.arc,
            attributes.is_edited       != null? attributes.is_edited       : this.is_edited,
            attributes.label           != null? attributes.label           : this.label,
            attributes.label_offset_id != null? attributes.label_offset_id : this.label_offset_id,
            attributes.head_style_id != null? attributes.head_style_id : this.head_style_id,
            attributes.line_style_id   != null? attributes.line_style_id   : this.line_style_id,
            attributes.tail_style_id != null? attributes.tail_style_id : this.tail_style_id,
            attributes.line_count      != null? attributes.line_count      : this.line_count,
            attributes.color           != null? attributes.color           : this.color,
        );
    }

}
