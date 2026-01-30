'use strict';


/*
`TikzcdObjects` results in a namespace of pure functions 
that describe maps between `DiagramObject`s and their representations in LaTeX using the Tikzcd plugin.

TODO: 
    decode color 
    implement encode()
*/

const TikzcdObjects = (tikzcd_codec) => {

    const action_for_phrase = {
        'bend left':  arc => arc.with({min_length_clockwise: -1.5}),
        'bend right': arc => arc.with({min_length_clockwise:  1.5}),
        'dashed': arc => arc.with({line_style_id: 1}),
        'dotted': arc => arc.with({line_style_id: 2}),
    };

    return {

        decode:(tag, reference_cell) => {

            let object = new DiagramObject(
                reference_cell, 'black', ''
            );

            let text = tikzcd_codec.text.encode(tag);
            const color_text = tag.tags[0];
            if(color_text.type == 'color_text'){
                const content2 = color_text.tags.filter(subtag=>!subtag.fluff);
                console.log(content2);
                object = object.with({color: tikzcd_codec.text.encode(content2[1])});
                text = tikzcd_codec.text.encode(content2[2]);
            }

            object.symbol = `\\[${text}\\]`;

            return object;

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

codecs.diagram.decode(`
    \\begin{tikzcd}
    A \\arrow[rd] \\arrow[r, "\\phi"] & B \\\\
    & C
    \\end{tikzcd}
`);

let lexloader = ({
    state: maps.chain(lexer.tokenize, loader.state),
    text:  maps.chain(loader.list, lexer.detokenize),
});

let arrows = TikzcdArrows(codecs);
let objects = TikzcdObjects(codecs);

let arrow = arrows.decode(codecs.arrow.decode('\\arrow[rrd, "\\phi"]'), glm.vec2(0,0));
let object = objects.decode(codecs.object.decode('\\textcolor{red}{\\bullet}'), glm.vec2(0,0));

console.log(codecs.object.decode('\\textcolor{red}{\\bullet}'));
console.log(codecs.object.decode('\\bullet'));

console.log(objects.decode(codecs.object.decode('\\textcolor{red}{\\bullet}'), glm.vec2(0,0)));
console.log(objects.decode(codecs.object.decode('\\bullet'), glm.vec2(0,0)));

