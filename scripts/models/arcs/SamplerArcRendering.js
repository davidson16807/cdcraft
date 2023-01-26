'use strict';

/*
`SamplerArcRendering` returns a namespace of pure functions describing a small category mapping arcs to svg depictions
*/
function SamplerArcRendering(sampler_arc_properties){
    const pi = Math.PI;
    const sqrt = Math.sqrt;
    const max = Math.max;
    const abs = Math.abs;
    const cos = Math.cos;
    const sign = Math.sign;
    // A `SvgQuadraticBezier` is a representation for a quadratic Bezier that can be used by svg
    class SvgQuadraticBezier{
        constructor(points){
            this.points = points;
        }
    };

    return {
        sampler_arc_to_svg_bezier: function(sampler_arc, sample_point_count){
            const inscribed_radius = glm.length(sampler_arc.source_offset);
            const inscribed_circumference = 2.0*pi*inscribed_radius;
            const c = 1 / cos(pi * sampler_arc.length_clockwise / (inscribed_circumference*sample_point_count) );

            const inscribed_arc = sampler_arc;
            const circumscribed_arc = new SamplerArc(sampler_arc.origin, sampler_arc.source_offset.mul(c), sampler_arc.length_clockwise*c);

            const points = [ sampler_arc_properties.position(inscribed_arc, 0.0) ];
            for (let i = 1; i <= sample_point_count; i++) {
                points.push(sampler_arc_properties.position(circumscribed_arc, (i-0.5)/sample_point_count));
                points.push(sampler_arc_properties.position(inscribed_arc, i/sample_point_count));
            }

            return new SvgQuadraticBezier(points);
        },
        svg_bezier_to_path: function(bezier){
            const points = bezier.points;
            const source = points[0];
            let output = `M ${source.x} ${source.y}`;
            for (let i = 1; i+1 < points.length; i+=2) {
                const control = points[i];
                const sample = points[i+1];
                output += ` Q ${control.x} ${control.y} ${sample.x} ${sample.y}`;
            }
            return output;
        },
    }
}
