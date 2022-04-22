'use strict';

/*
`UserArcFraming` returns a namespace of pure functions that describe isomorphisms to and from a reference frame.
`enter` accepts a position and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns a position that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/
function UserArcFraming(position_framing){
    const shifting = position_framing;
    return {
        enter: (user_arrow, frame) => 
            new UserArc(
                shifting.enter(user_arrow.source, frame),
                shifting.enter(user_arrow.target, frame),
                user_arrow.min_length_clockwise / frame.unit_length,
            ),
        leave: (user_arrow, frame) =>
            new UserArc(
                shifting.leave(user_arrow.source, frame),
                shifting.leave(user_arrow.target, frame),
                user_arrow.min_length_clockwise * frame.unit_length,
            ),
    };
}
