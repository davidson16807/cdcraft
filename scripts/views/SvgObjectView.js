'use strict';

function SvgObjectAttributes(math) {
    const sign = math.sign;
    return {
        label_offset_id_to_offset: (offset) => glm.vec2(12.5*offset.x, -33.3-40*offset.y),
        label_offset_id_to_style:  (offset) => 'float:'+(offset.x>=0? 'left':'right'),
    };
}

function SvgObjectView(dependencies, highlight_width) {

    const PanZoomMapping             = dependencies.PanZoomMapping;
    const svg                        = dependencies.svg;
    const html                       = dependencies.html;
    const svg_object_attributes      = dependencies.svg_object_attributes;
    const screen_state_storage       = dependencies.screen_state_storage;
    const render                     = dependencies.render;

    const text_center = glm.vec2(-12.5, -33.3);

    const drawing = {};
    drawing.draw = function(screen_frame_store, object) {
        const screen_frame = screen_state_storage.unpack(screen_frame_store);
        const screen_mapping = PanZoomMapping(screen_frame);
        const screen_highlight_width = screen_mapping.distance.apply(highlight_width);
        const object_screen_position = screen_mapping.position.apply(object.position);
        const label_offset_id = object.label_offset_id || glm.ivec2(1,-1);
        const symbol = html.div({},[], object.symbol || '\\[\\bullet\\]');
        render(symbol, {throwOnError: false});
        const label = html.div({
            style:svg_object_attributes.label_offset_id_to_style(label_offset_id),
        }, [], object.label || '');
        const object_color = object.color??'contrast';
        const color_class = object_color.startsWith('#')? '':'object-'+object_color;
        const g = svg.g({class: 'object'}, [
                svg.foreignObject(
                    {
                        class: `object ${color_class}` // TODO: do we need to duplicate the object class here?
                    }, [symbol], 
                    object_screen_position.add(text_center),
                    glm.vec2(1, 1)),
                svg.foreignObject(
                    {
                        class: `object ${color_class}` // TODO: do we need to duplicate the object class here?
                    }, [label], 
                    object_screen_position.add(
                        svg_object_attributes.label_offset_id_to_offset(label_offset_id)),
                    glm.vec2(1, 1)),
            ]);
        return g;
    }
    return drawing;
}
