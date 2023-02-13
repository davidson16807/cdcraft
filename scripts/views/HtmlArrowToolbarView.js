'use strict';

`
<div class="group-round">
    <label>Curvature</label>
    <input type="range" class="form-range" min="-5" max="5" id="range">
    <label>Offset</label>
    <input type="range" class="form-range" min="-5" max="5" id="range">
    <label>Trim</label>
    <input type="range" class="form-range" min="-5" max="5" id="range">
</div>

<div class="group-round">
    <div class="horizontal-axis-group ">
        <button id="toggle-grid" type="button" class="btn btn-round btn-dark">
            <div>Adjoint</div>
            <div class="img" >⊣</div>
        </button>
        <button id="toggle-grid" type="button" class="btn btn-round btn-dark">
            <div>Pullback/Pushout</div>
            <div class="img" >⌜</div>
        </button>
    </div>
</div>
`

function HtmlArrowToolbarView(dependencies) {

    const html                       = dependencies.html;
    const view_event_deferal         = dependencies.view_event_deferal;

    const drawing = {};
    drawing.draw = function(dom, app, ontextinput, onbuttonclick) {
        const panels = [];
        const diagram = app.diagram;

        const is_single_arrow_selected = (
            app.diagram.inferred_object_selections.length < 1 &&
            app.diagram.object_selections.length < 1 &&
            app.diagram.arrow_selections.length == 1);

        if (is_single_arrow_selected) {
            
            const arrow = diagram.arrows[diagram.arrow_selections[0]];
            const deferal = view_event_deferal(drawing, arrow, dom);

            const offset = arrow.label_offset_id || glm.ivec2(0,1);
            panels.push(
                html.div({class:'group-round',}, 
                    [
                        html.h5({},[],'Arrow'),
                        html.input({
                            id:      'arrow-label',
                            type:    'text',
                            class:   'form-control',
                            value:   arrow.label || '',
                            placeholder: '\\[description\\]',
                            oninput: deferal.callback(ontextinput),
                        }),
                        html.div({class:'horizontal-axis-group group-joined'}, 
                            [
                                html.button({type:'button', class:`btn ${offset.y<0? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-label-inside',}, [html.div({class:'img'}, [])]),
                                html.button({type:'button', class:'btn group-dark'}, [html.div({class:'img'}, [], '⤸')]),
                                html.button({type:'button', class:`btn ${offset.y>0? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-label-outside',},[html.div({class:'img'}, [])]),
                            ]),
                    ]),
                html.div({class:'group-round',}, 
                    [
                        html.div({class:'horizontal-axis-group group-joined'}, 
                            [
                                html.button({type:'button', class:`btn ${arrow.head_style_id == 0? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-head-style0',}, [html.div({class:'img'}, [], '')]),
                                html.button({type:'button', class:`btn ${arrow.head_style_id == 1? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-head-style1',}, [html.div({class:'img'}, [], '/')]),
                                html.button({type:'button', class:`btn ${arrow.head_style_id == 2? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-head-style2',}, [html.div({class:'img'}, [], 'ᐱ')]),
                                html.button({type:'button', class:`btn ${arrow.head_style_id == 3? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-head-style3',}, [html.div({class:'img'}, [], '\\')]),
                                html.button({type:'button', class:`btn ${arrow.head_style_id == 4? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-head-style4',}, [html.div({class:'img'}, [], '‒')]),
                            ]),
                        html.div({class:'horizontal-axis-group group-joined'}, 
                            [
                                html.button({type:'button', class:`btn ${arrow.line_count == 0? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-line-count0',}, [html.div({class:'img'}, [], '')]),
                                html.button({type:'button', class:`btn ${arrow.line_count == 1? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-line-count1',}, [html.div({class:'img'}, [], '|')]),
                                html.button({type:'button', class:`btn ${arrow.line_count == 2? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-line-count2',}, [html.div({class:'img'}, [], '‖')]),
                                html.button({type:'button', class:`btn ${arrow.line_count == 3? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-line-count3',}, [html.div({class:'img'}, [], '⫼')]),
                            ]),
                        html.div({class:'horizontal-axis-group group-joined'}, 
                            [
                                html.button({type:'button', class:`btn ${arrow.line_style_id == 0? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-line-style0',}, [html.div({class:'img'}, [], '|')]),
                                html.button({type:'button', class:`btn ${arrow.line_style_id == 1? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-line-style1',}, [html.div({class:'img'}, [], '╎')]),
                                html.button({type:'button', class:`btn ${arrow.line_style_id == 2? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-line-style2',}, [html.div({class:'img'}, [], '⁞')]),
                            ]),
                        html.div({class:'horizontal-axis-group group-joined'}, 
                            [
                                html.button({type:'button', class:`btn ${arrow.tail_style_id == 0? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-tail-style0',}, [html.div({class:'img'}, [], '')]),
                                html.button({type:'button', class:`btn ${arrow.tail_style_id == 1? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-tail-style1',}, [html.div({class:'img'}, [], 'ᒍ')]),
                                html.button({type:'button', class:`btn ${arrow.tail_style_id == 2? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-tail-style2',}, [html.div({class:'img'}, [], '∧')]),
                                html.button({type:'button', class:`btn ${arrow.tail_style_id == 3? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-tail-style3',}, [html.div({class:'img'}, [], 'ᒐ')]),
                                html.button({type:'button', class:`btn ${arrow.tail_style_id == 4? 'btn-secondary':'btn-dark'}`, onclick:onbuttonclick, id:'arrow-tail-style4',}, [html.div({class:'img'}, [], '‒')]),
                            ]),
                    ]),
            );
        }
        return html.div(
            {
                id: 'arrow-toolbar',
                class: 'short-axis-group',
            },
            panels);
    }
    return drawing;
}
