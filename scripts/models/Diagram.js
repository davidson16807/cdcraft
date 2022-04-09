'use strict';

/*
`Diagram` is a data structure that represents every property of a diagram that can be depicted within the application,
and the manner in which it is depicted.
It represents all state in the application that should be tracked within an undo/redo history.
This includes all model and view state but excludes control state, 
such as the state of mouse drags or the undo/redo history itself. For control state, see `Application`.
*/
class Diagram {
    constructor(arrows, objects, screen_frame_store, arrow_selections, object_selections){
        this.arrows = arrows;
        this.objects = objects;
        this.screen_frame_store = screen_frame_store;
        this.arrow_selections = arrow_selections || [];
        this.object_selections = object_selections || [];
    }

    copy(){
        return new Diagram(
            arrows.map(arrow => arrow.copy()),
            objects.map(object => object.copy()),
            screen_frame_store.copy(),
            arrow_selections.map(arrow => arrow.copy()),
            object_selections.map(object => object.copy()),
        );
    }

}
