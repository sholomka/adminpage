define(["./module"], function (module) {
    "use strict";
    module.directive("dgoDrivebyBestehendedetails", ["$urlService", "$constantsService", "$filter", "$restService", "$newsService", "$drivebysService", "$listenerService", "$mapService", "$sucheService", "$uibModal", "$rootScope", "$sce",
        function ($urlService, $constantsService, $filter, $restService, $newsService, $drivebysService, $listenerService, $mapService, $sucheService, $uibModal, $rootScope, $sce) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-driveby-bestehendedetails.html",
                controller: function ($scope, $attrs, Lightbox, $sessionStorage, $anchorScroll, $timeout) {

                    console.log('here');


                }
            };
        }]);
});
