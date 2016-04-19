define(["./module"], function (module) {
    "use strict";
    module.factory("$sucheService", ["$q", "$restService", "$rootScope",  function ($q, $restService, $scope) {
        var currentAngebotsart,
            currentRegion,
            currentAreas,
            currentSuchart,
            currentSuchoptionen,
            currentReferenzobjekt,
            currentSortOrder,
            currentSortOrderForCluster,
            currentOffset,
            currentOffsetForCluster,
            currentItem,
            currentCluster,
            currentViewport,
            currentZoomlevel;

        var cachedItems,
            cachedItemsHash,
            cachedClusterItems,
            cachedClusterItemsHash,
            cachedMarktdaten,
            cachedSoziodaten,
            cachedAngebotsHistorie,
            cachedAngebotsStatus;

        var getRequestData = function (forCluster) {
            if (currentSuchart == "referenzobjekt") {
                return getReferenzobjektRequestData(forCluster);
            } else {
                return getSuchprofilRequestData(forCluster);
            }
        };

        var getReferenzobjektRequestData = function (forCluster) {
            var referenzobjektSuchoptionen = angular.copy(currentReferenzobjekt);
            var rangeKeys = ["wohnflaeche", "zimmer", "preis", "baujahr", "grundstucksflache"];
            for (var i = 0; i < rangeKeys.length; i++) {
                var key = rangeKeys[i];
                var obj = referenzobjektSuchoptionen[key];
                if (angular.isObject(obj)) {
                    var wert = parseFloat(obj.wert);
                    var range = parseFloat(obj.range);
                    if (!isNaN(wert)) {
                        if (isNaN(range)) range = 0;
                        obj.von = wert - range;
                        obj.bis = wert + range;
                    } else {
                        delete obj.von;
                        delete obj.bis;
                    }
                }
                referenzobjektSuchoptionen[key] = obj;
            }


            referenzobjektSuchoptionen.letzteMonate = currentSuchoptionen.letzteMonate;

            return {
                suchoptionen: referenzobjektSuchoptionen,
                sortOrder: forCluster ? currentSortOrderForCluster : currentSortOrder,
                offset: forCluster ? currentOffsetForCluster : currentOffset,
                geo: {
                    areas: angular.isArray(currentAreas) && currentAreas.length > 0 ? currentAreas : undefined,
                    geoHash: forCluster && angular.isObject(currentCluster) ? currentCluster.wolkenId : undefined
                },
                view: {
                    viewport: currentViewport,
                    zoomlevel: currentZoomlevel
                },
                referenzobjekt: currentReferenzobjekt
            };
        };

        var getSuchprofilRequestData = function (forCluster) {
            return {
                suchoptionen: currentSuchoptionen,
                sortOrder: forCluster ? currentSortOrderForCluster : currentSortOrder,
                offset: forCluster ? currentOffsetForCluster : currentOffset,
                geo: {
                    areas: angular.isArray(currentAreas) && currentAreas.length > 0 ? currentAreas : undefined,
                    geoHash: forCluster && angular.isObject(currentCluster) ? currentCluster.wolkenId : undefined
                },
                view: {
                    viewport: currentViewport,
                    zoomlevel: currentZoomlevel
                }
            };
        };

        var cachedItemDetails = {};
        var loadItems = function (data, type) {
            var deferred = $q.defer();

            $restService.getObjektRequest(data).run().then(function (data) {
                deferred.resolve(data);
            }, function () {
                deferred.reject("Fehler beim Laden der Objektdetails!");
            });

           /* if (angular.isObject(cachedItemDetails[id])) {
                deferred.resolve(cachedItemDetails[id]);
            } else {
                $restService.getObjektRequest(data).run().then(function (data) {
                    deferred.resolve(data);
                    cachedItemDetails[id] = data;
                }, function () {
                    deferred.reject("Fehler beim Laden der Objektdetails!");
                });
            }*/
            return deferred.promise;
        };

        var loadItem = function (id) {
            var deferred = $q.defer();

            $restService.getObjektRequestDetail(id).run().then(function (data) {
                deferred.resolve(data);
            }, function () {
                deferred.reject("Fehler beim Laden der Objektdetails!");
            });

            return deferred.promise;
        };

        return {
            getRequestData: getRequestData,
            loadItems: loadItems,
            loadItem: loadItem
        };

    }]);
});
