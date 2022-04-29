'use strict';

/*
`SamplerArcMapping` describes how a sampler arc expressed in one coordinate system 
can be reexpressed in terms of another (`apply()`) and vice versa (`revert()`).
The mapping between coordinate systems (`mapping`) is arbitrary.
Its interface is analogous to `PanZoomMapping`,
and must implement functionality for positions, offsets, and distances.
*/
function SamplerArcMapping(mapping){
    return {

        apply: (sampler_arc) => 
            new SamplerArc(
                mapping.position.apply(sampler_arc.origin),
                mapping.offset  .apply(sampler_arc.source_offset),
                mapping.distance.apply(sampler_arc.length_clockwise),
            ),

        revert: (sampler_arc) =>
            new SamplerArc(
                mapping.position.revert(sampler_arc.origin),
                mapping.offset  .revert(sampler_arc.source_offset),
                mapping.distance.revert(sampler_arc.length_clockwise),
            ),

    };
}
