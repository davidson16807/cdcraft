'use strict';

/*
`UrlStrings` results in a namespace of pure functions 
that describe maps between arrays of `uint`s and their representation in a url querystring.
See README.md for more information.
*/

const UrlStrings = (base64_prefix) => ({
    // base64 encode the text if it contains special characters or could be interpreted as another primitive
    export: (text) =>
            text == null? null
        :   isNaN(parseInt(text)) && text.match(/^[a-zA-Z0-9+/=.-]$/)? text 
        :   base64_prefix+btoa(unescape(encodeURIComponent(text))),
    import: (text) => 
            text == null? null
        :   !text.startsWith(base64_prefix)? text 
        :   decodeURIComponent(escape(atob(text.replace(base64_prefix, '')))),
    updates: (version, string) => string,
});
