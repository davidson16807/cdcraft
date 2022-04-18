'use strict';

function SvgObjectSelectionView(dependencies) {

    const svg                        = dependencies.svg;
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const diagram_ids                = dependencies.diagram_ids;
    const position_shifting          = dependencies.position_shifting;
    const distance_shifting          = dependencies.distance_shifting;
    const view_event_deferal         = dependencies.view_event_deferal;

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, object, onclick) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        const g = svg.g(
            {},
            [
                svg.circle(
                    {
                        class: "object-highlight", 
                        r: distance_shifting.enter(0.25, screen_frame)
                    }, 
                    position_shifting.enter(object.position, screen_frame)
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

