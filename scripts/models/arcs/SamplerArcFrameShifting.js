'use strict';

/*
`SamplerArcFrameShifting` returns a namespace of pure functions that describe isomorphisms to and from a reference frame.
`enter` accepts a position and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns a position that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/
function SamplerArcFrameShifting(offset_frame_shifting, position_frame_shifting){
    return {
        enter: (user_arrow, frame) => 
            new SamplerArc(
                position_frame_shifting.enter(user_arrow.origin, frame),
                offset_frame_shifting.enter(user_arrow.source_offset, frame),
                user_arrow.length_clockwise / frame.unit_length,
            ),
        leave: (user_arrow, frame) =>
            new SamplerArc(
                position_frame_shifting.leave(user_arrow.origin, frame),
                offset_frame_shifting.leave(user_arrow.source_offset, frame),
                user_arrow.length_clockwise * frame.unit_length,
            ),
    };
}
