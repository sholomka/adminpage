define(["./module"], function (module) {
    "use strict";
    module.factory("$drivebysService", ["$q","$rootScope", "$restService", "$listenerService", "$sucheService",
        function($q,$rootScope,$restService, $listenerService, $sucheService) {
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


            var deleteDriveBy=function(data){
                var deferred=$q.defer();
                $restService.deleteDriveBy(data).run().then(function(data){
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
            
            var retriggerMap = function(id, viewport) {
                var suchProfil = {"suchoptionen":{},"sortOrder":{"sortField":"bauende","order":"asc"},"offset":0,"geo":{},"view":{"viewport":viewport,"zoomlevel":12},"type":"objekteimbau"};

                $sucheService.loadItems(suchProfil, id).then(function (data) {
                    $listenerService.triggerChange("detailItem", "dgoDrivebys", data);
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