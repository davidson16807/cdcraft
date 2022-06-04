An "arc" represents the body of an arrow.
It is the part of an arrow that excludes the head and tail.
An arrow can vary in its amount of curvature, 
ranging from nearly circular (such as an identity function),
to something that is perfectly straight to all observers.
In either case, the body of an arrow is still represented in memory as an arc.
Identity arrows are a degenerate case of an arc where the radius of the arc circle is a constant.
Straight arrows are a degenerate case of an arc where the radius of the arc circle is extremely large.

There are many possible ways an arc could be represented in memory.
No single representation is suitable to all tasks in the application.
Any given representation will make certain operations trivial
while making other operations exceedingly difficult.
For this reason, we define several kinds of arcs and 
map between them throughout the runtime of the applicaiton:

 * **stored arc**: 
   An arc as it is represented in application state.
   It snaps source and target nodes to cell midpoints if possible, 
   and indicates whether doing so was possible using an `is_valid` flag. 
   Since identity arrows can be depicted in one of several orientations,
   a `chord_direction` is stored to indicate which way the chord of an arc should point.
 * **user arc**: 
   An arc where source and target nodes are not snapped to cell midpoints.
   Positions within cell nodes indicate where a source or target would appear to the user.
   This is useful for when the arc needs to interface with the user,
   either because it needs to be rendered to the screen, 
   or because the user is specifying its source or target position using a mouse or touchpad.
 * **position arc**: 
   An arc where the source and target are stored as vectors in cell space,
   rather than as nodes. A `Node` is a polymorphic interface that represents sources or targets 
   in one of several ways. For instance, the node could indicate the index of an arrow in a list,
   in which case the arrow represents a higher level construct such as a functor,
   or the node could store the position of a source or target directly in cell space.
   The map from user arcs to position arcs is necessary to handle the case where 
   the position of a source or target must be calculated from the positions of 
   other entities in the diagram.
 * **sampler arc**: 
   An arc that stores the origin and radius of its circle.
   Representing an arc in this way allows positions to be easily determined anywhere along the arc,
   along with other properties such as the basis vectors of coordinate systems.
   These properties are essential when rendering the arrow in svg.
 * **svg arc**:
   An arc that that is stored in the same way that a `<path>` element in svg stores arcs.
