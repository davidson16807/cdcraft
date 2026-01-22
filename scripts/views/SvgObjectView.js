'use strict';

function SvgObjectAttributes(math) {
    const sign = math.sign;
    return {
        label_offset_id_to_offset: (offset) => glm.vec2(40*offset.x, -50*offset.y),
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

    const symbol_width = 100;

    return ({
        draw: function(screen_frame_store, object) {
            const screen_frame = screen_state_storage.unpack(screen_frame_store);
            const screen_mapping = PanZoomMapping(screen_frame);
            const screen_highlight_width = screen_mapping.distance.apply(highlight_width);
            const object_screen_position = screen_mapping.position.apply(object.position);
            const label_offset_id = object.label_offset_id || glm.ivec2(1,-1);
            const symbol = html.div({
                class:`object-label`,
                style:`font-size:${screen_mapping.distance.apply(1)}%;`,
                xmlns:"http://www.w3.org/1999/xhtml"
            },[], object.symbol || '\\[\\bullet\\]');
            render(symbol, {throwOnError: false});
            const label = html.div({
                class:`object-label`,
                style:
                    `font-size:${screen_mapping.distance.apply(1)}%;`+
                    svg_object_attributes.label_offset_id_to_style(label_offset_id),
                xmlns: "http://www.w3.org/1999/xhtml",
            }, [], object.label || '');
            const object_color = object.color??'contrast';
            const color_class = object_color.startsWith('#')? '':'object-'+object_color;
            const g = svg.g({class: `object ${color_class}`}, [
                    svg.foreignObject(
                        {
                            class: `object-label-wrapper ${color_class}`
                        }, [symbol], 
                        object_screen_position.add(glm.vec2(-symbol_width/2, screen_mapping.distance.apply(-0.13))),
                        glm.vec2(symbol_width, 30)),
                    svg.foreignObject(
                        {
                            class: `object-label-wrapper ${color_class}`
                        }, [label], 
                        object_screen_position.add(glm.vec2(0, screen_mapping.distance.apply(-0.13)))
                            .add(svg_object_attributes.label_offset_id_to_offset(label_offset_id)),
                        glm.vec2(1, 1)),
                ]);
            return g;
        }
    });
}
