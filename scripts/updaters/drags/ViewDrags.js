'use strict';

function ViewDrags(screen_frame_storage, position_shifting, offset_shifting, 
        log2_cell_width_change_per_scroll, log2_cell_width_min, log2_cell_width_max){
    const storage = screen_frame_storage;
    const max = Math.max;
    const min = Math.min;
    const clamp = (x, lo, hi) => min(max(x, lo), hi);
    return {

        pan: function(original_screen_frame_store){
            return {
                id: DragState.pan,
                is_model_drag: false,
                is_view_drag: true,
                initialize: () => original_screen_frame_store.with({}),
                move: (screen_frame_store, model_position, model_offset) => 
                    screen_frame_store.with({
                        topleft_cell_position: screen_frame_store.topleft_cell_position.sub(model_offset), 
                    }),
                wheel: (screen_frame_store, screen_focus, scroll_count) => screen_frame_store,
                command: (screen_frame_store, is_released, is_canceled) => 
                    diagram => diagram.with({screen_frame_store: screen_frame_store})
            };
        },

        release: function(original_screen_frame_store){
            const max = Math.max;
            const min = Math.min;
            return {
                id: DragState.released,
                is_model_drag: false,
                is_view_drag: false,
                initialize: () => original_screen_frame_store.with({}),
                move: (screen_frame_store, model_position, model_offset) => screen_frame_store,
                wheel: function(screen_frame_store, model_focus, scroll_count) {
                    const log2_cell_width_change = log2_cell_width_change_per_scroll * scroll_count;
                    const screen_frame = storage.unpack(screen_frame_store);
                    const updated_log2_cell_width = clamp(
                            screen_frame_store.log2_cell_width + log2_cell_width_change, 
                            log2_cell_width_min, 
                            log2_cell_width_max
                        );
                    const topleft_zoom_frame_store = 
                        new ScreenReferenceFrameStore(
                            screen_frame_store.topleft_cell_position, 
                            updated_log2_cell_width
                        );
                    const topleft_zoom_frame = storage.unpack(topleft_zoom_frame_store);
                    const screen_focus = position_shifting.enter(model_focus, screen_frame);
                    const screen_zoom_offset = position_shifting.enter(model_focus, topleft_zoom_frame).sub(screen_focus);
                    const model_zoom_offset = offset_shifting.leave(screen_zoom_offset, screen_frame);
                    return new ScreenReferenceFrameStore(
                            screen_frame_store.topleft_cell_position.add(model_zoom_offset), 
                            updated_log2_cell_width
                        );
                },
                command: (screen_frame_store, is_released, is_canceled) => 
                    diagram => diagram.with({screen_frame_store: screen_frame_store})
            };
        }

    };
}
