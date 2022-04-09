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

    copy(){
        return new DiagramArrow(
            this.arc.copy(),
            this.is_edited,
            this.label,
            this.label_offset,
            this.source_style_id,
            this.end_style_id,
            this.line_style_id,
        );
    }

}
