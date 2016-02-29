define(["./module"], function (module) {
    "use strict";
    module.directive("dgoBestehende", ["$urlService", "$constantsService", "$filter", "$restService", "$newsService",
        function ($urlService, $constantsService, $filter, $restService, $newsService) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-bestehende.html",
                controller: function ($scope, $element) {
                }
            };

        }]);
});