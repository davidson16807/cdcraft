'use strict';

/*
`Diagram` is a data structure that represents all state in the application that can be tracked within an undo/redo history.
This includes all model and view state but excludes control state such as the state of mouse drags or the undo/redo history itself. 
The composition of a Diagram with its control state is known as the `App`.
*/
class Diagram {
    constructor(
        arrows, objects, 
        arrow_selections, object_selections, inferred_object_selections, 
        screen_frame_store
    ){
        this.arrows = arrows;
        this.objects = objects;
        this.arrow_selections = arrow_selections || [];
        this.object_selections = object_selections || [];
        this.inferred_object_selections = inferred_object_selections || [];
        this.screen_frame_store = screen_frame_store;
    }

    with(attributes){
        return new Diagram(
            attributes.arrows                     != null? attributes.arrows                     : this.arrows,
            attributes.objects                    != null? attributes.objects                    : this.objects,
            attributes.arrow_selections           != null? attributes.arrow_selections           : this.arrow_selections,
            attributes.object_selections          != null? attributes.object_selections          : this.object_selections,
            attributes.inferred_object_selections != null? attributes.inferred_object_selections : this.inferred_object_selections,
            attributes.screen_frame_store         != null? attributes.screen_frame_store         : this.screen_frame_store,
        );
    }

}

