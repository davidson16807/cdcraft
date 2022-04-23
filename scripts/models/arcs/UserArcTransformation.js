'use strict';

/*
`UserArcTransformation` returns a namespace of pure functions that describe isomorphisms to and from a reference frame.
`enter` accepts a position and reference frame, both expressed in terms of an implicit user defined reference frame,
and returns a position that is defined in terms of the reference frame. `leave` is inverse to `enter`.
*/
function UserArcTransformation(position_transformation){
    return {
        enter: (user_arrow, frame) => 
            new UserArc(
                position_transformation.enter(user_arrow.source, frame),
                position_transformation.enter(user_arrow.target, frame),
                user_arrow.min_length_clockwise / frame.unit_length,
            ),
        leave: (user_arrow, frame) =>
            new UserArc(
                position_transformation.leave(user_arrow.source, frame),
                position_transformation.leave(user_arrow.target, frame),
                user_arrow.min_length_clockwise * frame.unit_length,
            ),
    };
}
