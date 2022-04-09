'use strict';

/*
`Diagram` is a data structure that represents all state in the application that can be tracked within an undo/redo history.
This includes all model and view state but excludes control state such as the state of mouse drags or the undo/redo history itself. 
The composition of a Diagram with its control state is known as the `App`.
*/
class Diagram {
    constructor(arrows, objects, arrow_selections, object_selections, screen_frame_store){
        this.arrows = arrows;
        this.objects = objects;
        this.arrow_selections = arrow_selections;
        this.object_selections = object_selections;
        this.screen_frame_store = screen_frame_store;
    }

    copy(){
        return new Diagram(
            this.arrows.map(arrow => arrow.copy()),
            this.objects.map(object => object.copy()),
            this.arrow_selections.map(arrow => arrow.copy()),
            this.object_selections.map(object => object.copy()),
            this.screen_frame_store.copy(),
        );
    }

}
