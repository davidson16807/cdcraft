
/*
`ArrowIdDummyMapping` implements the same interface as other `*Mapping` namespaces,
but does so for arrow ids within `Node` objects.
The positions of these nodes are inferred from the attributes 
of the `DiagramArrow` that they reference, 
so applying or reverting the map is effectively the identity.
*/
function ArrowIdDummyMapping() {
    return {
        apply: (arrow_id) => arrow_id,
        revert:(arrow_id) => arrow_id,
    }
}

/*
`NodeMapping` implements the same interface as other `*Mapping` namespaces,
but does so for `Node` objects. `Node` objects are polymorphic,
(currently they can represent either references to arrows or vectors in cell space)
so behavior for mapping
*/
function NodeMapping(type_to_mapping_lookup) {
    return {
        apply: (node) => node.with({ value: type_to_mapping_lookup[node.type].apply (node.value) }),
        revert:(node) => node.with({ value: type_to_mapping_lookup[node.type].revert(node.value) }),
    }
}
