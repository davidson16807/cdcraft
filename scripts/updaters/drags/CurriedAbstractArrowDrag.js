'use strict';

function CurriedAbstractArrowDrag(
        user_arcs_and_stored_arcs, 
        curried_user_arcs_and_flat_arcs, 
        math){
    const sign = math.sign;
    const abs = math.abs;
    const max = math.max;
    return (arrows) => {
        return {
            id: DragState.arrow,
            
            move: (arrow_in, screen_positions, screen_state) => 
                arrow_in.with({
                    arc: user_arcs_and_stored_arcs.user_arc_to_stored_arc(
                        arrow_in.arc.with({
                            target: arrow_in.arc.target.reference == null? 
                                  arrow_in.arc.target.with({ 
                                    position: PanZoomMapping(screen_state).position.revert(screen_positions[0])})
                                : arrow_in.arc.target
                        })),
                }),

            wheel: (arrow_in, screen_focus, scroll_count) => {
                const flat_arc = curried_user_arcs_and_flat_arcs(arrows).user_arc_to_flat_arc(arrow_in.arc)
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

            objectenter: (arrow_in, object) => arrow_in,

            arrowenter: (arrow_in, arrow) => 
                arrow_in.with({
                    arc: arrow_in.arc.with({
                        target: new Node(null, arrows.indexOf(arrow))}) }),

            arrowleave: (arrow_in, screen_positions, screen_state) => 
                arrow_in.with({
                    arc: arrow_in.arc.with({
                        target: new Node(PanZoomMapping(screen_state).position.revert(screen_positions[0])),
                    }),
                }),
        }
    }
}
