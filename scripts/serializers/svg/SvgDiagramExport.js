'use strict';

function SvgDiagramExport(dependencies) {


const style = `
svg{
 /* set "overflow: hidden" to hide the scrollbar ; */
 overflow : hidden;
 font-family: sans-serif;
 background-color: white;
 color: black;
}
@media (prefers-color-scheme: dark){
 svg {
  background-color: black;
  color: white;
  fill: white !important;
 }
}
.arrow-label{
 font-size: 161%;
 width: fit-content; /*needed for js to find width using offsetWidth*/
}
.arrow-green{
 stroke: #28a745;
 color: #28a745;
}
.arrow-blue{
 stroke: #007bff;
 color: #007bff;
}
.arrow-red{
 stroke: #dc3545;
 color: #dc3545;
}
.arrow-yellow{
 stroke: #ffc107;
 color: #ffc107;
}
.arrow-contrast{
 stroke: black;
 color: black;
}
@media (prefers-color-scheme: dark){
 .arrow-contrast {
  stroke: white;
  color: white;
 }
}
.object {
 font-size: 161%;
 overflow: visible;
 visibility: visible;
}
.object-label{
 font-size: 161%;
 width: fit-content; /*needed for js to find width using offsetWidth*/
}
.object-green{
 color: #28a745;
}
.object-blue{
 color: #007bff;
}
.object-red{
 color: #dc3545;
}
.object-yellow{
 color: #ffc107;
}
.object-contrast{
 color: black;
}
@media (prefers-color-scheme: dark){
 .object-contrast {
  color: white;
 }
}
.katex-display {
 margin: 0;
}
/*hidden class used by katex internals*/
.mord{
 display:none;
 visibility:hidden;
}
`;
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

            return svg.svg(
                {
                    id:            'graphics',
                    viewBox:       [0, 0, 
                        document.documentElement.clientWidth,
                        document.documentElement.clientHeight].join(' '),
                    xmlns:         "http://www.w3.org/2000/svg",
                    'xmlns:xhtml': "http://www.w3.org/1999/xhtml",
                },
                [
                    svg.style({},[],style.replaceAll(/\s/g, '').replaceAll(/\/\*.*?\*\//g, '')),
                    svg.g({transformation: frame_transform(diagram.screen_frame_store),},
                        [
                            svg.g({},
                                [...diagram.objects, ...inferred_objects]
                                    .map(object => 
                                        svg_object_view.draw(
                                            diagram.screen_frame_store, 
                                            object, 
                                        ))),
                            svg.g({}, 
                                diagram.arrows
                                    .map(arrow => 
                                        svg_arrow_view.draw(
                                            diagram.screen_frame_store, 
                                            arrow, 
                                            diagram.arrows,
                                        )))
                        ],
                    ),
                ],
            );

        },
    };
}


