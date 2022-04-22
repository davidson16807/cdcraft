'use strict';

/*
`ScreenReferenceFrameStorage` returns a namespace of pure functions that describe the isomorphism 
between a ScreenReferenceFrame and a ScaleTranslateFrame expressed in terms of "model space"
where each cell is of unit length.
*/
function ScreenReferenceFrameStorage(){
    const pow = Math.pow;
    const log2 = Math.log2;
    return {
        pack: (frame) => new ScreenReferenceFrameStore(frame.origin, log2(1/frame.unit_length)),
        unpack: (store) => new ScaleTranslateFrame(store.topleft_cell_position, 1/pow(2, store.log2_cell_width)),
    };
}
