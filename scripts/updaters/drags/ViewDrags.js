'use strict';

function ViewDrags(
        PanZoomMapping, 
        screen_frame_store, 
        log2_cell_width_change_per_scroll, 
        log2_cell_width_min, 
        log2_cell_width_max){
    const storage = screen_frame_store;
    const max = Math.max;
    const min = Math.min;
    const log2 = Math.log2;
    const clamp = (x, lo, hi) => min(max(x, lo), hi);

    function min_distance(positions) {
        let min_distance = Infinity;
        for (var i = 0; i < positions.length; i++) {
            for (var j = i+1; j < positions.length; j++) {
                glm.distance(positions[i], positions[j]);
            }
        }
        return min_distance;
    }

    return {

        pan: function(original_cell_to_pixel_store, original_screen_positions){
            const original_cell_to_pixel = storage.unpack(original_cell_to_pixel_store);
            const original_screen_midpoint = original_screen_positions[0];
            const original_screen_distance = min_distance(original_screen_positions);

            return {
                id: DragState.pan,
                initialize: () => 
                    original_cell_to_pixel_store.with({}),
                move: (cell_to_pixel_store, screen_positions, cell_to_pixel) => {
                    const cell_to_pixel_mapping = PanZoomMapping(cell_to_pixel);
                    const screen_midpoint = screen_positions[0];
                    const screen_distance = min_distance(screen_positions);
                    const screen_midpoint_offset = screen_midpoint.sub(original_screen_midpoint);
                    const model_midpoint_offset = cell_to_pixel_mapping.offset.revert(screen_midpoint_offset);
                    const scaling = (screen_distance / original_screen_distance) || 1.0;
                    return original_cell_to_pixel_store.with({
                        topleft_cell_position: 
                            original_cell_to_pixel_store.topleft_cell_position.sub(model_midpoint_offset),
                        log2_cell_width: 
                            original_cell_to_pixel_store.log2_cell_width - 
                            (log2(original_screen_distance / screen_distance) || 0.0)
                    });
                },
                wheel: (cell_to_pixel_store, screen_focus, scroll_count) => cell_to_pixel_store,
                arrowenter: (state, arrow) => state,
                arrowleave: (state, screen_position, model_to_screen) => state,
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
                    const cell_to_pixel = storage.unpack(cell_to_pixel_store);
                    const updated_log2_cell_width = clamp(
                            cell_to_pixel_store.log2_cell_width + log2_cell_width_change, 
                            log2_cell_width_min, 
                            log2_cell_width_max
                        );
                    const cell_to_zoomed_pixel = 
                        new ScreenStateStore(
                            cell_to_pixel_store.topleft_cell_position, 
                            updated_log2_cell_width
                        );
                    const cell_to_zoomed_pixel_mapping = PanZoomMapping(storage.unpack(cell_to_zoomed_pixel));
                    const cell_to_pixel_mapping = PanZoomMapping(cell_to_pixel);
                    const screen_focus = cell_to_pixel_mapping.position.apply(model_focus);
                    const screen_zoom_offset = cell_to_zoomed_pixel_mapping.position.apply(model_focus).sub(screen_focus);
                    const model_zoom_offset = cell_to_pixel_mapping.offset.revert(screen_zoom_offset);
                    return new ScreenStateStore(
                            cell_to_pixel_store.topleft_cell_position.add(model_zoom_offset), 
                            updated_log2_cell_width
                        );
                },
                arrowenter: (state, arrow) => state,
                arrowleave: (state, screen_position, model_to_screen) => state,
                objectenter: (state, object) => state,
                command: (cell_to_pixel_store, is_released, is_canceled) => 
                    diagram => diagram.with({screen_frame_store: cell_to_pixel_store})
            };
        }

    };
}
