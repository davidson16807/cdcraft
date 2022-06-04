'use strict';

/*
An `ArrowState` is a self-contained, self-consistent data structure
representing all state within the application that defines or references arrows. 

This state includes an array of all arrows within a diagram 
(some of which may be functors, which reference other arrows), 
and references to these arrows that indicate selections made by the user.

`ArrowState` exists so that functions may use it for input and output.
These functions can then guarantee that all references within the application will remain valid,
since `ArrowState` guarantees that any reference to an arrow will be contained within it.

As an example, if a function deletes an arrow from the application,
`ArrowState` will guarantee that the function has all the information needed 
for it to remove every reference to that arrow within the application.
*/
class ArrowState {

    constructor(arrows, arrow_selections){
        Object.defineProperty(this, 'arrows',              {get: ()=> arrows});
        Object.defineProperty(this, 'arrow_selections',    {get: ()=> arrow_selections});
    }

    with(attributes){
        return new ArrowState(
            attributes.arrows              != null? attributes.arrows              : this.arrows,
            attributes.arrow_selections    != null? attributes.arrow_selections    : this.arrow_selections,
        );
    }

}
