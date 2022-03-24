'use strict';

/*
`ScreenReferenceFrame` is a data structure that expresses a DiagramReferenceFrame 
in a way that can be easily manipulated by the application while guaranteeing correctness 
for all real valued attributes.
*/
class ScreenReferenceFrameStore {
    constructor(topleft_cell_position, log2_cell_width){
        this.topleft_cell_position = topleft_cell_position;
        this.log2_cell_width = log2_cell_width;
    }
    copy(){
        return new ScreenReferenceFrameStore(this.topleft_cell_position, this.log2_cell_width);
    }
}
