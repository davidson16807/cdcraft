'use strict';

function SvgObjectAttributes(math) {
    const sign = math.sign;
    return {
        label_offset_id_to_offset: (offset) => glm.vec2(0.08*offset.x, -0.1*offset.y),
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
            /*
            Append the label, measure its dimensions, then remove.
            This is not very performant, however measurement 
            can only be done when an element is added to the document.
            */
            // document.body.appendChild(symbol);
            // const symbol_width = Math.max(1, screen_mapping.distance.apply(symbol.offsetWidth/100));
            // document.body.removeChild(symbol);
            const symbol_width = screen_mapping.distance.apply(0.25);
            const symbol_height = screen_mapping.distance.apply(0.27);
            const g = svg.g({class: `object ${color_class}`}, [
                    svg.foreignObject(
                        {
                            class: `object-label-wrapper ${color_class}`
                        }, [symbol], 
                        object_screen_position.sub(glm.vec2(symbol_width/2, symbol_width/2)),
                        glm.vec2(symbol_width, symbol_width)),
                    svg.foreignObject(
                        {
                            class: `object-label-wrapper ${color_class}`
                        }, [label], 
                        object_screen_position
                            .sub(glm.vec2(0,symbol_height/2))
                            .add(screen_mapping.offset.apply(
                                svg_object_attributes.label_offset_id_to_offset(label_offset_id)
                            )),
                        glm.vec2(1, 1)),
                ]);
            return g;
        }
    });
}
