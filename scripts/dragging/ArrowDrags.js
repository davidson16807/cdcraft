'use strict';

/*
`*Drag`s are namespaces representing small categories that are functorial to themselves.
They each describe dragging operations performed by mice or touchpads.
When the drag starts, the application initializes an instance of the category and a state object within it.
When the drag is in progress, the application applies operations to the state object returning a new state object.
These operations reflect user actions that occur mid-drag, and are so far limited to movement or scrolling.

A state object can be used at any point to return a command object.
The command objects are small categories of idempotent isomorphic functions that return application state 
from any point during the drag to the points immediately before or after.

The functions within a `Drag` category can be considered the successively curried versions of pure functions.
The currying allows the functions to be able to compose and form small categories 
where the output of one is the input of another. 
The curried parameters are treated as private constants within the category,
and are analogous to private attributes within object oriented programming (OOP), 
except unlike typical OOP we actually bother to practice encapsulation 
and not merely pretend to using getters and setters.
*/
function ArrowDrags(user_arcs_and_stored_arcs, default_min_length_clockwise, min_length_clockwise_change_per_scroll){

    function move(arrow_in, model_position, model_offset) {
        const arc_in = arrow_in.arc;
        const arrow_out = new DiagramArrow(
            user_arcs_and_stored_arcs.user_arc_to_stored_arc(
                new UserArc(
                    arc_in.source,
                    model_position,
                    arc_in.min_length_clockwise,
                )
            ),
            arrow_in.is_edited,
            arrow_in.label,
            arrow_in.label_offset,
            arrow_in.source_style_id,
            arrow_in.end_style_id,
            arrow_in.line_style_id,
        );
        return arrow_out;
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

        return new DiagramArrow(
            new StoredArc(arc_in.source, arc_in.target, min_length_clockwise_out, arc_in.target_offset_id, arc_in.is_valid),
            arrow_in.is_edited,
            arrow_in.label,
            arrow_in.label_offset,
            arrow_in.source_style_id,
            arrow_in.end_style_id,
            arrow_in.line_style_id,
        );
    };

    return {
        create: function(arrows, initial_model_position) {
            const original_length = arrows.length;
            return {
                id: DragState.arrow,
                is_model_drag: true,
                is_view_drag: false,
                initialize: () => new DiagramArrow(
                        user_arcs_and_stored_arcs.user_arc_to_stored_arc(
                            new UserArc(
                                initial_model_position, 
                                initial_model_position,
                                default_min_length_clockwise,
                            )
                        ),
                        true,
                    ),
                move: move,
                wheel: wheel,
                // do nothing if not snapped, otherwise add the arrow
                command: (replacement_arrow, is_released, is_canceled) => {
                    return is_canceled || (is_released && !replacement_arrow.arc.is_valid)?
                        new Command(
                          // forward
                          (model_inout, view_inout) => model_inout.arrows.splice(original_length, 1),
                          // backward
                          (model_inout, view_inout) => model_inout.arrows.splice(original_length, 1),
                        )
                      : new Command(
                          // forward
                          (model_inout, view_inout) => model_inout.arrows[original_length] = new DiagramArrow(
                                replacement_arrow.arc,
                                !is_released,
                                replacement_arrow.label,
                                replacement_arrow.label_offset,
                                replacement_arrow.source_style_id,
                                replacement_arrow.end_style_id,
                                replacement_arrow.line_style_id,
                            ),
                          // backward
                          (model_inout, view_inout) => model_inout.arrows.splice(original_length, 1),
                        )
                }
            };
        },

        edit: function(arrows, replaced_arrow) {
            const arrow_id = arrows.indexOf(replaced_arrow);
            return {
                id: DragState.arrow,
                is_model_drag: true,
                is_view_drag: false,
                initialize: () => new DiagramArrow(
                        replaced_arrow.arc,
                        true,
                        replaced_arrow.label,
                        replaced_arrow.label_offset,
                        replaced_arrow.source_style_id,
                        replaced_arrow.end_style_id,
                        replaced_arrow.line_style_id,
                    ),
                move: move,
                wheel: wheel,
                // delete the arrow if canceled or not snapped, otherwise edit the arrow
                command: (replacement_arrow, is_released, is_canceled) => 
                    is_canceled || (is_released && !replacement_arrow.arc.is_valid)?
                        new Command(
                          // forward
                          (model_inout, view_inout) => model_inout.arrows.splice(arrow_id, 1),
                          // backward
                          (model_inout, view_inout) => model_inout.arrows.splice(arrow_id, 0, replaced_arrow),
                        )
                      : new Command(
                            // forward
                            (model_inout, view_inout) => model_inout.arrows[arrow_id] = new DiagramArrow(
                                  replacement_arrow.arc,
                                  !is_released,
                                  replacement_arrow.label,
                                  replacement_arrow.label_offset,
                                  replacement_arrow.source_style_id,
                                  replacement_arrow.end_style_id,
                                  replacement_arrow.line_style_id,
                              ),
                            // backward
                            (model_inout, view_inout) => model_inout.arrows[arrow_id] = replaced_arrow,
                        )
            };
        },
    };
}
