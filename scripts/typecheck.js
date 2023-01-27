'use strict';

// // for production:
// function typcheck(object, typestring) {}

function typecheck(object, typestring) {
    const types = typestring.split('+');
    if((object == null && !types.includes('1')) || 
       (object != null && !types.includes(object.constructor.name))) {
        throw new Error(`expected ${typestring}, found ${object.constructor.name}`);
    }
}
