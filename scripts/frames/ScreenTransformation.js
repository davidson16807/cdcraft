'use strict';

/*
`*ScaleTranslateTransformation` functions return a namespace of pure functions that describe an isomorphism.
`enter` accepts an object and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns an object that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/

/*
`OffsetScreenTransformation` operates on "offsets": differences between vectors that are not subject to translation across frame shifts.
*/
function OffsetScreenTransformation(){
    return {
        enter: (offset, frame) => offset.div(frame.unit_length),
        leave: (offset, frame) => offset.mul(frame.unit_length),
    };
}

/*
`PositionScreenTransformation` operates on "positions": vectors that are translated and scaled across frame shifts.
*/
function PositionScreenTransformation(){
    return {
        enter: (position, frame) => position.sub(frame.origin).div(frame.unit_length),
        leave: (position, frame) => position.mul(frame.unit_length).add(frame.origin),
    };
}

/*
`DistanceScreenTransformation` operates on "distances": the magntudes of offsets are are only subject to scaling across frame shifts
*/
function DistanceScreenTransformation(){
    return {
        enter: (distance, frame) => distance/frame.unit_length,
        leave: (distance, frame) => distance*frame.unit_length,
    };
}

/*
`ScreenTransformation` operates on reference frames themselves.
*/
function ScreenFrameScreenTransformation(){
    return {
        enter: (frame, entered) => 
            new ScaleTranslateFrame(
                position.sub(frame.origin).div(frame.unit_length),
                distance/frame.unit_length,
            ),
        leave: (frame, left) =>
            new ScaleTranslateFrame(
                position.mul(frame.unit_length).add(frame.origin),
                distance*frame.unit_length,
            ),
    };
}
