'use strict';


/*
`TikzcdDiagrams` results in a namespace of pure functions 
that describe maps between `DiagramArrow`s and their representations in LaTeX using the Tikzcd plugin.

TODO: 
    decode color 
    implement encode()
*/

const TikzcdDiagrams = (tikzcd_arrows, tikzcd_objects, default_screen_frame_store) => {

    return {

        decode:(tag) => {

            const arrows = [];
            const objects = [];

            const rows = tag.tags.filter(subtag=>subtag.type=='row');
            console.log(rows);
            for(let j=0; j<rows.length; j++){
                const cells = rows[j].tags.filter(subtag=>subtag.type=='cell');
                console.log(cells);
                for(let i=0; i<cells.length; i++){
                    console.log(cells[i]);
                    cells[i].tags
                        .filter(subtag=>subtag.type=='arrow')
                        .map(subtag=>tikzcd_arrows.decode(subtag, glm.vec2(i,j)))
                        .forEach(arrow=>arrows.push(arrow));
                    cells[i].tags
                        .filter(subtag=>subtag.type=='object')
                        .map(subtag=>tikzcd_objects.decode(subtag, glm.vec2(i,j)))
                        .forEach(object=>objects.push(object));
                }
            }

            return new Diagram(
                arrows, objects, 
                [], [], [], // selections
                default_screen_frame_store
            );

        }

    };

};


let backslash = '\\\\';

let lexer = Lexer([
    `'(?:[^']|${backslash}')*?'`,
    `"(?:[^"]|${backslash}")*?"`,
    `${backslash}?[a-zA-Z_][a-zA-Z0-9_]*`,
    `${backslash}${backslash}`,
    `[^a-zA-Z0-9_ \\t\\n]`,
    // `\\s+`,
]);

let maps = MapOps();
let maybes = MaybeOps();
let loader = Loader();

let peg = ShorthandParsingExpressionGrammarPrimitives(maps,
            ExtendedParsingExpressionGrammarPrimitives(ListOps(),
                BasicParsingExpressionGrammarPrimitives(maybes, maps, 
                    MaybeMapOps(), StateOps(maybes))));

let rules = TikzcdRules(peg);

let formatter = TagFormatting(maps);

let codecs = Codecs(Codec(lexer, loader, formatter, ' '), rules);

codecs.arrow.decode('\\arrow[rrd, "\\phi"]');

const diagram_tikzcd = `
    \\begin{tikzcd}
    A \\arrow[rd] \\arrow[r, "\\phi"] & B \\\\
    & C
    \\end{tikzcd}
`;


let lexloader = ({
    state: maps.chain(lexer.tokenize, loader.state),
    text:  maps.chain(loader.list, lexer.detokenize),
});

let arrows = TikzcdArrows(codecs);
let objects = TikzcdObjects(codecs);
let diagrams = TikzcdDiagrams(arrows, objects, new ScreenStateStore(glm.vec2(), 8));

let arrow = arrows.decode(codecs.arrow.decode('\\arrow[rrd, "\\phi"]'), glm.vec2(0,0));
let object = objects.decode(codecs.object.decode('\\textcolor{red}{\\bullet}'), glm.vec2(0,0));

// console.log(codecs.diagram.decode(diagram_tikzcd));
console.log(diagrams.decode(codecs.diagram.decode(diagram_tikzcd)));
