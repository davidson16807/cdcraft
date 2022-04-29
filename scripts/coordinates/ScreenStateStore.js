'use strict';

/*
`ScreenStateStore` is a data structure that expresses a PanZoomMap 
in a way that can be easily manipulated by the application 
while guaranteeing correctness for all real valued attributes.
"Correctness" here entails the user expectations will not be violated,
namely that the screen is not inverted, so cell_width>0.
*/
class ScreenStateStore {
    constructor(topleft_cell_position, log2_cell_width){
        this.topleft_cell_position = topleft_cell_position;
        this.log2_cell_width = log2_cell_width;
    }
    with(attributes){
        return new ScreenStateStore(
            attributes.topleft_cell_position  != null? attributes.topleft_cell_position  : this.topleft_cell_position, 
            attributes.log2_cell_width        != null? attributes.log2_cell_width        : this.log2_cell_width
        );
    }
}
