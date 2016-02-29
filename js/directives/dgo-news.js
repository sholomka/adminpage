define(["./module"], function (module) {
    "use strict";
    module.directive("dgoNews", ["$rootScope", "$urlService", "$constantsService", "$newsService", "$q", "$restService", "$filter",
        function ($rootScope, $urlService, $constantsService, $newsService, $q, $restService, $filter) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-news.html",
                controller: function ($scope, $attrs) {
                    $scope.classNames = $attrs.className == 'neue' ?
                          ["col-sm-4", "left-5", "column-30", "top-1", "panel", "panel-default"] :
                          ["col-sm-4", "column-30", "left-5", "top-1", "panel", "panel-default"];

                    if (localStorage.getItem('newsPaginationHeight') == null) {
                        localStorage.setItem('newsPaginationHeight', (document.querySelector(".erstellen").offsetHeight - document.querySelector(".modal-header").offsetHeight) + 'px');
                    }

                    $scope.newsHeight = localStorage.getItem('newsPaginationHeight');

                    $scope.newsItemsStyleObj = {
                        overflow: 'auto',
                        height: $scope.newsHeight
                    };

                    $scope.editNews = function(data){
                        if ($attrs.className == 'bestehende') {
                            $rootScope.$broadcast('editNews', {
                                data: data
                            });
                        } else {
                            $rootScope.$broadcast('editNewsNeue', {
                                data: data
                            });
                        }
                    };

                    $scope.$on('findNews', function (event, args) {
                        if ($attrs.className == 'bestehende') {
                            $rootScope.newsError =undefined;
                            $scope.news = args.data;
                        }
                    });

                    $scope.refreshWindow = function(type) {
                        if ($attrs.className == 'neue' && type == 'neue') {
                            $scope.sendData = {};
                            $scope.sendData.size = 10;
                            $scope.sendData.from = $scope.currentPage ? ($scope.currentPage - 1) * $scope.sendData.size :  0;
                            $scope.sendData.anzeigen = 'all';
                            $scope.sendData.createDateFrom = $filter('date')(new Date(), 'yyyy-MM-dd');
                            $scope.sendData.createDateUntil = $filter('date')(new Date(), 'yyyy-MM-dd');

                            $scope.countEditNews($scope.sendData);

                            $newsService.sucheNews($scope.sendData).then(function (data) {
                                $scope.news = data;
                            }, function (error) {
                                $rootScope.news = undefined;
                                if (error && error.exception == "PolygonNotInViewportException") {
                                    $rootScope.newsBemerkung = error.error;
                                } else {
                                    $rootScope.newsError = error;
                                }
                            });
                        } else if($attrs.className == 'bestehende' && type == 'bestehende') {
                            $scope.sendData.size = 10;
                            $scope.sendData.from = $scope.currentPage ? ($scope.currentPage - 1) * $scope.sendData.size :  0;

                            $newsService.sucheNews($scope.sendData).then(function(data){
                                $scope.news = data;
                            }, function(error){
                                $rootScope.news = undefined;
                                if(error && error.exception=="PolygonNotInViewportException"){
                                    $rootScope.newsBemerkung = error.error;
                                }else{
                                    $rootScope.newsError = error;
                                }
                            });
                        }
                    };

                    $scope.countEditNews = function(data) {
                        $restService.countEditNews(data).run().then(function(data){
                            if ($attrs.className == 'neue') {
                                $scope.totalItems = data;
                            } else {
                                $rootScope.$broadcast('retrigerCount', {
                                    count: data
                                });
                            }
                        },function(error) {

                        });
                    };

                    $scope.loescheNews = function (n) {
                        $newsService.loescheNews(n.newsId).then(function (data) {
                            $scope.refreshWindow($attrs.className);
                            $scope.countEditNews($scope.sendData);
                        });
                    };

                    $scope.kannNewsLoeschen = function () {
                        return $newsService.kannNewsLoeschen();
                    };

                    $scope.showNewsDetail = {};
                    $scope.showNewsDetails = function(nId){
                        if($scope.showNewsDetail[nId]==undefined){
                            $scope.showNewsDetail[nId]=true;
                        }else{
                            $scope.showNewsDetail[nId]=undefined;
                        }
                    };

                    $scope.$on('refreshWindow', function (event, args) {
                        $scope.refreshWindow(args.type);
                    });

                    if ($attrs.className == 'neue') {
                        $scope.title = 'heute erstellte News';
                        $scope.refreshWindow('neue');
                    } else {
                        $scope.title = 'Gesuchte News';

                        //pagination
                        $scope.$on('paginationData', function (event, args) {
                            $scope.sendData = args.data;
                            $scope.totalItems = args.count;
                        });
                    }

                    $scope.pageChanged = function() {
                        $scope.sendData.size = 10;
                        $scope.sendData.from = ($scope.currentPage - 1) * $scope.sendData.size;

                        $newsService.sucheNews($scope.sendData).then(function(data){
                            $scope.news = data;
                        }, function(error){
                            $rootScope.news = undefined;
                            if(error && error.exception=="PolygonNotInViewportException"){
                                $rootScope.newsBemerkung = error.error;
                            }else{
                                $rootScope.newsError = error;
                            }
                        });
                    };
                }
            };

        }]);
});