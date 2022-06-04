'use strict';

function ArrowDrags(diagram_ids, arrow_resource, user_arcs_and_stored_arcs, default_min_length_clockwise, min_length_clockwise_change_per_scroll){
    console.log(user_arcs_and_stored_arcs);
    function move(arrow_in, screen_positions, screen_state) {
        const arc_in = arrow_in.arc;
        const model_position = new Node('cell', PanZoomMapping(screen_state).position.revert(screen_positions[0]));
        return arrow_in.with({
            arc: user_arcs_and_stored_arcs.user_arc_to_stored_arc(
                    arc_in.with({target: model_position})),
        });
    };

    const sign = Math.sign;
    const abs = Math.abs;
    const max = Math.max;
    function wheel(arrow_in, screen_focus, scroll_count) {
        const arc_in = arrow_in.arc;

        const min_length_clockwise_change = min_length_clockwise_change_per_scroll * scroll_count;
        const chord_length = glm.distance(arc_in.source, arc_in.target);
        const arc_length1 = 0.7;
        const arc_length2 = max(arc_length1, chord_length);
        const min_arc_length = abs(arc_in.min_length_clockwise);
        const clockwise_sign = sign(arc_in.min_length_clockwise);
        const excess_in = clockwise_sign * max(min_arc_length - arc_length2, 0);
        const excess_out = excess_in + min_length_clockwise_change;
        const is_different_sign = sign(excess_in) * sign(excess_out) < 0;
        const min_length_clockwise_out = sign(excess_out) * (is_different_sign? arc_length1 : (abs(excess_out) + abs(arc_length2)));

        return arrow_in.with({
            arc: new StoredArc(arc_in.source, arc_in.target, min_length_clockwise_out, arc_in.chord_direction, arc_in.is_valid),
        });
    };

    const identity = state => state;
    return {
        create: function(arrows, initial_model_position) {
            const original_length = arrows.length;
            return {
                id: DragState.arrow,
                initialize: () => new DiagramArrow(
                        user_arcs_and_stored_arcs.user_arc_to_stored_arc(
                            new UserArc(
                                new Node('cell', initial_model_position), 
                                new Node('cell', initial_model_position),
                                default_min_length_clockwise,
                            )
                        ),
                        true,
                    ),
                move: move,
                wheel: wheel,
                arrowenter: (replacement_arrow, arrow) => 
                    replacement_arrow.with({
                        target: Node('arrow', arrows.indexOf(arrow)),
                    }),
                objectenter: (replacement_arrow, object) => replacement_arrow,
                // do nothing if not snapped, otherwise add the arrow
                command: (replacement_arrow, is_released, is_canceled) => {
                    return is_canceled || (is_released && !replacement_arrow.arc.is_valid)? 
                            diagram => diagram.with({
                                    arrows: arrows.with({arrow_selections: []}), 
                                    object_selections: [],
                                    inferred_object_selections: [],
                                })
                          : diagram => diagram.with({
                                    arrows: arrow_resource
                                        .put(arrows, {'': replacement_arrow.with({is_edited: !is_released})}),
                                    object_selections: [],
                                    inferred_object_selections: [],
                                })
                }
            };
        },

        edit: function(arrows, replaced_arrow) {
            const arrow_id = arrows.arrows.indexOf(replaced_arrow);
            return {
                id: DragState.arrow,
                initialize: () => replaced_arrow.with({is_edited: true}),
                move: move,
                wheel: wheel,
                arrowenter: (replacement_arrow, arrow) => replacement_arrow,
                objectenter: (replacement_arrow, object) => replacement_arrow,
                // delete the arrow if canceled or not snapped, otherwise edit the arrow
                command: (replacement_arrow, is_released, is_canceled) => diagram => 
                    is_canceled || (is_released && !replacement_arrow.arc.is_valid)? 
                        diagram.with({
                            arrows: arrow_resource.delete({arrow_id: replaced_arrow}),
                            object_selections: [],
                            inferred_object_selections: [],
                        })
                      : diagram.with({
                            arrows: arrow_resource
                                .put({ arrow_id: replacement_arrow.with({is_edited: !is_released}) })
                                .with({
                                    arrow_selections: 
                                        glm.distance(replacement_arrow.arc.target, replaced_arrow.arc.target) > 0?
                                            [] : [arrow_id]
                                    }),
                            object_selections: [],
                            inferred_object_selections: [],
                        })
            };
        },
    };
}
