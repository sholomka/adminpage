define(["./module"], function (module) {
    "use strict";
    module.directive("dgoDrivebys", ["$rootScope", "$urlService", "$constantsService", "$filter", "$restService", "$drivebysService", "$sucheService", "$listenerService",
        function ($rootScope, $urlService, $constantsService, $filter, $restService, $drivebysService, $sucheService, $listenerService) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-drivebys.html",
                controller: function ($scope, $attrs, $sessionStorage) {

                    $scope.type = $attrs.className == 'neue' ? 'neue' : 'bestehende';

                    $constantsService.getStates().then(function(constants){
                        $scope.statesFront = {};
                        for (var key in constants) {
                            $scope.statesFront[constants[key]] = key;
                        }
                    });

                    $scope.$on('updateDriveBy', function (event, args) {
                        $scope.refreshWindow('neue');
                        
                        if ($rootScope.driveBys.length > 1) {
                            var id = $rootScope.driveBys[1].transactionHash;
                            
                            $scope.showDrivebysDetailsRest(id);
                        }
                    });

                    $scope.sortFields = {
                        criterium: 'TIME',
                        order: 'ASC'
                    };
                    $scope.currentPage = 1;
                    $scope.numberOfResults = 30;

                    $scope.pageChanged = function() {
                        $scope.sendData =
                        {
                            "pageNumber": $scope.currentPage,
                            "numberOfResults": $scope.numberOfResults,
                            "sortCriterium": $scope.sortFields.criterium,
                            "sortOrder": $scope.sortFields.order,
                            "searchedStates": [
                                "FINISHED",
                                "INCOMPLETE",
                                "NEW",
                                "REJECTED",
                                "UNKNOWN"
                            ]
                        };

                        $drivebysService.searchTodayDriveBys($scope.sendData, $scope.type).then(function(data){
                            $scope.driveBys = data;
                        }, function(error){
                            $scope.driveBys = undefined;
                            if (error && error.exception == "PolygonNotInViewportException") {
                                $rootScope.newsBemerkung = error.error;
                            } else {
                                $rootScope.newsError = error;
                            }
                        });
                    };

                    $scope.sort = function(sortCriterium) {
                        if ($scope.isSortAsc(sortCriterium)) {
                            $scope.sortFields.order = "DESC";
                        } else if ($scope.isSortDesc(sortCriterium)) {
                            $scope.sortFields.order = "ASC";
                        } else {
                            $scope.sortFields = {
                                criterium: sortCriterium,
                                order: sortCriterium == 'TIME' ? 'DESC' : 'ASC'
                            };
                        }

                        $scope.sendData =
                        {
                            "pageNumber": $scope.currentPage,
                            "numberOfResults": $scope.numberOfResults,
                            "sortCriterium": $scope.sortFields.criterium,
                            "sortOrder": $scope.sortFields.order,
                            "searchedStates": [
                                "FINISHED",
                                "INCOMPLETE",
                                "NEW",
                                "REJECTED",
                                "UNKNOWN"
                            ]
                        };

                        $scope.searchEdit($scope.sendData, $scope.type);
                    };

                    $scope.isSort = function (sortCriterium) {
                        return angular.isDefined($scope.sortFields) && $scope.sortFields.criterium == sortCriterium;
                    };
                    $scope.isSortAsc = function (sortCriterium) {
                        return $scope.isSort(sortCriterium) && $scope.sortFields.order == "ASC";
                    };
                    $scope.isSortDesc = function (sortCriterium) {
                        return $scope.isSort(sortCriterium) && $scope.sortFields.order == "DESC";
                    };

                    $sessionStorage.formchanges = [];

                    $scope.showDrivebysDetails = function(id, $event) {
                        $sessionStorage.driveById = id;

                        var event = $event.currentTarget,
                            accept = angular.element(event).children().eq(0);

                        if(angular.isArray($sessionStorage.formchanges) && !angular.equals($sessionStorage.formchanges, [])) {
                            $sessionStorage.formchanges = $sessionStorage.formchanges.filter(function(x) {
                                return x !== undefined &&  x !== null;
                            });
                        }

                        if (!accept.hasClass('active') && (!$sessionStorage.formchanges || $sessionStorage.formchanges.length == 0) ) {
                            $sessionStorage.formchanges = [];
                            $scope.showDrivebysDetailsRest(id);
                        } else {
                            if (accept.hasClass('active')) {
                                $scope.showDrivebysDetailsRest(id);
                            }

                            accept.toggleClass('active');
                        }
                    };


                    $scope.showDrivebysDetailsRest = function(id) {
                        $rootScope.$broadcast('preloader', {data: true});
                        $scope.retriggerMap(id);
                        // $rootScope.$broadcast('preloader', {data: false});
                    };

                    $scope.retriggerMap = function(id) {
                        $drivebysService.showDrivebysDetails(id).then(function (data) {
                            var viewport = [[51.450189013791665,12.073658093359427],[51.450189013791665,12.495601757910208],[51.23336583234749,12.495601757910208],[51.23336583234749,12.073658093359427]];

                            $rootScope.$broadcast('drivebyDetails', {
                                data: data
                            });

                            $listenerService.triggerChange("drivebyDetails", "dgoDrivebys", data.location);

                            var suchProfil = {"suchoptionen":{},"sortOrder":{"sortField":"bauende","order":"asc"},"offset":0,"geo":{},"view":{"viewport":viewport,"zoomlevel":12},"type":"objekteimbau"};

                            $sucheService.loadItems(suchProfil, id).then(function (data) {
                                $listenerService.triggerChange("detailItem", "dgoDrivebys", data);
                            });

                        }, function (error) {})
                    };

                    $scope.searchEdit = function(data, type) {
                        $drivebysService.searchTodayDriveBys(data, type).then(function (data) {
                            $scope.driveBys = data;
                        }, function (error) {
                            $scope.driveBys = undefined;
                            if (error && error.exception == "PolygonNotInViewportException") {
                                $rootScope.newsBemerkung = error.error;
                            } else {
                                $rootScope.newsError = error;
                            }
                        });
                    };

                    $scope.countEdit = function(type) {
                        $drivebysService.countEditDriveBy(type).then(function (count) {
                            $scope.totalItems = count;
                        }, function (error) {
                            $scope.driveBys = undefined;
                        });
                    };

                    $scope.refreshWindow = function(type) {
                        if ($attrs.className == 'neue' && type == 'neue') {
                            var data = {
                                "pageNumber": $scope.currentPage
                            };

                            $scope.countEdit(type);

                            data = $scope.sendData || {
                                "pageNumber": $scope.currentPage,
                                "numberOfResults": $scope.numberOfResults
                            };

                             $scope.searchEdit(data, type);
                        } else if($attrs.className == 'bestehende' && type == 'bestehende') {
                            var data = {
                                "pageNumber": $scope.currentPage
                            };

                            $scope.countEdit(type);

                            data = $scope.sendData || {
                                    "pageNumber": $scope.currentPage,
                                    "numberOfResults": $scope.numberOfResults
                                };

                            $scope.searchEdit(data, type);
                        }
                    };

                    $scope.driveBysListStyleObj = {
                        overflow: 'auto',
                        height: $scope.driveBysListHeight
                    };

                    $scope.driveBysStyleObj = {
                        height: $scope.driveByNeueHeight
                    };

                    if ($attrs.className == 'neue') {
                        $scope.title = 'Offene DriveBys';

                        $scope.refreshWindow('neue');
                    } else {
                        $scope.title = 'Gesuchte DriveBys';

                        $scope.refreshWindow('bestehende');
                       
                        
                    }
                }
            };

        }]);
});
