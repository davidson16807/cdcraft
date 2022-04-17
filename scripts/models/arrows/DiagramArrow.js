'use strict';


/*
`DiagramArrow` is a data structure that represents every property of an arrow that can be depicted within the application
*/
class DiagramArrow {
    constructor(
        arc, is_edited, label, label_offset, 
        source_style_id, end_style_id, line_style_id, 
    ){
        Object.defineProperty(this, 'arc',  {get: ()=> arc});
        Object.defineProperty(this, 'is_edited',  {get: ()=> is_edited});
        Object.defineProperty(this, 'label',  {get: ()=> label});
        Object.defineProperty(this, 'label_offset',  {get: ()=> label_offset});
        Object.defineProperty(this, 'source_style_id',  {get: ()=> source_style_id});
        Object.defineProperty(this, 'end_style_id',  {get: ()=> end_style_id});
        Object.defineProperty(this, 'line_style_id',  {get: ()=> line_style_id});
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
