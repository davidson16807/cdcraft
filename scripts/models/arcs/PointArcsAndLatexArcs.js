'use strict';

/*
`PointArcsAndLatexArcs` returns a namespace of pure functions that describe maps between `LatexArc`s and `UserArc`s
*/
function PointArcsAndLatexArcs(point_arc_properties, math) {

    const pi = math.pi;
    const sign = math.sign;
    const abs = math.abs;
    const max = math.max;
    const acos = math.acos;
    const asin = math.asin;

    return {

        point_arc_to_latex_arc: function(point_arc) {
            const radius = point_arc_properties.radius(point_arc);
            // NOTE: 2πr is the circumference, where 2π is the angle of a full circle in radians, 
            // so for any angle the arc length of that angle is radius*angle, 
            // and the angle is arc_length/radius
            return new LatexArc(point_arc.source, point_arc.target, 
                abs(point_arc.min_length_clockwise)/radius, point_arc.min_length_clockwise>0.0);
        },

        latex_arc_to_point_arc: function(latex_arc) {
            const radius = point_arc_properties.radius(point_arc);
            // NOTE: 2πr is the circumference, where 2π is the angle of a full circle in radians, 
            // so for any angle the arc length of that angle is radius*angle
            return new PointArc(latex_arc.source, latex_arc.target, radius*latex_arc.angle * (latex_arc.bends_right? 1:-1));
        },

    };
}
