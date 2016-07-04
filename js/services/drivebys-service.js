define(["./module"], function (module) {
    "use strict";
    module.factory("$drivebysService", ["$q","$rootScope", "$restService", "$listenerService", "$sucheService",
        function($q,$rootScope,$restService, $listenerService, $sucheService) {
            var searchTodayDriveBys=function(data, type){
                var deferred=$q.defer();
                $restService.searchTodayDriveBys(data, type).run().then(function(data){
                    deferred.resolve(data);
                },function(error) {
                    deferred.reject(error);
                });
                return deferred.promise
            };

            var showDrivebysDetails=function(data, type){
                var deferred=$q.defer();
                $restService.showDrivebysDetails(data, type).run().then(function(data){
                    deferred.resolve(data);
                },function(error) {
                    deferred.reject(error);
                });
                return deferred.promise
            };

            var countEditDriveBy=function(data, type){
                var deferred=$q.defer();
                $restService.countEditDriveBy(data, type).run().then(function(data){
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

            var storeEdited=function(data, type){
                var deferred=$q.defer();
                $restService.storeEdited(data, type).run().then(function(data){
                    deferred.resolve(data);
                },function(error) {
                    deferred.reject(error);
                });
                return deferred.promise
            };


            var deleteDriveBy=function(data, type){
                var deferred=$q.defer();
                $restService.deleteDriveBy(data, type).run().then(function(data){
                    deferred.resolve(data);
                },function(error) {
                    deferred.reject(error);
                });
                return deferred.promise
            };
            
            var getMapped=function(id){
                var deferred=$q.defer();
                $restService.getMapped(id).run().then(function(data){
                    deferred.resolve(data);
                },function(error) {
                    deferred.reject(error);
                });
                return deferred.promise
            };
            
            var retriggerMap = function(type, viewport) {
                console.log('retriggerMap');

                var suchProfil = {"suchoptionen":{},"sortOrder":{"sortField":"bauende","order":"asc"},"offset":0,"geo":{},"view":{"viewport":viewport,"zoomlevel":15},"type":"objekteimbau"};

                $sucheService.loadItems(suchProfil).then(function (data) {
                    console.log('forceEvent');
                    $listenerService.triggerChange("detailItem"+type, "dgoDrivebys", data, true);
                });
            };

            return {
                searchTodayDriveBys:searchTodayDriveBys,
                showDrivebysDetails:showDrivebysDetails,
                countEditDriveBy:countEditDriveBy,
                getUserInfo:getUserInfo,
                storeEdited:storeEdited,
                getMapped:getMapped,
                deleteDriveBy:deleteDriveBy,
                retriggerMap:retriggerMap
            }
        }]);
});