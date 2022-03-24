'use strict';

/*
`ArcGeometry` returns a namespace of pure functions describing useful analytic geometry of arcs
*/
function ArcGeometry(){
    const pi = Math.PI;
    const pow = Math.pow;
    const acos = Math.acos;
    const cos = Math.cos;
    const sin = Math.sin;
    const min = Math.min;
    const max = Math.max;
    const sign = Math.sign;
    const abs = Math.abs;
    const epsilon = 1e-6;
    return {
        origin: function(source, target, min_length_clockwise, radius){
            const chord = target.sub(source);
            const chord_length = glm.length(chord);
            const chord_direction = glm.normalize(chord);
            const min_radius = abs(min_length_clockwise) / pi;
            const v = chord_direction.mul(radius);
            const theta = acos(chord_length/(2*radius)) * (chord_length < 2*min_radius? 1:-1) * -sign(min_length_clockwise);
            return glm.vec2(
                v.x * cos(theta) - v.y * sin(theta),
                v.x * sin(theta) + v.y * cos(theta),
            ).add(source);
        },
        radius: function(source, target, min_length_clockwise){
            /*
            NOTE: 
            Given the source position, target position, and length of an arc, we want to find the radius of the circle that is traced by the arc.
            We find the problem reduces to finding the radius ("r") of a semicircle given half the chord length ("x") and half the arc length ("A").
            We draw a right triangle on the semicircle with a hypoteneuse of r, a leg of x opposite to the origin, and angle of θ such that:
              x/r = sin(θ)
            The angle subtended by the arc ("ϕ") takes up the rest of the semicircle, so if we use radians then:
              ϕ = π-θ = A/r
            We have a lot of unknowns to work with (r, θ, and ϕ), so we first try to remove some from consideration.
            Using the equations above we find that:
              x/(A/ϕ) = sin(π-ϕ)
            which simplifies to:
              x/A = sin(ϕ)/ϕ
            So we can solve the problem by approximating the inverse of sin(ϕ)/ϕ
            We source our approximation by noticing that it resembles 2acos(ϕ) for our range of interest, [0,π]:
              https://www.desmos.com/calculator/unllvphdq0
            It's slightly off towards the middle of the range, but all we have to do is find an expression for a factor that we can "nudge" it by.
            We model this "nudge" factor as 1-axᵇ, and by fitting the function manually, we get adequate results using a = 0.147 and b = 0.65.
            In summary, our approximation is:
              ϕ = A/r ≈ 2 (1-a(x/A)ᵇ) acos(x/A)
            And our solution is:
              r ≈ A / (2 (1-a(x/A)ᵇ) acos(x/A))
            */
            const arc_length = abs(min_length_clockwise);
            const a = 0.147;
            const b = 0.650;
            const x = glm.distance(source, target) / 2.0;
            const A = max(x, arc_length/2 );
            const xA = min(x/A, 1-epsilon);
            const r = A / (2.0 * (1.0 - a*pow(xA, b)) * acos(xA));
            return r;
        },
    }
}
