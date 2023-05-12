'use strict';

`
<div class="group-round">
    <div class="horizontal-axis-group ">
        <button id="toggle-grid" type="button" class="btn btn-round btn-dark">
            <div>Flip</div>
            <div class="img" >⥦</div>
        </button>
        <button id="toggle-grid" type="button" class="btn btn-round btn-dark">
            <div>Rotate</div>
            <div class="img" >⥢</div>
        </button>
        <button id="toggle-grid" type="button" class="btn btn-round btn-dark">
            <div>Rotate</div>
            <div class="img" >↻</div>
        </button>
    </div>
</div>
`

function HtmlMultientityToolbarView(dependencies) {

    const html                       = dependencies.html;

    const drawing = {};
    drawing.draw = function(app, onbuttonclick) {
        const panels = [];
        const diagram = app.diagram;

        const is_any_entity_selected = (
            app.diagram.inferred_object_selections.length > 0 ||
            app.diagram.object_selections.length > 0 ||
            app.diagram.arrow_selections.length > 0);

        if (is_any_entity_selected) {

            panels.push(
                html.div({class:'group-round',}, 
                    [
                        html.div({class:'horizontal-axis-group group-joined'}, 
                            [
                                html.button({type:'button', class:`btn btn-success`, onclick:onbuttonclick, id:'multientity-color-green' }, [html.div({class:'img'}, [], '')]),
                                html.button({type:'button', class:`btn btn-primary`, onclick:onbuttonclick, id:'multientity-color-blue'  }, [html.div({class:'img'}, [], '')]),
                            ]),
                        html.div({class:'horizontal-axis-group group-joined'}, 
                            [
                                html.button({type:'button', class:`btn btn-danger`,  onclick:onbuttonclick, id:'multientity-color-red'   }, [html.div({class:'img'}, [], '')]),
                                html.button({type:'button', class:`btn btn-warning`, onclick:onbuttonclick, id:'multientity-color-yellow'}, [html.div({class:'img'}, [], '')]),
                                // html.button({type:'button', class:`btn btn-rainbow`, onclick:onbuttonclick, id:'multientity-line-count2',}, [html.div({class:'img'}, [], '‖')]),
                            ]),
                        html.div({class:'horizontal-axis-group group-joined'}, 
                            [
                                html.button({type:'button', class:`btn btn-contrast`, onclick:onbuttonclick, id:'multientity-color-contrast' }, [html.div({class:'img'}, [], '')]),
                            ]),
                    ]),
            );
        }
        return html.div(
            {
                id: 'multientity-toolbar',
                class: 'short-axis-group',
            },
            panels);
    }
    return drawing;
}
