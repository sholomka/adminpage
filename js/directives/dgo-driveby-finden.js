define(["./module"], function (module) {
    "use strict";
    module.directive("dgoDrivebyFinden", ["$q", "$rootScope", "$urlService", "$constantsService", "$restService", "$filter", "$drivebysService",
        function ($q, $rootScope, $urlService, $constantsService, $restService, $filter, $drivebysService) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-driveby-finden.html",
                controller: function ($scope, $element) {


                    $scope.sucheDriveBy = function() {


                        $scope.currentPage = 1;
                        $scope.numberOfResults = 30;

                        
                        $scope.sendData =
                        {
                            "searchedStates": [
                                "NEW"
                            ]
                        };

                        $drivebysService.searchTodayDriveBys($scope.sendData, $scope.type).then(function(data){
                            $rootScope.$broadcast('findDriveBy', {
                                data: data
                            });
                        }, function(error){
                            $scope.driveBys = undefined;
                            
                            if (error && error.exception == "PolygonNotInViewportException") {
                                $rootScope.newsBemerkung = error.error;
                            } else {
                                $rootScope.newsError = error;
                            }
                        });




                      
                    };

                    /*
                    $scope.settings = $constantsService.datepickerSettings().settings;
                    $scope.sendData = $constantsService.datepickerSettings('finden').sendData;
                    $scope.sendData.anzeigen = $scope.anzeigen['Alle'];

                    $scope.getCount =function() {
                        $scope.getCountData = {};

                        angular.forEach($scope.sendData, function(value, key, obj) {
                            $scope.getCountData[key] = value;

                            if (key == 'createDateFrom')
                                $scope.getCountData[key] = $filter('date')(value, 'yyyy-MM-dd');

                            if (key == 'createDateUntil')
                                $scope.getCountData[key] = $filter('date')(value, 'yyyy-MM-dd');

                        });

                        $restService.countEditNews($scope.getCountData).run().then(function(data){
                            $scope.count = data;
                        },function(error) {

                        });
                    };

                    $scope.showError =function(error) {
                        if (angular.isDefined(error)) {
                            if (error.required) {
                                return 'field can not be blank';
                            }
                        }
                    };

;

                    $scope.$on('retrigerCount', function (event, args) {
                        $scope.count = args.count;
                    });*/
                }
            };

        }]);
});