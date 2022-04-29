'use strict';

`
<div class="group-round">
    <h5>Arrow</h5>
    <input id="arrow-text" type="text" class="form-control" placeholder="Arrow Text" />
    <div>&nbsp;</div>
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

<div class="group-round">
    <label>Curvature</label>
    <input type="range" class="form-range" min="-5" max="5" id="range">
    <label>Offset</label>
    <input type="range" class="form-range" min="-5" max="5" id="range">
    <label>Trim</label>
    <input type="range" class="form-range" min="-5" max="5" id="range">
</div>

<div class="mobile group-round">
    <label>Styling</label>
    <div class="horizontal-axis-group">
        <button id="toggle-grid" type="button" class="btn btn-dark">
            <img src="icons/menu-left.svg"/>
        </button>
        <img src="icons/grid.svg"/>
        <button id="toggle-grid" type="button" class="btn btn-dark">
            <img src="icons/menu-right.svg"/>
        </button>
    </div>
    <div class="horizontal-axis-group">
        <button id="toggle-grid" type="button" class="btn btn-dark">
            <img src="icons/menu-left.svg"/>
        </button>
        <img src="icons/grid.svg"/>
        <button id="toggle-grid" type="button" class="btn btn-dark">
            <img src="icons/menu-right.svg"/>
        </button>
    </div>
    <div class="horizontal-axis-group">
        <button id="toggle-grid" type="button" class="btn btn-dark">
            <img src="icons/menu-left.svg"/>
        </button>
        <img src="icons/grid.svg"/>
        <button id="toggle-grid" type="button" class="btn btn-dark">
            <img src="icons/menu-right.svg"/>
        </button>
    </div>
</div>

<div class="group-round">
    <div class="horizontal-axis-group group-joined">
        <button id="toggle-grid" type="button" class="btn btn-dark active">
            <div class="img">↑</div>
        </button>
        <button id="toggle-grid" type="button" class="btn btn-dark">
            <div class="img">⇑</div>
        </button>
        <button id="toggle-grid" type="button" class="btn btn-dark">
            <div class="img">⤊</div>
        </button>
    </div>
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
    <div class="horizontal-axis-group ">
        <button id="toggle-grid" type="button" class="btn btn-round btn-dark">
            <div>Flip</div>
            <div class="img" >⥦</div>
            <img src="icons/swap-horizontal.svg"/>
        </button>
        <button id="toggle-grid" type="button" class="btn btn-round btn-dark">
            <div>Rotate</div>
            <div class="img" >⥢</div>
            <img src="icons/rotate-ccw.svg"/>
        </button>
        <button id="toggle-grid" type="button" class="btn btn-round btn-dark">
            <div>Rotate</div>
            <div class="img" >↻</div>
            <img src="icons/rotate-cw.svg"/>
        </button>
    </div>
</div>

<div class="group-round">
    <label>Color</label>
    <div class="horizontal-axis-group group-joined">
        <button id="toggle-grid" type="button" class="btn btn-success">
            <div class="img" />
        </button>
        <button id="toggle-grid" type="button" class="btn btn-primary">
            <div class="img" />
        </button>
        <button id="toggle-grid" type="button" class="btn btn-contrast active">
            <div class="img" />
        </button>
    </div>
    <div class="horizontal-axis-group group-joined">
        <button id="toggle-grid" type="button" class="btn btn-danger">
            <div class="img" />
        </button>
        <button id="toggle-grid" type="button" class="btn btn-warning">
            <div class="img" />
        </button>
        <button id="toggle-grid" type="button" class="btn btn-rainbow">
            <div class="img" />
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

            panels.push(
                html.div({class:'group-round',}, 
                    [
                        html.h5({},[],'Arrow'),
                        html.input({
                            id:      'arrow-text',
                            type:    'text',
                            class:   'form-control',
                            value:   arrow.label || '',
                            oninput: deferal.callback(ontextinput),
                        })
                    ]));
        }

        return html.div(
            {
                id: 'arrow-toolbar',
                class: 'bottom right short-axis-group group-dark group-round control',
            },
            panels);
    }
    return drawing;
}
