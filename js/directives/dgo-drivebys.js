define(["./module"], function (module) {
    "use strict";
    module.directive("dgoDrivebys", ["$rootScope", "$urlService", "$constantsService", "$filter", "$restService", "$drivebysService", "$sucheService", "$listenerService",
        function ($rootScope, $urlService, $constantsService, $filter, $restService, $drivebysService, $sucheService, $listenerService) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-drivebys.html",
                controller: function ($scope, $attrs) {
                    $scope.sortFields = {
                        criterium: 'TIME',
                        order: 'ASC'
                    };
                    $scope.currentPage = 1;
                    $scope.numberOfResults = 5;

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

                        $drivebysService.searchTodayDriveBys($scope.sendData).then(function(data){
                            $scope.driveBys = data;
                        }, function(error){
                            $rootScope.news = undefined;
                            if(error && error.exception=="PolygonNotInViewportException"){
                                $rootScope.newsBemerkung = error.error;
                            }else{
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

                        $drivebysService.searchTodayDriveBys($scope.sendData).then(function(data){
                            $scope.driveBys = data;
                        }, function(error){
                            $rootScope.news = undefined;
                            if(error && error.exception=="PolygonNotInViewportException"){
                                $rootScope.newsBemerkung = error.error;
                            }else{
                                $rootScope.newsError = error;
                            }
                        });
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

                    $scope.showDrivebysDetails = function(id) {
                        $drivebysService.showDrivebysDetails(id).then(function (data) {

                            $rootScope.$broadcast('drivebyDetails', {
                                data: data
                            });

                            $listenerService.triggerChange("drivebyDetails", "dgoDrivebys", data.location);

                            var suchProfil = {"suchoptionen":{},"sortOrder":{"sortField":"bauende","order":"asc"},"offset":0,"geo":{},"view":{"viewport":[[51.450189013791665,12.073658093359427],[51.450189013791665,12.495601757910208],[51.23336583234749,12.495601757910208],[51.23336583234749,12.073658093359427]],"zoomlevel":12},"type":"objekteimbau"};

                            $sucheService.loadItems(suchProfil, id).then(function (data) {
                                $listenerService.triggerChange("detailItem", "dgoDrivebys", data);
                            });


                        }, function (error) {
                            $rootScope.news = undefined;
                            if (error && error.exception == "PolygonNotInViewportException") {
                                $rootScope.newsBemerkung = error.error;
                            } else {
                                $rootScope.newsError = error;
                            }
                        });
                    };

                    $scope.searchEdit = function(data) {
                        $drivebysService.searchTodayDriveBys(data).then(function (data) {
                            $scope.driveBys = data;
                        }, function (error) {
                            $rootScope.driveBys = undefined;
                            if (error && error.exception == "PolygonNotInViewportException") {
                                $rootScope.newsBemerkung = error.error;
                            } else {
                                $rootScope.newsError = error;
                            }
                        });
                    };

                    $scope.countEdit = function(data) {
                        $drivebysService.countEditDriveBy(data).then(function (count) {
                            $scope.totalItems = count;
                        }, function (error) {
                            $rootScope.driveBys = undefined;
                            if (error && error.exception == "PolygonNotInViewportException") {
                                $rootScope.newsBemerkung = error.error;
                            } else {
                                $rootScope.newsError = error;
                            }
                        });
                    };

                    $scope.refreshWindow = function(type) {
                        if ($attrs.className == 'neue' && type == 'neue') {
                            var data = {
                                "pageNumber": $scope.currentPage
                            };

                            $scope.countEdit(data);

                            data = {
                                "pageNumber": $scope.currentPage,
                                "numberOfResults": $scope.numberOfResults
                            };

                            $scope.searchEdit(data);
                        } else if($attrs.className == 'bestehende' && type == 'bestehende') {
                           /* $scope.sendData.size = 10;
                            $scope.sendData.from = 0;

                            $newsService.sucheNews($scope.sendData).then(function(data){
                                $scope.news = data;
                            }, function(error){
                                $rootScope.news = undefined;
                                if(error && error.exception=="PolygonNotInViewportException"){
                                    $rootScope.newsBemerkung = error.error;
                                }else{
                                    $rootScope.newsError = error;
                                }
                            });*/
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
                    }
                }
            };

        }]);
});
