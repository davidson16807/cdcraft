'use strict';

function SvgGridView(dependencies) {

    const svg                  = dependencies.svg;
    const screen_state_storage = dependencies.screen_state_storage;
    const diagram_ids          = dependencies.diagram_ids;
    const PanZoomMapping       = dependencies.PanZoomMapping;

    function cell_count(screen_frame_store) {
        return Math.ceil(Math.max(document.documentElement.clientWidth, document.documentElement.clientHeight) / Math.pow(2.0, screen_frame_store.log2_cell_width))+1;
    };

    return {
        draw: function(screen_frame_store, is_grid_hidden) {
            const count = cell_count(screen_frame_store);
            function cell_border_position(x,y) {
                const screen_frame = screen_state_storage.unpack(screen_frame_store);
                const model_border_position = diagram_ids.border_id_to_cell_position( diagram_ids.cell_position_to_border_id(screen_frame.origin).add(glm.ivec2(x-1,y-1)) );
                return PanZoomMapping(screen_frame).position.apply(model_border_position);
            };
            const lines = [];
            if (!is_grid_hidden) {
                for(let i=0; i<count; i++){
                    lines.push(
                        svg.line({class:"vertical-cell-border"},
                            cell_border_position(i,-count), 
                            cell_border_position(i,count),
                        ));
                    lines.push(
                        svg.line({class:"vertical-cell-border"},
                            cell_border_position(-count,i), 
                            cell_border_position(count,i),
                        ));
                }
            }
            return svg.g({id:"cell-borders"}, lines);
        }
    }
}
