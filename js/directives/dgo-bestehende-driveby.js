define(["./module"], function (module) {
    "use strict";
    module.directive("dgoBestehendeDriveby", ["$urlService", "$constantsService", "$filter", "$restService", "$newsService",
        function ($urlService, $constantsService, $filter, $restService, $newsService) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-bestehende-driveby.html",
                controller: function ($scope, $element) {

                }
            };

        }]);
});