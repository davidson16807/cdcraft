'use strict';

/*
`*ScaleTranslateFraming` functions return a namespace of pure functions that describe an isomorphism.
`enter` accepts an object and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns an object that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/

/*
`PositionAffineFraming` transforms positions using an affine transformation.
`enter()` exists but is not implemented.
*/
function PositionAffineFraming(){
    return {
        leave: (position, frame) => 
            frame.origin
                .add(frame.y.mul(position.y))
                .add(frame.x.mul(position.x)),
    };
}

/*
`OffsetAffineFraming` transforms offset using an affine transformation.
`enter()` exists but is not implemented.
*/
function OffsetAffineFraming(){
    return {
        leave: (offset, frame) => 
            frame.y.mul(offset.y).add(frame.x.mul(offset.x)),
    };
}

/*
`AffineReframing` transforms an affine frame using an affine transformation.
`enter()` exists but is not implemented.
*/
function AffineReframing(offset_framing, position_framing){
    return {
        leave: (frame1, frame2) => 
            new AffineFrame(
                x:      offset_framing.enter(frame1.x, frame2),
                y:      offset_framing.enter(frame1.y, frame2),
                origin: position_framing.enter(frame1.origin, frame2),
            ),
    };
}