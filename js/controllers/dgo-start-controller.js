define(["./module"], function (module) {
    "use strict";
    module.controller("dgoStartController", ["$scope", "$rootScope", "$urlService", "$window", "$constantsService", "$newsService", function ($scope, $rootScope, $urlService, $window, $constantsService, $newsService) {
		$scope.tabs = [
			{ title:'Neue', url:'dgo-neue', show: true },
			{ title:'Bestehende', url:'dgo-bestehende', show: true},
			{ title:'Neue', url:'dgo-neue-driveby', show: false },
			{ title:'Bestehende', url:'dgo-bestehende-driveby', show: false},
            { title:'Neue', url:'dgo-oib', show: false },
            { title:'Bestehende', url:'dgo-oib', show: false}
		];

		$constantsService.newsThemen().then(function(constants){
			$scope.newsThemen = constants;
		});
		$constantsService.newsTypes().then(function(constants){
			$scope.newsTypes = constants;
		});

		$constantsService.newsModi().then(function(constants){
			$scope.anzeigen = constants;
		});

		$scope.checkFields = function(sendData) {
			if (sendData.location) {
				if ((sendData.location.lat || parseInt(sendData.location.lat) == 0) && (sendData.location.lon || parseInt(sendData.location.lon) == 0)) {
					$scope.disabled = false;
				} else {
					$scope.disabled = !(sendData.locationHierarchy && ((sendData.location.lat == '' && parseInt(sendData.location.lat) != 0) || sendData.location.lat == undefined) && ((sendData.location.lon == '' && parseInt(sendData.location.lon) != 0) || sendData.location.lon == undefined));
				}
			}  else {
				$scope.disabled = !sendData.locationHierarchy;
			}

			return $scope.disabled;
		};

		$scope.clearFields = function(type) {
			var clearData = {};

			if (type == 'erstellen') {
				clearData = $constantsService.datepickerSettings('erstellen').sendData;
			}

			return clearData;
		};

	}]);
});