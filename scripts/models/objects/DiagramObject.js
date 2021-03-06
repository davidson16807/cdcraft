'use strict';

/*
`DiagramObject` is a data structure that represents every property of an object that can be depicted within the application.
*/
class DiagramObject {
    constructor(position, depiction, is_edited, is_valid){
        Object.defineProperty(this, 'position',  {get: ()=> position});
        Object.defineProperty(this, 'depiction', {get: ()=> depiction || ''});
        Object.defineProperty(this, 'is_edited', {get: ()=> is_edited || false});
        Object.defineProperty(this, 'is_valid',  {get: ()=> is_valid  || true});
    }

    with(attributes){
        return new DiagramObject(
            attributes.position    != null? attributes.position    : this.position, 
            attributes.depiction   != null? attributes.depiction   : this.depiction, 
            attributes.is_edited   != null? attributes.is_edited   : this.is_edited,
            attributes.is_valid    != null? attributes.is_valid    : this.is_valid,
        );
    }

}
