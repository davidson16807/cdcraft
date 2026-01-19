'use strict';

/*
`DiagramArrow` is a data structure that represents every property of an arrow that can be depicted within the application
*/
class DiagramArrow {
    constructor(
        arc, 
        head_style_id, line_style_id, body_style_id, tail_style_id, 
        head_count, line_count, body_count, tail_count, 
        color, label, label_offset_id, 
        is_edited, 
    ){
        typecheck(arc,             'StoredArc');
        typecheck(line_style_id,   'Number');
        typecheck(head_style_id,   'Number');
        typecheck(body_style_id,   'Number');
        typecheck(tail_style_id,   'Number');
        typecheck(line_count,      'Number');
        typecheck(head_count,      'Number');
        typecheck(body_count,      'Number');
        typecheck(tail_count,      'Number');
        typecheck(color,           '1+String');
        typecheck(label,           '1+String');
        typecheck(label_offset_id, '1+glm_ivec2$class');
        typecheck(is_edited,       '1+Boolean');
        this.arc = Object.freeze(arc);
        this.head_style_id = Object.freeze(head_style_id);
        this.line_style_id = Object.freeze(line_style_id);
        this.body_style_id = Object.freeze(body_style_id);
        this.tail_style_id = Object.freeze(tail_style_id);
        this.head_count = Object.freeze(head_count);
        this.line_count = Object.freeze(line_count);
        this.body_count = Object.freeze(body_count);
        this.tail_count = Object.freeze(tail_count);
        this.label = Object.freeze(label);
        this.label_offset_id = Object.freeze(label_offset_id);
        this.color = Object.freeze(color);
        this.is_edited = Object.freeze(is_edited??false);
    }

    with(attributes){
        const is_edited = attributes.is_edited != null? attributes.is_edited : this.is_edited;
        return new DiagramArrow(
            attributes.arc             != null? attributes.arc             : this.arc.with({is_valid:!is_edited}),
            attributes.head_style_id   != null? attributes.head_style_id   : this.head_style_id,
            attributes.line_style_id   != null? attributes.line_style_id   : this.line_style_id,
            attributes.body_style_id   != null? attributes.body_style_id   : this.body_style_id,
            attributes.tail_style_id   != null? attributes.tail_style_id   : this.tail_style_id,
            attributes.head_count      != null? attributes.head_count      : this.head_count,
            attributes.line_count      != null? attributes.line_count      : this.line_count,
            attributes.body_count      != null? attributes.body_count      : this.body_count,
            attributes.tail_count      != null? attributes.tail_count      : this.tail_count,
            attributes.color           != null? attributes.color           : this.color,
            attributes.label           != null? attributes.label           : this.label,
            attributes.label_offset_id != null? attributes.label_offset_id : this.label_offset_id,
            is_edited,
        );
    }

}
