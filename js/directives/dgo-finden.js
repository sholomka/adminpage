define(["./module"], function (module) {
    "use strict";
    module.directive("dgoFinden", ["$q", "$rootScope", "$urlService", "$constantsService", "$restService", "$filter",
        function ($q, $rootScope, $urlService, $constantsService, $restService, $filter) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-finden.html",
                controller: function ($scope, $element) {
                    $scope.settings = $constantsService.datepickerSettings().settings;
                    $scope.sendData = $constantsService.datepickerSettings('finden').sendData;
                    $scope.sendData.anzeigen = $scope.anzeigen['Alle'];

                    $scope.getCount =function() {
                        $scope.sendData.createDateFrom = $filter('date')($scope.sendData.createDateFrom, 'yyyy-MM-dd');
                        $scope.sendData.createDateUntil = $filter('date')($scope.sendData.createDateUntil, 'yyyy-MM-dd');
                        $restService.countEditNews($scope.sendData).run().then(function(data){
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

                    $scope.sucheNews = function() {
                        $scope.sendData.size = 10;
                        $scope.sendData.from = 0;
                        $scope.sendData.createDateFrom = $filter('date')($scope.sendData.createDateFrom, 'yyyy-MM-dd');
                        $scope.sendData.createDateUntil = $filter('date')($scope.sendData.createDateUntil, 'yyyy-MM-dd');

                        var deferred=$q.defer();
                        $restService.sucheEditNews($scope.sendData).run().then(function(data){
                            $rootScope.$broadcast('findNews', {
                                data: data
                            });

                            $rootScope.$broadcast('paginationData', {
                                data: $scope.sendData,
                                count: $scope.count
                            });

                            deferred.resolve(data);
                        },function(error) {
                            deferred.reject(error);
           			        //$messageService.showError("Fehler beim Laden der Nachrichten!");
                        });
                        return deferred.promise
                    };

                    $scope.$on('retrigerCount', function (event, args) {
                        $scope.count = args.count;
                    });
                }
            };

        }]);
});