
`*Drag`s are namespaces representing small categories that are functorial to themselves.
They each describe dragging operations performed by mice or touchpads.
When the drag starts, the application initializes an instance of the category and a state object within it.
When the drag is in progress, the application applies operations to the state object returning a new state object.
These operations reflect user actions that occur mid-drag, and are so far limited to movement or scrolling.

A state object can be used at any point to return a command.
The command is a function that maps application state 
from any point during the drag to the points immediately before or after.

The functions within a `*Drag` category can be considered the successively curried versions of pure functions.
The currying allows the functions to be able to compose and form small categories 
where the output of one is the input of another. 
The curried parameters are treated as private constants within the category,
and are analogous to private attributes within object oriented programming (OOP), 
except unlike typical OOP we actually bother to practice encapsulation 
and not merely pretend to using getters and setters.