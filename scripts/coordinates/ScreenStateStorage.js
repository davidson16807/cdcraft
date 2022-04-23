'use strict';

/*
`ScreenStateStorage` returns a namespace of pure functions that map between 
a ScreenStateStore and screen state.
*/
function ScreenStateStorage(){
    const pow = Math.pow;
    const log2 = Math.log2;
    return {
        pack: (frame) => new ScreenStateStore(frame.origin, log2(1/frame.unit_length)),
        unpack: (store) => new PanZoomMap(store.topleft_cell_position, 1/pow(2, store.log2_cell_width)),
    };
}
