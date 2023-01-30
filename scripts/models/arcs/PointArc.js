
/*
`PointArc` is a data structure that only ever represents source and target as points in space.
This is opposed to `UserArc` or `StoredArc`, which represent source and target as potentially nested `Node`s 
so that they may represent 2-arrow. `PointArc` is still used to represent 2-arrows, 
but when it does source and target are the literal start and end points of the arc as they appear to the user.
`min_length_clockwise` is the minimum length of an arc, where sign inidicates arc chirality (positive values are clockwise).
*/
class PointArc {
    constructor(source, target, min_length_clockwise){
        typecheck(source, 'glm_vec2$class+glm_ivec2$class');
        typecheck(target, 'glm_vec2$class+glm_ivec2$class');
        this.source = Object.freeze(source);
        this.target = Object.freeze(target);
        this.min_length_clockwise = Object.freeze(min_length_clockwise);
    }
    with(attributes){
        return new PointArc(
            attributes.source                != null? attributes.source                : this.source,
            attributes.target                != null? attributes.target                : this.target,
            attributes.min_length_clockwise  != null? attributes.min_length_clockwise  : this.min_length_clockwise,
        );
    }
}
