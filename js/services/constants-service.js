define(["./module"], function (module) {
    "use strict";
    module.factory("$constantsService", ["$q","$rootScope","$restService",  function($q,$scope,$restService) {

        var newsThemen = function(){
        	var deferred=$q.defer();
        	$restService.getNewsThemen().run().then(function(data){
        		deferred.resolve(data);
        	},function() {
    			deferred.reject();
    			$messageService.showError("Fehler beim Laden der Konstanten!");
    		});
        	return deferred.promise;
        };

		var newsTypes = function(){
			var deferred=$q.defer();
			$restService.getNewsTypen().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

		var newsModi = function(){
			var deferred=$q.defer();
			$restService.getNewsModi().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

		var datepickerSettings = function(template){
			var settings = {};
			var sendData = {};

			if (template == 'erstellen') {
				sendData.publishFromDate = new Date();
				sendData.publishUntilDate = new Date();
				sendData.publishUntilDate.setMonth(sendData.publishUntilDate.getMonth() + 3);
			}

			$scope.toggleMin = function() {
				settings.minDate = settings.minDate ? null : new Date();
			};
			$scope.toggleMin();
			settings.maxDate = new Date(2020, 5, 22);

			settings.openFrom = function($event) {
				settings.status.openedFrom = true;
			};

			settings.openUntil = function($event) {
				settings.status.openedUntil = true;
			};

			settings.dateOptions = {
				formatYear: 'yy',
				startingDay: 1
			};

			settings.formats = ['yyyy-MM-dd', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
			settings.format = settings.formats[0];

			settings.status = {
				openedFrom: false,
				openedUntil: false
			};

			return {settings: settings, sendData: sendData};
		};

		var getZustande = function(){
			var deferred=$q.defer();
			$restService.getZustande().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

		var getStates = function(){
			var deferred=$q.defer();
			$restService.getStates().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

		var getObjektTypen = function(){
			var deferred=$q.defer();
			$restService.getObjektTypen().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

		var getBautenstande = function(){
			var deferred=$q.defer();
			$restService.getBautenstande().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

		var getObjektStandard = function(){
			var deferred=$q.defer();
			$restService.getObjektStandard().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

		var getObjektStandardUmg = function(){
			var deferred=$q.defer();
			$restService.getObjektStandardUmg().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

		var getLeerstandUmg = function(){
			var deferred=$q.defer();
			$restService.getLeerstandUmg().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

		var getVerkehr = function(){
			var deferred=$q.defer();
			$restService.getVerkehr().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

		var getVersorgung = function(){
			var deferred=$q.defer();
			$restService.getVersorgung().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

		var getErholung = function(){
			var deferred=$q.defer();
			$restService.getErholung().run().then(function(data){
				deferred.resolve(data);
			},function() {
				deferred.reject();
				$messageService.showError("Fehler beim Laden der Konstanten!");
			});
			return deferred.promise;
		};

    	return {
    		newsThemen: newsThemen,
			newsTypes: newsTypes,
			newsModi: newsModi,
			datepickerSettings: datepickerSettings,
			getZustande: getZustande,
			getStates: getStates,
			getObjektTypen:getObjektTypen,
			getBautenstande:getBautenstande,
			getObjektStandard:getObjektStandard,
			getObjektStandardUmg:getObjektStandardUmg,
			getLeerstandUmg:getLeerstandUmg,
			getVerkehr:getVerkehr,
			getVersorgung:getVersorgung,
			getErholung:getErholung
    	};

    }]);
});