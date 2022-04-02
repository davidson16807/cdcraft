


/*
`ViewEventDeferal` returns a convenience namespace of curried functions that generate 
standardized event callbacks for `*View` namespaces.
If an event occurs, the event callbacks will fire off a callback 
with information about the object and drawing.
This is done so that functions in `*View` namespaces can defer side effects 
to callbacks provided by higher levels of object composition outside the `*View` class.
*/
function ViewEventDeferal(drawing, model, dom) {
    return {

        callback: onevent => event => { 
            onevent(event, drawing, model, dom);
        },

        callbackPrevent: onevent => event => { 
            event.preventDefault(); 
            onevent(event, drawing, model, dom);
        },

        callbackPreventStop: onevent => event => { 
            event.preventDefault(); 
            event.stopPropagation();
            onevent(event, drawing, model, dom);
        },

    }
}


/*
`Svg` is a simple convenience wrapper that is namely meant to 
abstract out the need to specify namespaces for non-html elements.
It is a namespace whose functions map one-to-one with SVG elements.
Function names always match names of their corresponding SVG elements.
Functions construct their SVG element given only attributes and children as parameters, 
with optional parameters to allow passing vectored input using glm.vec2().
*/
function Svg(){

    function node(tag, attributes, children){
        children = children || [];
        const result = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (let name in attributes){
            if (name.startsWith('on')) {
                result.addEventListener(name.substring(2), attributes[name]);
            } else {
                result.setAttribute(name, attributes[name])
            }
        }
        for (let child of children){
            result.appendChild(child);
        }
        return result;
    };


    const namespace = {

        line: function(attributes, start, end){
            return node('line', 
                Object.assign(attributes, 
                    {x1: (attributes.x1 || start.x), 
                     y1: (attributes.y1 || start.y), 
                     x2: (attributes.x2 || end.x), 
                     y2: (attributes.y2 || end.y)}), 
                []);
        },

        circle: function(attributes, center){
            return node('circle', 
                Object.assign(attributes, 
                    {cx: (attributes.cx || center.x), 
                     cy: (attributes.cy || center.y)}), 
                []);
        },

        foreignObject: function(attributes, children, position, size){
            return node('foreignObject', 
                Object.assign(attributes, 
                    {x:      (attributes.x      || position.x), 
                     y:      (attributes.y      || position.y),
                     width:  (attributes.width  || size.x), 
                     height: (attributes.height || size.y)}), 
                children);
        },

    };

    const tags = ['svg', 'g', 'path'];
    for(let tag of tags){
        namespace[tag] = (attributes, children) => node(tag, attributes, children)
    }

    return namespace;
}

/*
`Html` is an analog of `Svg`, meant only for use when standardization in DOM element creation is desired.
*/
function Html(){

    function node(tag, attributes, children, textContent){
        const result = document.createElement(tag);
        for (let name in attributes){
            if (name.startsWith('on')) {
                result.addEventListener(name.substring(2), attributes[name]);
            } else {
                result.setAttribute(name, attributes[name])
            }
        }
        result.textContent = textContent;
        for (let child of children){
            result.appendChild(child);
        }
        return result;
    };

    const tags = ['body','div'];
    const namespace = {node:node};
    for(let tag of tags){
        namespace[tag] = (attributes, children, textContent) => node(tag, attributes, children, textContent)
    }

    return namespace;
}

function SvgGridView(dependencies) {

    const svg                        = dependencies.svg;
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const diagram_ids                = dependencies.diagram_ids;
    const position_shifting          = dependencies.position_shifting;

    function cell_count(screen_frame_store) {
        return Math.ceil(Math.max(document.documentElement.clientWidth, document.documentElement.clientHeight) / Math.pow(2.0, screen_frame_store.log2_cell_width))+1;
    };

    `
    <g id="grids" v-for="i in cell_count()">
        <line class="cell-border"
              v-bind:x1="cell_border_position(i,0).x" v-bind:y1="cell_border_position(0,-cell_count()).y" 
              v-bind:x2="cell_border_position(i,0).x" v-bind:y2="cell_border_position(0,cell_count()).y"/>
        <line class="cell-border"
              v-bind:y1="cell_border_position(0,i).y" v-bind:x1="cell_border_position(-cell_count(),0).x" 
              v-bind:y2="cell_border_position(0,i).y" v-bind:x2="cell_border_position(cell_count(),0).x"/>
    </g>
    `
    return {
        draw: function(screen_frame_store) {
            const count = cell_count(screen_frame_store);
            function cell_border_position(x,y) {
                const screen_frame = screen_frame_storage.unpack(screen_frame_store);
                const model_border_position = diagram_ids.border_id_to_cell_position( diagram_ids.cell_position_to_border_id(screen_frame.origin).add(glm.ivec2(x-1,y-1)) );
                return position_shifting.enter(model_border_position, screen_frame);
            };
            const lines = [];
            for(let i=0; i<count; i++){
                lines.push(
                    svg.line({class:"vertical-cell-border"},
                        cell_border_position(i,-count), 
                        cell_border_position(i,count),
                    ));
                lines.push(
                    svg.line({class:"vertical-cell-border"},
                        cell_border_position(-count,i), 
                        cell_border_position(count,i),
                    ));
            }
            return svg.g({id:"cell-borders"}, lines);
        }
    }
}


function SvgArrowAttributes(dependencies, settings) {
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const user_arcs_and_stored_arcs  = dependencies.user_arcs_and_stored_arcs;
    const user_arcs_and_sampler_arcs = dependencies.user_arcs_and_sampler_arcs;
    const sampler_arc_resizing       = dependencies.sampler_arc_resizing;
    const sampler_arc_shifting       = dependencies.sampler_arc_shifting;
    const sampler_arc_properties     = dependencies.sampler_arc_properties;
    const sampler_arc_rendering      = dependencies.sampler_arc_rendering;
    const position_shifting          = dependencies.position_shifting;
    const offset_shifting            = dependencies.offset_shifting;

    const arrow_trimming_length = settings.arrow_trimming_length;

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
            const resized_arc = sampler_arc_resizing.resize(sampler_arc, arrow_trimming_length, -arrow_trimming_length);
            const screen_arc = sampler_arc_shifting.enter(resized_arc, screen_frame);
            return sampler_arc_properties.position(screen_arc, fraction*screen_arc.length_clockwise);
        },

        path: function (screen_frame_store, stored_arc) {
            const screen_frame = screen_frame_storage.unpack(screen_frame_store);
            const user_arc = user_arcs_and_stored_arcs.stored_arc_to_user_arc(stored_arc);
            const sampler_arc = user_arcs_and_sampler_arcs.user_arc_to_sampler_arc(user_arc);
            const resized_arc = sampler_arc_resizing.resize(sampler_arc, arrow_trimming_length, -arrow_trimming_length);
            const screen_arc = sampler_arc_shifting.enter(resized_arc, screen_frame);

            const svg_bezier = sampler_arc_rendering.sampler_arc_to_svg_bezier(screen_arc, 10);
            const svg_path = svg_bezier_path_attribute(svg_bezier);
            return svg_path;
        },

        head: function (screen_frame_store, stored_arc) {
            const screen_frame = screen_frame_storage.unpack(screen_frame_store);
            const user_arc = user_arcs_and_stored_arcs.stored_arc_to_user_arc(stored_arc);
            const sampler_arc = user_arcs_and_sampler_arcs.user_arc_to_sampler_arc(user_arc);
            const resized_arc = sampler_arc_resizing.resize(sampler_arc, arrow_trimming_length, -arrow_trimming_length);
            const arrowhead_basis_x = offset_shifting.enter(sampler_arc_properties.normal(resized_arc, resized_arc.length_clockwise), screen_frame);
            const arrowhead_basis_y = offset_shifting.enter(sampler_arc_properties.tangent(resized_arc, resized_arc.length_clockwise), screen_frame);
            const arrowhead_origin = position_shifting.enter(sampler_arc_properties.position(resized_arc, resized_arc.length_clockwise), screen_frame);

            const cell_points = [glm.vec2(-0.04,-0.04), glm.vec2(0,0), glm.vec2(0.04,-0.04)];
            const screen_points = cell_points.map(point => arrowhead_basis_x.mul(point.x).add(arrowhead_basis_y.mul(point.y)).add(arrowhead_origin));
            const path = 'M ' + screen_points.map(point => `${point.x} ${point.y}`).join(' L ');
            return path;
        },

    };
}

function SvgArrowView(svg, svg_arrow_attributes, view_event_deferal) {
    const arrows = svg_arrow_attributes;

    `
    <g v-for="arrow in state.diagram.arrows" v-bind:class="state.drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'" 
            v-on:mousedown="!arrow.is_edited && arrowclick(arrow, $event)" v-on:mouseenter="arrowselect(arrow, $event)">
        <path class="arrow-highlight" v-bind:d="arrowpath(arrow.arc)" />
        <circle class="arrow-tip-highlight" v-bind:cx="arrowsample(arrow.arc, 0).x" v-bind:cy="arrowsample(arrow.arc, 0).y" r="10"/>
        <circle class="arrow-tip-highlight" v-bind:cx="arrowsample(arrow.arc, 1).x" v-bind:cy="arrowsample(arrow.arc, 1).y" r="10"/>
        <!-- <circle class="arrow-handle" v-bind:cx="arrowsample(arrow.arc, 0).x" v-bind:cy="arrowsample(arrow.arc, 0).y" r="13"/> -->
        <!-- <circle class="arrow-handle" v-bind:cx="arrowsample(arrow.arc, 1).x" v-bind:cy="arrowsample(arrow.arc, 1).y" r="13" /> -->
        <path class="arrow" v-bind:d="arrowhead(arrow.arc)" />
        <path class="arrow" v-bind:d="arrowpath(arrow.arc)"/>
    </g>
    `

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, arrow, drag_type, onclick, onselect) {
        const text_width = 80;
        const g = svg.g(
            {
                class: 'arrow-group ' + (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.path({class:"arrow-highlight", d: arrows.path(screen_frame_store, arrow.arc)}),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrows.sample(screen_frame_store, arrow.arc,0)),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrows.sample(screen_frame_store, arrow.arc,1)),
                // svg.circle({class:"arrow-handle", r:13} arrows.sample(arrow.arc,0)),
                // svg.circle({class:"arrow-handle", r:13} arrows.sample(arrow.arc,1)),
                svg.path({class:"arrow", d: arrows.head(screen_frame_store, arrow.arc)}),
                svg.path({class:"arrow", d: arrows.path(screen_frame_store, arrow.arc)}),
            ]);
        const deferal = view_event_deferal(drawing, arrow, dom);
        g.addEventListener('mousedown',  event => event.button == 0 && deferal.callbackPreventStop(onclick)(event));
        g.addEventListener('mouseenter', event => (!arrow.is_edited && event.buttons == 2) && deferal.callbackPreventStop(onselect)(event));
        return g;
    }
    return drawing;
}



function SvgArrowSelectionView(svg, svg_arrow_attributes, view_event_deferal) {
    const arrows = svg_arrow_attributes;

    function arrow_selection_click (arrow, event) {
        if (!arrow.is_edited && event.button == 0) {
            event.preventDefault(); 
            event.stopPropagation();
            // application_updater.arrowclick(this.state, arrow, this.state);
        }
    };

    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, arrow, drag_type, onclick) {
        const g = svg.g(
            {

                onmousedown: event => event.button == 0 && deferal.callbackPreventStop(onclick)(event),
            },
            [
                svg.path({class:"arrow-highlight", d: arrows.path(screen_frame_store, arrow.arc)}),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrows.sample(screen_frame_store, arrow.arc,0)),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrows.sample(screen_frame_store, arrow.arc,1)),
            ]);
        const deferal = view_event_deferal(drawing, arrow, dom);
        g.addEventListener('mousedown',  event => event.button == 0 && deferal.callbackPreventStop(onclick)(event));
        return g;
    }
    return drawing;
}


function SvgObjectView(dependencies) {

    const svg                        = dependencies.svg;
    const html                       = dependencies.html;
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const diagram_ids                = dependencies.diagram_ids;
    const position_shifting          = dependencies.position_shifting;
    const view_event_deferal         = dependencies.view_event_deferal;

    function screen_position (screen_frame_store, position) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        return position_shifting.enter(position, screen_frame);
    };


    `
    <g id="objects" v-for="object in inferred_objects(state.diagram)" v-bind:class="state.drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'"
            v-on:mousedown="!object.is_edited && objectclick(object, $event)" v-on:mouseenter="objectselect(object, $event)">
        <circle class="object-highlight" v-bind:cx="screen_position(object.position).x" v-bind:cy="screen_position(object.position).y" r="23" />
        <!-- NOTE: object position is offset along the axis by half the width of the <foreignObject> -->
        <foreignObject class="object" v-bind:x="screen_position(object.position).x-40" v-bind:y="screen_position(object.position).y"
            width="80" height="40">
            <div v-katex>\( \bullet \)</div>
        </foreignObject>
    </g>
    `
    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, object, drag_type, onclick, onselect) {
        const object_screen_position = screen_position(screen_frame_store, object.position);
        const text_width = 80;
        const g = svg.g(
            {
                class: (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
            },
            [
                svg.circle(
                    {class:"object-highlight", r:23}, 
                    object_screen_position),
                svg.foreignObject(
                    {class:"object", width:text_width, height:40}, 
                    [html.div({},[],'∙')], 
                    object_screen_position.sub(glm.vec2(text_width/2, 0)))
            ]);
        const deferal = view_event_deferal(drawing, object, dom);
        g.addEventListener('mousedown',  event => event.button == 0 && deferal.callbackPreventStop(onclick)(event));
        g.addEventListener('mouseenter', event => (!object.is_edited && event.buttons == 2) && deferal.callbackPreventStop(onselect)(event));
        return g;
    }
    return drawing;
}

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

    `
    <g v-for="object in state.drawing.object_selections" v-on:mousedown="object_selection_click(object, $event)" >
        <circle class="object-highlight" v-bind:cx="screen_position(object.position).x" v-bind:cy="screen_position(object.position).y" r="23" />
    </g>
    `
    const drawing = {};
    drawing.draw = function(dom, screen_frame_store, object, drag_type, onclick) {
        const g = svg.g(
            {},
            [
                svg.circle({class:"object-highlight", r:23}, screen_position(screen_frame_store, object.position)),
            ]);
        const deferal = view_event_deferal(drawing, object, dom);
        g.addEventListener('mousedown',  event => event.button == 0 && deferal.callbackPreventStop(onclick)(event));
        return g;
    }
    return drawing;
}


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

    drawing = {};

    function _redraw(dom, app, g_io) {
        g_io.setAttribute('transformation', frame_transform(app.view.screen_frame_store));
        g_io.replaceChildren(...[
                svg_grid_view.draw(app.view.screen_frame_store),
                svg.g({id:"arrow-selections"}, 
                    app.view.arrow_selections
                        .map(arrow => 
                            svg_arrow_selection_view.draw(
                                dom,
                                app.view.screen_frame_store, 
                                arrow, 
                                app.drag_type, 
                                (event, arrow_drawing, arrow, dom2) => onevents.arrowclick(event, drawing, arrow, app, dom)))),
                svg.g({id:"object-selections"}, 
                    app.view.object_selections
                        .map(object => 
                            svg_object_selection_view.draw(
                                dom,
                                app.view.screen_frame_store, 
                                object, 
                                app.drag_type, 
                                (event, arrow_drawing, object, dom2) => onevents.objectclick(event, drawing, object, app, dom)))),
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
            }, [g]);

        const app_node = html.div({
                id: 'app',
                class: "state.drag_type.id == 'pan'? 'pan-cursor' : ''",
            }, [svg_node]);

        return app_node;
    };

    drawing.redraw = function(app, dom_io)
    {
        const g_io = dom_io.getElementById('transformation');
        _redraw(dom_io, app, g_io);
    }

    return drawing;
}


