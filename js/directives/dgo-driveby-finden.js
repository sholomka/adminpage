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
                    $scope.status = {};
                    
                    $constantsService.getStates().then(function(constants){
                        $scope.states = constants;
                    });

                    $scope.settings = $constantsService.datepickerSettings().settings;
                    $scope.sendData = $constantsService.datepickerSettings('finden').sendData;


                    $scope.showError =function(error) {
                        if (angular.isDefined(error)) {
                            if (error.required) {
                                return 'field can not be blank';
                            }
                        }
                    };
                    
                    $scope.sucheDriveBy = function() {
                        // {
                        //     "pageNumber": 1,
                        //     "numberOfResults": 30,
                        //     "sortCriterium": "TIME",
                        //     "sortOrder": "ASC",
                        //     "searchedStates": [
                        //     "FINISHED",
                        //     "INCOMPLETE",
                        //     "NEW",
                        //     "REJECTED",
                        //     "UNKNOWN"
                        // ],
                        //     "user": {"userName": "user_3"},
                        //     "createDateFrom": "03.10.2015",
                        //     "createDateUntil": "04.10.2015",
                        //     "city": "city_3"
                        // }
                        
                        $scope.sendData.createDateFrom = $filter('date')($scope.sendData.createDateFrom, 'yyyy-MM-dd');
                        $scope.sendData.createDateUntil = $filter('date')($scope.sendData.createDateUntil, 'yyyy-MM-dd');
                        $scope.sendData.searchedStates = [];
                        angular.forEach($scope.status, function(value, key) {
                            if (value) {
                                if (key == 'Unvollstandig')
                                    key = 'Unvollständig';
                                $scope.sendData.searchedStates.push($scope.states[key]);
                            }
                        });

                        if ($scope.sendData.searchedStates.length == 0)
                            delete $scope.sendData.searchedStates;
                        
                        $scope.currentPage = 1;
                        $scope.numberOfResults = 30;

                        $drivebysService.searchTodayDriveBys($scope.sendData, $scope.type).then(function(data){
                            $rootScope.$broadcast('findDriveBy', {
                                data: data,
                                count: $scope.count,
                                sendData: $scope.sendData
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

                    $scope.getCount =function() {
                        $scope.getCountData = {};
                        $scope.sendData.searchedStates = [];
                        angular.forEach($scope.status, function(value, key) {
                            if (value) {
                                if (key == 'Unvollstandig')
                                    key = 'Unvollständig';
                                $scope.sendData.searchedStates.push($scope.states[key]);
                            }
                        });

                        if ($scope.sendData.searchedStates.length == 0)
                            delete $scope.sendData.searchedStates;

                        angular.forEach($scope.sendData, function(value, key, obj) {
                            $scope.getCountData[key] = value;

                            if (key == 'createDateFrom')
                                $scope.getCountData[key] = $filter('date')(value, 'yyyy-MM-dd');

                            if (key == 'createDateUntil')
                                $scope.getCountData[key] = $filter('date')(value, 'yyyy-MM-dd');
                        });

                        $drivebysService.countEditDriveBy($scope.getCountData, 'bestehende').then(function (count) {
                            $scope.count = count;
                        }, function (error) {
                            $scope.driveBys = undefined;
                        });
                    };
                }
            };

        }]);
});