
/*
`FlatArc` is a data structure that represents a `UserArc` in a "flattened" way, i.e. without nested data structures.
It represents a directed arc as a pair of vec2s that indicate the `source` and `target` in either cell or screen coordinates.
`min_length_clockwise` is the minimum length of an arc, where sign inidicates arc chirality (positive values are clockwise).
`FlatArc` has structure very similar to `UserArc`, the only difference being that `source` and `target` are `vec2`s, and not `UserNode`s.
*/
class FlatArc {
    constructor(source, target, min_length_clockwise){
        this.source = Object.freeze(source);
        this.target = Object.freeze(target);
        this.min_length_clockwise = Object.freeze(min_length_clockwise);
        // console.assert(this.source.constructor.name == 'glm.vec2$class');
        // console.assert(this.target.constructor.name == 'glm.vec2$class');
    }
    with(attributes){
        return new FlatArc(
            attributes.source                != null? attributes.source                : this.source,
            attributes.target                != null? attributes.target                : this.target,
            attributes.min_length_clockwise  != null? attributes.min_length_clockwise  : this.min_length_clockwise,
        );
    }
}
