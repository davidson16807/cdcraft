'use strict';


/*
`OffsetFrameShifting` returns a namespace of pure functions that describe an isomorphism.
`enter` accepts a offset and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns a offset that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/
function OffsetFrameShifting(){
    return {
        enter: (position, frame) => position.div(frame.unit_length),
        leave: (position, frame) => position.mul(frame.unit_length),
    };
}

/*
`PositionFrameShifting` returns a namespace of pure functions that describe an isomorphism.
`enter` accepts a position and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns a position that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/
function PositionFrameShifting(){
    return {
        enter: (position, frame) => position.sub(frame.origin).div(frame.unit_length),
        leave: (position, frame) => position.mul(frame.unit_length).add(frame.origin),
    };
}


/*
`ReferenceFrameShifting` returns a namespace of pure functions that describe an isomorphism
`enter` accepts two reference frames, both expressed in terms of an implicit user defined reference frame,
and returns a new reference frame that is the first defined in terms of the second. `leave` is inverse to `enter`.
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
