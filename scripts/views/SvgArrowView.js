'use strict';

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
        g.addEventListener('mousedown',  event => event.button == 2 && deferal.callbackPreventStop(onselect)(event));
        g.addEventListener('mouseenter', event => (!arrow.is_edited && event.buttons == 2) && deferal.callbackPreventStop(onselect)(event));
        return g;
    }
    return drawing;
}
