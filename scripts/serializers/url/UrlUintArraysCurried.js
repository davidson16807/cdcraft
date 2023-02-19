'use strict';

/*
`UrlUintArraysCurried` results in a namespace of pure functions 
that describe maps between arrays of `uint`s and their representation in a url querystring.
The querystring is a number whose binary representation is structured
such that uints at the end of the array correspond to bits of higher value.
See README.md for more information.
*/

const UrlUintArraysCurried = 
    (url_numbers) => 
        (bit_count, uint_count) => ({
                export: (array) => 
                    url_numbers.export(array.reduce((acc, uint, i) => acc+(uint<<(i*bit_count)), 0)),
                import: (string) => 
                    (acc => [...Array(uint_count).keys()].map(i => (acc>>(i*bit_count))%(1<<bit_count))) 
                        (url_numbers.import(string)),
                updates: (version, string) => string,
            });
