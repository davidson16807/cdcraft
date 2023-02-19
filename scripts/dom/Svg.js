'use strict';

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
