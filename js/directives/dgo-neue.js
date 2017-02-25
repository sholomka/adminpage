define(["./module"], function (module) {
    "use strict";
    module.directive("dgoNeue", ["$urlService", "$constantsService", "$filter", "$restService", "$newsService",
        function ($urlService, $constantsService, $filter, $restService, $newsService) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-neue.html",
                controller: function ($scope, $element) {
                    console.log('neue222');
                }
            };

        }]);
});