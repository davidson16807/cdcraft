'use strict';

function SvgArrowView(dependencies, highlight_width) {
    const svg = dependencies.svg;
    const html = dependencies.html;
    const arrows = dependencies.svg_arrow_attributes;
    const distance_shifting = dependencies.distance_shifting;
    const view_event_deferal = dependencies.view_event_deferal;

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, arrow, drag_type, onclick, onenter) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        const screen_highlight_width = distance_shifting.enter(highlight_width, screen_frame);
        const text_width = 80;
        const arrow_screen_midpoint = arrows.sample(screen_frame_store, arrow.arc, 0.5);
        const div = html.div({},[], arrow.label);
        const g = svg.g(
            {
                class: 'arrow-group ' + (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.path({class:"arrow-highlight", d: arrows.path(screen_frame_store, arrow.arc), 'stroke-width':screen_highlight_width}),
                svg.circle({class:"arrow-tip-highlight", r:screen_highlight_width/2.0}, arrows.sample(screen_frame_store, arrow.arc,0)),
                svg.circle({class:"arrow-tip-highlight", r:screen_highlight_width/2.0}, arrows.sample(screen_frame_store, arrow.arc,1)),
                // svg.circle({class:"arrow-handle", r:13} arrows.sample(arrow.arc,0)),
                // svg.circle({class:"arrow-handle", r:13} arrows.sample(arrow.arc,1)),
                svg.path({class:"arrow", d: arrows.head(screen_frame_store, arrow.arc)}),
                svg.path({class:"arrow", d: arrows.path(screen_frame_store, arrow.arc)}),
                svg.foreignObject(
                    {class:"object"}, [div], 
                    arrow_screen_midpoint.sub(glm.vec2(5, 14)),
                    glm.vec2(1, 1)),
            ]);
        const deferal = view_event_deferal(drawing, arrow, dom);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
        }
        if (onclick != null) {
            g.addEventListener('mousedown', deferal.callbackPrevent(onenter));
            g.addEventListener('mouseover', deferal.callbackPrevent(onenter));
        }
        return g;
    }
    return drawing;
}
