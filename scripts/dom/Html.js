'use strict';

/*
`Html` is an analog of `Svg`, meant only for use when standardization in DOM element creation is desired.
*/
function Html(){

    function node(tag, attributes, children, textContent){
        attributes = attributes ?? {};
        children = children ?? [];
        const result = document.createElement(tag);
        for (let name in attributes){
            if (name.startsWith('on')) {
                result.addEventListener(name.substring(2), attributes[name]);
            } else {
                result.setAttribute(name, attributes[name])
            }
        }
        if (textContent != null) {
            result.textContent = textContent;
        }
        for (let child of children){
            result.appendChild(child);
        }
        return result;
    };

    const tags = ['body','div','span','button','input','img','h1','h2','h3','h4','h5',];
    const namespace = {node:node};
    for(let tag of tags){
        namespace[tag] = (attributes, children, textContent) => node(tag, attributes, children, textContent)
    }

    return namespace;
}
