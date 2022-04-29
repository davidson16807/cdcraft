'use strict';

/*
`DiagramObjectSetOperations` returns a namespace of pure functions operating on sets of objects.
Object sets are represented using associative arrays for the sake of simplicity,
where objects are stored using a cell hash from the given `diagram_ids` namespace. 
The two functions within `DiagramObjectSetOperations` so far are:

* `initialize`: list→set a function that, given a list of `DiagramObject`s, 
  returns the set of all objects represented within the list according to the cell hash.
* `infer`: arrows→objects: a function that, given a list of `DiagramArrow`s, 
  returns a set of all objects that are implied by the existance of those arrows within a category
* `update`: objects×objects→objects: a function that returns the union of two sets of objects,
  using references from the second set when objects from the two sets share the same hash.
*/
function DiagramObjectSetOperations(diagram_ids){
    return {

        list_to_set: (object_list) => {
            const object_set = {};
            for(let object of object_list){
                object_set[
                    diagram_ids.cell_id_to_cell_hash(
                        diagram_ids.cell_position_to_cell_id(object.position))] = object;
            }
            return object_set;
        },

        set_to_list: (object_set) => {
            const object_list = [];
            for(let cell_hash in object_set){
                object_list.push(object_set[cell_hash]);
            }
            return object_list;
        },

        infer: (arrows) => {
            const objects = {};
            for(let arrow of arrows){
                objects[diagram_ids.cell_id_to_cell_hash(arrow.arc.source)] = new DiagramObject(arrow.arc.source);
                objects[diagram_ids.cell_id_to_cell_hash(arrow.arc.target)] = new DiagramObject(arrow.arc.target);
            }
            return objects;
        },

        update: (updated, updates) => {
            const result = {};
            for(let hash in updated){
                result[hash] = updated[hash];
            }
            for(let hash in updates){
                result[hash] = updates[hash];
            }
            return result;
        },

        delete: (source, deleted) => {
            const result = {};
            for(let hash in source){
                if (deleted[hash] == null) {
                    result[hash] = hash;
                }
            }
            return result;
        },

    };
}
