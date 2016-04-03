define(["./module"], function (module) {
    "use strict";
    module.factory("$restService", ["$q","$http","$location", function($q,$http,$location) {
    	
    	var getRequest=function(config) {
    		var requestConfig=angular.extend({
    			method: "GET",
    			responseType: "json"
    		},config);
    		return {
    			run: function() {
    				var deferred=$q.defer();
    				$http(requestConfig).then(function(response) {
    					deferred.resolve(response.data);
    	    		},function(response) {
    	    			if (response.status==401) {
    	    				//wenn nicht (mehr) angemeldet (obwohl wir der meinung sind, wir sind es), versuchen wir ein refresh der logindaten und schicken den request erneut los, falls anschließend eingeloggt.
    	    				//das verhindert ein ablaufen der session bei inaktivität
    	    				if ($authService.isLoggedIn()) {
	    						$authService.refreshLogin(true).then(function() {
	    							if ($authService.isLoggedIn()) {
	    								$http(requestConfig).then(function(response) {
	    			    					deferred.resolve(response.data);
	    								},function(response) {
	    									deferred.reject(response.data);
	    								});
	    							} else {
	    								deferred.reject(response.data);
	    								$authService.logoutSessionExpired();
	    							}
	    						});
    	    				} else {
    	    					deferred.reject(response.data);
    	    					$authService.logout();
    	    				}
            			} else {
            				deferred.reject(response.data);
            			}
    	    		});
    				return deferred.promise;
    			},
    			isAllowed: function() {
    				return $authService.isCurrentRequestAllowed(requestConfig.method,requestConfig.url);
    			}
    		}
    	};

		//News
        var getNewsThemen = function () {
            return getRequest({
                method: "GET",
                url: "http://geomap-intern.test1.evermind.de/service/adminbackend/news/themen"
                // url: "themen.json"
            });
        };

		var getNewsTypen = function () {
			return getRequest({
				method: "GET",
				url: "http://geomap-intern.test1.evermind.de/service/adminbackend/news/typen"
				// url: "typen.json"
			});
		};

		var getNewsModi = function () {
			return getRequest({
				method: "GET",
				url: "http://geomap-intern.test1.evermind.de/service/adminbackend/news/modus"
				// url: "modus.json"
			});
		};

		var sucheNews = function (data) {
			return getRequest({
				method: "POST",
				url: "http://geomap-intern.test1.evermind.de/service/adminbackend/news/suche",
				// url: "suchenews.json",
				data: data
			});
		};

		var getNewsSpeichernRequest = function (data) {
			return getRequest({
				method: "POST",
				url: "http://geomap-intern.test1.evermind.de/service/adminbackend/news/erstelle",
				// url: "erstellen.txt",
				data: data
			});
		};

		var countEditNews = function (data) {
			return getRequest({
				method: "POST",
				url: "http://geomap-intern.test1.evermind.de/service/adminbackend/news/countEdit",
				// url: "countEdit.txt",
				data: data
			});
		};

		var sucheEditNews = function (data) {
			return getRequest({
				method: "POST",
				url: "http://geomap-intern.test1.evermind.de/service/adminbackend/news/sucheEdit",
				// url: "sucheEdit.json",
				data: data
			});
		};

		var searchTodayNews = function (data) {
			return getRequest({
				method: "POST",
				url: "http://geomap-intern.test1.evermind.de/service/adminbackend/news/searchToday",
				// url: "sucheEdit.json",
				data: data
			});
		};

		var deleteNews = function (id) {
			return getRequest({
				method: "DELETE",
				url: "http://geomap-intern.test1.evermind.de/service/adminbackend/news/loesche/" + id
				//url: "service/news/loesche/" + id
			});
		};

		// DriveBy
		var searchTodayDriveBys = function (data) {
			return getRequest({
				method: "POST",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/sucheEdit",
				url: "searchTodayDriveBys.json",
				data: data
			});
		};

		var showDrivebysDetails = function (id) {
			return getRequest({
				method: "POST",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/getDetail",
				url: "getDetails.json",
				headers: {
				 	'Content-Type': 'text/plain'
				},

				data: id
			});
		};

		var countEditDriveBy = function () {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/countEdit"
				url: "countEditDriveBy.txt"
			});
		};

		var countEditDriveByBestehende = function (data) {
			return getRequest({
				method: "POST",
				url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/all/countEdit",
				data: data
			});
		};


		var getUserInfo = function (userName) {
			return getRequest({
				method: "POST",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/userInfo",
				url: "getUserInfo.json",

				headers: {
					'Content-Type': 'text/plain'
				},

				data: userName
			});
		};

		var getObjektRequest = function (data) {
			return getRequest({
				method: "POST",
				// url: "http://geomap-intern.test1.evermind.de/service/odb/suche/objekteimbau",
				url: "objectimbau.json",
				data: data
			});
		};

		var getObjektRequestDetail = function (id) {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/odb/suche/objekt/objekteimbau?objektId=" + id
				url: "objectimbaudetail.json"
			});
		};
		
		var getZustande = function () {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/getZustande"
				url: "zustande.json"
			});
		};

		var getStates = function () {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/getStates"
				url: "states.json"
			});
		};

		var getObjektTypen = function () {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/getObjektTypen"
				url: "objektTypen.json"
			});
		};

		var getBautenstande = function () {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/getBautenstande"
				url: "bautenstande.json"
			});
		};

		var getObjektStandard = function () {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/getObjektStandard"
				url: "objektStandard.json"
			});
		};

		var getObjektStandardUmg = function () {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/getObjektStandardUmg"
				url: "objektStandardUmg.json"
			});
		};

		var getLeerstandUmg = function () {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/getLeerstandUmg"
				url: "leerstandUmg.json"
			});
		};

		var getVerkehr = function () {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/getVerkehr"
				url: "verkehr.json"
			});
		};

		var getVersorgung = function () {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/getVersorgung"
				url: "versorgung.json"
			});
		};

		var getErholung = function () {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/getErholung"
				url: "erholung.json"
			});
		};

		var storeEdited = function (data) {
			return getRequest({
				method: "POST",
				url: "http://geomap-intern.test1.evermind.de/service/adminbackend/driveBy/storeEdited",
				data: data
			});
		};

		var getMapped = function (id) {
			return getRequest({
				method: "GET",
				// url: "http://geomap-intern.test1.evermind.de/service/odb/driveby/mapped?id=" + id
				url: "mapped.json"
			});
		};
		
        return {
            getNewsThemen: getNewsThemen,
			getNewsTypen: getNewsTypen,
			sucheNews: sucheNews,
			getNewsSpeichernRequest: getNewsSpeichernRequest,
			getNewsModi: getNewsModi,
			countEditNews: countEditNews,
			sucheEditNews: sucheEditNews,
			deleteNews: deleteNews,
			searchTodayNews: searchTodayNews,
			searchTodayDriveBys: searchTodayDriveBys,
			showDrivebysDetails: showDrivebysDetails,
			countEditDriveBy: countEditDriveBy,
			countEditDriveByBestehende: countEditDriveByBestehende,
			getUserInfo: getUserInfo,
			getObjektRequest: getObjektRequest,
			getObjektRequestDetail: getObjektRequestDetail,
			storeEdited: storeEdited,
			getZustande: getZustande,
			getStates: getStates,
			getObjektTypen:getObjektTypen,
			getBautenstande:getBautenstande,
			getObjektStandard:getObjektStandard,
			getObjektStandardUmg:getObjektStandardUmg,
			getLeerstandUmg:getLeerstandUmg,
			getVerkehr:getVerkehr,
			getVersorgung:getVersorgung,
			getErholung:getErholung,
			getMapped:getMapped
        };

    }]);
});
