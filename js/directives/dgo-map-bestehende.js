define(["./module"], function (module) {
    "use strict";
    module.directive("dgoMapBestehende", ["$mapService", function ($mapService) {
        return {
            restrict: "E",
            replace: true,
            template: "<div class=\"mapcanvas\">Map loading...</div>",
            controller: function ($scope,$element,$attrs) {
                $mapService.createMap($element[0],$attrs.type,$attrs.id);
            }
        };
    }]);
});