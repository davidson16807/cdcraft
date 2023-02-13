'use strict';

function SvgArrowAttributes(dependencies) {
    const screen_state_storage   = dependencies.screen_state_storage;
    const sampler_arc_properties = dependencies.sampler_arc_properties;
    const sampler_arc_rendering  = dependencies.sampler_arc_rendering;
    const PanZoomMapping         = dependencies.PanZoomMapping;
    const AffineMapping          = dependencies.AffineMapping;
    const AffineRemapping        = dependencies.AffineRemapping;

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

        head: function (trimmed_arc, screen_state_store, cell_points) {
            const screen_state = screen_state_storage.unpack(screen_state_store);
            const arrowhead_mapping = 
                AffineMapping(AffineRemapping(PanZoomMapping(screen_state)).apply(
                    sampler_arc_properties.map(trimmed_arc, 1)));
            const screen_points = cell_points.map(point => arrowhead_mapping.position.revert(point));
            return 'M ' + screen_points.map(point => `${point.x} ${point.y}`).join(' L ');
        },

        path: function (screen_arc) {
            const svg_bezier = sampler_arc_rendering.sampler_arc_to_svg_bezier(screen_arc, 10);
            return svg_bezier_path_attribute(svg_bezier);
        },

        tail: function (trimmed_arc, screen_state_store, cell_points) {
            const screen_state = screen_state_storage.unpack(screen_state_store);
            const arrowhead_mapping = 
                AffineMapping(AffineRemapping(PanZoomMapping(screen_state)).apply(
                    sampler_arc_properties.map(trimmed_arc, 0)));
            const screen_points = cell_points.map(point => arrowhead_mapping.position.revert(point));
            return 'M ' + screen_points.map(point => `${point.x} ${point.y}`).join(' L ');
        },

    };
}
