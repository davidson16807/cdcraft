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
    drawing.draw = function(dom, screen_frame_store, arrow, onclick) {
        const g = svg.g(
            {},
            [
                svg.path({class:"arrow-highlight", d: arrows.path(screen_frame_store, arrow.arc)}),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrows.sample(screen_frame_store, arrow.arc,0)),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrows.sample(screen_frame_store, arrow.arc,1)),
            ]);
        const deferal = view_event_deferal(drawing, arrow, dom);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
        }
        return g;
    }
    return drawing;
}
