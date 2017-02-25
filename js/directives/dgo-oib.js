/**
 * Created by lars on 22/02/17.
 */
define(["./module"], function (module) {
    "use strict";
    module.directive("dgoOib", ["$q", "$rootScope", "$urlService", "$constantsService", "$filter", "$restService", "$log",
        function ($q, $rootScope, $urlService, $constantsService, $filter, $restService, $log) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-oib.html",
                controller: function ($scope, $element) {
                    console.log('neue333');
                    $scope.something = function () {
                        $log.debug("Test test");
                        $restService.getOiB("21").run().then(function (success) {
                            $log.debug("success", success);
                        }, function (error) {
                            $log.debug("erorr", error);
                        });


                    };
                    $restService.getOrte().run().then(function(success){
                        $scope.orte = success;
                    });
                    // $log.debug($scope.orte);
                    $scope.settings = $constantsService.datepickerSettings().settings;
                    $scope.sendData = $constantsService.datepickerSettings('finden').sendData;

                    $scope.getCount = function () {
                        $scope.getCountData = {};

                        angular.forEach($scope.sendData, function (value, key, obj) {
                            $scope.getCountData[key] = value;

                            if (key == 'createDateFrom')
                                $scope.getCountData[key] = $filter('date')(value, 'dd.MM.yyyy');
                            $scope.von = $filter('date')(value, 'dd.MM.yyyy');

                            if (key == 'createDateUntil')
                                $scope.getCountData[key] = $filter('date')(value, 'dd.MM.yyyy');
                            $scope.bis = $filter('date')(value, 'dd.MM.yyyy');

                        });

                    };

                    $scope.showError = function (error) {
                        if (angular.isDefined(error)) {
                            if (error.required) {
                                return 'field can not be blank';
                            }
                        }
                    };
                }
            };

        }]);
});