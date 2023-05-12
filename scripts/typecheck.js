'use strict';

// // for production:
// function typcheck(object, typestring) {}

const typestring = object=>object == null? '1' : object.constructor.name;

function typecheck(object, typestring) {
    const types = typestring.split('+');
    if((object == null && !types.includes('1')) || 
       (object != null && !types.includes(object.constructor.name))) {
        throw new Error(`expected ${typestring}, found ${object.constructor.name}`);
    }
}
