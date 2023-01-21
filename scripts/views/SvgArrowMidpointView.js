'use strict';

function SvgArrowMidpointView(dependencies, midpoint_width) {
    const PanZoomMapping = dependencies.PanZoomMapping;
    const svg = dependencies.svg;
    const svg_arrow_attributes = dependencies.svg_arrow_attributes;
    const view_event_deferal = dependencies.view_event_deferal;
    const screen_state_storage = dependencies.screen_state_storage;

    const drawing = {};
    drawing.draw = function(dom, screen_state_store, arrow, drag_type, onclick, onenter) {
        const screen_frame = screen_state_storage.unpack(screen_state_store);
        const screen_mapping = PanZoomMapping(screen_frame);
        const screen_midpoint_width = screen_mapping.distance.apply(midpoint_width);
        const trimmed_arc = svg_arrow_attributes.stored_arc_to_trimmed_arc(arrow.arc, screen_state_store);
        const screen_arc = svg_arrow_attributes.trimmed_arc_to_screen_arc(trimmed_arc, screen_state_store);

        const deferal = view_event_deferal(drawing, arrow, dom);

        const g = svg.g(
            {
                class: (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.circle(
                    {
                        class: "object-highlight", 
                        r: screen_midpoint_width/2.0
                    }, 
                    svg_arrow_attributes.sample(screen_arc, 0.5)
                ),
            ]);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
            g.addEventListener('touchstart', deferal.callbackPrevent(onclick));
        }
        if (onenter != null) {
            g.addEventListener('mousedown', deferal.callbackPrevent(onenter));
            g.addEventListener('mouseover', deferal.callbackPrevent(onenter));
        }
        return g;
    }
    return drawing;
}
