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
        if (old_app == null || old_app.drag_type == new_app.drag_type){
            dom_io
                .getElementById('graphics')
                .setAttribute('cursor', new_app.drag_type.id == 'released'? 'default' : 'move')
        }

        if (old_app == null || old_app.screen_frame_store != new_app.screen_frame_store) {
            dom_io
                .getElementById('transformation')
                .setAttribute('transformation', frame_transform(new_app.diagram.screen_frame_store));
            dom_io
                .getElementById('cell-borders')
                .replaceWith(svg_grid_view.draw(new_app.diagram.screen_frame_store));
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

    drawing.draw = function(app, dom_io){
        const deferal = view_event_deferal(drawing, app, dom_io);

        const g = svg.g({id: "transformation"}, 
            [
                svg.g({id:"cell-borders"}),
                svg.g({id:"object-selections"}),
                svg.g({id:"arrow-selections"}),
                svg.g({id:"objects"}),
                svg.g({id:"arrows"}),
                svg.g({id:"object-selection-hitboxes", class:"hitbox"}),
                svg.g({id:"arrow-selection-hitboxes", class:"hitbox"}),
            ]);

        const svg_node = svg.svg(
            {
                id: 'graphics',
                oncontextmenu  : deferal.callbackPrevent     (onevents.contextmenu ),
                onmousedown    : deferal.callbackPrevent     (onevents.mousedown   ),
                onmousemove    : deferal.callbackPrevent     (onevents.mousemove   ),
                onmouseup      : deferal.callback            (onevents.mouseup     ),
                onwheel        : deferal.callback            (onevents.wheel       ),
                ontouchsource  : deferal.callback            (onevents.touchsource ),
                ontouchmove    : deferal.callbackPreventStop (onevents.touchmove   ),
                ontouchend     : deferal.callback            (onevents.touchend    ),
                onkeydown      : deferal.callback            (onevents.keydown    ),
            }, [g]);

        const app_node = html.div({
                id: 'app',
                class: "state.drag_type.id == 'pan'? 'pan-cursor' : ''",
            }, [svg_node]);

        dom_io.body.appendChild(app_node);
        dom_io.addEventListener('keydown', deferal.callback(onevents.keydown));
        _redraw(undefined, app, dom_io);
        return app_node;
    };

    drawing.redraw = function(old_app, new_app, dom_io)
    {
        _redraw(old_app, new_app, dom_io);
    }

    return drawing;
}


