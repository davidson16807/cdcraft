
/*
`Command` is an isomorphism implemented as a tuple of functions. It is used here to implement undo/redo history. 
Its name alludes to the "Command" pattern of object oriented programming.
The two functions within a `Command` are:

* `forward:state→state`, a function that maps the state of a modelview to another state. 
  It represents a change in state issued by the user. The modelview is modified in-place for performance reasons.
* `backward:state→state`, a function that is inverse to `forward(state)`

All changes to state within a Diagram are made using the `forward()` and `backward()` functions, 
even when not using undo/redo functionality. This is done to reduce the number of cases that must be considered within code.

We have chosen to implement undo/redo using `Command` since this approach corresponds to a categorial interpretation
that allows flexibility while preserving essential behavior. 
State objects do not need to be stored if the user wants to reduce memory consumption, 
but can be returned by `backward()` functions if doing so is easier or the alternative is not possible.
Custom `*Command` can also be implemented if the size of the `forward` and `backward` functions are also of concern.
*/
class Command{
    constructor(forward, backward){
        this.forward = forward;
        this.backward = backward;
    }
    copy(){
        return new Command(this.forward, this.backward);
    }
    static identity = new Command((model_inout, view_inout)=>{}, (model_inout, view_inout)=>{});
}
