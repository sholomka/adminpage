define(["./module"], function (module) {
    "use strict";
    module.directive("dgoMapBestehende", ["$mapServiceBestehende", function ($mapServiceBestehende) {
        return {
            restrict: "E",
            replace: true,
            template: "<div class=\"mapcanvasbestehende\">Map loading...</div>",
            controller: function ($scope,$element,$attrs) {
                $mapServiceBestehende.createMap($element[0],$attrs.type,$attrs.id);
            }
        };
    }]);
});