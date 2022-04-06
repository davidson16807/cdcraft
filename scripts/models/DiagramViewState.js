
/*
`DiagramViewState` is a data structure that contains all state relating to the presentation of a diagram.
*/
class DiagramViewState {
    constructor(screen_frame_store, object_selections, arrow_selections){
        this.screen_frame_store = screen_frame_store;
        this.object_selections = object_selections || [];
        this.arrow_selections = arrow_selections || [];
    }
}
