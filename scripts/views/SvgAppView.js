'use strict';

function SvgAppView(dependencies, onevents) {

    const screen_frame_storage       = dependencies.screen_frame_storage;
    const object_set_ops             = dependencies.diagram_object_set_ops;
    const svg_grid_view              = dependencies.svg_grid_view;
    const svg_object_view            = dependencies.svg_object_view;
    const svg_arrow_view             = dependencies.svg_arrow_view;
    const svg_object_selection_view  = dependencies.svg_object_selection_view;
    const svg_arrow_selection_view   = dependencies.svg_arrow_selection_view;
    const view_event_deferal         = dependencies.view_event_deferal;

    onevents = onevents || {};

    function frame_transform(screen_frame_store) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        return `translate(${-screen_frame.origin.x} ${-screen_frame.origin.y})`;
    };

    function inferred_objects (diagram) {
        const inferred = object_set_ops.set_to_list(
                object_set_ops.update(
                    object_set_ops.infer(diagram.arrows), 
                    object_set_ops.list_to_set(diagram.objects)
                ));
        return inferred;
    };

    const drawing = {};

    function _redraw(old_app, new_app, dom_io) {
        if (old_app == null || old_app.drag_type != new_app.drag_type){
            dom_io
                .getElementById('graphics')
                .setAttribute('cursor', new_app.drag_type.id == 'released'? 'default' : 'move')
        }

        if (old_app == null || old_app.undo_history != new_app.undo_history){
            dom_io.getElementById('undo').disabled = new_app.undo_history.length == 0;
        }

        if (old_app == null || old_app.redo_history != new_app.redo_history){
            dom_io.getElementById('redo').disabled = new_app.redo_history.length == 0;
        }

        if (old_app == null || old_app.screen_frame_store != new_app.screen_frame_store) {
            dom_io
                .getElementById('transformation')
                .setAttribute('transformation', frame_transform(new_app.diagram.screen_frame_store));
            dom_io
                .getElementById('cell-borders')
                .replaceWith(svg_grid_view.draw(new_app.diagram.screen_frame_store, new_app.is_grid_hidden));
        }
        if (new_app.is_grid_hidden) {
            dom_io.getElementById('toggle-grid').classList.remove('active');
        } else {
            dom_io.getElementById('toggle-grid').classList.add('active');
        }

        if (old_app == null || old_app.diagram.arrow_selections != new_app.diagram.arrow_selections) {
            dom_io.getElementById('arrow-selections')
                .replaceChildren(...new_app.diagram.arrow_selections
                    .map(arrow => 
                        svg_arrow_selection_view.draw(
                            dom_io,
                            new_app.diagram.screen_frame_store, 
                            arrow)));
            dom_io.getElementById('arrow-selection-hitboxes')
                .replaceChildren(...new_app.diagram.arrow_selections
                    .map(arrow => 
                        svg_arrow_selection_view.draw(
                            dom_io,
                            new_app.diagram.screen_frame_store, 
                            arrow, 
                            (event, arrow_drawing, arrow, dom2) => onevents.selection_click(event, drawing, arrow, new_app, dom_io))));
        }

        if (old_app == null || old_app.diagram.object_selections != new_app.diagram.object_selections) {
            dom_io.getElementById('object-selections')
                .replaceChildren(...new_app.diagram.object_selections
                    .map(object => 
                        svg_object_selection_view.draw(
                            dom_io,
                            new_app.diagram.screen_frame_store, 
                            object)));
            dom_io.getElementById('object-selection-hitboxes')
                .replaceChildren(...new_app.diagram.object_selections
                    .map(object => 
                        svg_object_selection_view.draw(
                            dom_io,
                            new_app.diagram.screen_frame_store, 
                            object, 
                            (event, arrow_drawing, object, dom2) => onevents.selection_click(event, drawing, object, new_app, dom_io))));
        }

        if (old_app == null || 
            old_app.diagram.objects != new_app.diagram.objects || 
            old_app.drag_type != new_app.drag_type) {
            dom_io.getElementById('objects')
                .replaceChildren(...inferred_objects(new_app.diagram)
                    .map(object => 
                        svg_object_view.draw(
                            dom_io,
                            new_app.diagram.screen_frame_store, 
                            object, 
                            new_app.drag_type, 
                            (event, arrow_drawing, object, dom2) => onevents.objectclick(event, drawing, object, new_app, dom_io),
                            (event, arrow_drawing, object, dom2) => onevents.objectselect(event, drawing, object, new_app, dom_io))));
        }

        if (old_app == null || 
            old_app.diagram.arrows != new_app.diagram.arrows || 
            old_app.drag_type != new_app.drag_type) {
            dom_io.getElementById('arrows')
                .replaceChildren(...new_app.diagram.arrows
                    .map(arrow => 
                        svg_arrow_view.draw(
                            dom_io,
                            new_app.diagram.screen_frame_store, 
                            arrow, 
                            new_app.drag_type, 
                            (event, arrow_drawing, arrow, dom2) => onevents.arrowclick(event, drawing, arrow, new_app, dom_io),
                            (event, arrow_drawing, arrow, dom2) => onevents.arrowselect(event, drawing, arrow, new_app, dom_io))));
        }

    }

    drawing.wire = function(app, dom_io){
        const deferal = view_event_deferal(drawing, app, dom_io);
        // keyboard events
        dom_io.addEventListener('keydown', deferal.callback(onevents.keydown));
        // button events
        dom_io.getElementById('undo')        .addEventListener('click', deferal.callback(onevents.buttonclick));
        dom_io.getElementById('redo')        .addEventListener('click', deferal.callback(onevents.buttonclick));
        dom_io.getElementById('toggle-grid') .addEventListener('click', deferal.callback(onevents.buttonclick));
        // mouse/touchpad events
        const graphics_io = dom_io.getElementById('graphics');
        graphics_io.addEventListener('contextmenu', deferal.callbackPrevent     (onevents.contextmenu ));
        graphics_io.addEventListener('mousedown',   deferal.callbackPrevent     (onevents.mousedown   ));
        graphics_io.addEventListener('mousemove',   deferal.callbackPrevent     (onevents.mousemove   ));
        graphics_io.addEventListener('mouseup',     deferal.callback            (onevents.mouseup     ));
        graphics_io.addEventListener('wheel',       deferal.callback            (onevents.wheel       ));
        graphics_io.addEventListener('touchsource', deferal.callback            (onevents.touchsource ));
        graphics_io.addEventListener('touchmove',   deferal.callbackPreventStop (onevents.touchmove   ));
        graphics_io.addEventListener('touchend',    deferal.callback            (onevents.touchend    ));
        _redraw(undefined, app, dom_io);
    };

    drawing.redraw = function(old_app, new_app, dom_io)
    {
        _redraw(old_app, new_app, dom_io);
    }

    return drawing;
}


