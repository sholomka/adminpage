define(["./module"], function(module) {
    "use strict";
    module.factory("$feedbackService", ["$q", "$rootScope", "$uibModal", "$messageService", "$restService", "$listenerService", "$authService", "$location",
        function($q, $rootScope, $uibModal, $messageService, $restService, $listenerService, $authService, $location) {
    		var currentFeedbackFehler,currentFeedbackErwartet;
            var saveFeedback = function(data) {
                var deferred = $q.defer();
                $restService.getFeedbackSpeichernRequest(data).run().then(function(responsedata) {
                    deferred.resolve(responsedata);
                },function() {
                    deferred.reject("Fehler beim Absenden des Feedbacks!");
                });
                return deferred.promise;
            };
            var setFeedback = function(feedbackFehler, feedbackErwartet){
                currentFeedbackFehler= feedbackFehler;
                currentFeedbackErwartet=feedbackErwartet;
            	showFeedbackDialog();
                currentFeedbackFehler= undefined;
                currentFeedbackErwartet=undefined;
            };
            var showFeedbackDialog = function() {
                var $scope = $rootScope.$new(true, null);
                if(currentFeedbackErwartet){
                	$scope.feedbackErwartet = currentFeedbackErwartet;
                }
                if(currentFeedbackFehler){
                	$scope.feedbackFehler = currentFeedbackFehler;
                }
                $scope.currentUserName = $authService.getCurrentUserName();
                $scope.currentUserEMail = $authService.getCurrentUserEMail();
                var currentModal = $uibModal.open({
                    templateUrl: 'templates/modal-feedback.html',
                    backdrop: 'static',
                    scope: $scope
                });
                $scope.feedbackSenden = function(feedbackFehler, feedbackErwartet) {
                    $scope.feedbackSending = true;
                    var feedbackData = {
                        fehler: feedbackFehler,
                        erwartet: feedbackErwartet,
                        user: $authService.getCurrentUser(),
                        name: $authService.getCurrentUserName(),
                        email: $authService.getCurrentUserEMail(),
                        paket: $authService.getCurrentPaket(),
                        mandant: $authService.getCurrentMandantName(),
                        data: $listenerService.getCompleteStorage(),
                        path: $location.path()
                    };
                    saveFeedback(feedbackData).then(function() {
                        $scope.feedbackSending = false;
                        currentModal.close();
                        $messageService.showInfo("Vielen Dank für Ihr Feedback.");
                    }, function(error) {
                        $scope.feedbackSending = false;
                        $messageService.showError(error);
                    });
                };
                $scope.cancel = function() {
                    currentModal.dismiss();
                };
                return currentModal.result;
            };
            var loadFeedback = function(feedbackId) {
                var deferred = $q.defer();
                $restService.getFeedbackLadenRequest(feedbackId).run().then(function(responsedata) {
                    deferred.resolve(responsedata);
                },function() {
                    deferred.reject("Fehler beim Laden des Feedbacks!");
                });
                return deferred.promise;
            };
            return {
                showFeedbackDialog: showFeedbackDialog,
                loadFeedback: loadFeedback,
                setFeedback: setFeedback
            };
        }
    ]);
});