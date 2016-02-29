define(["./module"], function (module) {
    "use strict";
    module.directive("dgoBearbeiten", ["$rootScope", "$urlService", "$constantsService", "$filter", "$restService", "$newsService",
        function ($rootScope, $urlService, $constantsService, $filter, $restService, $newsService) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-bearbeiten.html",
                controller: function ($scope, $element) {
                    $scope.settings = $constantsService.datepickerSettings().settings;
                    $scope.sendData = $constantsService.datepickerSettings().sendData;
                    $scope.disabled = $scope.checkFields($scope.sendData);
                    $scope.type = 'bearbeiten';

                    $scope.check = function(sendData) {
                        $scope.disabled = $scope.checkFields(sendData);
                    };

                    $scope.$on('editNews', function(event, args) {
                        var data = args.data;
                        
                        $scope.sendData = {};
                        $scope.sendData.title = data.title;
                        $scope.sendData.newsId = data.newsId;
                        $scope.sendData.teaser = data.teaser;
                        $scope.sendData.text = data.text;
                        $scope.sendData.source = data.source;
                        $scope.sendData.externalLink = data.externalLink;
                        $scope.sendData.locationHierarchy = data.locationHierarchy;
                        $scope.sendData.keywords = data.keywords;
                        $scope.sendData.publishFromDate = $filter('date')(data.publishFromDate, 'yyyy-MM-dd');
                        $scope.sendData.publishUntilDate = $filter('date')(data.publishUntilDate, 'yyyy-MM-dd');
                        $scope.sendData.topic = data.topic;
                        $scope.sendData.newsType = data.newsType;

                        if (data.location != null) {
                            $scope.sendData.location = {};
                            $scope.sendData.location.lat = data.location.lat;
                            $scope.sendData.location.lon = data.location.lon;
                        }

                        $scope.disabled = $scope.checkFields($scope.sendData);
                    });

                    $scope.clearCheckFields = function() {
                        $scope.sendData = $scope.clearFields($scope.type);
                        $scope.disabled = $scope.checkFields($scope.sendData);
                    };

                    $scope.saveNews=function() {
                        if ($scope.sendData.keywords != null && !angular.isArray($scope.sendData.keywords)) {
                            $scope.sendData.keywords = $scope.sendData.keywords.split(',').map(function(x) {
                                return x.trim();
                            });
                        }

                        $restService.getNewsSpeichernRequest($scope.sendData).run().then(function(){
                            $rootScope.$broadcast('refreshWindow', {type: 'bestehende'});
                            $scope.clearCheckFields();
                        });
                    };

                    $scope.cancel = function() {
                        $scope.clearCheckFields();
                    };
                }
            };

        }]);
});