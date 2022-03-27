foo = `
<div id="app" v-bind:class="state.drag_type.id == 'pan'? 'pan-cursor' : ''">
    <svg id="svg">
        <g id="transformation" v-bind:transform="transformation()">
            <g id="grids" v-for="i in cell_count()">
                <line class="cell-border"
                      v-bind:x1="cell_border_position(i,0).x" v-bind:y1="cell_border_position(0,-cell_count()).y" 
                      v-bind:x2="cell_border_position(i,0).x" v-bind:y2="cell_border_position(0,cell_count()).y"/>
                <line class="cell-border"
                      v-bind:y1="cell_border_position(0,i).y" v-bind:x1="cell_border_position(-cell_count(),0).x" 
                      v-bind:y2="cell_border_position(0,i).y" v-bind:x2="cell_border_position(cell_count(),0).x"/>
            </g>
            <g id="object-selections" v-for="object in state.view.object_selections" v-on:mousedown="!object.is_edited && object_selection_click(object, $event)" >
                <circle class="object-highlight" v-bind:cx="screen_position(object.position).x" v-bind:cy="screen_position(object.position).y" r="23" />
            </g>
            <g id="objects" v-for="object in inferred_objects(state.diagram)" v-bind:class="state.drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'"
                    v-on:mousedown="!object.is_edited && objectclick(object, $event)" v-on:mouseenter="objectselect(object, $event)">
                <circle class="object-highlight" v-bind:cx="screen_position(object.position).x" v-bind:cy="screen_position(object.position).y" r="23" />
                <!-- NOTE: object position is offset along the axis by half the width of the <foreignObject> -->
                <foreignObject class="object" v-bind:x="screen_position(object.position).x-40" v-bind:y="screen_position(object.position).y"
                    width="80" height="40">
                    <div v-katex>\( \bullet \)</div>
                </foreignObject>
            </g>
            <g id="arrow-selections"  v-for="arrow in state.view.arrow_selections" v-on:mousedown="!arrow.is_edited && arrow_selection_click(arrow, $event)" >
                <path class="arrow-highlight" v-bind:d="arrowpath(arrow.arc)" />
                <circle class="arrow-tip-highlight" v-bind:cx="arrowsample(arrow.arc, 0).x" v-bind:cy="arrowsample(arrow.arc, 0).y" r="10"/>
                <circle class="arrow-tip-highlight" v-bind:cx="arrowsample(arrow.arc, 1).x" v-bind:cy="arrowsample(arrow.arc, 1).y" r="10"/>
            </g>
            <g id="arrows" v-for="arrow in state.diagram.arrows" v-bind:class="state.drag_type.id == 'released'?  'highlight-on-hover' : 'highlight-never'" 
                    v-on:mousedown="!arrow.is_edited && arrowclick(arrow, $event)" v-on:mouseenter="arrowselect(arrow, $event)">
                <path class="arrow-highlight" v-bind:d="arrowpath(arrow.arc)" />
                <circle class="arrow-tip-highlight" v-bind:cx="arrowsample(arrow.arc, 0).x" v-bind:cy="arrowsample(arrow.arc, 0).y" r="10"/>
                <circle class="arrow-tip-highlight" v-bind:cx="arrowsample(arrow.arc, 1).x" v-bind:cy="arrowsample(arrow.arc, 1).y" r="10"/>
                <!-- <circle class="arrow-handle" v-bind:cx="arrowsample(arrow.arc, 0).x" v-bind:cy="arrowsample(arrow.arc, 0).y" r="13"/> -->
                <!-- <circle class="arrow-handle" v-bind:cx="arrowsample(arrow.arc, 1).x" v-bind:cy="arrowsample(arrow.arc, 1).y" r="13" /> -->
                <path class="arrow" v-bind:d="arrowhead(arrow.arc)" />
                <path class="arrow" v-bind:d="arrowpath(arrow.arc)"/>
            </g>
        </g>
    </svg>
</div>
`


function Svg(){
    return {

        node: function(tag, attributes, children){
            const result = document.createElementNS('http://www.w3.org/2000/svg',tag);
            for (let name in attributes){
                result.setAttribute(name, attributes[name])
            }
            for (let child of children){
                result.appendChild(child);
            }
            return result;
        },

        group: function(attributes, children){
            return node('g', attributes, children);
        },

        line: function(attributes, v1, v2){
            return node('line', 
                Object.assign(attributes, {x1:v1.x, y1:v1.y, x2:v2.x, y2:v2.y}), 
                []);
        },

    };
}
function SvgGridView(
    svg,
    screen_frame_storage, 
    diagram_ids, 
    position_shifting, 
    object_sets,
    dom_parser,
) {

    // function cell_width(screen_frame_store) {
    //     return Math.pow(2.0, screen_frame_store.log2_cell_width);
    // };

    function cell_count(screen_frame_store) {
        return Math.ceil(Math.max(document.documentElement.clientWidth, document.documentElement.clientHeight) / Math.pow(2.0, screen_frame_store.log2_cell_width))+1;
    };

    return {
        initialize: function(screen_frame_store) {
            const count = cell_count(screen_frame_store);
            function cell_border_position(x,y) {
                const screen_frame = screen_frame_storage.unpack(screen_frame_store);
                const model_border_position = diagram_ids.border_id_to_cell_position( diagram_ids.cell_position_to_border_id(screen_frame.origin).add(glm.ivec2(x-1,y-1)) );
                return position_shifting.enter(model_border_position, screen_frame);
            };
            const lines = [];
            for(let i=0; i<count; i++){
                lines.push(svg.line(
                    {class:"vertical-cell-border"},
                    cell_border_position(i,-count), 
                    cell_border_position(i,count),
                ));
                lines.push(svg.line(
                    {class:"vertical-cell-border"},
                    cell_border_position(-count,i), 
                    cell_border_position(count,i),
                ));
            }
            return svg.group({id:"cell-borders"}, lines);
        }
    }
}

function SvgArrowView(
    screen_frame_storage, 
    user_arcs_and_stored_arcs,
    user_arcs_and_sampler_arcs,
    sampler_arc_resizing,
    sampler_arc_shifting,
    sampler_arc_properties,
    sampler_arc_rendering,
    position_shifting, 
    offset_shifting, 
    dom_parser,
    application_updater,
    arrow_trimming_length,
) {
    const parse = dom_parser.parseFromString();


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

    function arrowclick (arrow, event) {
        if (event.button == 0) {
            event.preventDefault(); 
            event.stopPropagation();
            application_updater.arrowclick(this.state, arrow, this.state);
        }
    };

    function arrowselect (arrow, event){
        if (event.buttons == 2) {
            event.preventDefault(); 
            event.stopPropagation();
            application_updater.arrowselect(this.state, arrow.get(), this.state);
        }
    };

}


function SvgApplicationView(
    screen_frame_storage, 
    diagram_ids, 
    position_shifting, 
    object_sets,
    dom_parser,
) {
    const parse = dom_parser.parseFromString();


    function frame_transform_attribute(screen_frame_store) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        return `translate(${-screen_frame.origin.x} ${-screen_frame.origin.y})`;
    };









    function inferred_objects (diagram) {
        return object_sets.update(
                object_sets.infer(diagram.arrows), 
                object_sets.list_to_set(diagram.objects)
            );
    };

    function screen_position (screen_frame_store, position) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        return position_shifting.enter(position, screen_frame);
    };

    function objectclick (object, event) {
        if (event.button == 0) {
            event.preventDefault(); 
            event.stopPropagation();
            application_updater.objectclick(this.state, object, this.state);
        }
    };

    function objectselect (object, event){
        if (event.buttons == 2) {
            event.preventDefault(); 
            event.stopPropagation();
            application_updater.objectselect(this.state, object, this.state);
        }
    };


    function object_selection_click (object, event) {
        if (event.button == 0) {
            event.preventDefault(); 
            event.stopPropagation();
            application_updater.objectclick(this.state, object, this.state);
        }
    };

    function arrow_selection_click (arrow, event) {
        if (event.button == 0) {
            event.preventDefault(); 
            event.stopPropagation();
            application_updater.arrowclick(this.state, arrow, this.state);
        }
    };

    return {

    }

}

function SvgApplicationView(
    screen_frame_storage, 
    diagram_ids, 
    position_shifting, 
    object_sets,
    dom_parser,
) {
    const parse = dom_parser.parseFromString();


    function frame_transform_attribute(screen_frame_store) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        return `translate(${-screen_frame.origin.x} ${-screen_frame.origin.y})`;
    };









    function inferred_objects (diagram) {
        return object_sets.update(
                object_sets.infer(diagram.arrows), 
                object_sets.list_to_set(diagram.objects)
            );
    };

    function screen_position (screen_frame_store, position) {
        const screen_frame = screen_frame_storage.unpack(screen_frame_store);
        return position_shifting.enter(position, screen_frame);
    };

    function objectclick (object, event) {
        if (event.button == 0) {
            event.preventDefault(); 
            event.stopPropagation();
            application_updater.objectclick(this.state, object, this.state);
        }
    };

    function objectselect (object, event){
        if (event.buttons == 2) {
            event.preventDefault(); 
            event.stopPropagation();
            application_updater.objectselect(this.state, object, this.state);
        }
    };


    function object_selection_click (object, event) {
        if (event.button == 0) {
            event.preventDefault(); 
            event.stopPropagation();
            application_updater.objectclick(this.state, object, this.state);
        }
    };

    function arrow_selection_click (arrow, event) {
        if (event.button == 0) {
            event.preventDefault(); 
            event.stopPropagation();
            application_updater.arrowclick(this.state, arrow, this.state);
        }
    };

    return {
        grid: function() {
            // body...
        }

    }


}