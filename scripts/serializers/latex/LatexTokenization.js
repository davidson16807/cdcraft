'use strict';

/*
`ListOps` provides useful operations that can be performed on a list
*/
const ListOps = () => ({
    index: i => array => i>=0? array[i] : array[array.length-1],
    slice: (i,j) => array => array.slice(i,j),
    range: n => [...Array(n).keys()],
});

/*
`MapOps` provides useful operations that can be performed on functions
*/
const MapOps = () => ({
    id : x => x,
    right  : f => (...xs) => f(...xs.reverse()),
    chain  : (...fs) => x => fs.reduce((fx, g) => g(fx), x),
    while  : predicate => f => x => { let last; while( predicate(x=f(last=x))){} return last; },
});

/*
`MaybeOps` attempts a complete description of useful operations that can be performed on the datatype: maybe=1+x≅2,
where `1` is any nullish value, and `x` is any nonnullish value of arbitrary type.
There are 2² possible functions that map 2→2, however we omit one (2→1) since it is trivial.
We also add two functions (2⇆bool) that cast to and from another representation of 2, using booleans.
*/
const MaybeOps = () => ({
    bind   : f => x => x == null? x : f(x),
    fill   : y => x => x != null? x : y,
    swap   : y => x => x != null? null : y,
    make   : y => x => x? y : null,
    exists :      x => x != null,
});

/*
`MaybeMapOps` is analogous to MaybeOps, but operates on the datatype: 2=1+x, 
where `1` is any function that returns a nullish value, 
and `x` is any function that returns a nonnullish value.
*/
const MaybeMapOps = () => ({
    fill   : (...fs) => x => fs.reduceRight((gx,f) => gx ?? f(x), fs.slice(-1)[0](x)),
    bind   : (f, g)  => x => (gx => gx == null? null:f(x)) (g(x)),
    swap   : (f, g)  => x => (gx => gx != null? null:f(x)) (g(x)),
    make   : (f, g)  => x => f(x)? g(x) : null,
    exists :  f      => x => f(x) != null,
});

/*
`Tag` is a sparse but complete representation of an object that has been parsed, 
analogous to an xml tag. It includes only a data type and a list of ParseTags as children.
*/
const Tag = (tags, type, fluff) => ({
        tags : tags ?? [],
        ...(type? {type:type} : {}),
        ...(fluff? {fluff:true} : {}),
    });

/*
`State` represents the state of a parsing or formatting operation.
It stores two `Tag`s, one with flat list of children, the other nested.
During parsing, the flat list is transferred to the nested tree, and during formatting, the opposite occurs.
*/
const State = (list, tree) => ({
        list : list ?? Tag(),
        tree : tree ?? Tag(),
    });

/*
`StateOps` provides useful operations that can be performed on a `State`
*/
const StateOps = (maybes)=>({
    next:         ({list,tree}) => list.tags[0],
    consume: i => ({list,tree}) => 
        State(
            Tag(list.tags.slice(i), list.type),
            Tag(list.tags.slice(0,i), tree.type),
        ),
    fluff:                   maybes.bind(({list,tree})=>State(list, Tag([Tag(tree.tags, tree.type, true)]))),
    type:          (name) => maybes.bind(({list,tree})=>State(list, Tag([Tag(tree.tags, name)]))),
    join: next => current => 
            next == null || current == null? null
            : State(next.list, Tag([...current.tree.tags, ...next.tree.tags], next.tree.type )),
});

const BasicParsingExpressionGrammarPrimitives = (maybes, maps, maybe_maps, states) => ({

    fluff: (rule)       => maps.chain(rule, states.fluff),
    type:  (name, rule) => maps.chain(rule, states.type(name)),

    and:   (rule)  => maybe_maps.bind (states.consume(0), rule),
    not:   (rule)  => maybe_maps.swap (states.consume(0), rule),
    option:(rule)  => maybe_maps.fill (states.consume(0), rule),
    any:              maybe_maps.bind (states.consume(1), maps.chain(states.next)),
    exact: (value) => maybe_maps.bind (states.consume(1), maps.chain(states.next, token => token!=value? null:token)),
    regex: (regex) => maybe_maps.bind (states.consume(1), maps.chain(states.next, maybes.bind(token=>token.match(regex)))),
    choice:           maps.right(maybe_maps.fill),

    join: (...rules) => 
        maps.chain(states.consume(0), 
            ...rules.map(rule => maybes.bind(state => states.join(rule(state))(state)))),

    repeat: () => (rule) => 
        maps.chain(states.consume(0), 
            maps.while(maybes.exists)(state => states.join(rule(state))(state))),

});

const ExtendedParsingExpressionGrammarPrimitives = (lists, peg) =>
    Object.assign({}, 
        peg,
        {
            repeat:
                (min=0, max=Infinity) => (rule) => 
                    peg.join(
                        ...lists.range(min).map(i=>rule),
                        ...(isFinite(max)?
                            lists.range(max-min).map(i=>peg.option(rule))
                        :   [peg.repeat()(rule)]),
                    ),
            pad: rule => 
                    peg.join(
                        peg.option(peg.fluff(peg.regex('\\s+'))), 
                        rule,
                        peg.option(peg.fluff(peg.regex('\\s+'))),
                    ),
        }
    );

const ShorthandParsingExpressionGrammarPrimitives = (maps, peg) => {
    const type_lookups = {}
    const longhand = rule => state => type_lookups[rule.constructor.name](rule)(state);
    Object.assign(type_lookups, {
        'String':   maps.chain(peg.exact, peg.pad),
        'RegExp':   maps.chain(peg.regex, peg.pad),
        'Array':    array => peg.join(...array.map(longhand)),
        'Function': maps.id,
    });
    return ({
        rule:                 longhand,
        any:                  peg.pad(peg.any),
        type:  (name,rule) => peg.type (name,longhand(rule)),
        fluff:        rule => peg.fluff(longhand(rule)),
        and:          rule => peg.and(longhand(rule)),
        not:          rule => peg.not(longhand(rule)),
        option:       rule => peg.option(longhand(rule)),
        choice: (...rules) => peg.choice (...rules.map(longhand)),
        repeat: (min=0, max=Infinity) => (rule) =>  peg.repeat(min,max) (longhand(rule)),
    });
}

const TagFormatting = (maps) => {
    const type_lookups = {};
    const format = tag => tag.tags.map(subtag=> type_lookups[subtag.constructor.name](subtag)).flat();
    Object.assign(type_lookups, {
        'String':   maps.id,
        'Object':   format,
    });
    return {
        format: format
    }
};

const Lexer = (string_regexen) => 
    (token_regex => ({
        // tokenize:   (text)   => text.split(token_regex).filter(token => token.trim(/\s*/).length > 0),
        tokenize:   (text)   => text.split(token_regex).filter(token => token.length > 0),
        detokenize: (tokens) => tokens.join(''),
    })) (new RegExp('('+string_regexen.join('|')+')', 'g'));


const Loader = () => ({
        state: (list)  => State(Tag(list)),
        list:  (state) => state.list.tags,
    });


let maps = MapOps();
let maybes = MaybeOps();
let lists = ListOps();
let peg = ShorthandParsingExpressionGrammarPrimitives(maps,
            ExtendedParsingExpressionGrammarPrimitives(lists,
                BasicParsingExpressionGrammarPrimitives(maybes, maps, 
                    MaybeMapOps(), StateOps(maybes))));

const {rule, type, fluff, not, option, choice, repeat} = peg;

const backslash = '\\\\';

const lexer = Lexer([
    // `'(?:[^']|${backslash}')*?'`,
    `"(?:[^"]|${backslash}")*?"`,
    `${backslash}?[a-zA-Z0-9_]+`,
    `${backslash}${backslash}`,
    `[^a-zA-Z0-9_\\s]`,
    // `\\s+`,
]);

const loader = Loader();

const formatter = TagFormatting(maps);

const lexloader = ({
    state: maps.chain(lexer.tokenize, loader.state),
    text:  maps.chain(loader.list, lexer.detokenize),
});

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

