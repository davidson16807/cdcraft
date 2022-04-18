'use strict';

/*
`*FrameShifting` functions return a namespace of pure functions that describe an isomorphism.
`enter` accepts an object and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns an object that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/

/*
`OffsetFrameShifting` operates on "offsets": differences between vectors that are not subject to translation across frame shifts.
*/
function OffsetFrameShifting(){
    return {
        enter: (offset, frame) => offset.div(frame.unit_length),
        leave: (offset, frame) => offset.mul(frame.unit_length),
    };
}

/*
`PositionFrameShifting` operates on "positions": vectors that are translated and scaled across frame shifts.
*/
function PositionFrameShifting(){
    return {
        enter: (position, frame) => position.sub(frame.origin).div(frame.unit_length),
        leave: (position, frame) => position.mul(frame.unit_length).add(frame.origin),
    };
}

/*
`DistanceFrameShifting` operates on "distances": the magntudes of offsets are are only subject to scaling across frame shifts
*/
function DistanceFrameShifting(){
    return {
        enter: (distance, frame) => distance/frame.unit_length,
        leave: (distance, frame) => distance*frame.unit_length,
    };
}

/*
`ReferenceFrameShifting` operates on reference frames themselves.
*/
function ReferenceFrameShifting(position_frame_shifting){
    const shifting = position_frame_shifting;
    return {
        enter: (frame1, frame2) => 
            new DiagramReferenceFrame(
                shifting.enter(frame1.origin, frame2),
                frame1.unit_length / frame2.unit_length,
            ),
        leave: (frame1, frame2) =>
            new DiagramReferenceFrame(
                shifting.leave(frame1.origin, frame2),
                frame1.unit_length * frame2.unit_length,
            ),
    };
}
