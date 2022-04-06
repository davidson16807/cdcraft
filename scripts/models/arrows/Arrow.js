
/*
`Arrow` is a data structure that represents only the attributes within the mathematical definition of an arrow
`source` and `target` are ivec2s indicating source and target in cell coordinates.
*/
class Arrow {
    constructor(source, target){
        this.source = source;
        this.target = target;
    }
    copy(){ 
        return new Arrow(this.source, this.target);
    }
}
