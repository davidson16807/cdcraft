'use strict';

const LatexRules = (peg) => {

    const backslash = '\\\\';

    const {rule, type, fluff, not, option, choice, repeat} = peg;

    const token     = [];
    const parens    = [fluff('('), repeat()([not(')'), token]), fluff(')')];
    const brackets  = [fluff('['), repeat()([not(']'), token]), fluff(']')];
    const braces    = [fluff('{'), repeat()([not('}'), token]), fluff('}')];
    const word      = /[a-zA-Z_][a-zA-Z0-9_]*/;
    const directive = type('directive',/\\[a-zA-Z0-9_]*/);
    const integer   = type('integer',  /-?[0-9]+/);
    const float     = type('float',    /-?[0-9]+\.[0-9]*([Ee]-?[0-9]*)?/);
    const string    = type('string',   /"(?:[^"]|\\")*?"/);
    const offset    = type('offset',   /[udlr]+/);
    const variable  = type('variable', word);
    const phrase    = type('phrase',   repeat(1)(word));
    const label     = type('label',    [type('text',string), type('modifiers', option("'"), repeat(1)(word))]);
    const text      = type('text',     repeat()(token));
    const value     = choice(offset, variable, string, integer, float);
    const assignment= type('assignment',     [type('key', variable), fluff('='), type('value', value)]);
    token.push(choice(parens, brackets, braces, directive, value));

    const arrow = type('arrow', [
        type('tag',/\\[udlr]*ar(row)?/),
        fluff('['), 
        repeat()(type('entry', [choice(assignment, label, phrase, value), fluff(',')])),
        option(type('entry', choice(assignment, label, phrase, value))),
        fluff(']'),
        option(
            fluff('{'), 
            type('offset', offset),
            fluff('}'),
        ),
        type('label',
            repeat()(
                type('label-position', brackets),
                type('label-test', braces),
            ),
        ),
    ]);
    const beginning = lexer.tokenize('\\begin{tikzcd}')
    const ending = lexer.tokenize('\\end{tikzcd}')
    const object = [not(choice('&', backslash, ending)), token];
    const cell = type('cell', repeat()(choice(arrow, object)));
    const row  = type('row', [
        repeat()([not(choice(backslash, ending)), cell, fluff('&')]),
        option(cell),
    ]);
    const diagram = [
        fluff(beginning),
        repeat()([row, fluff(backslash)]),
        option(row),
        fluff(ending),
    ];

    return {
        token:     token,
        parens:    parens,
        brackets:  brackets,
        braces:    braces,
        word:      word,
        directive: directive,
        integer:   integer,
        float:     float,
        string:    string,
        offset:    offset,
        variable:  variable,
        phrase:    phrase,
        label:     label,
        text:      text,
        value:     value,
        assignment:assignment,
        arrow:     arrow,
        beginning: beginning,
        ending:    ending,
        object:    object,
        cell:      cell,
        row:       row,
        diagram:   diagram,
    }
}

const LatexParser = (maps, lexer, loader, rules) => {
    return Object.assign(
        ...Object.entries(rules).map((
            [key, rule]) => {key: maps.chain(lexer.tokenize, loader.state, rule)})
    );
};

const backslash = '\\\\';

const lexer = Lexer([
    // `'(?:[^']|${backslash}')*?'`,
    `"(?:[^"]|${backslash}")*?"`,
    `${backslash}?[a-zA-Z0-9_]+`,
    `${backslash}${backslash}`,
    `[^a-zA-Z0-9_\\s]`,
    // `\\s+`,
]);

const LatexSerializer = (Lexer, loader, parser, formatter) => {

}


let maps = MapOps();
let maybes = MaybeOps();
let peg = ShorthandParsingExpressionGrammarPrimitives(maps,
            ExtendedParsingExpressionGrammarPrimitives(ListOps(),
                BasicParsingExpressionGrammarPrimitives(maybes, maps, 
                    MaybeMapOps(), StateOps(maybes))));

const loader = Loader();

const formatter = TagFormatting(maps);

const lexloader = ({
    state: maps.chain(lexer.tokenize, loader.state),
    text:  maps.chain(loader.list, lexer.detokenize),
});


rule([not(']'), 'foo'])(lexloader.state('foo]'))

let bpeg = BasicParsingExpressionGrammarPrimitives(maybes, maps, MaybeMapOps(), StateOps(maybes));
console.log(bpeg.exact('x')( loader.state( ['x' ] )));
console.log(bpeg.exact('x')( loader.state( [ ] )));
console.log(bpeg.join(bpeg.exact('a'), bpeg.exact('b'))( loader.state( ['a','b' ] )));
console.log(bpeg.join(bpeg.exact('a'), bpeg.exact('b'))( loader.state( ['a' ] )));
console.log(bpeg.join(bpeg.exact('a'), bpeg.exact('b'))( loader.state( [ ] )));
console.log(bpeg.join(bpeg.exact('a'), bpeg.exact('b'))( loader.state( ['a','c' ] )));
console.log(bpeg.repeat()(bpeg.exact('a'))( loader.state( ['a','a' ] )));
console.log(bpeg.choice(bpeg.exact('a'), bpeg.exact('b'))( loader.state( ['b' ] )));
console.log(bpeg.choice(bpeg.exact('a'), bpeg.exact('b'))( loader.state( ['c' ] )));
console.log(bpeg.choice(bpeg.exact('a'), bpeg.exact('b'))( loader.state( [ ] )));

console.log(rule('x')( loader.state( ['x' ] )));
console.log(rule('x')( loader.state( [ ] )));
console.log(rule(['a', 'b'])( loader.state( ['a','b' ] )));
console.log(rule(['a', 'b'])( loader.state( ['a' ] )));
console.log(rule(['a', 'b'])( loader.state( [ ] )));
console.log(rule(['a', 'b'])( loader.state( ['a','c' ] )));
console.log(repeat()('a')( loader.state( ['a','a' ] )));
console.log(repeat()('a')( loader.state( ['a' ] )));
console.log(repeat()('a')( loader.state( [ ] )));
console.log(choice('a', 'b')( loader.state( ['a' ] )));
console.log(choice('a', 'b')( loader.state( ['b' ] )));
console.log(choice('a', 'b')( loader.state( ['c' ] )));
console.log(choice('a', 'b')( loader.state( [ ] )));
console.log(rule([not(')'), 'a'])( loader.state( ['a' ] )));
console.log(rule([not(')'), 'a'])( loader.state( [')' ] )));
console.log(rule([not(')'), 'a'])( loader.state( [ ] ))); 

console.log(repeat()([not(')'), 'a'])( loader.state( ['a','a',')' ] )));
console.log(repeat()([not(')'), 'a'])( loader.state( [')' ] )));
console.log(repeat()([not(')'), 'a'])( loader.state( [ ] )));

console.log(repeat(2)([not(')'), 'a'])( loader.state( ['a','a','a',')' ] )));
console.log(repeat(2)([not(')'), 'a'])( loader.state( ['a','a',')' ] )));
console.log(repeat(2)([not(')'), 'a'])( loader.state( ['a',')' ] )));
console.log(repeat(2)([not(')'), 'a'])( loader.state( [ ] )));

console.log(rule([not(')'), 'a'])( loader.state( ['a',')' ] )));
console.log(rule([not(')'), 'a'])( loader.state( ['a',')' ] )));
console.log(rule(['a'])( loader.state( ['a',')' ] )));
console.log(rule([choice(word, directive)])( loader.state( ['a',')' ] )));
console.log(rule([choice(directive)])( loader.state( ['a',')' ] )));
console.log(rule([choice(parens, brackets, braces, directive, choice(word))])( loader.state( ['a',')' ] )));
console.log(rule(type('variable',word))( loader.state( ['a',')' ] )));
console.log(rule([type('variable',word)])( loader.state( ['a',')' ] )));
console.log(rule([choice(parens, brackets, braces, directive, choice(type('variable',word)))])( loader.state( ['a',')' ] )));
console.log(rule([choice(parens, brackets, braces, directive, value)])( loader.state( ['a',')' ] )));
console.log(rule([token])( loader.state( ['a',')' ] )));
console.log(rule([token])(lexloader.state('a)')));

console.log(rule(brackets)(lexloader.state('[foo]')));
console.log(rule(arrow)(lexloader.state(`\\arrow[rd]`)));
console.log(rule(arrow)(lexloader.state(`\\arrow[r, "\\phi"]`)));
console.log(rule(repeat()(arrow))(lexloader.state(`\\arrow[rd] \\arrow[r, "\\phi"]`)));
console.log(rule(cell)(lexloader.state(`A \\arrow[rd] \\arrow[r, "\\phi"]`)));
console.log(rule(row)(lexloader.state(`A \\arrow[rd] \\arrow[r, "\\phi"] & B`)));
console.log(rule([repeat()([row, fluff('\\')]), option(row)])(
    lexloader.state(`A \\arrow[rd] \\arrow[r, "\\phi"] & B \\ C`)));
console.log(rule([repeat()([row, fluff('\\')]), option(row)])(
    lexloader.state(`A \\arrow[rd] \\arrow[r, "\\phi"] & B \\ & C`)));
const state = lexloader.state(`
    \\begin{tikzcd}
    A \\arrow[rd] \\arrow[r, "\\phi"] & B \\\\
    & C
    \\end{tikzcd}
`);
const parsed = rule(diagram)(state);
const formatted = formatter.format(parsed.tree);
const detokenized = lexer.detokenize(formatted);
console.log('state:', state);
console.log('parsed:', parsed);
console.log('formatted:', formatted);
console.log('detokenized:', detokenized);

