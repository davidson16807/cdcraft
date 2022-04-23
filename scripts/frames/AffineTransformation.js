'use strict';

/*
`*AffineTransformation` functions return a namespace of pure functions that describe an isomorphism.
`enter` accepts an object and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns an object that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/

/*
`PositionAffineTransformation` transforms positions using an affine transformation.
`enter()` exists but is not implemented.
*/
function PositionAffineTransformation(){
    return {
        leave: (position, frame) => 
            frame.origin
                .add(frame.y.mul(position.y))
                .add(frame.x.mul(position.x)),
    };
}

/*
`OffsetAffineTransformation` transforms offset using an affine transformation.
`enter()` exists but is not implemented.
*/
function OffsetAffineTransformation(){
    return {
        leave: (offset, frame) => 
            frame.y.mul(offset.y).add(frame.x.mul(offset.x)),
    };
}

/*
`AffineFrameTransformation` transforms an affine frame using an arbitrary transformation.
*/
function AffineFrameTransformation(offset_transformation, position_transformation){
    return {
        enter: (frame1, frame2) => 
            new AffineFrame(
                offset_transformation.enter(frame1.x, frame2),
                offset_transformation.enter(frame1.y, frame2),
                position_transformation.enter(frame1.origin, frame2),
            ),
        leave: (frame1, frame2) => 
            new AffineFrame(
                offset_transformation.leave(frame1.x, frame2),
                offset_transformation.leave(frame1.y, frame2),
                position_transformation.leave(frame1.origin, frame2),
            ),
    };
}
