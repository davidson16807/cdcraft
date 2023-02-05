'use strict';

function SvgArrowView(dependencies, highlight_width) {
    const PanZoomMapping = dependencies.PanZoomMapping;
    const svg = dependencies.svg;
    const html = dependencies.html;
    const screen_state_storage = dependencies.screen_state_storage;
    const svg_arrow_attributes = dependencies.svg_arrow_attributes;
    const view_event_deferal = dependencies.view_event_deferal;
    const render = dependencies.render;
    const curried_user_arcs_and_point_arcs = dependencies.curried_user_arcs_and_point_arcs;

    const sign = Math.sign;
    function linearstep(lo,hi,x) {
        return x<=lo? 0.0 : x >= hi? 1.0 : ((x-lo)/(hi-lo));
    }

    const drawing = {};
    drawing.draw = function(dom, screen_state_store, arrow, arrows, drag_type, onclick, onenter, onleave) {
        const screen_state = screen_state_storage.unpack(screen_state_store);
        const user_arcs_and_point_arcs = curried_user_arcs_and_point_arcs(arrows);
        const point_arc = user_arcs_and_point_arcs.user_arc_to_point_arc(
                            user_arcs_and_stored_arcs.stored_arc_to_user_arc(arrow.arc));
        const trimmed_arc = svg_arrow_attributes.point_arc_to_trimmed_arc(point_arc);
        const screen_arc = svg_arrow_attributes.trimmed_arc_to_screen_arc(trimmed_arc, screen_state_store);
        const screen_highlight_width = PanZoomMapping(screen_state).distance.apply(highlight_width);
        const text_width = 80;
        const arc_direction = glm.normalize(point_arc.target.sub(point_arc.source));
        const arc_midpoint = svg_arrow_attributes.sample(screen_arc, 0.5);
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
                    {class:"arrow-label-wrapper"}, [div], 
                    arc_midpoint
                        .add(arc_midpoint_direction_from_origin.mul(15))
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
