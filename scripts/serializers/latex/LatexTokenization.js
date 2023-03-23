'use strict';

const ListOps = () => ({
    index: i => array => i>=0? array[i] : array[array.length-1],
    slice: (i,j) => array => array.slice(i,j),
    range: n => [...Array(n).keys()],
});

const MapOps = () => ({
    id : x => x,
    right  : f => (...inputs) => f(...inputs.reverse()),
    encurry: f => a => b => f(a,b),
    decurry: f => (a,b)  => f(a)(b),
    splat  : f => inputs => f(...inputs),
    chain  : (...fs) => x => fs.reduce((fx, g) => g(fx), x),
    while  : predicate => f => x => { let last; while( predicate(x=f(last=x))){} return last; },
});

/*
`MaybeOps` attempts a complete description of useful operations that can be performed on the datatype: maybe=1+x≅2,
where `1` is any nullish value, and `x` is any nonnullish value of arbitrary type.
There are 2² possible functions that map 2→2, however we omit one (2→null) since it is trivial.
We also add two functions (2⇆bool) that cast to and from another representation of 2, using booleans.
*/
const MaybeOps = () => ({
    bind   : f => x => x == null? x : f(x),
    fill   : y => x => x != null? x : y,
    swap   : y => x => x != null? null : y,
    make   : y => x => x? y : null,
    exists :      x => x == null,
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
    exists :  f      => x => f(x) == null,
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

class ParseTag {
    constructor(type, members, children){
        this.type = type;
        this.members = members ?? {};
        this.children = children ?? [];
    }
    with(attributes){
        return new ParseTag(
            attributes.type     ?? this.type,
            attributes.members  ?? this.members,
            attributes.children ?? this.children,
        );
    }
}

const ParseTagOps = (maybes) => ({
    consume:  i => (array) => new ParseTag(undefined, {}, array.slice(0,i)),
    fluff:             tag => new ParseTag(),
    trait:   (name) => tag => new ParseTag(undefined, Object.fromEntries([[name, tag]])),
    type:    (name) => tag => tag.with({type: name}),
    advance: next => current => 
                next == null || current == null? null
                :   next.with({
                        children: [...current.children, ...next.children], 
                        members:  Object.assign({}, current.members, next.members)}),
});

class ParseState {
    constructor(captured, unmatched){
        this.captured = captured;
        this.unmatched = unmatched;
    }
    with(attributes){
        return new ParseState(
            attributes.captured  ?? this.captured,
            attributes.unmatched ?? this.unmatched,
        );
    }
}

const ParseStateOps = (maybes, tags)=>({
    consume: i => (array) => new ParseState(tags.consume(i)(array), array.slice(i)),
    fluff:                   maybes.bind(state=>state.with({captured: tags.fluff (state.captured)})),
    trait:         (name) => maybes.bind(state=>state.with({captured: tags.trait (state.captured)})),
    type:          (name) => maybes.bind(state=>state.with({captured: tags.type  (state.captured)})),
    advance: next => current => 
                next == null || current == null? null
                :   next.with({ captured: tags.advance(next.captured)(current.captured) }),
});

const BasicParsingExpressionGrammarPrimitives = (maybes, maps, lists, maybe_maps, states) => ({

    fluff: (rule)       => maps.chain(rule, states.fluff),
    type:  (name, rule) => maps.chain(rule, states.type(name)),
    trait: (name, rule) => maps.chain(rule, states.trait(name)),

    and:   (rule)  => maybe_maps.bind (states.consume(0), rule),
    not:   (rule)  => maybe_maps.swap (states.consume(0), rule),
    option:(rule)  => maybe_maps.fill (states.consume(0), rule),
    any:              maybe_maps.bind (states.consume(1), lists.index(0)),
    exact: (value) => maybe_maps.bind (states.consume(1), maps.chain(lists.index(0), token => token!=value? null:token)),
    regex: (regex) => maybe_maps.bind (states.consume(1), maps.chain(lists.index(0), maybes.bind(token=>token.match(regex)))),
    choice:           maps.right(maybe_maps.fill),

    join: (...rules) => 
        maps.chain(states.consume(0), 
            ...rules.map(rule => 
                maybes.bind(state => states.advance(rule(state.unmatched))(state)))),

    repeat: () => (rule) => 
        maps.chain(states.consume(0), 
            maps.while(maybes.exists)(state => states.advance(rule(state.unmatched))(state))),

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
        trait: (name,rule) => peg.trait(name,longhand(rule)),
        fluff:        rule => peg.fluff(longhand(rule)),
        and:          rule => peg.and(longhand(rule)),
        not:          rule => peg.not(longhand(rule)),
        option:       rule => peg.option(longhand(rule)),
        choice: (...rules) => peg.choice (...rules.map(longhand)),
        repeat: (min=0, max=Infinity) => (rule) =>  peg.repeat(min,max) (longhand(rule)),
    });
}

// let maps = MapOps();
// let maybes = MaybeOps();
// let tags = ParseTagOps(maybes);
// let states = ParseStateOps(maybes, tags);
// let peg = BasicParsingExpressionGrammarPrimitives(maybes, maps, 
//     ListOps(), MaybeMapOps(), ParseStateOps(maybes, tags));
// console.log(peg.exact('x')(['x']));
// console.log(peg.exact('x')([]));
// console.log(peg.join(peg.exact('a'), peg.exact('b'))(['a','b']));
// console.log(peg.join(peg.exact('a'), peg.exact('b'))(['a']));
// console.log(peg.join(peg.exact('a'), peg.exact('b'))([]));
// console.log(peg.join(peg.exact('a'), peg.exact('b'))(['a','c']));
// console.log(peg.repeat()(peg.exact('a'))(['a','a']));
// console.log(peg.choice(peg.exact('a'), peg.exact('b'))(['b']));
// console.log(peg.choice(peg.exact('a'), peg.exact('b'))(['c']));
// console.log(peg.choice(peg.exact('a'), peg.exact('b'))([]));

let maps = MapOps();
let maybes = MaybeOps();
let lists = ListOps();
let peg = ShorthandParsingExpressionGrammarPrimitives(maps,
            ExtendedParsingExpressionGrammarPrimitives(lists,
                BasicParsingExpressionGrammarPrimitives(maybes, maps, lists, 
                    MaybeMapOps(), ParseStateOps(maybes, ParseTagOps(maybes)))));

console.log(peg.rule('x')(['x']));
console.log(peg.rule('x')([]));
console.log(peg.rule(['a', 'b'])(['a','b']));
console.log(peg.rule(['a', 'b'])(['a']));
console.log(peg.rule(['a', 'b'])([]));
console.log(peg.rule(['a', 'b'])(['a','c']));
console.log(peg.repeat()('a')(['a','a']));
console.log(peg.choice('a', 'b')(['a']));
console.log(peg.choice('a', 'b')(['b']));
console.log(peg.choice('a', 'b')(['c']));
console.log(peg.choice('a', 'b')([]));

const {rule, type, trait, fluff, and, not, option, choice, repeat, any} = peg;

const token     = [];
const rounds    = [fluff('('), not(')'), token, fluff(')')];
const squares   = [fluff('['), not(']'), token, fluff(']')];
const curlies   = [fluff('{'), not('}'), token, fluff('}')];
const word      = /[a-zA-Z_][a-zA-Z0-9_]*/;
const directive = type('directive',/\\[a-zA-Z0-9_]*/);
const integer   = type('integer',  /-?[0-9]+/);
const float     = type('float',    /-?[0-9]+\.[0-9]*([Ee]-?[0-9]*)?/);
const string    = type('string',   /"(?:[^"]|\\")*?"/);
const offset    = type('offset',   /[udlr]+/);
const variable  = type('variable', word);
const phrase    = type('phrase',   repeat(1)(word));
const label     = type('label',    [trait('text',string), trait('modifiers', option("'"), repeat(1)(word))]);
const text      = type('text',     repeat()(token));
const value     = choice(offset, variable, string, integer, float);
const pair      = type('pair',     [trait('key', variable), fluff('='), trait('value', value)]);
token.push(choice(rounds, squares, curlies, directive, value, any));
const arrow = type('arrow', [
    trait('tag',/\\[udlr]+ar(row)?/),
    fluff('['), 
    repeat()(type('entry', [choice(pair, label, phrase, value), fluff(',')])),
    option(type('entry', choice(pair, label, phrase, value))),
    fluff(']'),
    option(
        fluff('{'), 
        type('offset', offset),
        fluff('}'),
    ),
    type('label',
        repeat()(
            type('label-position', squares),
            type('label-test', curlies),
        ),
    ),
]);
const object = [not(choice(/\\[udlr]+ar(row)?/, '&', '\\')), token];
const cell = type('cell', repeat()(choice(object, arrow)));
const row  = [
    repeat()([cell, fluff('&')]),
    option(cell),
];
const diagram = [
    fluff(lexer.tokenize('\\begin{tikzcd}')),
    repeat()([row, fluff('\\')]),
    option(row),
    fluff(lexer.tokenize('\\end{tikzcd}')),
];

// const CachedParsingExpressionGrammar = (peg) => {
//     let counter = 0;
//     const cache = {};
//     return Object.assign({}, 
//         peg,
//         {
//             choice: (...fs) => x => (hash=>choice_cache[]) (JSON.stringify(key)),
//         });
// }

const backslash = '\\\\';

const lexer = Lexer([
    //`'(?:[^']|${backslash}')*?'`,
    `"(?:[^"]|${backslash}")*?"`,
    `${backslash}?[a-zA-Z0-9_]+`,
    `${backslash}\\n`,
    `[^a-zA-Z0-9_]`,
    `\\s*`,
]);

// const tokens = lexer.tokenize(`\\begin{tikzcd}
// A \\arrow[rd] \\arrow[r, "\\phi"] & B \\
// & C
// \\end{tikzcd}
// `);

// let epeg = ExtendedParsingExpressionGrammarPrimitives(BasicParsingExpressionGrammarPrimitives());

// epeg.join(
//     epeg.exact('\\begin'),
//     epeg.exact('{'),
//     epeg.repeat()(epeg.any))(['\\begin','{','foo']);

// epeg.exact('\\begin')(tokens);

// epeg.join(
//     epeg.exact('\\begin'),
//     epeg.exact('{'),
//     epeg.any,
//     epeg.exact('}'))(tokens);

// epeg.join(
//     epeg.exact('\\begin'),
//     epeg.exact('{'),
//     epeg.any,
//     epeg.exact('}'))([]);

// epeg.join(
//     epeg.fluff(epeg.exact('\\begin')),
//     epeg.fluff(epeg.exact('{')),
//     epeg.any,
//     epeg.fluff(epeg.exact('}'))
// )(['\\begin','{','foo']);

// epeg.join(
//     epeg.exact('\\begin'),
//     epeg.exact('{'),
//     epeg.repeat()(epeg.not(epeg.exact('}'), epeg.any)),
//     epeg.exact('}'))(['\\begin','{','foo','bar','}']);

