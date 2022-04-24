'use strict';

function SvgArrowView(dependencies, highlight_width) {
    const PanZoomMapping = dependencies.PanZoomMapping;
    const svg = dependencies.svg;
    const html = dependencies.html;
    const screen_state_storage = dependencies.screen_state_storage;
    const svg_arrow_attributes = dependencies.svg_arrow_attributes;
    const view_event_deferal = dependencies.view_event_deferal;
    const render = dependencies.render;

    const drawing = {};
    drawing.draw = function(dom, screen_state_store, arrow, drag_type, onclick, onenter) {
        const screen_state = screen_state_storage.unpack(screen_state_store);
        const trimmed_arc = svg_arrow_attributes.stored_arc_to_trimmed_arc(arrow.arc, screen_state_store);
        const screen_arc = svg_arrow_attributes.trimmed_arc_to_stored_arc(trimmed_arc, screen_state_store);
        const screen_highlight_width = PanZoomMapping(screen_state).distance.apply(highlight_width);
        const text_width = 80;
        const arrow_screen_midpoint = svg_arrow_attributes.sample(screen_arc, 0.5);
        const div = html.div({},[], arrow.label);
        render(div, {throwOnError: false});
        const g = svg.g(
            {
                class: 'arrow-group ' + (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.path({class:"arrow-highlight", d: svg_arrow_attributes.path(screen_arc), 'stroke-width':screen_highlight_width}),
                svg.circle({class:"arrow-tip-highlight", r:screen_highlight_width/2.0}, svg_arrow_attributes.sample(screen_arc,0)),
                svg.circle({class:"arrow-tip-highlight", r:screen_highlight_width/2.0}, svg_arrow_attributes.sample(screen_arc,1)),
                // svg.circle({class:"arrow-handle", r:13} svg_arrow_attributes.sample(screen_arc,0)),
                // svg.circle({class:"arrow-handle", r:13} svg_arrow_attributes.sample(screen_arc,1)),
                svg.path({class:"arrow", d: svg_arrow_attributes.head(trimmed_arc, screen_state_store)}),
                svg.path({class:"arrow", d: svg_arrow_attributes.path(screen_arc)}),
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
