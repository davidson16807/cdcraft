'use strict';

/*
`LatexColors` results in a namespace of pure functions 
that describe maps between colors as represented in application code vs. a url querystring.
See README.md for more information.
*/

const LatexColors = (color_code_ids) => {
    const color_id = Object.fromEntries(color_code_ids);
    const color_code = Object.fromEntries(color_code_ids.map(color => [color[1], color[0]]));
    return {
        export: (color) => color_id[color] ?? (color == null? null : color.replace('#','')),
        import: (value) => color_code[value] ?? (value == null? null : '#'+value),
    };
};

