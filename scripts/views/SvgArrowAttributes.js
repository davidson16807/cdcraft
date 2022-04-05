'use strict';

function SvgArrowAttributes(dependencies, settings) {
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const user_arcs_and_stored_arcs  = dependencies.user_arcs_and_stored_arcs;
    const user_arcs_and_sampler_arcs = dependencies.user_arcs_and_sampler_arcs;
    const sampler_arc_resizing       = dependencies.sampler_arc_resizing;
    const sampler_arc_shifting       = dependencies.sampler_arc_shifting;
    const sampler_arc_properties     = dependencies.sampler_arc_properties;
    const sampler_arc_rendering      = dependencies.sampler_arc_rendering;
    const position_shifting          = dependencies.position_shifting;
    const offset_shifting            = dependencies.offset_shifting;

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

        sample: function (screen_frame_store, stored_arc, fraction) {
            const screen_frame = screen_frame_storage.unpack(screen_frame_store);
            const user_arc = user_arcs_and_stored_arcs.stored_arc_to_user_arc(stored_arc);
            const sampler_arc = user_arcs_and_sampler_arcs.user_arc_to_sampler_arc(user_arc);
            const resized_arc = sampler_arc_resizing.resize(sampler_arc, source_trim_length, -target_trim_length);
            const screen_arc = sampler_arc_shifting.enter(resized_arc, screen_frame);
            return sampler_arc_properties.position(screen_arc, fraction*screen_arc.length_clockwise);
        },

        path: function (screen_frame_store, stored_arc) {
            const screen_frame = screen_frame_storage.unpack(screen_frame_store);
            const user_arc = user_arcs_and_stored_arcs.stored_arc_to_user_arc(stored_arc);
            const sampler_arc = user_arcs_and_sampler_arcs.user_arc_to_sampler_arc(user_arc);
            const resized_arc = sampler_arc_resizing.resize(sampler_arc, source_trim_length, -target_trim_length);
            const screen_arc = sampler_arc_shifting.enter(resized_arc, screen_frame);

            const svg_bezier = sampler_arc_rendering.sampler_arc_to_svg_bezier(screen_arc, 10);
            const svg_path = svg_bezier_path_attribute(svg_bezier);
            return svg_path;
        },

        head: function (screen_frame_store, stored_arc) {
            const screen_frame = screen_frame_storage.unpack(screen_frame_store);
            const user_arc = user_arcs_and_stored_arcs.stored_arc_to_user_arc(stored_arc);
            const sampler_arc = user_arcs_and_sampler_arcs.user_arc_to_sampler_arc(user_arc);
            const resized_arc = sampler_arc_resizing.resize(sampler_arc, source_trim_length, -target_trim_length);
            const arrowhead_basis_x = offset_shifting.enter(sampler_arc_properties.normal(resized_arc, resized_arc.length_clockwise), screen_frame);
            const arrowhead_basis_y = offset_shifting.enter(sampler_arc_properties.tangent(resized_arc, resized_arc.length_clockwise), screen_frame);
            const arrowhead_origin = position_shifting.enter(sampler_arc_properties.position(resized_arc, resized_arc.length_clockwise), screen_frame);

            const cell_points = [glm.vec2(-0.04,-0.04), glm.vec2(0,0), glm.vec2(0.04,-0.04)];
            const screen_points = cell_points.map(point => arrowhead_basis_x.mul(point.x).add(arrowhead_basis_y.mul(point.y)).add(arrowhead_origin));
            const path = 'M ' + screen_points.map(point => `${point.x} ${point.y}`).join(' L ');
            return path;
        },

    };
}
