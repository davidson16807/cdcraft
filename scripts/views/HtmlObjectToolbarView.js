'use strict';

function HtmlObjectToolbarView(dependencies) {

    const html                       = dependencies.html;
    const view_event_deferal         = dependencies.view_event_deferal;

    const drawing = {};
    drawing.draw = function(dom, app, ontextinput, onbuttonclick) {
        const panels = [];
        const diagram = app.diagram;

        const is_single_object_selected = (
            (diagram.inferred_object_selections.length == 1 ||
             diagram.object_selections.length == 1) &&
             diagram.arrow_selections.length < 1);

        if (is_single_object_selected) {
            const object = (
                diagram.objects[diagram.object_selections] || 
                diagram.inferred_object_selections[0]);
            const deferal = view_event_deferal(drawing, object, dom);

            panels.push(
                html.div({class:'group-round',}, 
                    [
                        html.h5({},[],'Object'),
                        html.input({
                            id:      'object-text',
                            type:    'text',
                            class:   'form-control',
                            value:   object.depiction || '\\[\\bullet\\]',
                            oninput: deferal.callback(ontextinput),
                        })
                    ]));
        }

        return html.div(
            {
                id: 'object-toolbar',
                class: 'bottom right short-axis-group group-dark group-round control',
            },
            panels);
    }
    return drawing;
}
