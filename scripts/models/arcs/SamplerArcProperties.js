'use strict';

/*
`SamplerArcProperties` returns a namespace of pure functions describing properties for any point along a `SamplerArc`
*/
function SamplerArcProperties(){
    const pi = Math.PI;
    const cos = Math.cos;
    const sin = Math.sin;
    const sign = Math.sign;
    return {
        normal: function (sampler_arc, distance) {
            const v = glm.normalize(sampler_arc.source_offset);
            const radius = glm.length(sampler_arc.source_offset);
            const theta = distance / radius;
            return glm.vec2(
                v.x * cos(theta) - v.y * sin(theta),
                v.x * sin(theta) + v.y * cos(theta),
            );
        },
        tangent: function (sampler_arc, distance) {
            const v = glm.normalize(sampler_arc.source_offset);
            const radius = glm.length(sampler_arc.source_offset);
            const theta = (distance / radius) + pi/2.0* sign(sampler_arc.length_clockwise) ;
            return glm.vec2(
                v.x * cos(theta) - v.y * sin(theta),
                v.x * sin(theta) + v.y * cos(theta),
            );
        },
        position: function (sampler_arc, distance){
            const v = sampler_arc.source_offset;
            const radius = glm.length(sampler_arc.source_offset);
            const theta = distance / radius;
            return radius == 0? 
                  sampler_arc.origin 
                : glm.vec2(
                    v.x * cos(theta) - v.y * sin(theta),
                    v.x * sin(theta) + v.y * cos(theta),
                ).add(sampler_arc.origin);
        },
        frame: function(sampler_arc, distance) {
            const v = sampler_arc.source_offset;
            const vhat = glm.normalize(v);
            const radius = glm.length(sampler_arc.source_offset);
            const theta = distance / radius;
            const theta_offset = theta + pi/2.0* sign(sampler_arc.length_clockwise);
            return new AffineFrame(
                glm.vec2(
                    vhat.x * cos(theta) - vhat.y * sin(theta),
                    vhat.x * sin(theta) + vhat.y * cos(theta),
                ),

                glm.vec2(
                    vhat.x * cos(theta_offset) - vhat.y * sin(theta_offset),
                    vhat.x * sin(theta_offset) + vhat.y * cos(theta_offset),
                ),

                radius == 0? 
                  sampler_arc.origin 
                : glm.vec2(
                    v.x * cos(theta) - v.y * sin(theta),
                    v.x * sin(theta) + v.y * cos(theta),
                ).add(sampler_arc.origin),
            );
        }
    };
}
