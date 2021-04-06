'use strict';

class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    equal(other){
        return this.x === other.x && this.y === other.y;
    }
}

class Arrow {
    constructor(x0,y0,x1,y1){
        this.from_cell = glm.ivec2(x0,y0);
        this.to_cell = glm.ivec2(x1,y1);
        this.label = undefined;
        this.min_length = 1;
        this.is_clockwise = false;
        this.label_position_id = undefined;
        this.start_style_id = undefined;
        this.end_style_id = undefined;
        this.line_style_id = undefined;
    }
}

class Node {
    constructor(x,y,label){
        this.cell = glm.ivec2(x,y);
        this.label = label;
    }
}

class Diagram {
    constructor(nodes, arrows){
        this.nodes = nodes_added;
        this.arrows = arrows_added;
    }
}

function JsonDiagramConversion() {
    return {
        'diagram_to_json': function(diagram){
            return JSON.stringify(diagram);
        },
        'json_to_diagram': function(json){
            return JSON.parse(json);
        },
        'diagram_to_tikzcd': function(diagram){

        },
        'tikzcd_to_diagram': function(tikzcd){

        },
        'diagram_to_base64': function(diagram){

        },
        'base64_to_diagram': function(base64){

        },
        'diagram_to_ascii': function(diagram){

        },
    };
}

function ArcPropertyTools(){
    return {
        'radius_from_chord_and_arc': (chord_length, arc_length) => chord_length + arc_length,
        'angle_from_radius_and_chord': (radius, chord_length) => 2*Math.asin(chord_length/(2*radius)),
    };
}

function ArcDerivation(arc_property_tools){
    tools = arc_property_tools || ArcPropertyTools();
    return {
        'arc_from_start_end_and_length': (start, end, length, chirality) => {
            
        },
    };
}

class Arc {
    constructor(start, end, arc_length, is_clockwise){
        direction = glm.normal(end.sub(start));
        tangent = is_clockwise? glm.vec2(direction.y, -direction.x) : glm.vec2(-direction.y, direction.x);
        chord_length = glm.length(start.add(end));
        radius = arc_length + chord_length;
        angle = arc_length / radius;
        midpoint = start.sub(end).div(2);
        origin = tangent.mul(Math.cos(angle/2) * radius).add(midpoint);
        origin_to_start_direction = glm.normal(origin.sub(end));
        origin_to_end_direction = glm.normal(origin.sub(end));
    }
}