
/*
`Arrow` is a data structure that represents only the attributes within the mathematical definition of an arrow
`source` and `target` are ivec2s indicating source and target in cell coordinates.
*/
class Arrow {
    constructor(source, target){
        this.source = source;
        this.target = target;
    }
    with(attributes){ 
        return new Arrow(
            attributes.source != null? attributes.source : this.source, 
            attributes.target != null? attributes.target : this.target
        );
    }
}
