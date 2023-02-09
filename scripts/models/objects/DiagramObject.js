'use strict';

/*
`DiagramObject` is a data structure that represents every property of an object that can be depicted within the application.
*/
class DiagramObject {
    constructor(position, depiction, description, is_edited, is_valid){
        this.position = Object.freeze(position);
        this.depiction = Object.freeze(depiction);
        this.description = Object.freeze(description);
        this.is_edited = Object.freeze(is_edited);
        this.is_valid = Object.freeze(is_valid);
    }

    with(attributes){
        return new DiagramObject(
            attributes.position    != null? attributes.position    : this.position, 
            attributes.depiction   != null? attributes.depiction   : this.depiction, 
            attributes.description != null? attributes.description : this.description, 
            attributes.is_edited   != null? attributes.is_edited   : this.is_edited,
            attributes.is_valid    != null? attributes.is_valid    : this.is_valid,
        );
    }

}
