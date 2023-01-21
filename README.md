`cditor` is built using "Model-View-Updater" architecture (A.K.A. "MVU" or "Elm" architecture). 

All functions that operate on objects exposed to the undo/redo history are pure in the strictest sense. 
This is important, since it means that references will never change their values, 
therefore references can be used to cheaply store redundant state in the undo/redo history, 
and these references will forever reflect state as it was in the past. 
It also means that referential equality can be used as a cheap test for when the view needs to be updated, 
which is itself invaluable. 
Purity is enforced vigorously using Object.freeze() with every attribute within classes of the model layer.