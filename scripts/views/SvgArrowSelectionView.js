'use strict';

function SvgArrowSelectionView(dependencies) {

    const svg = dependencies.svg;
    const arrows = dependencies.svg_arrow_attributes;
    const distance_shifting = dependencies.distance_shifting;
    const view_event_deferal = dependencies.view_event_deferal;

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, arrow, onclick) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        const g = svg.g(
            {},
            [
                svg.path({class:"arrow-highlight", d: arrows.path(screen_frame_store, arrow.arc), 'stroke-width':distance_shifting.enter(0.3, screen_frame)}),
                svg.circle({class:"arrow-tip-highlight", r:distance_shifting.enter(0.15, screen_frame)}, arrows.sample(screen_frame_store, arrow.arc,0)),
                svg.circle({class:"arrow-tip-highlight", r:distance_shifting.enter(0.15, screen_frame)}, arrows.sample(screen_frame_store, arrow.arc,1)),
            ]);
        const deferal = view_event_deferal(drawing, arrow, dom);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
        }
        return g;
    }
    return drawing;
}
