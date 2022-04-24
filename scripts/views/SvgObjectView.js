'use strict';

function SvgObjectView(dependencies, highlight_width) {

    const PanZoomMapping             = dependencies.PanZoomMapping;
    const svg                        = dependencies.svg;
    const html                       = dependencies.html;
    const screen_state_storage       = dependencies.screen_state_storage;
    const view_event_deferal         = dependencies.view_event_deferal;
    const render                     = dependencies.render;

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, object, drag_type, onclick, onenter) {
        const screen_frame = screen_state_storage.unpack(screen_frame_store);
        const screen_mapping = PanZoomMapping(screen_frame);
        const screen_highlight_width = screen_mapping.distance.apply(highlight_width);
        const object_screen_position = screen_mapping.position.apply(object.position);
        const div = html.div({},[], object.depiction || '\\[\\bullet\\]');
        render(div, {throwOnError: false});
        const g = svg.g(
            {
                class: (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.circle(
                    {class:"object-highlight", r:screen_highlight_width/2.0}, 
                    object_screen_position),
                svg.foreignObject(
                    {class:"object"}, [div], 
                    object_screen_position.sub(glm.vec2(5, 14)),
                    glm.vec2(1, 1))
            ]);
        const deferal = view_event_deferal(drawing, object, dom);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
        }
        if (onenter != null) {
            g.addEventListener('mousedown', deferal.callbackPrevent(onenter));
            g.addEventListener('mouseover', deferal.callbackPrevent(onenter));
        }
        return g;
    }
    return drawing;
}
