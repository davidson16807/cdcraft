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
    const highlight_width    = settings.highlight_width;

    const sign = Math.sign;
    function linearstep(lo,hi,x) {
        return x<=lo? 0.0 : x >= hi? 1.0 : ((x-lo)/(hi-lo));
    }

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

    const drawing = {};
    drawing.draw = function(dom, screen_state_store, arrow, arrows, drag_type, onclick, onenter, onleave) {
        const screen_state = screen_state_storage.unpack(screen_state_store);
        const point_arc = stored_arcs_and_point_arcs_curried(arrows).stored_arc_to_point_arc(arrow.arc);
        const sampler_arc = point_arcs_and_sampler_arcs.point_arc_to_sampler_arc(point_arc);
        const trimmed_arc = sampler_arc_transforms.trim(sampler_arc, source_trim_length, -target_trim_length);
        const screen_arc = SamplerArcMapping(PanZoomMapping(screen_state)).apply(trimmed_arc);
        const screen_highlight_width = PanZoomMapping(screen_state).distance.apply(highlight_width);
        const text_width = 80;
        const arc_direction = glm.normalize(point_arc.target.sub(point_arc.source));
        const arc_midpoint = sampler_arc_properties.position(screen_arc, 0.5);
        const arc_midpoint_offset_from_origin = arc_midpoint.sub(screen_arc.origin);
        const arc_midpoint_direction_from_origin = 
            glm.length(arc_midpoint_offset_from_origin) > 1? 
            glm.normalize(arc_midpoint_offset_from_origin) : glm.vec2(0,1);
        const div = html.div({class:"arrow-label"},[], arrow.label);
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
                class: 'arrow-group ' + (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.path({class:"arrow-highlight", d: svg_arrow_attributes.path(screen_arc), 'stroke-width':screen_highlight_width}),
                svg.circle({class:"arrow-tip-highlight", r:screen_highlight_width/2.0}, sampler_arc_properties.position(screen_arc, 0)),
                svg.circle({class:"arrow-tip-highlight", r:screen_highlight_width/2.0}, sampler_arc_properties.position(screen_arc, 1)),
                // svg.circle({class:"arrow-handle", r:13} sampler_arc_properties.position(screen_arc,0)),
                // svg.circle({class:"arrow-handle", r:13} sampler_arc_properties.position(screen_arc,1)),
                svg.path({class:"arrow", d: svg_arrow_attributes.head(trimmed_arc, screen_state_store)}),
                svg.path({class:"arrow", d: svg_arrow_attributes.path(screen_arc)}),
                // svg.path({class:"arrow", d: svg_arrow_attributes.path(screen_arc.with({source_offset: screen_arc.source_offset.add(glm.normalize(screen_arc.source_offset).mul(4))}))}),
                // svg.path({class:"arrow", d: svg_arrow_attributes.path(screen_arc.with({source_offset: screen_arc.source_offset.sub(glm.normalize(screen_arc.source_offset).mul(4))}))}),
                svg.foreignObject(
                    {class:"arrow-label-wrapper"}, [div], 
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
