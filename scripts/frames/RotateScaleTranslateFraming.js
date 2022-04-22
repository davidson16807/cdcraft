'use strict';

/*
`*ScaleTranslateFraming` functions return a namespace of pure functions that describe an isomorphism.
`enter` accepts an object and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns an object that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/

/*
`PositionRotateScaleTranslateFraming` transforms positions using an RotateScaleTranslate transformation.
`enter()` exists but is not implemented.
*/
function PositionRotateScaleTranslateFraming(){
    return {
        leave: (position, frame) => 
            frame.origin
                .add(frame.x.mul(position.x))
                .add(glm.vec2(frame.x.y, -frame.x.x).mul(position.y))
    };
}

/*
`OffsetRotateScaleTranslateFraming` transforms offset using an RotateScaleTranslate transformation.
`enter()` exists but is not implemented.
*/
function OffsetRotateScaleTranslateFraming(){
    return {
        leave: (offset, frame) => 
            frame.x.mul(position.x).add(glm.vec2(frame.x.y, -frame.x.x).mul(position.y)),
    };
}

/*
`RotateScaleTranslateReframing` transforms an RotateScaleTranslate frame using an RotateScaleTranslate transformation.
`enter()` exists but is not implemented.
*/
function RotateScaleTranslateReframing(offset_framing, position_framing){
    return {
        leave: (frame1, frame2) => 
            new RotateScaleTranslateFrame(
                x:      offset_framing.enter(frame1.x, frame2),
                origin: position_framing.enter(frame1.origin, frame2),
            ),
    };
}