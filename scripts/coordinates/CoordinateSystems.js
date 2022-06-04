'use strict';

/*
`AffineMap` defines an affine coordinate system in terms of another affine coordinate system.
An alternate name could be `PanZoomRotateFlipShear`, but we avoid this name for brevity.
*/
class AffineMap {
    constructor(ihat,jhat,origin){
        this.ihat = ihat;
        this.jhat = jhat;
        this.origin = origin;
    }
}

/*
`AffineMapping` describes how objects expressed in one affine coordinate system 
can be reexpressed in terms of another (`apply()`) and vice versa (`revert()`) 
Here, an "object" can refer to a position, an offset, or another affine coordinate system.
NOTE: `apply()` exists but is not implemented yet
*/
function AffineMapping(map) {
    const namespace = {}

    namespace.position = {
        revert: (position) => 
            map.origin
                .add(map.ihat.mul(position.x))
                .add(map.jhat.mul(position.y)),
    };

    namespace.offset = {
        revert: (offset) => map.ihat.mul(offset.x).add(map.jhat.mul(offset.y)),
    };

    return namespace;
}

function AffineRemapping(mapping){

    return {
        apply: (map) => 
            new AffineMap(
                mapping.offset.apply(map.ihat),
                mapping.offset.apply(map.jhat),
                mapping.position.apply(map.origin),
            ),
        revert: (map) => 
            new AffineMap(
                mapping.offset.revert(map.ihat),
                mapping.offset.revert(map.jhat),
                mapping.position.revert(map.origin),
            ),
    }

}

/*
`PanZoomRotateFlipMap` defines a cartesian coordinate system that can be expressed
in terms of another cartesian coordinate system using only translation and orthogonal transformations.
*/
class PanZoomRotateFlipMap {
    constructor(ihat,flip_y,origin){
        this.ihat = ihat;
        this.flip_y = flip_y;
        this.origin = origin;
    }
}

/*
`PanZoomRotateFlipMapping` describes how objects expressed in one coordinate system 
can be reexpressed in terms of another (`apply()`) and vice versa (`revert()`) 
when the other coordinate system is defined using only scaling and orthogonal translation.
Here, an "object" can refer to a position, an offset, or another coordinate system.
*/
function PanZoomRotateFlipMapping(map) {
    const namespace = {}
    const A = glm.mat2(map.ihat, glm.vec2(-ihat.y*(map.flip_y?-1:1), ihat.x));
    const Ainv = glm.inverse(A);

    namespace.position = {
        apply:  (position) => Ainv.mul(position.sub(map.origin)),
        revert: (position) => A.mul(position).add(map.origin),
    };

    namespace.offset = {
        apply:  (offset) => Ainv.mul(offset),
        revert: (offset)   => A.mul(offset),
    };

    namespace.distance = {
        apply:  (distance) => distance / glm.length(ihat),
        revert: (distance) => distance * glm.length(ihat),
    }

    return namespace;
}

/*
`PanZoomRotateMap` defines a cartesian coordinate system that can be expressed
in terms of another cartesian coordinate system using only translation and orthonormal transformations.
*/
class PanZoomRotateMap {
    constructor(ihat,origin){
        this.ihat = ihat;
        this.origin = origin;
    }
}

/*
`PanZoomRotateMapping` describes how objects expressed in one coordinate system 
can be reexpressed in terms of another (`apply()`) and vice versa (`revert()`) 
when the other coordinate system is defined using only scaling and orthonormal translation.
Here, an "object" can refer to a position, an offset, or another coordinate system.
*/
function PanZoomRotateMapping(map) {
    const namespace = {}
    const A = glm.mat2(map.ihat, glm.vec2(-ihat.y, ihat.x));
    const Ainv = glm.transpose(A);

    namespace.position = {
        apply:  (position) => Ainv.mul(position.sub(map.origin)),
        revert: (position) => A.mul(position).add(map.origin),
    };

    namespace.offset = {
        apply:  (position) => Ainv.mul(position),
        revert: (offset) => A.mul(position),
    };

    namespace.distance = {
        apply:  (distance) => distance / glm.length(ihat),
        revert: (distance) => distance * glm.length(ihat),
    }

    return namespace;
}

/*
`PanZoomMap` defines a cartesian coordinate system that can be expressed
in terms of another cartesian coordinate system using only scaling and translation.
*/
class PanZoomMap {
    constructor(origin, unit_length){
        this.origin = origin;
        this.unit_length = unit_length;
    }
}

/*
`PanZoomMapping` describes how objects expressed in one coordinate system 
can be reexpressed in terms of another (`apply()`) and vice versa (`revert()`) 
when the other coordinate system is defined using only scaling and translation.
Here, an "object" can refer to a position, an offset, or another coordinate system.
*/
function PanZoomMapping(map) {
    const namespace = {}

    namespace.position = {
        apply:  (position) => position.sub(map.origin).div(map.unit_length),
        revert: (position) => position.mul(map.unit_length).add(map.origin),
    };

    namespace.offset = {
        apply:  (offset) => offset.div(map.unit_length),
        revert: (offset) => offset.mul(map.unit_length),
    };

    namespace.distance = {
        apply:  (distance) => distance/map.unit_length,
        revert: (distance) => distance*map.unit_length,
    };

    return namespace;
}

function PanZoomRemapping(mapping){

    return {
        apply: (map) => 
            new PanZoomMap(
                mapping.position.apply(map.origin),
                mapping.distance.apply(map.unit_length),
            ),
        revert: (map) => 
            new PanZoomMap(
                mapping.position.revert(map.origin),
                mapping.distance.revert(map.unit_length),
            ),
    }

}



class CartesianToRadialMap {
    constructor(origin, reference_offset, clockwise_angle_unit){
        this.reference_offset = reference_offset;
        this.clockwise_angle_unit = clockwise_angle_unit; // negative values indicate counterclockwise measurement
        this.origin = origin;
    }
}

class RadialCoordinates {
    constructor(radius, angle){
        this.radius = radius;
        this.angle = angle;
    }
}

/*
`CartesianToRadialMapping` describes how objects expressed in a cartesian coordinate system 
can be reexpressed in terms of a radial coordinate system (`apply()`), and vice versa (`revert()`).
Here, an "object" can refer to a position, an offset, or another affine coordinate system.
*/
function CartesianToRadialMapping(cartesian_to_radial_map){
    const map = cartesian_to_radial_map;
    const atan2 = Math.atan2;
    const cos = Math.cos;
    const sin = Math.sin;
    const ihat = glm.normalize(map.reference_offset);
    const jhat = glm.vec2(-ihat.y, ihat.x);
    const radius_unit = glm.length(map.reference_offset);
    const namespace = {};

    namespace.position = {
        apply: (cartesian) => {
            const offset = cartesian.sub(map.origin);
            const direction = glm.normalize(offset);
            return RadialCoordinates(
                glm.length(offset) / radius_unit,
                atan2(
                    direction.dot(jhat),
                    direction.dot(ihat)
                ) / clockwise_angle_unit,
            )
        },
        revert: (radial) =>
            glm.vec2(
                cos(radial.angle)*radial.radius,
                sin(radial.angle)*radial.radius
            ),
    };

    return namespace;
}
