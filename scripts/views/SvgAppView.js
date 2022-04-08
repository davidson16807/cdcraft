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

    `
    <div id="app" v-bind:class="state.drag_type.id == 'pan'? 'pan-cursor' : ''">
        <svg id="svg">
            <g id="transformation" v-bind:transform="transformation()">
                ...
            </g>
        </svg>
    </div>
    `

    const drawing = {};

    function _redraw(dom, app, g_io) {
        g_io.setAttribute('transformation', frame_transform(app.view.screen_frame_store));
        g_io.replaceChildren(...[
                svg_grid_view.draw(app.view.screen_frame_store),
                svg.g({id:"object-selections"}, 
                    app.view.object_selections
                        .map(object => 
                            svg_object_selection_view.draw(
                                dom,
                                app.view.screen_frame_store, 
                                object, 
                                app.drag_type, 
                                (event, arrow_drawing, object, dom2) => onevents.objectclick(event, drawing, object, app, dom)))),
                svg.g({id:"arrow-selections"}, 
                    app.view.arrow_selections
                        .map(arrow => 
                            svg_arrow_selection_view.draw(
                                dom,
                                app.view.screen_frame_store, 
                                arrow, 
                                app.drag_type, 
                                (event, arrow_drawing, arrow, dom2) => onevents.arrowclick(event, drawing, arrow, app, dom)))),
                svg.g({id:"objects"},
                    inferred_objects(app.diagram)
                        .map(object => 
                            svg_object_view.draw(
                                dom,
                                app.view.screen_frame_store, 
                                object, 
                                app.drag_type, 
                                (event, arrow_drawing, object, dom2) => onevents.objectclick(event, drawing, object, app, dom),
                                (event, arrow_drawing, object, dom2) => onevents.objectselect(event, drawing, object, app, dom)))),
                svg.g({id:"arrows"}, 
                    app.diagram.arrows
                        .map(arrow => 
                            svg_arrow_view.draw(
                                dom,
                                app.view.screen_frame_store, 
                                arrow, 
                                app.drag_type, 
                                (event, arrow_drawing, arrow, dom2) => onevents.arrowclick(event, drawing, arrow, app, dom),
                                (event, arrow_drawing, arrow, dom2) => onevents.arrowselect(event, drawing, arrow, app, dom)))),
            ]);
    }

    drawing.draw = function(dom, app){
        const deferal = view_event_deferal(drawing, app, dom);

        const g = svg.g({id: "transformation"},[]);
        _redraw(dom, app, g);

        const svg_node = svg.svg(
            {
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

        dom.addEventListener('keydown', deferal.callback(onevents.keydown));

        return app_node;
    };

    drawing.redraw = function(app, dom_io)
    {
        const g_io = dom_io.getElementById('transformation');
        _redraw(dom_io, app, g_io);
    }

    return drawing;
}


