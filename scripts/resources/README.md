A `*Resource` class implements a REST-like interface on a collection of elements.
Indexed elements can be extracted from resources ("get"), manipulated,
and applied to other resources ("put"), obtaining new resources.
Elements with those indexes can also be filtered ("delete"), which also returns new resources.
All functions (get, put, and delete) are pure and idempotent.

More formally, a resource is a category class where the following are defined:
* `get`, a function data→window that returns an object representing a "window" on a subcomponent of `data`.
* `put`, a function data×window→data that returns an "updated" version of data that reflects changes within the "window".
* `delete`, a function data×window→data that returns a "filtered" version of data that excludes elements in the `window`.

The motivation in creating the `*Resource` interface 
is to create stateless CRUD APIs that serve as the backend to UIs.
A reoccuring pattern in UI design is to offer the user 
the ability to select design elements that they can either edit or delete.
This pattern can itself be justified by underpinnings in relational algebra.
Names of functions are borrowed from the REST API,
since the two interfaces are mutually consistent.
The term "resource" is borrowed from "Resource Oriented Design",
where it is used in the same sense.