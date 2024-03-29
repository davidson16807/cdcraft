'use strict';

function ArrowDrags(
        diagram_ids, 
        node_hashing,
        node_metric_bundle,
        abstract_curried_arrow_drag, 
        arrow_reference_resource,
        user_arcs_and_stored_arcs_curried, 
        default_min_length_clockwise, 
    ){

    return {

        create: function(arrows, initial_model_position, initial_arrow) {
            const user_arcs_and_stored_arcs = user_arcs_and_stored_arcs_curried(arrows);
            const arrow_id = arrows.indexOf(initial_arrow);
            return Object.assign({}, 
                abstract_curried_arrow_drag(arrows), 
                {
                    initialize: () => 
                        new DiagramArrow(
                            user_arcs_and_stored_arcs.user_arc_to_stored_arc(
                                arrow_id >= 0?
                                    new UserArc(
                                        new Node(initial_model_position, arrow_id), 
                                        new Node(initial_model_position),
                                        default_min_length_clockwise,
                                    )
                                  : new UserArc(
                                        new Node(diagram_ids.cell_position_to_cell_id(initial_model_position)), 
                                        new Node(diagram_ids.cell_position_to_cell_id(initial_model_position)),
                                        default_min_length_clockwise,
                                    )
                            ),
                            2, 0, 0, 0, 
                            1, arrow_id<0?1:2, 0, 0, 
                            'contrast', undefined, undefined, 
                            true, 
                        ),
                    // do nothing if not snapped, otherwise add the arrow
                    command: (replacement_arrow, is_released, is_canceled) => diagram => 
                        is_canceled || (is_released && !replacement_arrow.arc.is_valid)? 
                            diagram.with({
                                    arrows: arrows, 
                                    arrow_selections: [], 
                                    object_selections: [],
                                    inferred_object_selections: [],
                                })
                          : diagram.with({
                                    arrows: [...arrows, replacement_arrow.with({is_edited: !is_released})],
                                    arrow_selections: [],
                                    object_selections: [],
                                    inferred_object_selections: [],
                                })
                });
        },

        edit: function(arrows, replaced_arrow) {
            const arrow_id = arrows.indexOf(replaced_arrow);
            const arrow_hash = node_hashing.hash(new Node(null, arrow_id));
            const arrows_before = arrows.slice(0,arrow_id);
            const arrows_after = arrows.slice(arrow_id+1);
            return Object.assign({}, 
                abstract_curried_arrow_drag(arrows), 
                {
                    initialize: () => replaced_arrow.with({is_edited: true}),
                    // delete the arrow if canceled or not snapped, otherwise edit the arrow
                    command: (replacement_arrow, is_released, is_canceled) => diagram => 
                        is_canceled || (is_released && !replacement_arrow.arc.is_valid)? 
                            diagram.with({
                                    arrows: arrow_reference_resource.delete(arrows, Object.fromEntries([[arrow_hash, arrow_id]])),
                                    arrow_selections: [],
                                    object_selections: [],
                                    inferred_object_selections: [],
                                })
                          : diagram.with({
                                    arrows: 
                                        [...arrows_before, 
                                         replacement_arrow.with({is_edited: !is_released}),
                                         ...arrows_after],
                                    arrow_selections: 
                                        node_metric_bundle.distance(replacement_arrow.arc.target, replaced_arrow.arc.target) > 0?
                                            [] : [arrow_id], 
                                    object_selections: [],
                                    inferred_object_selections: [],
                                })
                });
        },
    };
}
