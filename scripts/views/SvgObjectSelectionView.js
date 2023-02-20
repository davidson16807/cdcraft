'use strict';

function SvgObjectSelectionView(dependencies, highlight_width) {

    const PanZoomMapping             = dependencies.PanZoomMapping;
    const svg                        = dependencies.svg;
    const screen_state_storage       = dependencies.screen_state_storage;
    const view_event_deferal         = dependencies.view_event_deferal;

    const drawing = {};
    drawing.draw = function(screen_frame_store, object, drag_class, onclick, onenter) {
        const screen_frame = screen_state_storage.unpack(screen_frame_store);
        const screen_mapping = PanZoomMapping(screen_frame);
        const screen_highlight_width = screen_mapping.distance.apply(highlight_width);
        const g = svg.g(
            {},
            [
                svg.circle(
                    {
                        class: ["object-highlight", drag_class].join(' '), 
                        r: screen_highlight_width/2.0
                    }, 
                    screen_mapping.position.apply(object.position)
                ),
            ]);
        if (onclick != null) {
            g.addEventListener('mousedown',  onclick);
            g.addEventListener('touchstart', onclick);
        }
        if (onenter != null) {
            g.addEventListener('mousedown', onenter);
            g.addEventListener('mouseover', onenter);
        }
        return g;
    }
    return drawing;
}

