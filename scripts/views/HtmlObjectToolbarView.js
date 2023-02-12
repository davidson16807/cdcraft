'use strict';


function HtmlObjectToolbarView(dependencies) {

    const html                       = dependencies.html;
    const view_event_deferal         = dependencies.view_event_deferal;

    const drawing = {};
    drawing.draw = function(dom, app, ontextinput, onbuttonclick) {
        let panels = [];
        const diagram = app.diagram;

        const is_single_object_selected = (
            (diagram.inferred_object_selections.length == 1 ||
             diagram.object_selections.length == 1) &&
             diagram.arrow_selections.length < 1);

        if (is_single_object_selected) {
            const object = (
                diagram.objects[diagram.object_selections[0]] || 
                diagram.inferred_object_selections[0]);
            const deferal = view_event_deferal(drawing, object, dom);

            panels =[
                html.div({class:'group-round',}, 
                    [
                        html.h5({},[],'Object'),
                        html.div({class:'horizontal-axis-group group-split'}, 
                            [
                                html.input({
                                    id:      'object-symbol',
                                    type:    'text',
                                    class:   'form-control',
                                    value:   object.symbol || '\\[\\bullet\\]',
                                    oninput: deferal.callback(ontextinput),
                                }),
                            ]),
                        html.div({class:'horizontal-axis-group group-split'}, 
                            [
                                html.input({
                                    id:      'object-label',
                                    type:    'text',
                                    class:   'form-control',
                                    value:   object.label || '',
                                    placeholder: '\\[description\\]',
                                    oninput: deferal.callback(ontextinput),
                                }),
                            ])
                    ]),
                html.div({class:'group-round',}, 
                    [
                        html.div({class:'horizontal-axis-group'}, 
                            [
                                html.button({type:'button', class:'btn btn-dark', onclick:onbuttonclick, id:'object-label-topleft',}, [html.div({class:'img'}, [])]),
                                html.button({type:'button', class:'btn btn-dark', onclick:onbuttonclick, id:'object-label-topright',}, [html.div({class:'img'}, [])]),
                            ]),
                        html.div({class:'horizontal-axis-group'}, 
                            [
                                html.button({type:'button', class:'btn btn-dark', onclick:onbuttonclick, id:'object-label-left',}, [html.div({class:'img'}, [])]),
                                html.button({type:'button', class:'btn group-dark'},[html.div({class:'img'}, [], '∙')]),
                                html.button({type:'button', class:'btn btn-dark', onclick:onbuttonclick, id:'object-label-right',},[html.div({class:'img'}, [])]),
                            ]),
                        html.div({class:'horizontal-axis-group'}, 
                            [
                                html.button({type:'button', class:'btn btn-dark', onclick:onbuttonclick, id:'object-label-bottomleft',}, [html.div({class:'img'}, [])]),
                                html.button({type:'button', class:'btn btn-dark', onclick:onbuttonclick, id:'object-label-bottomright',}, [html.div({class:'img'}, [])]),
                            ]),
                    ]),
                /*
                */
            ];
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
