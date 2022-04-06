'use strict';

/*
`Diagram` is a data structure that represents every property of a diagram that can be depicted within the application.
It serves as the "Model" of a "Model-View-Updater" pattern (A.K.A. "Elm" architecture).
*/
class Diagram {
    constructor(arrows, objects){
        this.arrows = arrows;
        this.objects = objects;
    }
}
