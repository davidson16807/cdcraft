'use strict';

/*
`PointArcsAndSamplerArcs` returns a namespace of pure functions that describe maps between `SamplerArc`s and `UserArc`s
*/
function PointArcsAndSamplerArcs(point_arc_properties, math) {
    const sign = math.sign;
    const abs = math.abs;
    const max = math.max;
    return {
        point_arc_to_sampler_arc: function(point_arc) {
            const radius = point_arc_properties.radius(point_arc);
            const origin = point_arc_properties.origin(point_arc, radius);
            const clockwise_sign = sign(point_arc.min_length_clockwise);
            const min_length = abs(point_arc.min_length_clockwise);
            const length = max(abs(point_arc.min_length_clockwise), glm.distance(point_arc.source, point_arc.target));
            const length_clockwise = clockwise_sign * length;
            return new SamplerArc(origin, point_arc.source.sub(origin), length_clockwise);
        },
    };
}