
function SelectionDrags(diagram_ids, max_snap_distance){
    return {
        move: function(initial_arrow_list, arrow_selections, initial_object_list, object_selections) {
            const explicit_object_hashes = {};
            for (let object of initial_object_list) {
                explicit_object_hashes[diagram_ids.cell_id_to_cell_hash(object.position)] = object;
            }
            // needed to perform object modification and quick object lookup
            const initial_object_hashes = {};
            for (let object of object_selections) {
                initial_object_hashes[diagram_ids.cell_id_to_cell_hash(object.position)] = object;
            }
            for (let arrow of arrow_selections) {
                initial_object_hashes[diagram_ids.cell_id_to_cell_hash(arrow.arc.source)] = arrow;
                initial_object_hashes[diagram_ids.cell_id_to_cell_hash(arrow.arc.target)] = arrow;
            }

            // needed to perform arrow deletion and modification
            const source_arrow_ids = [];
            const target_arrow_ids = [];
            const all_arrow_ids = [];
            for (let i = 0; i<initial_arrow_list.length; i++){
                const arrow = initial_arrow_list[i];
                const source_hash = diagram_ids.cell_id_to_cell_hash(arrow.arc.source);
                const target_hash = diagram_ids.cell_id_to_cell_hash(arrow.arc.target);
                if (initial_object_hashes[source_hash]){
                    source_arrow_ids.push(i);
                }
                if (initial_object_hashes[target_hash]){
                    target_arrow_ids.push(i);
                }
                if (initial_object_hashes[target_hash] || initial_object_hashes[source_hash]){
                    all_arrow_ids.push(i);
                }
            }
            const object_ids = [];
            for (let i = 0; i<initial_object_list.length; i++){
                const object = initial_object_list[i];
                const object_hash = diagram_ids.cell_id_to_cell_hash(object.position);
                if (initial_object_hashes[object_hash]){
                    object_ids.push(i);
                }
            }

            function get_representative_position(arrows, objects, object_selections){
                const initial_representative_position = glm.vec2();
                for(let i of source_arrow_ids){
                    return arrows[i].arc.source;
                }
                for(let i of object_ids){
                    return objects[i].position
                }
                for(let object of object_selections){
                    return object.position
                }
            }
            const initial_representative_position = get_representative_position(initial_arrow_list, initial_object_list, object_selections)

            return {
                id: DragState.object,
                is_model_drag: true,
                is_view_drag: false,
                initialize: () => glm.vec2(),
                move: (cumulative_model_offset, model_position, model_offset) => cumulative_model_offset.add(model_offset),
                wheel: (cumulative_model_offset, screen_focus, scroll_count) => cumulative_model_offset,
                // delete the object and its arrows if canceled, otherwise move the object and its arrows
                command: (cumulative_model_offset, is_released, is_canceled) => {
                    const cumulative_model_offset_id = diagram_ids.cell_position_to_cell_id(cumulative_model_offset);
                    const is_snapped = glm.length(cumulative_model_offset_id.sub(cumulative_model_offset)) < max_snap_distance;
                    const cumulative_model_offset_snapped = is_snapped? cumulative_model_offset_id : cumulative_model_offset;


                    /*
                    TODO: consider moving logic here to a new `DiagramObjectMovement` category class 
                    NOTE: it would be nice to create data structures here that don't require O(N) traversal 
                        through arrows or objects, but generating those data structures also requires O(N) traversal,
                        and since we can't guarantee that model_inout will not change over multiple invocations,
                        we would have to generate those data structures one per invocation anyways, 
                        so we might as well traverse through the object and arrow lists.
                    */
                    return is_canceled || (is_released && !is_snapped)?
                        new Command(
                          // forward
                          (model_inout, view_inout) => {
                            model_inout.arrows = [...model_inout.arrows];
                            console.log(all_arrow_ids)
                            for(let i=all_arrow_ids.length-1; i>=0; i--){
                                model_inout.arrows.splice(all_arrow_ids[i], 1);
                            }
                            model_inout.objects = [...model_inout.objects];
                            for(let i=object_ids.length-1; i>=0; i--){
                                model_inout.objects.splice(object_ids[i], 1);
                            }
                            view_inout.arrow_selections = [];
                            view_inout.object_selections = [];
                          },
                          // backward
                          (model_inout, view_inout) => {
                            model_inout.arrows = initial_arrow_list;
                            model_inout.objects = initial_object_list;
                            view_inout.arrow_selections = arrow_selections;
                            view_inout.object_selections = object_selections;
                          },
                        )
                      : new Command(
                          // forward
                          (model_inout, view_inout) => {
                            const current_offset = get_representative_position(model_inout.arrows, model_inout.objects, view_inout.object_selections).sub(initial_representative_position);
                            const corrective_offset = cumulative_model_offset_snapped.sub(current_offset);
                            for(let i=0; i<view_inout.arrow_selections.length; i++){
                                const arrow = view_inout.arrow_selections[i].copy();
                                arrow.arc.source = arrow.arc.source.add(corrective_offset);
                                arrow.arc.target = arrow.arc.target.add(corrective_offset);
                                view_inout.arrow_selections[i] = arrow;
                            }
                            for(let i=0; i<view_inout.object_selections.length; i++){
                                const object = view_inout.object_selections[i].copy();
                                object.position = object.position.add(corrective_offset);
                                view_inout.object_selections[i] = object;
                            }
                            for(let i of source_arrow_ids){
                                model_inout.arrows[i].arc.source = model_inout.arrows[i].arc.source.add(corrective_offset);
                            }
                            for(let i of target_arrow_ids){
                                model_inout.arrows[i].arc.target = model_inout.arrows[i].arc.target.add(corrective_offset);
                            }
                            for(let i of object_ids){
                                model_inout.objects[i].position = model_inout.objects[i].position.add(corrective_offset);
                            }
                          },
                          // backward
                          (model_inout, view_inout) => {
                            const current_offset = get_representative_position(model_inout.arrows, model_inout.objects, view_inout.object_selections).sub(initial_representative_position);
                            for(let i=0; i<view_inout.arrow_selections.length; i++){
                                const arrow = view_inout.arrow_selections[i].copy();
                                arrow.position = arrow.position.sub(current_offset);
                                view_inout.arrow_selections[i] = arrow;
                            }
                            for(let i=0; i<view_inout.object_selections.length; i++){
                                const object = view_inout.object_selections[i].copy();
                                object.position = object.position.sub(current_offset);
                                view_inout.object_selections[i] = object;
                            }
                            for(let i of source_arrow_ids){
                                model_inout.arrows[i].arc.source = model_inout.arrows[i].arc.source.sub(current_offset);
                            }
                            for(let i of target_arrow_ids){
                                model_inout.arrows[i].arc.target = model_inout.arrows[i].arc.target.sub(current_offset);
                            }
                            for(let i of object_ids){
                                model_inout.objects[i].position = model_inout.objects[i].position.sub(current_offset);
                            }
                          },
                        )
                }
            };
        },
    };
}
