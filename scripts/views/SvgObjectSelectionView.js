'use strict';

function SvgObjectSelectionView(dependencies, highlight_width) {

    const svg                        = dependencies.svg;
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const position_framing          = dependencies.position_framing;
    const distance_framing          = dependencies.distance_framing;
    const view_event_deferal         = dependencies.view_event_deferal;

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, object, onclick) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        const screen_highlight_width = distance_framing.enter(highlight_width, screen_frame);
        const g = svg.g(
            {},
            [
                svg.circle(
                    {
                        class: "object-highlight", 
                        r: screen_highlight_width/2.0
                    }, 
                    position_framing.enter(object.position, screen_frame)
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

