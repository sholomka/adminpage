define(["./module"], function (module) {
    "use strict";
    module.factory("$spezialgebieteService", ["$q", "$rootScope", "$messageService", "$listenerService", "$restService", "$feedbackService", "$wunschService",
        function ($q, $scope, $messageService, $listenerService, $restService, $feedbackService, $wunschService) {
            var currentViewport,
                currentZoomlevel,
                currentSpezialgebiete,
                cachedTypen,
                cachedGebieteTypen = {},
                cachedGebiete = {};

            var getTypen = function () {
                var deferred = $q.defer();

                if (angular.isDefined(cachedTypen)) {
                    deferred.resolve(cachedTypen);
                } else {
                    $restService.getSpezialgebietTypenRequest().run().then(function (data) {
                        if (data != null) {
                            cachedTypen = data;
                            deferred.resolve(data);
                        } else {
                            deferred.reject();
                        }
                    }, function () {
                        deferred.reject();
                    });
                }
                return deferred.promise;
            };

            var getTypenMap = function () {
                var deferred = $q.defer();

                getTypen().then(function (typen) {
                    var map = {};
                    for (var i = 0; i < typen.length; i++) {
                        map[typen[i].key] = typen[i];
                    }
                    deferred.resolve(map);
                });

                return deferred.promise;
            };

            var getGebieteForIds = function (gebietIds) {
                var promises = [];
                angular.forEach(gebietIds, function (gebietId) {
                    promises.push(getGebiet(gebietId));
                });

                return $q.all(promises);
            };

            var getGebiet = function (gebietId) {
                var deferred = $q.defer();

                if (angular.isDefined(cachedGebiete[gebietId])) {
                    deferred.resolve(cachedGebiete[gebietId]);
                } else {
                    $restService.getSpezialgebietRequest(gebietId).run().then(function (data) {
                        if (data != null) {
                            cachedGebiete[gebietId] = data;
                            deferred.resolve(data);
                        } else {
                            deferred.reject();
                        }
                    }, function () {
                        deferred.reject();
                    });
                }
                return deferred.promise;
            };

            var getGebieteForViewportTasks = {}; //map aller aktuellen tasks
            var getGebieteForViewportLatestTask = null; //der letzte und damit einzig relevante task
            var getGebieteForViewport = function () {
                var requestData = {
                    view: {
                        viewport: currentViewport,
                        zoomlevel: currentZoomlevel
                    },
                    spezialgebiete: currentSpezialgebiete
                };
                var hash = JSON.stringify(requestData);

                var deferred = $q.defer();
                //wenn bereits eine anfrage mit denselben parametern läuft, dann warten wir, bis diese fertig ist und klauen uns das resultat davon
                if (angular.isDefined(getGebieteForViewportTasks[hash])) {
                    getGebieteForViewportTasks[hash].then(function (data) {
                        deferred.resolve(data);
                    }, function (error) {
                        deferred.reject(error);
                    });
                } else {
                    //ansonsten speichern wir den aktuellen promise in der task-map
                    getGebieteForViewportTasks[hash] = deferred.promise;
                    getGebieteForViewportLatestTask = deferred.promise;
                    $restService.getSpezialgebieteSucheRequest(requestData).run().then(function (data) {
                        //nur mit den Daten resolven, wenn dies auch der aktuellste Task ist, anonsten lassen wir ihn leise sterben
                        if (getGebieteForViewportLatestTask == deferred.promise) {
                            deferred.resolve(data);
                        }
                        delete getGebieteForViewportTasks[hash];
                    }, function () {
                        if (getGebieteForViewportLatestTask == deferred.promise) {
                            deferred.reject("Fehler beim Laden der Spezialgebiete!");
                        }
                        delete getGebieteForViewportTasks[hash];
                    });
                }

                return deferred.promise;
            };

            var sonderkartenwunsch = function (sonderkarte, address) {
                var text = {};
                text.einleitung = "Wir wollen Ihnen in geomap alle relevanten Informationen für Ihr Suchgebiet anzeigen. Indem Sie uns Ihre Wunschkarte mitteilen, helfen Sie uns bei der Priorisierung.";
                text.feedbackFeldText = "Ich interessiere mich für die Sonderkarte " + sonderkarte + ".";
                text.feedbackText = "Gern können Sie im folgenden Feld weitere Kartenwünsche ergänzen.";
                text.feedbackTitel = "Vielen Dank für Ihr Interesse!";
                text.sendenButtonText = "Wunsch senden";
                $wunschService.setWunsch(address, text);

            };
            $listenerService.addChangeListener("viewport", "spezialgebieteService", function (viewport) {
                currentViewport = viewport;
            });

            $listenerService.addChangeListener("zoomlevel", "spezialgebieteService", function (zoomlevel) {
                currentZoomlevel = zoomlevel;
            });

            $listenerService.addChangeListener("spezialgebiete", "spezialgebieteService", function (spezialgebiete) {
                currentSpezialgebiete = spezialgebiete;
            });


            return {
                getTypen: getTypen,
                getTypenMap: getTypenMap,
                getGebiet: getGebiet,
                getGebieteForIds: getGebieteForIds,
                getGebieteForViewport: getGebieteForViewport,
                sonderkartenwunsch: sonderkartenwunsch
            }
        }]);
});