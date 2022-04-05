'use strict';

function SvgArrowSelectionView(svg, svg_arrow_attributes, view_event_deferal) {
    const arrows = svg_arrow_attributes;

    function arrow_selection_click (arrow, event) {
        if (!arrow.is_edited && event.button == 0) {
            event.preventDefault(); 
            event.stopPropagation();
            // application_updater.arrowclick(this.state, arrow, this.state);
        }
    };

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, arrow, drag_type, onclick) {
        const g = svg.g(
            {

                onmousedown: event => event.button == 0 && deferal.callbackPreventStop(onclick)(event),
            },
            [
                svg.path({class:"arrow-highlight", d: arrows.path(screen_frame_store, arrow.arc)}),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrows.sample(screen_frame_store, arrow.arc,0)),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrows.sample(screen_frame_store, arrow.arc,1)),
            ]);
        const deferal = view_event_deferal(drawing, arrow, dom);
        g.addEventListener('mousedown',  event => event.button == 0 && deferal.callbackPreventStop(onclick)(event));
        return g;
    }
    return drawing;
}
