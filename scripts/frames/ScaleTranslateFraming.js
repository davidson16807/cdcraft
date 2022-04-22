'use strict';

/*
`*ScaleTranslateFraming` functions return a namespace of pure functions that describe an isomorphism.
`enter` accepts an object and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns an object that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/

/*
`OffsetScaleTranslateFraming` operates on "offsets": differences between vectors that are not subject to translation across frame shifts.
*/
function OffsetScaleTranslateFraming(){
    return {
        enter: (offset, frame) => offset.div(frame.unit_length),
        leave: (offset, frame) => offset.mul(frame.unit_length),
    };
}

/*
`PositionScaleTranslateFraming` operates on "positions": vectors that are translated and scaled across frame shifts.
*/
function PositionScaleTranslateFraming(){
    return {
        enter: (position, frame) => position.sub(frame.origin).div(frame.unit_length),
        leave: (position, frame) => position.mul(frame.unit_length).add(frame.origin),
    };
}

/*
`DistanceScaleTranslateFraming` operates on "distances": the magntudes of offsets are are only subject to scaling across frame shifts
*/
function DistanceScaleTranslateFraming(){
    return {
        enter: (distance, frame) => distance/frame.unit_length,
        leave: (distance, frame) => distance*frame.unit_length,
    };
}

/*
`ScaleTranslateReframing` operates on reference frames themselves.
*/
function ScaleTranslateReframing(position_framing){
    const shifting = position_framing;
    return {
        enter: (frame, entered) => 
            new ScaleTranslateFrame(
                shifting.enter(frame.origin, entered),
                frame.unit_length / entered.unit_length,
            ),
        leave: (frame, left) =>
            new ScaleTranslateFrame(
                shifting.leave(frame.origin, left),
                frame.unit_length * left.unit_length,
            ),
    };
}
