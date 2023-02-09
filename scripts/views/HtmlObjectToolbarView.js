'use strict';


`
<div class="group-round">
    <h5>Object</h5>
    <input id="object-text" type="text" class="form-control" placeholder="Object Text" />
    <div class="horizontal-axis-group maybe-slider">
        <button id="toggle-grid" type="button" class="btn btn-dark">
            <img src="icons/lock.svg"/>
        </button>
        <div class="vertical-axis-group">
            <label>Position</label>
            <input type="range" class="form-range" min="-5" max="5" id="range" disabled>
        </div>
    </div>
</div>
`
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
                                    id:      'object-text',
                                    type:    'text',
                                    class:   'form-control',
                                    value:   object.depiction || '\\[\\bullet\\]',
                                    oninput: deferal.callback(ontextinput),
                                }),
                            ]),
                        html.div({class:'horizontal-axis-group group-split'}, 
                            [
                                html.input({
                                    id:      'object-description',
                                    type:    'text',
                                    class:   'form-control',
                                    value:   object.description || '',
                                    placeholder: '\\[description\\]',
                                    oninput: deferal.callback(ontextinput),
                                }),
                            ])
                    ]),
                /*
                html.div({class:'group-round',}, 
                    [
                        html.div({class:'horizontal-axis-group'}, 
                            [
                                html.button({type:'button', class:'btn btn-dark'}, [html.div({class:'img'}, [])]),
                                html.button({type:'button', class:'btn btn-dark'}, [html.div({class:'img'}, [])]),
                                html.button({type:'button', class:'btn btn-dark'}, [html.div({class:'img'}, [])]),
                            ]),
                        html.div({class:'horizontal-axis-group'}, 
                            [
                                html.button({type:'button', class:'btn btn-dark'}, [html.div({class:'img'}, [])]),
                                html.button({type:'button', class:'btn group-dark'},[html.div({class:'img'}, [], '∙')]),
                                html.button({type:'button', class:'btn btn-dark'}, [html.div({class:'img'}, [])]),
                            ]),
                        html.div({class:'horizontal-axis-group'}, 
                            [
                                html.button({type:'button', class:'btn btn-dark'}, [html.div({class:'img'}, [])]),
                                html.button({type:'button', class:'btn btn-dark'}, [html.div({class:'img'}, [])]),
                                html.button({type:'button', class:'btn btn-dark'}, [html.div({class:'img'}, [])]),
                            ]),
                    ]),
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
