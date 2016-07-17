define(["./module"], function (module) {
    "use strict";
    module.directive("dgoDrivebysBestehende", ["$rootScope", "$urlService", "$constantsService", "$filter", "$restService", "$drivebysService", "$sucheService", "$listenerService", "$mapService", "$mapServiceBestehende",
        function ($rootScope, $urlService, $constantsService, $filter, $restService, $drivebysService, $sucheService, $listenerService, $mapService, $mapServiceBestehende) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-drivebys-bestehende.html",
                controller: function ($scope, $attrs, $sessionStorage) {
                    $scope.type = $attrs.className == 'neue' ? 'neue' : 'bestehende';

                    $scope.$on('findDriveBy', function (event, args) {
                        if ($scope.type == 'bestehende') {
                            $scope.driveBys = args.data;
                            $scope.totalItems = args.count;
                            $scope.sendData = args.sendData;
                        }
                    });

                    $constantsService.getStates().then(function(constants){
                        $scope.statesFront = {};
                        for (var key in constants) {
                            $scope.statesFront[constants[key]] = key;
                        }
                    });

                    $scope.$on('updateBestehendeList', function (event, args) {
                        if ($scope.type == 'bestehende') {
                            $scope.refreshWindow('bestehende');
                        }
                    });

                    $scope.$on('updateDriveByBestehende', function (event, args) {
                        if ($scope.type == 'bestehende') {
                            $scope.refreshWindow('bestehende');
                            if ($scope.driveBys.length > 1) {
                                var id = $scope.driveBys[1].transactionHash;
                                $scope.showDrivebysDetailsRest(id);
                            } else {
                                $rootScope.$broadcast('preloader'+$scope.type, {data: false});
                            }
                        }
                    });

                    $scope.sortFields = {
                        criterium: 'TIME',
                        order: 'ASC'
                    };
                    $scope.currentPage = 1;
                    $scope.numberOfResults = 30;

                    $scope.sendData =
                    {
                        "searchedStates": [
                            "FINISHED",
                            "INCOMPLETE",
                            "NEW",
                            "REJECTED",
                            "UNKNOWN"
                        ]
                    };

                    $scope.pageChanged = function() {
                        $scope.sendData.pageNumber = $scope.currentPage;
                        $scope.sendData.numberOfResults = $scope.numberOfResults;
                        $scope.sendData.sortCriterium = $scope.sortFields.criterium;
                        $scope.sendData.sortOrder = $scope.sortFields.order;

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

                        $scope.sendData.pageNumber = $scope.currentPage;
                        $scope.sendData.numberOfResults = $scope.numberOfResults;
                        $scope.sendData.sortCriterium = $scope.sortFields.criterium;
                        $scope.sendData.sortOrder = $scope.sortFields.order;

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
                    $sessionStorage.formchangesbestehende = [];

                    $scope.showDrivebysDetails = function(id, $event) {
                        $sessionStorage.driveById = id;

                        var event = $event.currentTarget,
                            accept = angular.element(event).children().eq(0),
                            storageFormchangesName = 'formchanges';

                        if ($scope.type == 'bestehende') {
                            storageFormchangesName += $scope.type;
                        }

                        if(angular.isArray($sessionStorage[storageFormchangesName]) && !angular.equals($sessionStorage[storageFormchangesName], [])) {
                            $sessionStorage[storageFormchangesName] = $sessionStorage[storageFormchangesName].filter(function(x) {
                                return x !== undefined &&  x !== null;
                            });
                        }

                        if (!accept.hasClass('active') && (!$sessionStorage[storageFormchangesName] || $sessionStorage[storageFormchangesName].length == 0) ) {
                            $sessionStorage[storageFormchangesName] = [];
                            $scope.showDrivebysDetailsRest(id);
                        } else {
                            if (accept.hasClass('active')) {
                                $scope.showDrivebysDetailsRest(id);
                                angular.element(document.querySelectorAll('.driveby-items.bestehende .active')).removeClass('active');
                            } else {
                                angular.element(document.querySelectorAll('.driveby-items.bestehende .active')).removeClass('active');
                                accept.addClass('active');
                            }
                        }
                    };

                    $scope.showDrivebysDetailsRest = function(id) {
                        $scope.retriggerMap(id, $scope.type);
                    };

                    $scope.retriggerMap = function(id, type) {
                        $rootScope.$broadcast('preloader'+type, {data: true});
                        $drivebysService.showDrivebysDetails(id, type).then(function (data) {
                            if (angular.isObject(data) && !angular.equals(data, {})) {
                                var viewport =  $listenerService.getDefaultViewport();

                                $rootScope.$broadcast('drivebyDetails'+type, {
                                    data: data,
                                    type: $scope.type
                                });

                                $listenerService.triggerChange("drivebyDetails"+type, "dgoDrivebys", data.location);

                                var suchProfil = {"suchoptionen":{},"sortOrder":{"sortField":"bauende","order":"asc"},"offset":0,"geo":{},"view":{"viewport":viewport,"zoomlevel":12},"type":"objekteimbau"};

                                if (type == 'neue')
                                    $mapService.disableZoomListener(true);
                                else
                                    $mapServiceBestehende.disableZoomListener(true);

                                $sucheService.loadItems(suchProfil).then(function (data) {
                                    if (!angular.equals($sessionStorage.mapObjectList, {})) {
                                        var addObject = {};
                                        addObject.angebotsart = $sessionStorage.mapObjectList.angebotsart;
                                        addObject.location = $sessionStorage.mapObjectList.location;
                                        addObject.id = $sessionStorage.mapObjectList.id;

                                        data.objektImBauVorschau.unshift(addObject);

                                        console.log('id', $sessionStorage.mapObjectList.id);
                                    }

                                    $listenerService.triggerChange("detailItem"+type, "dgoDrivebys", data);
                                    // $listenerService.triggerChange("detailItem", "dgoDrivebys", data);
                                });
                               
                            } else {
                                $rootScope.$broadcast('preloader'+type, {data: false});
                            }
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

                    $scope.countEdit = function(data, type) {
                        $drivebysService.countEditDriveBy(data, type).then(function (count) {
                            $scope.totalItems = count;
                        }, function (error) {
                            $scope.driveBys = undefined;
                        });
                    };

                    $scope.refreshWindow = function(type) {
                        var data = {
                            "pageNumber": $scope.currentPage
                        };

                        $scope.countEdit(data, type);

                        data = $scope.sendData || {
                                "pageNumber": $scope.currentPage,
                                "numberOfResults": $scope.numberOfResults
                            };

                        $scope.searchEdit(data, type);
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
