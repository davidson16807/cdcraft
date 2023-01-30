An "arc" in this application simply refers to any directed arc. 
Arcs are fundamental to the application since they are necessary to specify an arrow,
which is composed of a single arc along with additional styling and annotation.
Arcs can be represented in numerous ways, and different behaviors can be best implemented using different representations:
* `StoredArc` represents arcs in a way that allows easy storage and manipulation by the application. 
  They are what is stored in application state objects such as `Diagram` or `AppState`.
* `UserArc` represents arcs in a way that can be easily manipulated by user input. 
  `UserArc`s may be nested since nodes can represent other arcs.
* `FlatArc` represents a `UserArc` in a "flattened" way, i.e. without nesting.
  They are specified similar to `UserArcs`, but source and target are always the locations at which the arc starts or ends.
* `SamplerArc` represents a directed arc in a way that allows finding properties along the arc for use in rendering.
* `SvgArc` represents arcs in the same manner as the svg path "arc" directive.
  They are currently unused since for now we use beziers directives instead.