An "updater" is function returning a namespace of functions that reflect how events map to state operations.
All functions within the namespace represent the transformation of state in reponse to controller events. 

The name "updater" is in reference to the "Updater" 
within the "Model-View-Updater" pattern (A.K.A. "MVU" or "Elm" architecture),
however it differs here in two ways:
* For performance and brevity, application state is modified in place.
  Functions can still be conceived of as pure since output state is entirely decided by parameters,
  but the only implementation of the function requires the memory footprint of output to be that of the input.
* Several updaters are available, whereas MVU typically condenses side effects to a single component.
  We deviate from this because some behavior (like mouse dragging) is polymorphic, 
  however all components responsible for side effect are restricted the "updater" directory, here.

Some "updaters" are injected as dependencies into the constructors other other updaters.
The topmost updater in this class composition hierarchy is `ApplicationUpdater`, 
which governs all side effect within the application, 
and is closest to the "updater" in MVU. 