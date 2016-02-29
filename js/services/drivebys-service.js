define(["./module"], function (module) {
    "use strict";
    module.factory("$drivebysService", ["$q","$rootScope", "$restService",
        function($q,$rootScope,$restService) {
            var searchTodayDriveBys=function(data){
                var deferred=$q.defer();
                $restService.searchTodayDriveBys(data).run().then(function(data){
                    deferred.resolve(data);
                },function(error) {
                    deferred.reject(error);
                });
                return deferred.promise
            };

            var showDrivebysDetails=function(data){
                var deferred=$q.defer();
                $restService.showDrivebysDetails(data).run().then(function(data){
                    deferred.resolve(data);
                },function(error) {
                    deferred.reject(error);
                });
                return deferred.promise
            };

            var countEditDriveBy=function(data){
                var deferred=$q.defer();
                $restService.countEditDriveBy(data).run().then(function(data){
                    deferred.resolve(data);
                },function(error) {
                    deferred.reject(error);
                });
                return deferred.promise
            };

            var getUserInfo=function(data){
                var deferred=$q.defer();
                $restService.getUserInfo(data).run().then(function(data){
                    deferred.resolve(data);
                },function(error) {
                    deferred.reject(error);
                });
                return deferred.promise
            };

            var storeEdited=function(data){
                var deferred=$q.defer();
                $restService.storeEdited(data).run().then(function(data){
                    deferred.resolve(data);
                },function(error) {
                    deferred.reject(error);
                });
                return deferred.promise
            };

            return {
                searchTodayDriveBys:searchTodayDriveBys,
                showDrivebysDetails:showDrivebysDetails,
                countEditDriveBy:countEditDriveBy,
                getUserInfo:getUserInfo,
                storeEdited:storeEdited
            }
        }]);
});