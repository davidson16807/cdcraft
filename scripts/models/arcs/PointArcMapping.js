'use strict';


/*
`PointArcMapping` describes how a sampler arc expressed in one coordinate system 
can be reexpressed in terms of another (`apply()`) and vice versa (`revert()`).
The mapping between coordinate systems (`mapping`) is arbitrary.
Its interface is analogous to `PanZoomMapping`,
and must implement functionality for positions and distances.
*/
function PointArcMapping(mapping){
    return {

        apply: (user_arrow, frame) => 
            new PointArc(
                mapping.position.apply(user_arrow.source),
                mapping.position.apply(user_arrow.target),
                mapping.distance.apply(user_arrow.min_length_clockwise),
            ),

        revert: (user_arrow, frame) =>
            new PointArc(
                mapping.position.revert(user_arrow.source),
                mapping.position.revert(user_arrow.target),
                mapping.distance.revert(user_arrow.min_length_clockwise),
            ),

    };
}
