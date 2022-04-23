'use strict';

function SvgArrowAttributes(dependencies, settings) {
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const user_arcs_and_stored_arcs  = dependencies.user_arcs_and_stored_arcs;
    const user_arcs_and_sampler_arcs = dependencies.user_arcs_and_sampler_arcs;
    const sampler_arc_resizing       = dependencies.sampler_arc_resizing;
    const sampler_arc_transformation = dependencies.sampler_arc_transformation;
    const sampler_arc_properties     = dependencies.sampler_arc_properties;
    const sampler_arc_rendering      = dependencies.sampler_arc_rendering;
    const offset_transformation      = dependencies.offset_transformation;
    const position_transformation    = dependencies.position_transformation;
    const position_affine_transformation     = dependencies.position_affine_transformation;
    const affine_frame_screen_transformation = dependencies.affine_frame_screen_transformation;

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
            const screen_arc = sampler_arc_transformation.enter(resized_arc, screen_frame);
            return sampler_arc_properties.position(screen_arc, fraction*screen_arc.length_clockwise);
        },

        path: function (screen_frame_store, stored_arc) {
            const screen_frame = screen_frame_storage.unpack(screen_frame_store);
            const user_arc = user_arcs_and_stored_arcs.stored_arc_to_user_arc(stored_arc);
            const sampler_arc = user_arcs_and_sampler_arcs.user_arc_to_sampler_arc(user_arc);
            const resized_arc = sampler_arc_resizing.resize(sampler_arc, source_trim_length, -target_trim_length);
            const screen_arc = sampler_arc_transformation.enter(resized_arc, screen_frame);

            const svg_bezier = sampler_arc_rendering.sampler_arc_to_svg_bezier(screen_arc, 10);
            const svg_path = svg_bezier_path_attribute(svg_bezier);
            return svg_path;
        },

        head: function (screen_frame_store, stored_arc) {
            const screen_frame = screen_frame_storage.unpack(screen_frame_store);
            const user_arc = user_arcs_and_stored_arcs.stored_arc_to_user_arc(stored_arc);
            const sampler_arc = user_arcs_and_sampler_arcs.user_arc_to_sampler_arc(user_arc);
            const resized_arc = sampler_arc_resizing.resize(sampler_arc, source_trim_length, -target_trim_length);
            const arrowhead_frame = 
                affine_frame_screen_transformation.enter(
                    sampler_arc_properties.frame(resized_arc, resized_arc.length_clockwise), 
                screen_frame);

            const cell_points = [glm.vec2(-0.04,-0.04), glm.vec2(0,0), glm.vec2(0.04,-0.04)];
            const screen_points = 
                cell_points.map(point => position_affine_transformation.leave(point, arrowhead_frame));
            const path = 'M ' + screen_points.map(point => `${point.x} ${point.y}`).join(' L ');
            return path;
        },

    };
}
