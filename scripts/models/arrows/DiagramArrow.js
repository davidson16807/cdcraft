'use strict';


/*
`DiagramArrow` is a data structure that represents every property of an arrow that can be depicted within the application
*/
class DiagramArrow {
    constructor(
        arc, is_edited, label, label_offset, 
        source_style_id, end_style_id, line_style_id, 
    ){
        this.arc = arc;
        this.is_edited = is_edited || false;
        this.label = label || "";
        this.label_offset = label_offset || 1;
        this.source_style_id = source_style_id || 0;
        this.end_style_id = end_style_id || 0;
        this.line_style_id = line_style_id || 0;
    }

    with(attributes){
        return new DiagramArrow(
            attributes.arc              != null? attributes.arc              : this.arc,
            attributes.is_edited        != null? attributes.is_edited        : this.is_edited,
            attributes.label            != null? attributes.label            : this.label,
            attributes.label_offset     != null? attributes.label_offset     : this.label_offset,
            attributes.source_style_id  != null? attributes.source_style_id  : this.source_style_id,
            attributes.end_style_id     != null? attributes.end_style_id     : this.end_style_id,
            attributes.line_style_id    != null? attributes.line_style_id    : this.line_style_id,
        );
    }

}
