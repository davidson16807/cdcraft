'use strict';

function SvgArrowSelectionView(dependencies, settings) {
    const PanZoomMapping                     = dependencies.PanZoomMapping;
    const SamplerArcMapping                  = dependencies.SamplerArcMapping;
    const svg                                = dependencies.svg;
    const svg_arrow_attributes               = dependencies.svg_arrow_attributes;
    const view_event_deferal                 = dependencies.view_event_deferal;
    const screen_state_storage               = dependencies.screen_state_storage;
    const stored_arcs_and_point_arcs_curried = dependencies.stored_arcs_and_point_arcs_curried;

    const source_trim_length = settings.source_trim_length;
    const target_trim_length = settings.target_trim_length;
    const highlight_width    = settings.highlight_width;

    const drawing = {};
    drawing.draw = function(dom, screen_state_store, arrow, arrows, onclick) {
        const screen_frame = screen_state_storage.unpack(screen_state_store);
        const stored_arcs_and_point_arcs = stored_arcs_and_point_arcs_curried(arrows);
        const point_arc = stored_arcs_and_point_arcs.stored_arc_to_point_arc(arrow.arc);
        const sampler_arc = point_arcs_and_sampler_arcs.point_arc_to_sampler_arc(point_arc);
        const trimmed_arc = sampler_arc_transforms.trim(sampler_arc, source_trim_length, -target_trim_length);
        const screen_mapping = PanZoomMapping(screen_frame);
        const screen_arc = SamplerArcMapping(screen_mapping).apply(trimmed_arc);
        const screen_highlight_width = screen_mapping.distance.apply(highlight_width);
        const path = svg.path({class:"arrow-highlight", d: svg_arrow_attributes.path(screen_arc), 'stroke-width':screen_highlight_width, 'stroke-linecap':'round'});
        const deferal = view_event_deferal(drawing, arrow, dom);
        if (onclick != null) {
            path.addEventListener('mousedown',  deferal.callbackPrevent(onclick));
            path.addEventListener('touchstart', deferal.callbackPrevent(onclick));
        }
        return path;
    }
    return drawing;
}
