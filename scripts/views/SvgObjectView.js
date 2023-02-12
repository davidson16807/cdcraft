'use strict';

function SvgObjectAttributes(math) {
    const sign = math.sign;
    return {
        label_offset_id_to_offset: (offset) => glm.vec2(12*offset.x, -20-40*offset.y),
        label_offset_id_to_style:  (offset) => 'float:'+(offset.x>=0? 'left':'right'),
    };
}

function SvgObjectView(dependencies, highlight_width) {

    const PanZoomMapping             = dependencies.PanZoomMapping;
    const svg                        = dependencies.svg;
    const html                       = dependencies.html;
    const svg_object_attributes      = dependencies.svg_object_attributes;
    const screen_state_storage       = dependencies.screen_state_storage;
    const view_event_deferal         = dependencies.view_event_deferal;
    const render                     = dependencies.render;

    const text_center = glm.vec2(-8, -20);

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, object, drag_type, onclick, onenter) {
        const screen_frame = screen_state_storage.unpack(screen_frame_store);
        const screen_mapping = PanZoomMapping(screen_frame);
        const screen_highlight_width = screen_mapping.distance.apply(highlight_width);
        const object_screen_position = screen_mapping.position.apply(object.position);
        const label_offset_id = object.label_offset_id || glm.vec2(1,-1);
        const symbol = html.div({},[], object.symbol || '\\[\\bullet\\]');
        render(symbol, {throwOnError: false});
        const label = html.div({
            style:svg_object_attributes.label_offset_id_to_style(label_offset_id),
        }, [], object.label || '');
        const inner_g = svg.g(
            {
                class: (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.circle(
                    {class:"object-highlight", r:screen_highlight_width/2.0}, 
                    object_screen_position),
                svg.foreignObject(
                    {class:"object"}, [symbol], 
                    object_screen_position.add(text_center),
                    glm.vec2(1, 1)),
            ]);
        const outer_g = svg.g({}, [
                inner_g, 
                svg.foreignObject(
                    {class:"object"}, [label], 
                    object_screen_position.add(
                        svg_object_attributes.label_offset_id_to_offset(label_offset_id)),
                    glm.vec2(1, 1)),
            ]);
        const deferal = view_event_deferal(drawing, object, dom);
        if (onclick != null) {
            outer_g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
            outer_g.addEventListener('touchstart', deferal.callbackPrevent(onclick));
        }
        if (onenter != null) {
            outer_g.addEventListener('mousedown', deferal.callbackPrevent(onenter));
            outer_g.addEventListener('mouseover', deferal.callbackPrevent(onenter));
        }
        return outer_g;
    }
    return drawing;
}
