'use strict';

function SvgObjectView(dependencies) {

    const svg                        = dependencies.svg;
    const html                       = dependencies.html;
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const diagram_ids                = dependencies.diagram_ids;
    const position_shifting          = dependencies.position_shifting;
    const view_event_deferal         = dependencies.view_event_deferal;

    function screen_position (screen_frame_store, position) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        return position_shifting.enter(position, screen_frame);
    };

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, object, drag_type, onclick, onselect) {
        const object_screen_position = screen_position(screen_frame_store, object.position);
        const text_width = 80;
        const g = svg.g(
            {
                class: (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.circle(
                    {class:"object-highlight", r:23}, 
                    object_screen_position),
                svg.foreignObject(
                    {class:"object", width:text_width, height:40}, 
                    [html.div({},[],'∙')], 
                    object_screen_position.sub(glm.vec2(text_width/2, 0)))
            ]);
        const deferal = view_event_deferal(drawing, object, dom);
        if (onclick) {
            g.addEventListener('mousedown',  event => event.button == 0 && deferal.callbackPreventStop(onclick)(event));
        }
        if (onselect) {
            g.addEventListener('mousedown',  event => event.button == 2 && deferal.callbackPreventStop(onselect)(event));
            g.addEventListener('mouseenter', event => (!object.is_edited && event.buttons == 2) && deferal.callbackPreventStop(onselect)(event));
        }
        return g;
    }
    return drawing;
}
