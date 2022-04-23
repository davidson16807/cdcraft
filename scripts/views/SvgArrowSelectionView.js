'use strict';

function SvgArrowSelectionView(dependencies, highlight_width) {
    const PanZoomMapping = dependencies.PanZoomMapping;
    const svg = dependencies.svg;
    const arrows = dependencies.svg_arrow_attributes;
    const view_event_deferal = dependencies.view_event_deferal;

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, arrow, onclick) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        const screen_highlight_width = PanZoomMapping(screen_frame).distance.apply(highlight_width);
        const g = svg.g(
            {},
            [
                svg.path({class:"arrow-highlight", d: arrows.path(screen_frame_store, arrow.arc), 'stroke-width':screen_highlight_width}),
                svg.circle({class:"arrow-tip-highlight", r:screen_highlight_width/2.0}, arrows.sample(screen_frame_store, arrow.arc,0)),
                svg.circle({class:"arrow-tip-highlight", r:screen_highlight_width/2.0}, arrows.sample(screen_frame_store, arrow.arc,1)),
            ]);
        const deferal = view_event_deferal(drawing, arrow, dom);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
        }
        return g;
    }
    return drawing;
}
