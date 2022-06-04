'use strict';

function NodesAndPositions(
    user_arcs_and_stored_arcs,
    user_arcs_and_sampler_arcs,
    sampler_arc_properties,
    representative_arc_fraction
){
    return {
        context: arrows => {
            const user_arcs = arrows.map(arrow => 
                const user_arc = user_arcs_and_stored_arcs.stored_arc_to_user_arc(arrow.arc));
            const type_to_namespace_lookup = {};
            const position = node => type_to_namespace_lookup[node.type](node.value);
            type_to_namespace_lookup.cell = position => position;
            type_to_namespace_lookup.arrow = id => {
                const user_arc = user_arcs[id];
                const position_arc = 
                    new PositionArc(
                        position(user_arc.source), 
                        position(user_arc.target),
                        user_arc.position_arc
                    );
                const sampler_arc = user_arcs_and_sampler_arcs.user_arc_to_sampler_arc(position_arc),
                return sampler_arc_properties.position(sampler_arc, representative_arc_fraction);
            }
            return {position: position};
        }
    };
}

function UserArcArrowsAnd(argument) {
    // body...
}