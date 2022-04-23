'use strict';

function SvgObjectSelectionView(dependencies, highlight_width) {

    const PanZoomMapping             = dependencies.PanZoomMapping;
    const svg                        = dependencies.svg;
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const view_event_deferal         = dependencies.view_event_deferal;

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, object, onclick) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        const screen_mapping = PanZoomMapping(screen_frame);
        const screen_highlight_width = screen_mapping.distance.apply(highlight_width);
        const g = svg.g(
            {},
            [
                svg.circle(
                    {
                        class: "object-highlight", 
                        r: screen_highlight_width/2.0
                    }, 
                    screen_mapping.position.apply(object.position)
                ),
            ]);
        const deferal = view_event_deferal(drawing, object, dom);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
        }
        return g;
    }
    return drawing;
}

