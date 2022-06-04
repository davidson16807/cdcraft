A `*Resource` class implements a REST-like interface on a collection of elements.
Indexed elements can be extracted from resources ("get"), manipulated,
and applied to other resources ("put"), obtaining new resources.
Elements with those indexes can also be filtered ("delete"), which also returns new resources.
All functions (get, put, delete, and post) are pure and idempotent, with the following definitions:

* `get`, a function resource→window that returns an object representing a "window" 
  on a subcomponent of `resource`.
* `put`, a function resource×window→resource that returns an "updated" version 
  of resource that reflects changes within the "window".
* `delete`, a function resource×window→resource that returns a "filtered" 
  version of resource that excludes elements in the `window`.
* `post`, a function window→resource that returns a newly constructed resource 
  object that strictly reflects elements in the `window`.

The motivation in creating the `*Resource` interface 
is to create stateless CRUD APIs that serve as the backend to UIs.
A reoccuring pattern in UI design is to offer the user 
the ability to select design elements that they can either edit or delete.
This pattern can itself be justified by underpinnings in set theory 
and relational algebra. A "resource" can be considered a representation of a
a set on a computer, or a "relation" (that is, a set of tuples) 
in relational algebra. How the resource is represented in memory 
is not relevant to the definition and may vary. 
For instance, a resource may be implemented as an associative array 
if the equivalence of objects can be defined by a hash, 
or as an ordered array if two objects with identical values
for attributes are still treated as separate elements, 
or as a structure of arrays if data locality or normalization concerns 
come into play. Furthermore, several resources could be defined on 
the same data structure, such that a resource defined on an array of arrows
could consider the source and target positions of arrows to be the elements 
of the set, or it may consider the arrows themselves to be the elements.
With the above definition, a "window" is implemented as a lookup of some kind and
simultaneously serves roles as both a map and a set in set theory,
or as a projection and selection in relational algebra. 
The decision to define windows this way is influenced by their O(1) lookup capability.
"get" and "post" as defined above map a resource to and from a windows representation,
and "put" and "post" serve the role of union and difference, respectively.

The term "resource" is borrowed from "Resource Oriented Design",
where it is used in the same sense.

