'use strict';

function SvgObjectView(dependencies) {

    const svg                        = dependencies.svg;
    const html                       = dependencies.html;
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const diagram_ids                = dependencies.diagram_ids;
    const position_shifting          = dependencies.position_shifting;
    const distance_shifting          = dependencies.distance_shifting;
    const view_event_deferal         = dependencies.view_event_deferal;
    const render                     = dependencies.render;

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, object, drag_type, onclick, onenter) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        const object_screen_position = position_shifting.enter(object.position, screen_frame);
        const text_width = 80;
        const div = html.div({},[], object.depiction || '\\[\\bullet\\]');
        render(div, {throwOnError: false});
        const g = svg.g(
            {
                class: (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.circle(
                    {class:"object-highlight", r:distance_shifting.enter(0.25, screen_frame)}, 
                    object_screen_position),
                svg.foreignObject(
                    {class:"object", width:text_width, height:40}, [div], 
                    object_screen_position.sub(glm.vec2(text_width/2, 0)))
            ]);
        const deferal = view_event_deferal(drawing, object, dom);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
        }
        if (onenter != null) {
            g.addEventListener('mouseenter', deferal.callbackPrevent(onenter));
        }
        return g;
    }
    return drawing;
}
