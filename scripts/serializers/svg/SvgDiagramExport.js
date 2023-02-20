'use strict';

function SvgDiagramExport(dependencies) {

    const screen_state_storage       = dependencies.screen_state_storage;
    const arrow_positions_resource   = dependencies.arrow_positions_resource;
    const object_position_resource   = dependencies.object_position_resource;
    const resource_operations        = dependencies.resource_operations;
    const svg_object_view            = dependencies.svg_object_view;
    const svg_arrow_view             = dependencies.svg_arrow_view;

    function frame_transform(screen_frame_store) {
        const screen_frame = screen_state_storage.unpack(screen_frame_store);
        return `translate(${-screen_frame.origin.x} ${-screen_frame.origin.y})`;
    };

    return {
        export: (diagram) => {

            const inferred_objects = 
                object_position_resource.post([],
                    resource_operations.delete(
                        arrow_positions_resource.get(diagram.arrows),
                        object_position_resource.get(diagram.objects)
                    )
                );

            return svg.svg({id:'graphics'},
                [
                    svg.g({transformation: frame_transform(diagram.screen_frame_store),},
                        [
                            svg.g({},
                                [...diagram.objects, ...inferred_objects]
                                    .map(object => 
                                        svg_object_view.draw(
                                            diagram.screen_frame_store, 
                                            object, 
                                            'highlight-never', 
                                        ))),
                            svg.g({}, 
                                diagram.arrows
                                    .map(arrow => 
                                        svg_arrow_view.draw(
                                            diagram.screen_frame_store, 
                                            arrow, 
                                            diagram.arrows,
                                            'highlight-never', 
                                        )))
                        ],
                    ),
                ],
            );

        },
    };
}


