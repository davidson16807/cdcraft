'use strict';

const ListOps = () => ({
    index: i => array => i>=0? array[i] : array[array.length-1],
    slice: (i,j) => array => array.slice(i,j),
    range: n => [...Array(n).keys()],
});

const MapOps = () => ({
    id : x => x,
    right  : f => (...xs) => f(...xs.reverse()),
    encurry: f => a => b => f(a,b),
    decurry: f => (a,b)  => f(a)(b),
    splat  : f => xs => f(...xs),
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
`MaybeMapOps` is analogous to MaybeOps, but operates on the datatype: 2=1+x, 
where `1` is any bimap that returns a nullish value, 
and `x` is any bimap that returns a nonnullish value.
*/
const MaybeBiMapOps = () => ({
    fill   : (...fs) => x => fs.reduceRight((gx,f) => gx ?? f(x), fs.slice(-1)[0](x)),
    bind   : (f, g)  => x => (gx => gx == null? null:f(x)) (g(x)),
    swap   : (f, g)  => x => (gx => gx != null? null:f(x)) (g(x)),
    make   : (f, g)  => x => f(x)? g(x) : null,
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

class ParseTag {
    constructor(type, children){
        this.type = type;
        this.children = children ?? [];
    }
    with(attributes){
        return new ParseTag(
            attributes.type     ?? this.type,
            attributes.children ?? this.children,
        );
    }
}

const ParseTagOps = (maybes) => ({
    consume:  i => (array) => new ParseTag(undefined, array.slice(0,i)),
    junk:             tag => new ParseTag(),
    type:    (name) => tag => new ParseTag(undefined, [tag.with({type: name})]),
    advance: next => current => 
                next == null || current == null? null
                :   next.with({
                        children: [...current.children, ...next.children], 
                    }),
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
    junk:                    maybes.bind(state=>state.with({captured: tags.junk (state.captured)})),
    type:          (name) => maybes.bind(state=>state.with({captured: tags.type  (name)(state.captured)})),
    advance: next => current => 
                next == null || current == null? null
                :   next.with({ captured: tags.advance(next.captured)(current.captured) }),
});

const BasicParsingExpressionGrammarPrimitives = (maybes, maps, lists, maybe_maps, states) => ({

    junk: (rule)       => maps.chain(rule, states.junk),
    type:  (name, rule) => maps.chain(rule, states.type(name)),

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
        junk:        rule => peg.junk(longhand(rule)),
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

const {rule, type, junk, and, not, option, choice, repeat, any} = peg;

console.log(rule('x')(['x']));
console.log(rule('x')([]));
console.log(rule(['a', 'b'])(['a','b']));
console.log(rule(['a', 'b'])(['a']));
console.log(rule(['a', 'b'])([]));
console.log(rule(['a', 'b'])(['a','c']));
console.log(repeat()('a')(['a','a']));
console.log(repeat()('a')(['a']));
console.log(repeat()('a')([]));
console.log(choice('a', 'b')(['a']));
console.log(choice('a', 'b')(['b']));
console.log(choice('a', 'b')(['c']));
console.log(choice('a', 'b')([]));
console.log(rule([not(')'), 'a'])(['a']));
console.log(rule([not(')'), 'a'])([')']));
console.log(rule([not(')'), 'a'])([])); 

console.log(repeat()([not(')'), 'a'])(['a','a',')']));
console.log(repeat()([not(')'), 'a'])([')']));
console.log(repeat()([not(')'), 'a'])([]));

console.log(repeat(2)([not(')'), 'a'])(['a','a','a',')']));
console.log(repeat(2)([not(')'), 'a'])(['a','a',')']));
console.log(repeat(2)([not(')'), 'a'])(['a',')']));
console.log(repeat(2)([not(')'), 'a'])([]));

const backslash = '\\\\';

const lexer = Lexer([
    //`'(?:[^']|${backslash}')*?'`,
    `"(?:[^"]|${backslash}")*?"`,
    `${backslash}?[a-zA-Z0-9_]+`,
    `${backslash}\\n`,
    `[^a-zA-Z0-9_]`,
    `\\s*`,
]);


rule([not(']'), 'foo'])(lexer.tokenize('foo]')) 



const token     = [];
const parens    = [junk('('), repeat(0)([not(')'), token]), junk(')')];
const brackets   = [junk('['), repeat(0)([not(']'), token]), junk(']')];
const braces   = [junk('{'), repeat(0)([not('}'), token]), junk('}')];
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
const pair      = type('pair',     [type('key', variable), junk('='), type('value', value)]);
token.push(choice(parens, brackets, braces, directive, value, any));

const arrow = type('arrow', [
    type('tag',/\\[udlr]*ar(row)?/),
    junk('['), 
    repeat()(type('entry', [choice(pair, label, phrase, value), junk(',')])),
    option(type('entry', choice(pair, label, phrase, value))),
    junk(']'),
    option(
        junk('{'), 
        type('offset', offset),
        junk('}'),
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
    repeat()([not(choice('\\', ending)), cell, junk('&')]),
    option(cell),
]);
const diagram = [
    junk(beginning),
    repeat()([row, junk('\\')]),
    option(row),
    junk(ending),
];


console.log(rule([not(')'), 'a'])(['a',')']));
console.log(rule([not(')'), 'a'])(['a',')']));
console.log(rule(['a'])(['a',')']));
console.log(rule([choice(word, directive)])(['a',')']));
console.log(rule([choice(directive)])(['a',')']));
console.log(rule([choice(parens, brackets, braces, directive, choice(word))])(['a',')']));
console.log(rule(type('variable',word))(['a',')']));
console.log(rule([type('variable',word)])(['a',')']));
console.log(rule([choice(parens, brackets, braces, directive, choice(type('variable',word)))])(['a',')']));
console.log(rule([choice(parens, brackets, braces, directive, value, any)])(['a',')']));
console.log(rule([token])(['a',')']));
console.log(rule([token])(lexer.tokenize('a)')));



console.log(rule(brackets)(lexer.tokenize('[foo]')));
console.log(rule(arrow)(lexer.tokenize(`\\arrow[rd]`)));
console.log(rule(arrow)(lexer.tokenize(`\\arrow[r, "\\phi"]`)));
console.log(rule(repeat()(arrow))(lexer.tokenize(`\\arrow[rd] \\arrow[r, "\\phi"]`)));
console.log(rule(cell)(lexer.tokenize(`A \\arrow[rd] \\arrow[r, "\\phi"]`)));
console.log(rule(row)(lexer.tokenize(`A \\arrow[rd] \\arrow[r, "\\phi"] & B`)));
console.log(rule([repeat()([row, junk('\\')]), option(row)])(
    lexer.tokenize(`A \\arrow[rd] \\arrow[r, "\\phi"] & B \\ C`)));
console.log(rule([repeat()([row, junk('\\')]), option(row)])(
    lexer.tokenize(`A \\arrow[rd] \\arrow[r, "\\phi"] & B \\ & C`)));
console.log(rule(diagram)(lexer.tokenize(`
    \\begin{tikzcd}
    A \\arrow[rd] \\arrow[r, "\\phi"] & B \\\\
    & C
    \\end{tikzcd}
`)));

