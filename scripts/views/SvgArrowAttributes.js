'use strict';

function SvgArrowAttributes(dependencies, settings) {
    const screen_state_storage         = dependencies.screen_state_storage;
    const user_arcs_and_stored_arcs    = dependencies.user_arcs_and_stored_arcs;
    const curried_user_arcs_and_flat_arcs = dependencies.curried_user_arcs_and_flat_arcs;
    const flat_arcs_and_sampler_arcs   = dependencies.flat_arcs_and_sampler_arcs;
    const sampler_arc_resizing         = dependencies.sampler_arc_resizing;
    const sampler_arc_properties       = dependencies.sampler_arc_properties;
    const sampler_arc_rendering        = dependencies.sampler_arc_rendering;
    const PanZoomMapping               = dependencies.PanZoomMapping;
    const AffineMapping                = dependencies.AffineMapping;
    const AffineRemapping              = dependencies.AffineRemapping;
    const SamplerArcMapping            = dependencies.SamplerArcMapping;

    const source_trim_length = settings.source_trim_length;
    const target_trim_length = settings.target_trim_length;

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

    return {

        flat_arc_to_trimmed_arc: function(flat_arc) {
            const sampler_arc = flat_arcs_and_sampler_arcs.flat_arc_to_sampler_arc(flat_arc)
            const trimmed_arc = sampler_arc_resizing.resize(sampler_arc, source_trim_length, -target_trim_length);
            return trimmed_arc;
        },

        trimmed_arc_to_screen_arc: function(trimmed_arc, screen_state_store) {
            const screen_state = screen_state_storage.unpack(screen_state_store);
            const screen_arc = SamplerArcMapping(PanZoomMapping(screen_state)).apply(trimmed_arc);
            return screen_arc;
        },

        head: function (trimmed_arc, screen_state_store) {
            const screen_state = screen_state_storage.unpack(screen_state_store);
            const arrowhead_mapping = 
                AffineMapping(AffineRemapping(PanZoomMapping(screen_state)).apply(
                    sampler_arc_properties.map(trimmed_arc, 1.0)));

            const cell_points = [glm.vec2(-0.04,-0.04), glm.vec2(0,0), glm.vec2(0.04,-0.04)];
            const screen_points = cell_points.map(point => arrowhead_mapping.position.revert(point));
            return 'M ' + screen_points.map(point => `${point.x} ${point.y}`).join(' L ');
        },

        sample: function (screen_arc, fraction) {
            return sampler_arc_properties.position(screen_arc, fraction);
        },

        path: function (screen_arc) {
            const svg_bezier = sampler_arc_rendering.sampler_arc_to_svg_bezier(screen_arc, 10);
            return svg_bezier_path_attribute(svg_bezier);
        },

    };
}
