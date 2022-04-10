'use strict';

function SvgObjectSelectionView(dependencies) {

    const svg                        = dependencies.svg;
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const diagram_ids                = dependencies.diagram_ids;
    const position_shifting          = dependencies.position_shifting;
    const view_event_deferal         = dependencies.view_event_deferal;

    function screen_position (screen_frame_store, position) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        return position_shifting.enter(position, screen_frame);
    };

    function object_selection_click (object, event) {
        if (!object.is_edited && event.button == 0) {
            event.preventDefault(); 
            event.stopPropagation();
            // application_updater.objectclick(this.state, object, this.state);
        }
    };

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, object, opacity, onclick) {
        const g = svg.g(
            {
                opacity: opacity,
            },
            [
                svg.circle({class:"object-highlight", r:23}, screen_position(screen_frame_store, object.position)),
            ]);
        const deferal = view_event_deferal(drawing, object, dom);
        g.addEventListener('mousedown',  event => event.button == 0 && deferal.callbackPreventStop(onclick)(event));
        return g;
    }
    return drawing;
}

