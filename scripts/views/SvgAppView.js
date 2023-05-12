'use strict';

function SvgAppView(dependencies, onevents) {

    const screen_state_storage       = dependencies.screen_state_storage;
    const arrow_positions_resource   = dependencies.arrow_positions_resource;
    const object_position_resource   = dependencies.object_position_resource;
    const resource_operations        = dependencies.resource_operations;
    const svg_grid_view              = dependencies.svg_grid_view;
    const svg_object_view            = dependencies.svg_object_view;
    const svg_arrow_view             = dependencies.svg_arrow_view;
    const svg_object_selection_view  = dependencies.svg_object_selection_view;
    const svg_arrow_selection_view   = dependencies.svg_arrow_selection_view;
    const svg_arrow_midpoint_view    = dependencies.svg_arrow_midpoint_view;
    const view_event_deferal         = dependencies.view_event_deferal;
    const html_object_toolbar_view   = dependencies.html_object_toolbar_view;
    const html_arrow_toolbar_view    = dependencies.html_arrow_toolbar_view;
    const html_multientity_toolbar_view = dependencies.html_multientity_toolbar_view;

    onevents = onevents || {};

    function frame_transform(screen_frame_store) {
        const screen_frame = screen_state_storage.unpack(screen_frame_store);
        return `translate(${-screen_frame.origin.x} ${-screen_frame.origin.y})`;
    };

    const drawing = {};

    function _redraw(old_app, new_app, dom_io, trigger) {
        typecheck(old_app, 'AppState+1');
        typecheck(new_app, 'AppState');

        if (old_app?.drag_type != new_app.drag_type){
            dom_io
                .getElementById('graphics')
                .setAttribute('cursor', new_app.drag_type.id == 'released'? 'default' : 'move')
        }

        if ((old_app?.save_state) != (new_app.save_state)){
            dom_io.getElementById('save-svg-image').hidden = (new_app.save_state == 'svg');
            dom_io.getElementById('saved-svg-image').hidden = (new_app.save_state != 'svg');
            dom_io.getElementById('save-url-image').hidden = (new_app.save_state == 'url');
            dom_io.getElementById('saved-url-image').hidden = (new_app.save_state != 'url');
            // dom_io.getElementById('save-latex-image').hidden = (new_app.save_state == 'latex');
            // dom_io.getElementById('saved-latex-image').hidden = (new_app.save_state != 'latex');
        }

        if ((old_app?.undo_history) != (new_app.undo_history)){
            dom_io.getElementById('undo').disabled = new_app.undo_history.length == 0;
        }

        if ((old_app?.redo_history) != (new_app.redo_history)){
            dom_io.getElementById('redo').disabled = new_app.redo_history.length == 0;
        }

        if (new_app.is_grid_hidden) {
            dom_io.getElementById('toggle-grid').classList.remove('active');
        } else {
            dom_io.getElementById('toggle-grid').classList.add('active');
        }

        const old_diagram = old_app?.diagram;
        const new_diagram = new_app.diagram;
        const deferal = view_event_deferal(drawing, new_app, dom_io);

        if (old_diagram?.screen_frame_store != new_diagram.screen_frame_store) {
            dom_io
                .getElementById('transformation')
                .setAttribute('transformation', frame_transform(new_diagram.screen_frame_store));
            dom_io
                .getElementById('cell-borders')
                .replaceWith(svg_grid_view.draw(new_diagram.screen_frame_store, new_app.is_grid_hidden));
        }

        if (old_diagram?.arrows != new_diagram.arrows ||
            old_diagram?.arrow_selections != new_diagram.arrow_selections ||
            old_diagram?.objects != new_diagram.objects ||
            old_diagram?.object_selections != new_diagram.object_selections || 
            old_diagram?.inferred_object_selections != new_diagram.inferred_object_selections) {

            if (!(new Set(['arrow-label','object-symbol','object-label']).has(trigger))){
                dom_io.getElementById('multientity-toolbar')
                    .replaceWith(html_multientity_toolbar_view.draw(new_app, 
                        deferal.callback(onevents.buttonclick),
                    ));
            }
        }

        if (old_diagram?.arrows != new_diagram.arrows ||
            old_diagram?.arrow_selections != new_diagram.arrow_selections) {

            if (trigger != 'arrow-label'){
                dom_io.getElementById('arrow-toolbar')
                    .replaceWith(html_arrow_toolbar_view.draw(new_app, 
                        deferal.callback(onevents.textinput),
                        deferal.callback(onevents.buttonclick),
                    ));
                dom_io.getElementById('arrow-label')?.focus();
            }

            const arrow_selections_list = new_diagram.arrow_selections
                .map(id => new_diagram.arrows[id])
                .filter(arrow => arrow != null);
            dom_io.getElementById('arrow-selection-hitboxes')
                .replaceChildren(...arrow_selections_list
                    .map(arrow => 
                        svg_arrow_selection_view.draw(
                            new_diagram.screen_frame_store, 
                            arrow, 
                            new_diagram.arrows, 
                            'highlight-always',
                            deferal.callbackPrevent(onevents.selection_click))));
        }

        if (old_diagram?.objects != new_diagram.objects ||
            old_diagram?.object_selections != new_diagram.object_selections || 
            old_diagram?.inferred_object_selections != new_diagram.inferred_object_selections) {

            if (!(new Set(['object-symbol','object-label']).has(trigger))){
                dom_io.getElementById('object-toolbar')
                    .replaceWith(html_object_toolbar_view.draw(new_app, 
                        deferal.callback(onevents.textinput),
                        deferal.callback(onevents.buttonclick),
                    ));
                dom_io.getElementById('object-label')?.focus();
            }

            const object_selections = [
                ...new_diagram.inferred_object_selections,
                ...new_diagram.object_selections
                    .map(id => new_diagram.objects[id])
                    .filter(object => object != null),
            ];
            dom_io.getElementById('object-selection-hitboxes')
                .replaceChildren(...object_selections
                    .map(object => 
                        svg_object_selection_view.draw(
                            new_diagram.screen_frame_store, 
                            object, 
                            'highlight-always',
                            deferal.callbackPrevent(onevents.selection_click))));
        }

        if (old_diagram?.objects != new_diagram.objects || 
            old_app?.drag_type != new_app.drag_type) {
            const inferred_objects = 
                object_position_resource.post([],
                    resource_operations.delete(
                        arrow_positions_resource.get(new_diagram.arrows),
                        object_position_resource.get(new_diagram.objects)
                    )
                );
            dom_io.getElementById('objects')
                .replaceChildren(...[...new_diagram.objects, ...inferred_objects]
                    .map(object => 
                        svg_object_view.draw(
                            new_diagram.screen_frame_store, 
                            object, 
                        )));
            dom_io.getElementById('object-selections')
                .replaceChildren(...[...new_diagram.objects, ...inferred_objects]
                    .map(object => 
                        svg_object_selection_view.draw(
                            new_diagram.screen_frame_store, 
                            object,
                            new_app.drag_type.id == 'released'? 'highlight-on-hover' : 'highlight-never',
                            deferal.callbackPrevent(onevents.objectdown(object)),
                            deferal.callbackPrevent(onevents.objectenter(object))
                        )));
        }

        if (old_diagram?.arrows != new_diagram.arrows || 
            old_app?.drag_type != new_app.drag_type) {
            dom_io.getElementById('arrows')
                .replaceChildren(...new_diagram.arrows
                    .map(arrow => 
                        svg_arrow_view.draw(
                            new_diagram.screen_frame_store, 
                            arrow, 
                            new_diagram.arrows,
                        )));
            dom_io.getElementById('arrow-selections')
                .replaceChildren(...new_diagram.arrows
                    .map(arrow => 
                        svg_arrow_selection_view.draw(
                            new_diagram.screen_frame_store, 
                            arrow, 
                            new_diagram.arrows,
                            new_app.drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never',
                            deferal.callbackPrevent(onevents.arrowdown(arrow)),
                            deferal.callbackPrevent(onevents.arrowenter(arrow)),
                            deferal.callbackPrevent(onevents.arrowleave(arrow)),
                        )));
            dom_io.getElementById('arrow-midpoint-hitboxes')
                .replaceChildren(...new_diagram.arrows
                    .map(arrow => 
                        svg_arrow_midpoint_view.draw(
                            new_diagram.screen_frame_store, 
                            arrow,
                            new_diagram.arrows,
                            new_app.drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never',
                            deferal.callbackPrevent(onevents.midpointdown(arrow)),
                        )));
        }

    }

    drawing.wire = function(app, dom_io){
        const deferal = view_event_deferal(drawing, app, dom_io);
        // keyboard events
        dom_io.addEventListener('keydown', deferal.callback(onevents.keydown));
        // button events
        dom_io.getElementById('save-url')    .addEventListener('click',  deferal.callback(onevents.buttonclick));
        dom_io.getElementById('save-svg')    .addEventListener('click',  deferal.callback(onevents.buttonclick));
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
        graphics_io.addEventListener('touchstart',  deferal.callback            (onevents.touchstart  ));
        graphics_io.addEventListener('touchsource', deferal.callback            (onevents.touchsource ));
        graphics_io.addEventListener('touchmove',   deferal.callbackPreventStop (onevents.touchmove   ));
        graphics_io.addEventListener('touchend',    deferal.callback            (onevents.touchend    ));
        _redraw(undefined, app, dom_io);
    };

    drawing.redraw = function(old_app, new_app, dom_io, trigger)
    {
        _redraw(old_app, new_app, dom_io, trigger);
    }

    return drawing;
}


