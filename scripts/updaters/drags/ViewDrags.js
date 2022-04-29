'use strict';

function ViewDrags(PanZoomMapping, screen_frame_store, 
        log2_cell_width_change_per_scroll, log2_cell_width_min, log2_cell_width_max){
    const storage = screen_frame_store;
    const max = Math.max;
    const min = Math.min;
    const clamp = (x, lo, hi) => min(max(x, lo), hi);

    function midpoint(positions) {
        let midpoint = glm.vec2();
        for (var i = 0; i < positions.length; i++) {
            midpoint = midpoint.add(positions[i]);
        }
        return midpoint.div(positions.length);
    }

    return {

        pan: function(original_cell_to_pixel_store, original_screen_positions){
            const original_screen_midpoint = midpoint(original_screen_positions);

            return {
                id: DragState.pan,
                initialize: () => 
                    original_cell_to_pixel_store.with({}),
                move: (cell_to_pixel_store, screen_positions, cell_to_pixel) => {
                    const screen_midpoint = midpoint(screen_positions);
                    const screen_midpoint_offset = screen_midpoint.sub(original_screen_midpoint);
                    const model_midpoint_offset = PanZoomMapping(cell_to_pixel).offset.revert(screen_midpoint_offset);
                    return original_cell_to_pixel_store.with({
                        topleft_cell_position: 
                            original_cell_to_pixel_store.topleft_cell_position.sub(model_midpoint_offset), 
                    });
                },
                wheel: (cell_to_pixel_store, screen_focus, scroll_count) => cell_to_pixel_store,
                arrowenter: (state, arrow) => state,
                objectenter: (state, object) => state,
                command: (cell_to_pixel_store, is_released, is_canceled) => 
                    diagram => diagram.with({screen_frame_store: cell_to_pixel_store})
            };
        },

        release: function(original_cell_to_pixel_store){
            const max = Math.max;
            const min = Math.min;
            return {
                id: DragState.released,
                initialize: () => original_cell_to_pixel_store.with({}),
                move: (cell_to_pixel_store, screen_positions, screen_state) => cell_to_pixel_store,
                wheel: function(cell_to_pixel_store, model_focus, scroll_count) {
                    const log2_cell_width_change = log2_cell_width_change_per_scroll * scroll_count;
                    const screen_frame = storage.unpack(cell_to_pixel_store);
                    const updated_log2_cell_width = clamp(
                            cell_to_pixel_store.log2_cell_width + log2_cell_width_change, 
                            log2_cell_width_min, 
                            log2_cell_width_max
                        );
                    const topleft_zoom_frame_store = 
                        new ScreenStateStore(
                            cell_to_pixel_store.topleft_cell_position, 
                            updated_log2_cell_width
                        );
                    const topleft_zoom_mapping = PanZoomMapping(storage.unpack(topleft_zoom_frame_store));
                    const screen_mapping = PanZoomMapping(screen_frame);
                    const screen_focus = screen_mapping.position.apply(model_focus);
                    const screen_zoom_offset = topleft_zoom_mapping.position.apply(model_focus).sub(screen_focus);
                    const model_zoom_offset = screen_mapping.offset.revert(screen_zoom_offset);
                    return new ScreenStateStore(
                            cell_to_pixel_store.topleft_cell_position.add(model_zoom_offset), 
                            updated_log2_cell_width
                        );
                },
                arrowenter: (state, arrow) => state,
                objectenter: (state, object) => state,
                command: (cell_to_pixel_store, is_released, is_canceled) => 
                    diagram => diagram.with({screen_frame_store: cell_to_pixel_store})
            };
        }

    };
}
