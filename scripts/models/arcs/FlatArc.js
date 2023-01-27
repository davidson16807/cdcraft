
/*
`FlatArc` is a data structure that only ever represents source and target as position vectors
(It is "flat" because it does not use nested UserArcs to represent the source and target of 2-arrows, unlike `UserArc` or `StoredArc`).
`min_length_clockwise` is the minimum length of an arc, where sign inidicates arc chirality (positive values are clockwise).
*/
class FlatArc {
    constructor(source, target, min_length_clockwise){
        typecheck(source, 'glm_vec2$class+glm_ivec2$class');
        typecheck(target, 'glm_vec2$class+glm_ivec2$class');
        this.source = Object.freeze(source);
        this.target = Object.freeze(target);
        this.min_length_clockwise = Object.freeze(min_length_clockwise);
    }
    with(attributes){
        return new FlatArc(
            attributes.source                != null? attributes.source                : this.source,
            attributes.target                != null? attributes.target                : this.target,
            attributes.min_length_clockwise  != null? attributes.min_length_clockwise  : this.min_length_clockwise,
        );
    }
}
