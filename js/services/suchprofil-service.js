define(["./module"], function (module) {
    "use strict";
    module.factory("$suchprofilService", ["$q","$rootScope","$restService", "$listenerService", function($q,$rootScope,$restService, $listenerService) {
    	var currentAngebotsart,
    		currentSuchprofil,
    		currentSuchoptionen,
    		currentRegion,
    		currentAreas,
    		currentViewport,
    		currentSortOrder,
    		currentFavoriten,
    		currentSpezialgebiete;
    	
    	var loadEmptySuchprofil=function() {
    		$listenerService.resetSuchprofil();
    	};

    	var setSuchprofilResponseData=function(responsedata) {
    		if (angular.isObject(responsedata.data)) {
    			currentAngebotsart=angular.copy(responsedata.data.angebotsart);
	    		currentSuchoptionen=angular.copy(responsedata.data.suchoptionen);
				currentRegion=angular.copy(responsedata.data.region);
				currentAreas=angular.copy(responsedata.data.areas);
				currentViewport=angular.copy(responsedata.data.viewport);
				currentSortOrder=angular.copy(responsedata.data.sortOrder);
				currentSpezialgebiete=angular.copy(responsedata.data.spezialgebiete);
				if (angular.isUndefined(currentFavoriten)) currentFavoriten={};
				currentFavoriten["suchoptionen"]=angular.copy(responsedata.data.favoriten);

				//das eigentliche suchprofil-objekt besteht nur aus den metadaten
				delete responsedata.data;
    		}
			currentSuchprofil=responsedata;
			$listenerService.triggerChange("angebotsart","suchprofilService",currentAngebotsart);
			$listenerService.triggerChange("suchoptionen","suchprofilService",currentSuchoptionen);
			$listenerService.triggerChange("viewport","suchprofilService",currentViewport);
			$listenerService.triggerChange("region","suchprofilService",currentRegion);
			$listenerService.triggerChange("areas","suchprofilService",currentAreas);
			$listenerService.triggerChange("sortOrder","suchprofilService",currentSortOrder);
			$listenerService.triggerChange("suchprofil","suchprofilService",currentSuchprofil);
			$listenerService.triggerChange("favoriten","suchprofilService",currentFavoriten);
            $listenerService.triggerChange("spezialgebiete","suchprofilService",currentSpezialgebiete);
    	};

    	var getRequestData=function() {
    		var requestdata=angular.copy(currentSuchprofil);
    		requestdata.data={
    			angebotsart: currentAngebotsart,
    			suchoptionen: currentSuchoptionen,
				region: currentRegion,
				areas: currentAreas,
				viewport: currentViewport,
				sortOrder: currentSortOrder,
                spezialgebiete: currentSpezialgebiete,
				favoriten: angular.isDefined(currentFavoriten) ? currentFavoriten["suchoptionen"] : undefined,
			};
    		return requestdata;
    	}

    	var loadSuchprofil=function(suchprofilId) {
    		var deferred=$q.defer();
			$restService.getSuchprofilLadenRequest(suchprofilId).run().then(function(responsedata) {
				setSuchprofilResponseData(responsedata);
				$messageService.showInfo("Suchprofil '"+currentSuchprofil.name+"' wurde geladen.");
    			deferred.resolve(currentSuchprofil);
			},function() {
				$messageService.showError("Fehler beim Laden des Suchprofils!");
				deferred.reject();
			});
			return deferred.promise;
    	};

    	var saveSuchprofil=function() {
    		if (angular.isUndefined(currentSuchprofil.id) || currentSuchprofil.id==null) {
				return saveNewSuchprofil();
			} else {
				var deferred=$q.defer();
				$restService.getSuchprofilSpeichernRequest(currentSuchprofil.id,getRequestData()).run().then(function(responsedata) {
    				setSuchprofilResponseData(responsedata);
    				$messageService.showInfo("Suchprofil '"+currentSuchprofil.name+"' wurde gespeichert.");
					deferred.resolve(currentSuchprofil);
				},function() {
					$messageService.showError("Fehler beim Speichern des Suchprofils!");
					deferred.reject();
				});
    			return deferred.promise;
			}
		};

		var saveNewSuchprofil=function() {
			var deferred=$q.defer();

			var $scope = $rootScope.$new(true, null);
			$scope.suchname=currentSuchprofil.name;
			var currentModal=$uibModal.open({
    			template: '<div class="modal-header"><h4 class="modal-title">Suchprofil speichern</h4></div><div class="modal-body"><form><div class="form-group"><label>Bezeichnung</label><input type="text" class="form-control" ng-model="suchname"></div></form></div><div class="modal-footer"><button class="btn btn-primary" ng-click="speichern(suchname)" ng-class="{\'disabled\': !suchname}">OK</button><button class="btn btn-default" ng-click="cancel()">Abbrechen</button></div>',
    			backdrop: "static",
    			scope: $scope,
    			size: "s"
    		});

			$scope.speichern=function(name) {
				if (angular.isUndefined(name) || name.length==0) return;
				var requestdata=getRequestData();
				requestdata.name=name;
	    		$restService.getSuchprofilSpeichernRequest(null,requestdata).run().then(function(responsedata) {
	    			setSuchprofilResponseData(responsedata);
	    			$messageService.showInfo("Suchprofil '"+currentSuchprofil.name+"' wurde gespeichert.");
					deferred.resolve(currentSuchprofil);
				},function() {
					$messageService.showError("Fehler beim Speichern des Suchprofils!");
					deferred.reject();
				});
        		currentModal.close();
        	};
        	$scope.cancel=function() {
        		currentModal.dismiss();
        	};

        	return deferred.promise;
		};

		var isLoschenErlaubt=function(suchprofil) {
			return $restService.getSuchprofilLoschenRequest(suchprofil).isAllowed();
		};

    	var deleteSuchprofil=function(suchprofil) {
    		var deferred=$q.defer();
    		$messageService.showConfirmDialog("Löschen bestätigen","Möchten Sie dieses Suchprofil wirklich löschen?").then(function() {
    			$restService.getSuchprofilLoschenRequest(suchprofil).run().then(function(data) {
        			$messageService.showInfo("Das Suchprofil wurde gelöscht.");
        			deferred.resolve();
    			},function() {
    				$messageService.showError("Fehler beim Löschen des Suchprofils!");
    				deferred.reject();
    			});
    		});
    		return deferred.promise;
    	};

    	var listSuchprofile=function() {
    		var deferred=$q.defer();
			$restService.getSuchprofilListeRequest().run().then(function(data) {
				if (angular.isArray(data) && data.length>0) {
					deferred.resolve(data);
				} else {
					deferred.resolve(undefined);
				}
			},function() {
				deferred.reject("Fehler beim Laden der Suchprofile");
			});
    		return deferred.promise;
    	};

    	var showLadenDialog = function() {
            var $scope = $rootScope.$new(true, null);
            $scope.cancel = function() {
                currentModal.dismiss();
            };
            $scope.loadSuchprofil=function(suchprofil) {
        		loadSuchprofil(suchprofil).then(function() {
        			currentModal.dismiss();
        		});
        	};

        	$scope.deleteSuchprofil=function(suchprofil) {
        		deleteSuchprofil(suchprofil).then(function() {
        			$scope.refresh();
        		});
        	};

        	$scope.isLoschenErlaubt=function(suchprofil) {
        		return isLoschenErlaubt(suchprofil);
        	};

        	$scope.refresh=function() {
        		$scope.suchprofile=undefined;
        		$scope.suchprofileLoading=true;
        		$scope.suchprofileError=undefined;
        		listSuchprofile().then(function(data) {
        			$scope.suchprofileLoading=false;
        			$scope.suchprofile=data;
        		},function(error) {
        			$scope.suchprofileLoading=false;
        			$scope.suchprofileError=error;
        		});
        	};

        	var currentModal = $uibModal.open({
                templateUrl: 'templates/modal-sucheladen.html',
                backdrop: 'static',
                scope: $scope,
                size: "lg"
            });

        	$scope.refresh();

            return currentModal.result;
        };

    	$listenerService.addChangeListener("suchprofil","suchprofilService",function(suchprofil) {
			currentSuchprofil=suchprofil;
		});

		$listenerService.addChangeListener("region","suchprofilService",function(region) {
			currentRegion=region;
		});

		$listenerService.addChangeListener("areas","suchprofilService",function(areas) {
			currentAreas=areas;
		});

		$listenerService.addChangeListener("viewport","suchprofilService",function(viewport) {
			currentViewport=viewport;
		});

		$listenerService.addChangeListener("suchoptionen","suchprofilService",function(suchoptionen) {
			currentSuchoptionen=suchoptionen;
		});

		$listenerService.addChangeListener("sortOrder","suchprofilService",function(sortOrder) {
			currentSortOrder=sortOrder;
		});

		$listenerService.addChangeListener("favoriten","suchprofilService",function(favoriten) {
			currentFavoriten=favoriten;
		});

		$listenerService.addChangeListener("angebotsart","suchprofilService",function(angebotsart) {
			currentAngebotsart=angebotsart;
		});

        $listenerService.addChangeListener("spezialgebiete","suchprofilService",function(spezialgebiete) {
            currentSpezialgebiete=spezialgebiete;
        });


    	return {
    		loadEmptySuchprofil: loadEmptySuchprofil,
    		saveSuchprofil: saveSuchprofil,
    		saveNewSuchprofil: saveNewSuchprofil,
    		showLadenDialog: showLadenDialog,
    		getRequestData: getRequestData
    	};
    	
    }]);
});