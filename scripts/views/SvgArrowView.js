'use strict';

function SvgArrowView(dependencies, settings) {

    const stored_arcs_and_point_arcs_curried = dependencies.stored_arcs_and_point_arcs_curried;
    const point_arcs_and_sampler_arcs  = dependencies.point_arcs_and_sampler_arcs;

    const AffineMapping          = dependencies.AffineMapping;
    const AffineRemapping        = dependencies.AffineRemapping;
    const PanZoomMapping         = dependencies.PanZoomMapping;
    const SamplerArcMapping      = dependencies.SamplerArcMapping;

    const render                 = dependencies.render;
    const sampler_arc_properties = dependencies.sampler_arc_properties;
    const sampler_arc_transforms = dependencies.sampler_arc_transforms;
    const screen_state_storage   = dependencies.screen_state_storage;
    const html                   = dependencies.html;
    const svg                    = dependencies.svg;
    const svg_arrow_attributes   = dependencies.svg_arrow_attributes;
    const view_event_deferal     = dependencies.view_event_deferal;

    const source_trim_length = settings.source_trim_length;
    const target_trim_length = settings.target_trim_length;
    const arrow_line_spacing = settings.arrow_line_spacing;
    const arrow_head_slope   = settings.arrow_head_slope;
    const arrow_line_width   = settings.arrow_line_width;
    const highlight_width    = settings.highlight_width;

    const sign = Math.sign;
    const ceil = Math.ceil;
    const abs = Math.abs;
    function linearstep(lo,hi,x) {
        return x<=lo? 0.0 : x >= hi? 1.0 : ((x-lo)/(hi-lo));
    }

    const offset_line_id = (line_id, line_count) => line_id+(line_count+1)%2;
    const line_offset_id = (offset_line_id) => ceil(offset_line_id/2) * sign(offset_line_id%2-(1/2));
    const line_offset    = (line_id, line_count) => line_offset_id(offset_line_id(line_id, line_count)) * arrow_line_spacing;

    function svg_bezier_path_attribute(bezier){
        const points = bezier.points;
        const source = points[0];
        let output = `M ${source.x} ${source.y}`;
        for (let i = 1; i+1 < points.length; i+=2) {
            const control = points[i];
            const sample = points[i+1];
            output += ` Q ${control.x} ${control.y} ${sample.x} ${sample.y}`;
        }
        return output;
    }

    const line_style = [
        '',
        `${2*arrow_line_width} ${arrow_line_width}`,
        `${arrow_line_width} ${2*arrow_line_width}`,
    ];

    const head_style = [
        [],
        [glm.vec2(0.05,-0.05),  glm.vec2(0,0)],
        [glm.vec2(0.05,-0.05), glm.vec2(0,0), glm.vec2(-0.05,-0.05)],
                               [glm.vec2(0,0), glm.vec2(-0.05,-0.05)],
        [glm.vec2(-0.05,0), glm.vec2(0.05,0)],
    ];

    const tail_style = [
        [],
                                                   [glm.vec2(0.05,0), glm.vec2(0.04,-0.02), glm.vec2(0.01,-0.02), glm.vec2(0,0)],
                           [glm.vec2(-0.05,-0.05),  glm.vec2(0,0), glm.vec2(0.05,-0.05)],
        [glm.vec2(-0.05,0), glm.vec2(-0.04,-0.02), glm.vec2(-0.01,-0.02), glm.vec2(0,0)],
        [glm.vec2(-0.05,0), glm.vec2(0.05,0)],
    ];

    const drawing = {};
    drawing.draw = function(dom, screen_state_store, arrow, arrows, drag_class, onclick, onenter, onleave) {
        const screen_state = screen_state_storage.unpack(screen_state_store);
        const point_arc = stored_arcs_and_point_arcs_curried(arrows).stored_arc_to_point_arc(arrow.arc);
        const sampler_arc = point_arcs_and_sampler_arcs.point_arc_to_sampler_arc(point_arc);
        const trimmed_arc = sampler_arc_transforms.trim(sampler_arc, source_trim_length, -target_trim_length);
        const screen_mapping = PanZoomMapping(screen_state);
        const screen_arc = SamplerArcMapping(screen_mapping).apply(trimmed_arc);
        const screen_highlight_width = screen_mapping.distance.apply(highlight_width);
        const text_width = 80;
        const arc_direction = glm.normalize(point_arc.target.sub(point_arc.source));
        const arc_midpoint = sampler_arc_properties.position(screen_arc, 0.5);
        const arc_midpoint_offset_from_origin = arc_midpoint.sub(screen_arc.origin);
        const arc_midpoint_direction_from_origin = 
            glm.length(arc_midpoint_offset_from_origin) > 1? 
            glm.normalize(arc_midpoint_offset_from_origin) : glm.vec2(0,1);
        const color_class = arrow.color.startsWith('#')? '':'arrow-'+arrow.color;
        const div = html.div({class:`arrow-label`},[], arrow.label);
        render(div, {throwOnError: false});
        /*
        Append the label, measure its dimensions, then remove.
        This is not very performant, however measurement 
        can only be done when an element is added to the document.
        */
        document.body.appendChild(div);
        const label_height = div.offsetHeight;
        const label_width = div.offsetWidth;
        document.body.removeChild(div);
        const label_offset_id = arrow.label_offset_id || glm.ivec2(0,1);
        const g = svg.g(
            {
                class: `arrow-group ${color_class} ${drag_class}`,
                // color: arrow.color.startsWith('#')? arrow.color:'',
            },
            [
                svg.path({
                    'stroke-width': screen_highlight_width, 
                    'stroke-linecap':'round', 
                    class:"arrow-highlight", 
                    d: svg_arrow_attributes.path(screen_arc), 
                }),
                svg.path({
                    'stroke-width': arrow_line_width,
                    class:"arrow", 
                    d: svg_arrow_attributes.head(trimmed_arc, screen_state_store, head_style[arrow.head_style_id]),
                }),
                svg.path({
                    'stroke-width': arrow_line_width,
                    class:"arrow", 
                    d: svg_arrow_attributes.tail(trimmed_arc, screen_state_store, tail_style[arrow.tail_style_id]),
                }),
                ...[...Array(arrow.line_count).keys()].map(
                    line_id => 
                        svg.path({
                            'stroke-dasharray': line_style[arrow.line_style_id],
                            'stroke-width':     arrow_line_width,
                            class:"arrow", 
                            d: svg_arrow_attributes.path(
                                sampler_arc_transforms.trim(
                                    sampler_arc_transforms.shift(
                                        screen_arc, 
                                        line_offset(line_id, arrow.line_count)),
                                    0, -abs(line_offset(line_id, arrow.line_count) * arrow_head_slope)
                                )),
                        })
                ),
                svg.foreignObject(
                    {
                        class:`arrow-label-wrapper ${color_class}`
                    }, [div], 
                    arc_midpoint
                        .add(arc_midpoint_direction_from_origin.mul(15*label_offset_id.y))
                        .sub(glm.vec2(label_width * linearstep(-1, 1, -sign(arrow.arc.min_length_clockwise)*arc_direction.y), 
                                      label_height/2.0)),
                    glm.vec2(1, 1)),
            ]);
        const deferal = view_event_deferal(drawing, arrow, dom);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
            g.addEventListener('touchstart', deferal.callbackPrevent(onclick));
        }
        if (onenter != null) {
            g.addEventListener('mousedown', deferal.callbackPrevent(onenter));
            g.addEventListener('mouseenter', deferal.callbackPrevent(onenter));
        }
        if (onleave != null) {
            g.addEventListener('mouseleave', deferal.callbackPrevent(onleave));
        }
        return g;
    }
    return drawing;
}
