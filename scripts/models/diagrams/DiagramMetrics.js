'use strict';

/*
`DiagramMetrics` defines useful metrics for comparing diagrams.
Metrics satisfy the usual mathematical definition for some definition of equality
(e.g. in terms of some set of attributes, up to restrictions on floating point precision, etc.)
*/
function DiagramMetrics(arrow_metrics, object_metrics) {
    return {

        is_model_different: (diagram1, diagram2) => 
            (diagram1.arrows != diagram2.arrows || 
             diagram1.objects != diagram2.objects),

        is_view_different: (diagram1, diagram2) => 
            (diagram1.arrow_selections != diagram2.arrow_selections || 
             diagram1.object_selections != diagram2.object_selections ||
             diagram1.inferred_object_selections != diagram2.inferred_object_selections ||
             diagram1.screen_frame_store != diagram2.screen_frame_store),

    }
}