'use strict';

/*
`PointArcProperties` returns a namespace of pure functions describing properties for any point along a `SamplerArc`
*/
function PointArcProperties(glm){
    return {
        chord_length: (arc) => glm.distance(arc.target, arc.source),
        chord_offset: (arc) => glm.sub(arc.target, arc.source),
        chord_direction: (arc) => glm.normalize(glm.sub(arc.target, arc.source)),
    };
}
