'use strict';

function ArrowDrags(diagram_ids, user_arcs_and_stored_arcs, meta_user_arcs_and_flat_arcs, default_min_length_clockwise, min_length_clockwise_change_per_scroll){

    const Tools = (user_arcs_and_flat_arcs) => {
        const sign = Math.sign;
        const abs = Math.abs;
        const max = Math.max;
        return {

            move: (arrow_in, screen_positions, screen_state) => {
                const arc_in = arrow_in.arc;
                const model_position = PanZoomMapping(screen_state).position.revert(screen_positions[0]);
                return arrow_in.with({
                    arc: user_arcs_and_stored_arcs.user_arc_to_stored_arc(
                            arc_in.with({
                                target: arc_in.target.with({
                                    position: model_position
                                })
                            })),
                });
            },

            wheel: (arrow_in, screen_focus, scroll_count) => {
                const flat_arc = user_arcs_and_flat_arcs.user_arc_to_flat_arc(arrow_in.arc)
                const min_length_clockwise_change = min_length_clockwise_change_per_scroll * scroll_count;
                const chord_length = glm.distance(flat_arc.source, flat_arc.target);
                const arc_length1 = 0.7;
                const arc_length2 = max(arc_length1, chord_length);
                const min_arc_length = abs(flat_arc.min_length_clockwise);
                const clockwise_sign = sign(flat_arc.min_length_clockwise);
                const excess_in = clockwise_sign * max(min_arc_length - arc_length2, 0);
                const excess_out = excess_in + min_length_clockwise_change;
                const is_different_sign = sign(excess_in) * sign(excess_out) < 0;
                const min_length_clockwise_out = sign(excess_out) * (is_different_sign? arc_length1 : (abs(excess_out) + abs(arc_length2)));

                return arrow_in.with({
                    arc: arrow_in.arc.with({
                        min_length_clockwise: min_length_clockwise_out
                    }),
                });
            },

        }
    }


    const identity = state => state;
    return {
        create: function(arrows, initial_model_position) {
            const original_length = arrows.length;
            const tools = Tools(meta_user_arcs_and_flat_arcs.instantiate(arrows));
            return {
                id: DragState.arrow,
                initialize: () => {
                        const result = new DiagramArrow(
                            user_arcs_and_stored_arcs.user_arc_to_stored_arc(
                                new UserArc(
                                    new UserNode(diagram_ids.cell_position_to_cell_id(initial_model_position)), 
                                    new UserNode(diagram_ids.cell_position_to_cell_id(initial_model_position)),
                                    default_min_length_clockwise,
                                )
                            ),
                            true,
                        );
                        return result;
                    },
                move: tools.move,
                wheel: tools.wheel,
                arrowenter: (replacement_arrow, arrow) => replacement_arrow,
                objectenter: (replacement_arrow, object) => replacement_arrow,
                // do nothing if not snapped, otherwise add the arrow
                command: (replacement_arrow, is_released, is_canceled) => {
                    return is_canceled || (is_released && !replacement_arrow.arc.is_valid)? 
                            diagram => diagram.with({
                                    arrows: arrows, 
                                    arrow_selections: [], 
                                    object_selections: [],
                                    inferred_object_selections: [],
                                })
                          : diagram => diagram.with({
                                    arrows: [...arrows, replacement_arrow.with({is_edited: !is_released})],
                                    arrow_selections: [],
                                    object_selections: [],
                                    inferred_object_selections: [],
                                })
                }
            };
        },

        create_2arrow: function(arrows, initial_model_position, initial_arrow) {
            const arrow_id = arrows.indexOf(initial_arrow);
            const original_length = arrows.length;
            const tools = Tools(meta_user_arcs_and_flat_arcs.instantiate(arrows));
            return {
                id: DragState.arrow,
                initialize: () => {
                        const result = new DiagramArrow(
                            user_arcs_and_stored_arcs.user_arc_to_stored_arc(
                                new UserArc(
                                    new UserNode(null, arrow_id), 
                                    new UserNode(initial_model_position),
                                    default_min_length_clockwise,
                                )
                            ),
                            true,
                        );
                        return result;
                    },
                move: tools.move,
                wheel: tools.wheel,
                arrowenter: (replacement_arrow, arrow) => replacement_arrow,
                objectenter: (replacement_arrow, object) => replacement_arrow,
                midpointenter: (replacement_arrow, object) => replacement_arrow,
                // do nothing if not snapped, otherwise add the arrow
                command: (replacement_arrow, is_released, is_canceled) => {
                    return is_canceled || (is_released && !replacement_arrow.arc.is_valid)? 
                            diagram => diagram.with({
                                    arrows: arrows, 
                                    arrow_selections: [], 
                                    object_selections: [],
                                    inferred_object_selections: [],
                                })
                          : diagram => diagram.with({
                                    arrows: [...arrows, replacement_arrow.with({is_edited: !is_released})],
                                    arrow_selections: [],
                                    object_selections: [],
                                    inferred_object_selections: [],
                                })
                }
            };
        },

        edit: function(arrows, replaced_arrow) {
            const arrow_id = arrows.indexOf(replaced_arrow);
            const arrows_before = arrows.slice(0,arrow_id);
            const arrows_after = arrows.slice(arrow_id+1);
            const tools = Tools(meta_user_arcs_and_flat_arcs.instantiate(arrows));
            return {
                id: DragState.arrow,
                initialize: () => replaced_arrow.with({is_edited: true}),
                move: tools.move,
                wheel: tools.wheel,
                arrowenter: (replacement_arrow, arrow) => replacement_arrow,
                objectenter: (replacement_arrow, object) => replacement_arrow,
                // delete the arrow if canceled or not snapped, otherwise edit the arrow
                command: (replacement_arrow, is_released, is_canceled) => diagram => 
                    is_canceled || (is_released && !replacement_arrow.arc.is_valid)? 
                            diagram.with({
                                    arrows: [...arrows_before, ...arrows_after],
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
                                        glm.distance(replacement_arrow.arc.target.position, replaced_arrow.arc.target.position) > 0?
                                            [] : [arrow_id], 
                                    object_selections: [],
                                    inferred_object_selections: [],
                                })
            };
        },
    };
}
