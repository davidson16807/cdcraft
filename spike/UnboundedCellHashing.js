
// function test(f){
//     for(let y=-2; y<=2; y++){
//         let line = '';
//         for(let x=-2; x<=2; x++){
//             line += f(x,y)+',';
//         }
//         console.log(line);
//     }
// }

function UnboundedCellHashingTools() {
    const abs = Math.abs;
    const max = Math.max;
    const min = Math.min;

    const shell_radius = (x,y) => max(abs(x), abs(y));

    const shell_width = (shell_radius) => Math.max(2*shell_radius + 1, 0);

    const clamp = (x, lo, hi) => min(max(x, lo), hi);

    const bounded_hash = (x,y, radius) => {
        const shell_width_ = shell_width(radius);
        return clamp( clamp(x + radius, 
                            0, shell_width_) + (y + radius) * shell_width_,
                      0, shell_width_ * shell_width_);
    };

    return Object.freeze({
        'shell_radius': shell_radius,
        'shell_width': shell_width,
        'clamp': clamp,
        'bounded_hash': bounded_hash,
    });
}
// tools = UnboundedCellHashingTools(); test((x,y)=>{return  tools.bounded_hash(x,y,1); })

/* 
`UnboundedCellHashing` returns a namspace with a single exposed function, "hash".
The function maps any whole number 2d coordinates to a unique positive integer.
The 2d coordinates need not be bounded to any range of values, and may be positive or negative.
The function is bijective: a 2d coordinate can in concept be reconstructed from the hash, 
though the inverse is not implemented, and all hash values have a valid cell. 
This allows cells in an unbounded grid to be tightly packed into a 1d array.
The function is implemented through an category of functions encapsulated in the scope of the function.
*/
function UnboundedCellHashing(optional_tools) {
    tools = optional_tools || UnboundedCellHashingTools();
    const max = Math.max;
    return Object.freeze({
            'hash': (x,y) => {
                const shell_radius = tools.shell_radius(x,y);
                const inner_shell_radius = shell_radius - 1;
                const inner_shell_width = tools.shell_width(inner_shell_radius);
                const inner_shell_area = inner_shell_width * inner_shell_width;
                return tools.bounded_hash(x,y, shell_radius) 
                     - tools.bounded_hash(x,y, inner_shell_radius)
                     + inner_shell_area; 
            }
        });
}

// hasher = UnboundedCellHashing(); test((x,y)=>{return  hasher.hash(x,y,1); })
