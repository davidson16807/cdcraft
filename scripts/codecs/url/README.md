The `Url*` functions in this folder represent namespace of pure functions 
that describe maps between javascript objects and their representation in a url querystring.
When restricted to valid objects and arrays, the following diagram commutes:

```
      export  updateₙ₋₁  update₁  update₀
array   ⇆   vₙ   ←     ⋯    ←   v₁   ←   v₀
      import
```

where "vₙ" indicates the nᵗʰ version of the file format.
