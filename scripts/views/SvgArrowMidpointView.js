'use strict';

function SvgArrowMidpointView(dependencies, midpoint_width) {
    const PanZoomMapping = dependencies.PanZoomMapping;
    const svg = dependencies.svg;
    const svg_arrow_attributes = dependencies.svg_arrow_attributes;
    const view_event_deferal = dependencies.view_event_deferal;
    const screen_state_storage = dependencies.screen_state_storage;
    const curried_stored_arcs_and_point_arcs = dependencies.curried_stored_arcs_and_point_arcs;

    const drawing = {};
    drawing.draw = function(dom, screen_state_store, arrow, arrows, drag_type, onclick, onenter, onleave) {
        const screen_frame = screen_state_storage.unpack(screen_state_store);
        const screen_mapping = PanZoomMapping(screen_frame);
        const screen_midpoint_width = screen_mapping.distance.apply(midpoint_width);
        const stored_arcs_and_point_arcs = curried_stored_arcs_and_point_arcs(arrows);
        const point_arc = stored_arcs_and_point_arcs.stored_arc_to_point_arc(arrow.arc);
        const trimmed_arc = svg_arrow_attributes.point_arc_to_trimmed_arc(point_arc);
        const screen_arc = svg_arrow_attributes.trimmed_arc_to_screen_arc(trimmed_arc, screen_state_store);


        const g = svg.g(
            {
                class: (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.circle(
                    {
                        class: "object-highlight", 
                        r: screen_midpoint_width/2.0
                    }, 
                    svg_arrow_attributes.sample(screen_arc, 0.5)
                ),
            ]);
        const deferal = view_event_deferal(drawing, arrow, dom);
        if (onclick != null) {
            g.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
            g.addEventListener('touchstart', deferal.callbackPrevent(onclick));
        }
        if (onenter != null) {
            g.addEventListener('mousedown', deferal.callbackPrevent(onenter));
            g.addEventListener('mouseover', deferal.callbackPrevent(onenter));
        }
        if (onleave != null) {
            g.addEventListener('mouseout', deferal.callbackPrevent(onleave));
        }
        return g;
    }
    return drawing;
}
