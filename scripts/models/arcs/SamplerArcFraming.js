'use strict';

/*
`SamplerArcFraming` returns a namespace of pure functions that describe isomorphisms to and from a reference frame.
`enter` accepts a position and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns a position that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/
function SamplerArcFraming(offset_framing, position_framing){
    return {
        enter: (user_arrow, frame) => 
            new SamplerArc(
                position_framing.enter(user_arrow.origin, frame),
                offset_framing.enter(user_arrow.source_offset, frame),
                user_arrow.length_clockwise / frame.unit_length,
            ),
        leave: (user_arrow, frame) =>
            new SamplerArc(
                position_framing.leave(user_arrow.origin, frame),
                offset_framing.leave(user_arrow.source_offset, frame),
                user_arrow.length_clockwise * frame.unit_length,
            ),
    };
}
