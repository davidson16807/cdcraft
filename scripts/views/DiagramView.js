

/*
`ViewEventDeferal` returns a convenience namespace of curried functions that generate 
standardized event callbacks for `*View` namespaces.
If an event occurs, the event callbacks will fire off a callback 
with information about the object and view.
This is done so that functions in `*View` namespaces can defer side effects 
to callbacks provided by higher levels of object composition outside the `*View` class.
*/
function ViewEventDeferal(view, model) {
    return {
        callback: onevent => event => { 
            console.log(event.type);
            onevent(view, model, event);
        },

        callbackPrevent: onevent => event => { 
            event.preventDefault(); 
            console.log(event.type);
            onevent(view, model, event);
        },

        callbackPreventStop: onevent => event => { 
            event.preventDefault(); 
            event.stopPropagation();
            console.log(event.type);
            onevent(view, model, event);
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
        const result = document.createElementNS('http://www.w3.org/2000/svg',tag);
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

        foreignObject: function(attributes, children, position){
            return node('foreignObject', 
                Object.assign(attributes, 
                    {cx: (attributes.x || position.x), 
                     cy: (attributes.y || position.y)}), 
                children);
        },

    };

    const tags = ['svg', 'g'];
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

    const tags = ['div'];
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
    const view_event_deferal         = dependencies.view_event_deferal;

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
        create: function(screen_frame_store) {
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
    const view = {};
    view.create = function(screen_frame_store, object, drag_type, onclick, onselect) {
        const deferal = view_event_deferal(view, object);
        const object_screen_position = screen_position(screen_frame_store, object.position);
        const text_width = 80;
        return svg.g(
            {
                class: (drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'),
                onmousedown: event => event.button == 0 && deferal.callbackPreventStop(onclick)(view,object,event),
                onmouseenter: event => (!object.is_edited && event.buttons == 2) && deferal.callbackPreventStop(onselect)(view,object,event),
            }
            [
                svg.circle(
                    {class:"object-highlight", r:23}, 
                    object_screen_position),
                svg.foreignObject(
                    {class:"object", width:text_width, height:40}, 
                    [html.div({},[],'∙')], 
                    object_screen_position-glm.vec2(text_width/2,0))
            ]);
    }
    return view;
}

function SvgArrowView(dependencies, settings) {

    const screen_frame_storage       = dependencies.screen_frame_storage;
    const user_arcs_and_stored_arcs  = dependencies.user_arcs_and_stored_arcs;
    const user_arcs_and_sampler_arcs = dependencies.user_arcs_and_sampler_arcs;
    const sampler_arc_resizing       = dependencies.sampler_arc_resizing;
    const sampler_arc_shifting       = dependencies.sampler_arc_shifting;
    const sampler_arc_properties     = dependencies.sampler_arc_properties;
    const sampler_arc_rendering      = dependencies.sampler_arc_rendering;
    const position_shifting          = dependencies.position_shifting;
    const offset_shifting            = dependencies.offset_shifting;
    const view_event_deferal         = dependencies.view_event_deferal;

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
    };

    function arrowsample (screen_frame_store, stored_arc, fraction) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        const user_arc = user_arcs_and_stored_arcs.stored_arc_to_user_arc(stored_arc);
        const sampler_arc = user_arcs_and_sampler_arcs.user_arc_to_sampler_arc(user_arc);
        const resized_arc = sampler_arc_resizing.resize(sampler_arc, arrow_trimming_length, -arrow_trimming_length);
        const screen_arc = sampler_arc_shifting.enter(resized_arc, screen_frame);
        return sampler_arc_properties.position(screen_arc, fraction*screen_arc.length_clockwise);
    };

    function arrowpath (screen_frame_store, stored_arc) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        const user_arc = user_arcs_and_stored_arcs.stored_arc_to_user_arc(stored_arc);
        const sampler_arc = user_arcs_and_sampler_arcs.user_arc_to_sampler_arc(user_arc);
        const resized_arc = sampler_arc_resizing.resize(sampler_arc, arrow_trimming_length, -arrow_trimming_length);
        const screen_arc = sampler_arc_shifting.enter(resized_arc, screen_frame);

        const svg_bezier = sampler_arc_rendering.sampler_arc_to_svg_bezier(screen_arc, 10);
        const svg_path = svg_bezier_path_attribute(svg_bezier);
        return svg_path;
    };

    function arrowhead (screen_frame_store, stored_arc) {
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
    };

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

    const view = {};
    view.create = function(screen_frame_store, arrow, drag_type, onclick, onselect) {
        const deferal = view_event_deferal(view, arrow);
        const text_width = 80;
        return svg.g(
            {
                class: drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never',
                onmousedown: event => event.button == 0 && deferal.callbackPreventStop(onclick)(view,arrow,event),
                onmouseenter: event => (!arrow.is_edited && event.buttons == 2) && deferal.callbackPreventStop(onselect)(view,arrow,event),
            },
            [
                svg.path({class:"arrow-highlight", d:arrowpath(screen_frame_store, arrow.arc)}),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrowsample(arrow.arc,0)),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrowsample(arrow.arc,1)),
                // svg.circle({class:"arrow-handle", r:13} arrowsample(arrow.arc,0)),
                // svg.circle({class:"arrow-handle", r:13} arrowsample(arrow.arc,1)),
                svg.path({class:"arrow"}, arrowhead(arrow.arc)),
                svg.path({class:"arrow"}, arrowpath(arrow.arc)),
            ]);
    }
    return view;
}



function SvgArrowSelectionView(dependencies) {

    const svg                        = dependencies.svg;
    const screen_frame_storage       = dependencies.screen_frame_storage;
    const diagram_ids                = dependencies.diagram_ids;
    const position_shifting          = dependencies.position_shifting;
    const view_event_deferal         = dependencies.view_event_deferal;

    function arrow_selection_click (arrow, event) {
        if (!arrow.is_edited && event.button == 0) {
            event.preventDefault(); 
            event.stopPropagation();
            // application_updater.arrowclick(this.state, arrow, this.state);
        }
    };

    const view = {};
    view.create = function(screen_frame_store, arrow, drag_type, onclick) {
        const deferal = view_event_deferal(view, arrow);
        return svg.g(
            {
                onmousedown: event => event.button == 0 && deferal.callbackPreventStop(onclick)(view,arrow,event),
            },
            [
                svg.path({class:"arrow-highlight", d:arrowpath(screen_frame_store, arrow.arc)}),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrowsample(arrow.arc,0)),
                svg.circle({class:"arrow-tip-highlight", r:10}, arrowsample(arrow.arc,1)),
            ]);
    }
    return view;
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
    <g v-for="object in state.view.object_selections" v-on:mousedown="object_selection_click(object, $event)" >
        <circle class="object-highlight" v-bind:cx="screen_position(object.position).x" v-bind:cy="screen_position(object.position).y" r="23" />
    </g>
    `
    const view = {};
    view.create = function(screen_frame_store, object, drag_type, onclick) {
        const deferal = view_event_deferal(view, object);
        return svg.g(
            {
                onmousedown: event => event.button == 0 && deferal.callbackPreventStop(onclick)(view,object,event),
            },
            [
                svg.circle({class:"object-highlight", r:23}, screen_position(screen_frame_store, object.position)),
            ]);
    }
    return view;
}


function SvgAppView(dependencies, onevents) {

    const screen_frame_storage       = dependencies.screen_frame_storage;
    const object_sets                = dependencies.diagram_object_set_operations;
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
        return object_sets.set_to_list(
                object_sets.update(
                    object_sets.infer(diagram.arrows), 
                    object_sets.list_to_set(diagram.objects)
                ));
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

    view = {};
    view.create = function(app){
        const deferal = view_event_deferal(view, app);

        const g = svg.g(
            {
                id: "transformation",
                transform: frame_transform(app.view.screen_frame_store),
            },
            [
                svg_grid_view.create(app.view.screen_frame_store),
                svg.g({id:"arrows"}, 
                    app.diagram.arrows
                        .map(arrow => 
                            svg_arrow_view.create(
                                app.view.screen_frame_store, 
                                arrow, 
                                app.drag_type, 
                                (view, arrow, event) => onevents.arrowclick(view, app, arrow, event),
                                (view, arrow, event) => onevents.arrowselect(view, app, arrow, event)))),
                svg.g({id:"objects"},
                    inferred_objects(app.diagram)
                        .map(object => 
                            svg_object_view.create(
                                app.view.screen_frame_store, 
                                object, 
                                app.drag_type, 
                                (view, object, event) => onevents.objectclick(view, app, object, event),
                                (view, object, event) => onevents.objectselect(view, app, object, event)))),
                svg.g({id:"arrow-selections"}, 
                    app.view.arrow_selections
                        .map(arrow => 
                            svg_arrow_selection_view.create(
                                app.view.screen_frame_store, 
                                arrow, 
                                app.drag_type, 
                                (view, arrow, event) => onevents.arrowclick(view, app, arrow, event)))),
                svg.g({id:"object-selections"}, 
                    app.view.object_selections
                        .map(arrow => 
                            svg_object_selection_view.create(
                                app.view.screen_frame_store, 
                                arrow, 
                                app.drag_type, 
                                (view, object, event) => onevents.objectclick(view, app, object, event)))),
            ]);

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

    return view;
}


