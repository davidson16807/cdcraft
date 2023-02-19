'use strict';

/*
`ViewEventDeferal` returns a convenience namespace of curried functions that generate 
standardized event callbacks for `*View` namespaces.
If an event occurs, the event callbacks will fire off a callback 
with information about the object and drawing.
This is done so that functions in `*View` namespaces can defer side effects 
to callbacks provided by higher levels of object composition outside the `*View` class.
*/
const ViewEventDeferal = 
    () => (drawing, app, dom) => 
        ({

            callback: onevent => event => { 
                onevent(event, drawing, app, dom);
            },

            callbackPrevent: onevent => event => { 
                event.preventDefault(); 
                onevent(event, drawing, app, dom);
            },

            callbackPreventStop: onevent => event => { 
                event.preventDefault(); 
                event.stopPropagation();
                onevent(event, drawing, app, dom);
            },

        });
