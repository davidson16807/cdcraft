'use strict';

/*
`PointArcsAndSamplerArcs` returns a namespace of pure functions that describe maps between `SamplerArc`s and `UserArc`s
*/
function PointArcsAndSamplerArcs(arc_geometry, math) {
    const sign = math.sign;
    const abs = math.abs;
    const max = math.max;
    return {
        flat_arc_to_sampler_arc: function(flat_arc) {
            const radius = arc_geometry.radius(flat_arc.source, flat_arc.target, flat_arc.min_length_clockwise);
            const origin = arc_geometry.origin(flat_arc.source, flat_arc.target, flat_arc.min_length_clockwise, radius);
            const clockwise_sign = sign(flat_arc.min_length_clockwise);
            const min_length = abs(flat_arc.min_length_clockwise);
            const length = max(abs(flat_arc.min_length_clockwise), glm.distance(flat_arc.source, flat_arc.target));
            const length_clockwise = clockwise_sign * length;
            return new SamplerArc(origin, flat_arc.source.sub(origin), length_clockwise);
        },
    };
}