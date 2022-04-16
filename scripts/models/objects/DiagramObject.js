'use strict';

/*
`DiagramObject` is a data structure that represents every property of an object that can be depicted within the application.
*/
class DiagramObject {
    constructor(position, depiction, annotation, is_edited, is_valid){
        this.position = position;
        this.depiction = depiction || '∙';
        // this.depiction = depiction || '\\( \\bullet \\)';
        this.annotation = annotation || '';
        this.is_edited = is_edited || false;
        this.is_valid = is_valid || true;
    }

    with(attributes){
        return new DiagramObject(
            attributes.position    != null? attributes.position    : this.position, 
            attributes.depiction   != null? attributes.depiction   : this.depiction, 
            attributes.annotation  != null? attributes.annotation  : this.annotation, 
            attributes.is_edited   != null? attributes.is_edited   : this.is_edited,
            attributes.is_valid    != null? attributes.is_valid    : this.is_valid,
        );
    }

}
