'use strict';

/*
`SamplerArcResizing` returns a namespace of pure functions that shift the start and end position of a `SamplerArc`
*/
function SamplerArcResizing(sampler_arc_properties){
    const sign = Math.sign;
    return {
        resize: function (sampler_arc, source_offset, target_offset){
            const clockwise_sign = sign(sampler_arc.length_clockwise);
            source_offset *= clockwise_sign;
            target_offset *= clockwise_sign;
            return new SamplerArc(
                sampler_arc.origin, 
                sampler_arc_properties.position(sampler_arc, source_offset/sampler_arc.length_clockwise).sub(sampler_arc.origin), 
                sampler_arc.length_clockwise - source_offset + target_offset
            );
        },
    }
}
