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
    fill   : (...fs) => x => fs.reduce((gx,f) => gx ?? f(x), fs[0](x)),
    bind   : (g, f)  => x => (gx => gx == null? null:f(x)) (g(x)),
    swap   : (g, f)  => x => (gx => gx != null? null:f(x)) (g(x)),
    make   : (g, f)  => x => f(x)? g(x) : null,
    exists :  f      => x => f(x) != null,
});

/*
`Lexer` results in a namespace of pure functions 
that describe maps between strings and arrays of tokens.
*/
const Lexer = (string_regexen) => 
    (token_regex => ({
        tokenize:   (text)   => text.split(token_regex).filter(token => token.trim(/\s*/).length > 0),
        detokenize: (tokens) => tokens.join(' '),
    })) (new RegExp('('+string_regexen.join('|')+')', 'g'));

/*
`Tag` is a sparse but complete representation of an object that has been parsed, 
analogous to an xml tag. It includes only a data type and a list of ParseTags as children.
*/
const Tag = (tags, type) => ({
        tags : tags ?? [],
        type : type,
    });

/*
`State` represents the state of a parsing or formatting operation.
It stores two `Tag`s, one with flat list of children, the other nested.
During parsing, the flat list is transferred to the nested tree, and during formatting, the opposite occurs.
*/
const State = (tree, list) => ({
        tree : tree ?? Tag(),
        list : list ?? Tag(),
    });

/*
`StateOps` provides useful operations that can be performed on a `State`
*/
const StateOps = (maybes)=>({
    consume: i => (array) => State(Tag(array.slice(0,i)), array.slice(i)),
    // consume: i => ({tree,list}) => 
    //     State(
    //         Tag(list.tags.slice(0,i), tree.type)
    //         Tag(list.tags.slice(i), list.type)
    //     ),
    fluff:                   maybes.bind(({tree,list})=>State(Tag(), list)),
    type:          (name) => maybes.bind(({tree,list})=>State(Tag([Tag(tree.tags, name)]), list)),
    join: next => current => 
            next == null || current == null? null
            : State(Tag([...current.tree.tags, ...next.tree.tags], next.tree.type ), next.list),
});

const BasicParsingExpressionGrammarPrimitives = (maybes, maps, lists, maybe_maps, states) => ({

    fluff: (rule)       => maps.chain(rule, states.fluff),
    type:  (name, rule) => maps.chain(rule, states.type(name)),

    and:   (rule)  => maps.right(maybe_maps.bind) (states.consume(0), rule),
    not:   (rule)  => maps.right(maybe_maps.swap) (states.consume(0), rule),
    option:(rule)  => maps.right(maybe_maps.fill) (states.consume(0), rule),
    any:              maps.right(maybe_maps.bind) (states.consume(1), lists.index(0)),
    exact: (value) => maps.right(maybe_maps.bind) (states.consume(1), maps.chain(lists.index(0), token => token!=value? null:token)),
    regex: (regex) => maps.right(maybe_maps.bind) (states.consume(1), maps.chain(lists.index(0), maybes.bind(token=>token.match(regex)))),
    choice:           maybe_maps.fill,

    join: (...rules) => 
        maps.chain(states.consume(0), 
            ...rules.map(rule => 
                maybes.bind(state => states.join(rule(state.list))(state)))),

    repeat: () => (rule) => 
        maps.chain(states.consume(0), 
            maps.while(maybes.exists)(state => states.join(rule(state.list))(state))),

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
        }
    );

const ShorthandParsingExpressionGrammarPrimitives = (maps, peg) => {
    const type_lookups = {}
    const longhand = rule => array => type_lookups[rule.constructor.name](rule)(array);
    Object.assign(type_lookups, {
        'String':   peg.exact,
        'RegExp':   peg.regex,
        'Array':    array => peg.join(...array.map(longhand)),
        'Function': maps.id,
    });
    return ({
        rule: longhand,
        any:  peg.any,
        type:  (name,rule) => peg.type (name,longhand(rule)),
        fluff:        rule => peg.fluff(longhand(rule)),
        and:          rule => peg.and(longhand(rule)),
        not:          rule => peg.not(longhand(rule)),
        option:       rule => peg.option(longhand(rule)),
        choice: (...rules) => peg.choice (...rules.map(longhand)),
        repeat: (min=0, max=Infinity) => (rule) =>  peg.repeat(min,max) (longhand(rule)),
    });
}

let maps = MapOps();
let maybes = MaybeOps();
let lists = ListOps();
let peg = ShorthandParsingExpressionGrammarPrimitives(maps,
            ExtendedParsingExpressionGrammarPrimitives(lists,
                BasicParsingExpressionGrammarPrimitives(maybes, maps, lists, 
                    MaybeMapOps(), StateOps(maybes))));

const {rule, type, fluff, not, option, choice, repeat} = peg;

const backslash = '\\\\';

const lexer = Lexer([
    //`'(?:[^']|${backslash}')*?'`,
    `"(?:[^"]|${backslash}")*?"`,
    `${backslash}?[a-zA-Z0-9_]+`,
    `${backslash}\\n`,
    `[^a-zA-Z0-9_]`,
    `\\s*`,
]);

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
const object = [not(choice('&', '\\', ending)), token];
const cell = type('cell', repeat()(choice(arrow, object)));
const row  = type('row', [
    repeat()([not(choice('\\', ending)), cell, fluff('&')]),
    option(cell),
]);
const diagram = [
    fluff(beginning),
    repeat()([row, fluff('\\')]),
    option(row),
    fluff(ending),
];


rule([not(']'), 'foo'])(lexer.tokenize('foo]'))

let bpeg = BasicParsingExpressionGrammarPrimitives(maybes, maps, 
    ListOps(), MaybeMapOps(), StateOps(maybes));
console.log(bpeg.exact('x')( maps.id( ['x' ] )));
console.log(bpeg.exact('x')( maps.id( [ ] )));
console.log(bpeg.join(bpeg.exact('a'), bpeg.exact('b'))( maps.id( ['a','b' ] )));
console.log(bpeg.join(bpeg.exact('a'), bpeg.exact('b'))( maps.id( ['a' ] )));
console.log(bpeg.join(bpeg.exact('a'), bpeg.exact('b'))( maps.id( [ ] )));
console.log(bpeg.join(bpeg.exact('a'), bpeg.exact('b'))( maps.id( ['a','c' ] )));
console.log(bpeg.repeat()(bpeg.exact('a'))( maps.id( ['a','a' ] )));
console.log(bpeg.choice(bpeg.exact('a'), bpeg.exact('b'))( maps.id( ['b' ] )));
console.log(bpeg.choice(bpeg.exact('a'), bpeg.exact('b'))( maps.id( ['c' ] )));
console.log(bpeg.choice(bpeg.exact('a'), bpeg.exact('b'))( maps.id( [ ] )));

console.log(rule('x')( maps.id( ['x' ] )));
console.log(rule('x')( maps.id( [ ] )));
console.log(rule(['a', 'b'])( maps.id( ['a','b' ] )));
console.log(rule(['a', 'b'])( maps.id( ['a' ] )));
console.log(rule(['a', 'b'])( maps.id( [ ] )));
console.log(rule(['a', 'b'])( maps.id( ['a','c' ] )));
console.log(repeat()('a')( maps.id( ['a','a' ] )));
console.log(repeat()('a')( maps.id( ['a' ] )));
console.log(repeat()('a')( maps.id( [ ] )));
console.log(choice('a', 'b')( maps.id( ['a' ] )));
console.log(choice('a', 'b')( maps.id( ['b' ] )));
console.log(choice('a', 'b')( maps.id( ['c' ] )));
console.log(choice('a', 'b')( maps.id( [ ] )));
console.log(rule([not(')'), 'a'])( maps.id( ['a' ] )));
console.log(rule([not(')'), 'a'])( maps.id( [')' ] )));
console.log(rule([not(')'), 'a'])( maps.id( [ ] ))); 

console.log(repeat()([not(')'), 'a'])( maps.id( ['a','a',')' ] )));
console.log(repeat()([not(')'), 'a'])( maps.id( [')' ] )));
console.log(repeat()([not(')'), 'a'])( maps.id( [ ] )));

console.log(repeat(2)([not(')'), 'a'])( maps.id( ['a','a','a',')' ] )));
console.log(repeat(2)([not(')'), 'a'])( maps.id( ['a','a',')' ] )));
console.log(repeat(2)([not(')'), 'a'])( maps.id( ['a',')' ] )));
console.log(repeat(2)([not(')'), 'a'])( maps.id( [ ] )));

console.log(rule([not(')'), 'a'])( maps.id( ['a',')' ] )));
console.log(rule([not(')'), 'a'])( maps.id( ['a',')' ] )));
console.log(rule(['a'])( maps.id( ['a',')' ] )));
console.log(rule([choice(word, directive)])( maps.id( ['a',')' ] )));
console.log(rule([choice(directive)])( maps.id( ['a',')' ] )));
console.log(rule([choice(parens, brackets, braces, directive, choice(word))])( maps.id( ['a',')' ] )));
console.log(rule(type('variable',word))( maps.id( ['a',')' ] )));
console.log(rule([type('variable',word)])( maps.id( ['a',')' ] )));
console.log(rule([choice(parens, brackets, braces, directive, choice(type('variable',word)))])( maps.id( ['a',')' ] )));
console.log(rule([choice(parens, brackets, braces, directive, value)])( maps.id( ['a',')' ] )));
console.log(rule([token])( maps.id( ['a',')' ] )));
console.log(rule([token])(lexer.tokenize('a)')));

console.log(rule(brackets)(lexer.tokenize('[foo]')));
console.log(rule(arrow)(lexer.tokenize(`\\arrow[rd]`)));
console.log(rule(arrow)(lexer.tokenize(`\\arrow[r, "\\phi"]`)));
console.log(rule(repeat()(arrow))(lexer.tokenize(`\\arrow[rd] \\arrow[r, "\\phi"]`)));
console.log(rule(cell)(lexer.tokenize(`A \\arrow[rd] \\arrow[r, "\\phi"]`)));
console.log(rule(row)(lexer.tokenize(`A \\arrow[rd] \\arrow[r, "\\phi"] & B`)));
console.log(rule([repeat()([row, fluff('\\')]), option(row)])(
    lexer.tokenize(`A \\arrow[rd] \\arrow[r, "\\phi"] & B \\ C`)));
console.log(rule([repeat()([row, fluff('\\')]), option(row)])(
    lexer.tokenize(`A \\arrow[rd] \\arrow[r, "\\phi"] & B \\ & C`)));
console.log(rule(diagram)(lexer.tokenize(`
    \\begin{tikzcd}
    A \\arrow[rd] \\arrow[r, "\\phi"] & B \\\\
    & C
    \\end{tikzcd}
`)));

