'use strict';

/*
A "Parsing Expression Grammar" (PEG) is a type of formal grammar that can be used to describe formal languages. 
PEGs are similar in nature to context-free grammars (CFG), however the choice operator in a CFG is ambiguous, 
whereas the choice operator in a PEG always selects the first match.
This single difference allows PEGs to be easily implemented while also guaranteeing unambiguous behavior.

The Parsing Expression Grammar implemented here uses functions to represent rules within the grammar. 
These functions return other functions that parse a list of tokens by mapping from one parse state to another. 
A "parse state" contains only two things: the list of tokens that has yet to be parsed, 
and the syntax tree that has been built to represent the tokens that came before.
Both the syntax tree and the token list are represented using the same data structure, known as a "Tag"
A tag represents a list that can be given a name and or be flagged as unimportant "fluff".
The list may store either strings or other tags. 
*/

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

const BasicPegPrimitives = (maybes, maps, maybe_maps, states) => ({

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

const ExtendedPegPrimitives = (lists, peg) =>
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

const ShorthandPegPrimitives = (maps, peg) => {
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

