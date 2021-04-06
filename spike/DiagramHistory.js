
/* 
Tracks changes that can be applied to objects, such as within an undo/redo history.
*/
class ValueEdit{
    constructor(before, after){
        this.apply(object){
            object.after = after;
        }
        this.revert(object){
            object.before = before;
        }
        this.condense(second){
            return second;
        }
    }
}

/* 
Encapsulates an object.
Allows an api user to change the object as if acting on the object directly.
Changes made by the api user are stored separately, 
and may be retrieved for use by the api, such as within an undo/redo history.
*/
class ValueEditingProxy{
    constructor(value){
        let before = undefined;
        let after = undefined;
        this.get = function(id){
            return after || value;
        }
        this.set = function(id, value2){
            before = value;
            after = value2;
        }
        this.edits = function(){
            return new ValueEdit(before, after);
        }
    }
}


/* 
Tracks changes that can be applied to objects, such as within an undo/redo history.
*/
class ObjectEdit{
    constructor(before, after){
        this.apply(object){
            for(id in after){
                object[id] = after[id];
            }
        }
        this.revert(object){
            for(id in before){
                object[id] = before[id];
            }
        }
        this.condense(second){
            before_copy = {};
            after_copy = {};
            this.apply(after_copy);
            second.apply(after_copy);
            second.revert(before_copy);
            this.revert(before_copy);
            return new ObjectEdit(before_copy, after_copy);
        }
    }
}

/* 
Encapsulates an object.
Allows an api user to change the object as if acting on the object directly.
Changes made by the api user are stored separately, 
and may be retrieved for use by the api, such as within an undo/redo history.
*/
class ObjectEditingProxy{
    constructor(object){
        const before = {};
        const after = {};
        this.keys = function(){
            copy = {};
            for(id in object){
                if(object[id] !== undefined) {
                    copy[id] = true;
                }
            }
            for(id in after){
                if(after[id] !== undefined) {
                    copy[id] = true;
                } else {
                    delete copy[id];
                }
            }
            return Object.freeze(copy.keys());
        }
        this.has = function(id){
            return (id in after) || (id in object);
        }
        this.get = function(id){
            return id in after? after[id] : object[id];
        }
        this.set = function(id, value){
            before[id] = object[id];
            after[id] = value;
        }
        this.delete = function(id){
            before[id] = object[id];
            after[id] = undefined;
        }
        this.edits = function(){
            return new ObjectEdit(before, after);
        }
    }
}

/* 
Tracks changes that can be applied to diagrams, such as within an undo/redo history.
*/
class DiagramEdit{
    constructor(node_edits, arrow_edits){
        this.node_edits = node_edits;
        this.arrow_edits = arrow_edits;
        this.apply(diagram){
            node_edits.apply(diagram.nodes);
            arrow_edits.apply(diagram.arrows);
        }
        this.revert(object){
            node_edits.revert(diagram.nodes);
            arrow_edits.revert(diagram.arrows);
        }
        this.condense(second){
            return new DiagramEdit(
                node_edits.condense(second.node_edits), 
                arrow_edits.condense(second.arrow_edits));
        }
    }
}

/* 
Encapsulates a Diagram object. 
Allows an api user to change the diagram as if acting on the diagram directly.
Changes made by the api user are stored separately, 
and may be retrieved for use by the api, such as within an undo/redo history.
*/
class DiagramEditingProxy{
    constructor(diagram){
        this.nodes = new ObjectEditingProxy(diagram.nodes);
        this.arrows = new ObjectEditingProxy(diagram.arrows);
        this.edits = function(){
            return new DiagramEdit(this.nodes, this.arrows);
        }
    }
}

/* 
Tracks changes that can be applied to diagrams, such as within an undo/redo history.
*/
class DiagramViewEdit{
    constructor(selection_edits, focus_edits){
        this.selection_edits = selection_edits;
        this.focus_edits = focus_edits;
        this.apply(view){
            selection_edits.apply(view.selection);
            focus_edits.apply(view);
        }
        this.revert(object){
            selection_edits.revert(view.selection);
            focus_edits.revert(view);
        }
        this.condense(second){
            return new DiagramViewEdit(
                selection_edits.condense(second.selection_edits), 
                focus_edits.condense(second.focus_edits));
        }
    }
}

class DiagramViewEditingProxy{
    constructor(view){
        this.selection = new ObjectEditingProxy(view.selection);
        this.focus = new ValueEditingProxy(view.focus);
        this.edits = function(){
            return new DiagramViewEdit(this.selection, this.focus);
        }
    }
}

/* 
Tracks changes that can be applied to diagrams, such as within an undo/redo history.
*/
class AppEdit{
    constructor(diagram_edits, view_edits){
        this.diagram_edits = diagram_edits;
        this.view_edits = view_edits;
        this.apply(diagram){
            diagram_edits.apply(diagram.diagram);
            view_edits.apply(diagram.view);
        }
        this.revert(object){
            diagram_edits.revert(diagram.diagram);
            view_edits.revert(diagram.view);
        }
        this.condense(second){
            return new AppEdit(
                diagram_edits.condense(second.diagram_edits), 
                view_edits.condense(second.view_edits));
        }
    }
}

class AppEditingProxy{
    constructor(view){
        this.diagram = new DiagramEditingProxy(view.diagram);
        this.view = new DiagramViewEditingProxy(view.view);
        this.edits = function(){
            return new AppEdit(this.diagram, this.view);
        }
    }
}