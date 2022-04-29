'use strict';

function SvgArrowSelectionView(dependencies, highlight_width) {
    const PanZoomMapping = dependencies.PanZoomMapping;
    const svg = dependencies.svg;
    const svg_arrow_attributes = dependencies.svg_arrow_attributes;
    const view_event_deferal = dependencies.view_event_deferal;
    const screen_state_storage = dependencies.screen_state_storage;

    const drawing = {};
    drawing.draw = function(dom, screen_state_store, arrow, onclick) {
        const screen_frame = screen_state_storage.unpack(screen_state_store);
        const trimmed_arc = svg_arrow_attributes.stored_arc_to_trimmed_arc(arrow.arc, screen_state_store);
        const screen_arc = svg_arrow_attributes.trimmed_arc_to_screen_arc(trimmed_arc, screen_state_store);
        const screen_highlight_width = PanZoomMapping(screen_frame).distance.apply(highlight_width);
        const g = svg.g(
            {},
            [
                svg.path({class:"arrow-highlight", d: svg_arrow_attributes.path(screen_arc), 'stroke-width':screen_highlight_width}),
                svg.circle({class:"arrow-tip-highlight", r:screen_highlight_width/2.0}, svg_arrow_attributes.sample(screen_arc, 0)),
                svg.circle({class:"arrow-tip-highlight", r:screen_highlight_width/2.0}, svg_arrow_attributes.sample(screen_arc, 1)),
            ]);
        const deferal = view_event_deferal(drawing, arrow, dom);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
            g.addEventListener('touchstart', deferal.callbackPrevent(onclick));
        }
        return g;
    }
    return drawing;
}
