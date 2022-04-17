'use strict';

function SvgAppView(dependencies, onevents) {

    const screen_frame_storage       = dependencies.screen_frame_storage;
    const arrow_positions_resource   = dependencies.arrow_positions_resource;
    const object_position_resource   = dependencies.object_position_resource;
    const resource_operations        = dependencies.resource_operations;
    const svg_grid_view              = dependencies.svg_grid_view;
    const svg_object_view            = dependencies.svg_object_view;
    const svg_arrow_view             = dependencies.svg_arrow_view;
    const svg_object_selection_view  = dependencies.svg_object_selection_view;
    const html_object_toolbar_view   = dependencies.html_object_toolbar_view;
    const svg_arrow_selection_view   = dependencies.svg_arrow_selection_view;
    const view_event_deferal         = dependencies.view_event_deferal;

    onevents = onevents || {};

    function frame_transform(screen_frame_store) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        return `translate(${-screen_frame.origin.x} ${-screen_frame.origin.y})`;
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

        if (new_app.is_grid_hidden) {
            dom_io.getElementById('toggle-grid').classList.remove('active');
        } else {
            dom_io.getElementById('toggle-grid').classList.add('active');
        }

        if (old_app == null || old_app.screen_frame_store != new_app.screen_frame_store) {
            dom_io
                .getElementById('transformation')
                .setAttribute('transformation', frame_transform(new_app.diagram.screen_frame_store));
            dom_io
                .getElementById('cell-borders')
                .replaceWith(svg_grid_view.draw(new_app.diagram.screen_frame_store, new_app.is_grid_hidden));
        }

        if (old_app == null || 
            old_app.diagram.arrow_selections != new_app.diagram.arrow_selections) {

            const is_single_arrow_selected = (
                new_app.diagram.inferred_object_selections.length < 1 &&
                new_app.diagram.object_selections.length < 1 &&
                new_app.diagram.arrow_selections.length == 1);
            dom_io.getElementById('arrow-toolbar')
                .classList[is_single_arrow_selected? 'remove' : 'add']('hidden');

            const arrow_selections_list = new_app.diagram.arrow_selections
                    .map(id => new_app.diagram.arrows[id])
                    .filter(arrow => arrow != null);
            dom_io.getElementById('arrow-selections')
                .replaceChildren(...arrow_selections_list
                    .map(arrow => 
                        svg_arrow_selection_view.draw(
                            dom_io,
                            new_app.diagram.screen_frame_store, 
                            arrow)));
            dom_io.getElementById('arrow-selection-hitboxes')
                .replaceChildren(...arrow_selections_list
                    .map(arrow => 
                        svg_arrow_selection_view.draw(
                            dom_io,
                            new_app.diagram.screen_frame_store, 
                            arrow,
                            (event, arrow_drawing, arrow, dom2) => onevents.selection_click(event, drawing, arrow, new_app, dom_io))));
        }


        if (old_app == null || 
            old_app.diagram.object_selections != new_app.diagram.object_selections || 
            old_app.diagram.inferred_object_selections != new_app.diagram.inferred_object_selections) {

            dom_io.getElementById('object-toolbar')
                .replaceWith(html_object_toolbar_view.draw(dom_io, new_app, 
                    (event, object_drawing, app, dom2) => onevents.textinput(event, drawing, new_app, dom_io),
                    (event, object_drawing, app, dom2) => onevents.buttonclick(event, drawing, new_app, dom_io),
                ));

            const object_selections = [
                ...new_app.diagram.inferred_object_selections,
                ...new_app.diagram.object_selections
                    .map(id => new_app.diagram.objects[id])
                    .filter(object => object != null),
            ];
            dom_io.getElementById('object-selections')
                .replaceChildren(...object_selections
                    .map(object => 
                        svg_object_selection_view.draw(
                            dom_io,
                            new_app.diagram.screen_frame_store, 
                            object)));
            dom_io.getElementById('object-selection-hitboxes')
                .replaceChildren(...object_selections
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
            const inferred_objects = 
                object_position_resource.post(
                    resource_operations.delete(
                        arrow_positions_resource.get(new_app.diagram.arrows),
                        object_position_resource.get(new_app.diagram.objects)
                    )
                );
            dom_io.getElementById('objects')
                .replaceChildren(...[...new_app.diagram.objects, ...inferred_objects]
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
        dom_io.getElementById('undo')        .addEventListener('click',  deferal.callback(onevents.buttonclick));
        dom_io.getElementById('redo')        .addEventListener('click',  deferal.callback(onevents.buttonclick));
        dom_io.getElementById('toggle-grid') .addEventListener('click',  deferal.callback(onevents.buttonclick));
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


