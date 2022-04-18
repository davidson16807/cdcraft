'use strict';

function SvgArrowView(dependencies) {
    const svg = dependencies.svg;
    const arrows = dependencies.svg_arrow_attributes;
    const distance_shifting = dependencies.distance_shifting;
    const view_event_deferal = dependencies.view_event_deferal;

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, arrow, drag_type, onclick, onenter) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        const text_width = 80;
        const g = svg.g(
            {
                class: 'arrow-group ' + (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.path({class:"arrow-highlight", d: arrows.path(screen_frame_store, arrow.arc), 'stroke-width':distance_shifting.enter(0.3, screen_frame)}),
                svg.circle({class:"arrow-tip-highlight", r:distance_shifting.enter(0.15, screen_frame)}, arrows.sample(screen_frame_store, arrow.arc,0)),
                svg.circle({class:"arrow-tip-highlight", r:distance_shifting.enter(0.15, screen_frame)}, arrows.sample(screen_frame_store, arrow.arc,1)),
                // svg.circle({class:"arrow-handle", r:13} arrows.sample(arrow.arc,0)),
                // svg.circle({class:"arrow-handle", r:13} arrows.sample(arrow.arc,1)),
                svg.path({class:"arrow", d: arrows.head(screen_frame_store, arrow.arc)}),
                svg.path({class:"arrow", d: arrows.path(screen_frame_store, arrow.arc)}),
            ]);
        const deferal = view_event_deferal(drawing, arrow, dom);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
        }
        if (onclick != null) {
            g.addEventListener('mouseenter', deferal.callbackPrevent(onenter));
        }
        return g;
    }
    return drawing;
}
