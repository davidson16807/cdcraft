'use strict';


/*
`LatexEscapesAndTextEscapes` results in a namespace of pure functions 
that describe maps between plaintext where \[Latex is escaped\]
and text formatted in latex where \{plaintext is escaped}.
*/

const LatexEscapesAndPlaintextEscapes = () => 
    ({
        latex_escapes: (plaintext_escapes) => 
            plaintext_escapes
                .split(/\\text\{(.*?)\}/)
                .map((block, i) => block.length > 0 && i%2==0? '\\['+block+'\\]' : block)
                .join(''),

        plaintext_escapes: (latex_escapes) => 
            latex_escapes
                .split(/\\\[(.*?)\\\]/)
                .map((block, i) => block.length > 0 && i%2==0? '\\text{'+block+'}' : block)
                .join(''),
    });

const escapes = LatexEscapesAndPlaintextEscapes();
escapes.plaintext_escapes('foo\\[\\times\\]bar')
escapes.latex_escapes(escapes.plaintext_escapes('foo\\[\\times\\]bar'))