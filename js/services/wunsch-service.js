define(["./module", "googlemaps"], function (module) {
    "use strict";
    module.factory("$wunschService", ["$q", "$rootScope", "$uibModal", "$messageService", "$restService", "$listenerService", "$authService", "$location",
        function ($q, $rootScope, $uibModal, $messageService, $restService, $listenerService, $authService, $location) {
            var currentWunsch;
            var currentAddress;
            var currentObjectId;
            var currentAngebotsart;

            var saveWunsch = function (data) {
                var deferred = $q.defer();
                $restService.getWunschSpeichernRequest(data).run().then(function (responsedata) {
                    deferred.resolve(responsedata);
                }, function () {
                    deferred.reject("Fehler beim Absenden des Wunsches!");
                });
                return deferred.promise;
            };
            var $scope = $rootScope.$new(true, null);
            $scope.text = {};

            var setWunsch = function (address, text) {
                var wunsch = text.feedbackFeldText;
                $scope.text = text;
                currentWunsch = wunsch;

                currentAddress = address;
                currentObjectId = undefined;
                showWunschDialog();
                currentWunsch = undefined;
            };

            var setWunschWithObject = function (object, text) {
                var wunsch = text.feedbackFeldText;
                $scope.text = text;
                currentWunsch = wunsch;

                currentObjectId = object.id;
                currentAngebotsart = object.angebotsart;
                currentAddress = undefined;
                showWunschDialog();
                currentWunsch = undefined;
            };

            var showWunschDialog = function () {

                if (currentWunsch) {
                    $scope.wunsch = currentWunsch;
                }
                $scope.currentUserName = $authService.getCurrentUserName();
                $scope.currentUserEMail = $authService.getCurrentUserEMail();
                var currentModal = $uibModal.open({
                    templateUrl: 'templates/modal-wunsch.html',
                    backdrop: 'static',
                    scope: $scope
                });
                $scope.wunschSenden = function (wunsch) {
                    $scope.wunschSending = true;
                    var wunschData = {
                        wunsch: wunsch,
                        location: currentAddress,
                        objekt: currentObjectId ?$location.protocol() +"://"+ location.host + "#/objectshare?id=" + encodeURIComponent(currentObjectId) + "&angebotsart=" + currentAngebotsart : undefined,
                        user: $authService.getCurrentUser(),
                        name: $authService.getCurrentUserName(),
                        email: $authService.getCurrentUserEMail(),
                        paket: $authService.getCurrentPaket(),
                        mandant: $authService.getCurrentMandantName(),
                    };
                    saveWunsch(wunschData).then(function () {
                        $scope.wunschSending = false;
                        currentModal.close();
                        $messageService.showInfo("Vielen Dank für Ihr Feedback.");
                    }, function (error) {
                        $scope.wunschSending = false;
                        $messageService.showError(error);
                    });
                };
                $scope.cancel = function () {
                    currentModal.dismiss();
                };
                return currentModal.result;
            };
//            var loadWunsch = function(wunschId) {
//                var deferred = $q.defer();
//                $restService.getWunschLadenRequest(wunschId).run().then(function(responsedata) {
//                    deferred.resolve(responsedata);
//                },function() {
//                    deferred.reject("Fehler beim Laden des Feedbacks!");
//                });
//                return deferred.promise;
//            };
            return {
                showWunschDialog: showWunschDialog,
//                loadFeedback: loadFeedback,
                setWunsch: setWunsch,
                setWunschWithObject: setWunschWithObject
            };
        }
    ]);
});