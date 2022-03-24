'use strict';


/*
`UserArcsAndSamplerArcs` returns a namespace of pure functions that describe maps between `SamplerArc`s and `UserArc`s
*/
function UserArcsAndSamplerArcs(arc_geometry) {
    const sign = Math.sign;
    const abs = Math.abs;
    const max = Math.max;
    return {
        user_arc_to_sampler_arc: function(user_arc) {
            const radius = arc_geometry.radius(user_arc.source, user_arc.target, user_arc.min_length_clockwise);
            const origin = arc_geometry.origin(user_arc.source, user_arc.target, user_arc.min_length_clockwise, radius);
            const clockwise_sign = sign(user_arc.min_length_clockwise);
            const min_length = abs(user_arc.min_length_clockwise);
            const length = max(abs(user_arc.min_length_clockwise), glm.distance(user_arc.source, user_arc.target));
            const length_clockwise = clockwise_sign * length;
            return new SamplerArc(origin, user_arc.source.sub(origin), length_clockwise);
        },
    };
}


