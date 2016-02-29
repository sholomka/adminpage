define(["./module"], function (module) {
    "use strict";
    module.factory("$authService", ["$http", "$q", "$timeout", "$rootScope", "$localStorage", "$messageService", "$urlService", "$listenerService", "$location",
        function ($http, $q, $timeout, $scope, $localStorage, $messageService, $urlService, $listenerService, $location) {

            var logoutRequested = false;
            var sessionExpiredMessageShown = false;

            /*
             Features:
             suche
             sucheObjekte
             sucheZwangsversteigerungen
             sucheWohnungen
             sucheDetailansicht
             sucheSpeichern
             suchePolygon
             sucheVergleich
             sucheHistorie
             sucheMarktDaten
             sucheSozioDaten
             sucheReferenzobjekt
             sucheReferenzobjektSpeichern
             */
            var getInfoRequest = function () {
                return $http.get("service/auth/info", null, {responseType: "json"}).then(function (response) {
                    return response.data;
                });
            };

            var getLoginRequest = function (data) {
                return $http.post("service/auth/login", data, {responseType: "json"}).then(function (response) {
                    return response.data;
                });
            };

            var getLogoutRequest = function () {
                return $http.get("service/auth/logout", null, {responseType: "json"}).then(function (response) {
                    return response.data;
                });
            };

            var getCheckRequest = function (data) {
                return $http.post("service/benutzer/check", data, {responseType: "json"}).then(function (response) {
                    return response.data;
                }, function (response) {
                    return $q.reject(response.data ? response.data.error : "Es ist ein Fehler aufgetreten");
                });
            };

            var getInviteRequest = function (data) {
                return $http.post("service/benutzer/invite", data, {responseType: "json"}).then(function (response) {
                    return response.data;
                }, function (response) {
                    return $q.reject(response.data ? response.data.error : "Es ist ein Fehler aufgetreten");
                });
            };

            var getFriendInviteRequest = function (data) {
                console.log($scope.currentUser);
                return $http.post("service/benutzer/invite/" + $scope.currentUser.mandantId + "/" + $scope.currentUser.userId,
                    data, {responseType: "json"}).then(function (response) {
                    return response.data;
                }, function (response) {
                    return $q.reject(response.data ? response.data.error : "Es ist ein Fehler aufgetreten");
                });
            };

            var getRegisterRequest = function (data) {
                return $http.post("service/benutzer/register", data, {responseType: "json"}).then(function (response) {
                    return response.data;
                }, function (response) {
                    return $q.reject(response.data ? response.data.error : "Es ist ein Fehler aufgetreten");
                });
            };

            var pingbackTimer = false;
            var startPingback = function () {
                stopPingback();
                pingbackTimer = $timeout(function () {
                    refreshLogin(true); //aller 5min das login refreshen
                    startPingback();
                }, 5000 * 60);
            };
            var stopPingback = function () {
                $timeout.cancel(pingbackTimer);
            };

            //automatisch pingback starten
            startPingback();

            var refreshLoginTask = undefined; //immer nur 1 aktiver refresh task, alle anderen warten auf diesen
            var refreshLogin = function (forceRefresh) {
                var deferred = $q.defer();

                if (!forceRefresh && angular.isObject($scope.currentUser)) {
                    deferred.resolve($scope.currentUser);
                } else {
                    if (angular.isDefined(refreshLoginTask)) {
                        refreshLoginTask.then(function (data) {
                            deferred.resolve(data);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    } else {
                        refreshLoginTask = deferred.promise;
                        getInfoRequest().then(function (data) {
                            if (angular.isObject(data)) {
                                $scope.currentUser = data;
                            } else {
                                $scope.currentUser = {};
                            }
                            if (!$scope.currentUser.userId) {
                                tryAutoLogin().then(function () {
                                    deferred.resolve();
                                });
                            } else {
                                deferred.resolve();
                            }
                            refreshLoginTask = undefined;
                        }, function () {
                            $scope.currentUser = {};
                            deferred.resolve();
                            refreshLoginTask = undefined;
                        });
                    }
                }

                return deferred.promise;
            };

            var tryAutoLogin = function () {
                var deferred = $q.defer();

                if (!angular.isObject($localStorage.rememberedLoginData)) {
                    $scope.currentUser = {};
                    deferred.resolve();
                } else {
                    getLoginRequest($localStorage.rememberedLoginData).then(function (data) {
                        if (angular.isObject(data)) {
                            $scope.currentUser = data;
                        } else {
                            $scope.currentUser = {};
                        }
                        deferred.resolve();
                    }, function () {
                        $scope.currentUser = {};
                        //wenn autologin fehlschlägt, löschen wir auch die gespeicherten informationen aus dem localstorage
                        delete $localStorage.rememberedLoginData;
                        deferred.resolve();
                    });
                }

                return deferred.promise;
            };

            var login = function (mandant, email, password, merken) {
                var deferred = $q.defer();

                var data = {
                    mandant: mandant,
                    email: email,
                    password: password
                };
                getLoginRequest(data).then(function (data) {
                    if (angular.isObject(data)) {
                        $scope.currentUser = data;
                        $messageService.showInfo("Sie haben sich erfolgreich eingeloggt.");
                        if (merken) {
                            $localStorage.rememberedLoginData = {
                                mandant: mandant,
                                email: email,
                                password: data.encryptedPassword,
                                passwordIsEncrypted: true
                            };
                        }
                    } else {
                        $messageService.showError("Fehler beim Einloggen! Bitte überprüfen Sie Ihre Daten");
                    }
                    deferred.resolve();
                }, function () {
                    $messageService.showError("Fehler beim Einloggen! Bitte überprüfen Sie Ihre Daten");
                    deferred.resolve();
                });

                return deferred.promise;
            };

            var isLoggedIn = function () {
                if (logoutRequested) return false;
                return getCurrentUserId() != null;
            };

            var logoutSessionExpired = function () {
                if (!sessionExpiredMessageShown) {
                    sessionExpiredMessageShown = true;
                    $messageService.showWarning("Sitzung abgelaufen", "Ihre Sitzung ist abgelaufen. Bitte loggen Sie sich erneut ein!").then(function () {
                        sessionExpiredMessageShown = false;
                        logout();
                    });
                }
            };

            var logout = function () {
                logoutRequested = true;
                getLogoutRequest().then(function (data) {
                    delete $localStorage.rememberedLoginData;
                    $scope.currentUser = {};
                    $listenerService.resetStorage();
                    $urlService.gotoStartPage();
                    logoutRequested = false;
                }, function () {
                    //wenn service nicht antwortet, loggen wir uns lokal trotzdem aus
                    delete $localStorage.rememberedLoginData;
                    $scope.currentUser = {};
                    $listenerService.resetStorage();
                    $urlService.gotoStartPage();
                    logoutRequested = false;
                });
            };

            var getCurrentMandantId = function () {
                return $scope.currentUser.mandantId;
            };

            var getCurrentMandantName = function () {
                return $scope.currentUser.mandant;
            };

            var getCurrentUserId = function () {
                return $scope.currentUser.userId;
            };

            var getCurrentUserName = function () {
                return $scope.currentUser.name;
            };

            var getCurrentUserEMail = function () {
                return $scope.currentUser.email;
            };

            var getCurrentPaket = function () {
                return $scope.currentUser.paket;
            };

            var getCurrentUser = function () {
                return $scope.currentUser;
            };

            var hasCurrentFeature = function (feature) {
                return angular.isObject($scope.currentUser) && angular.isArray($scope.currentUser.features) && $scope.currentUser.features.indexOf(feature) >= 0;
            };

            var isCurrentRequestAllowed = function (method, url) {
                var testString = method.toUpperCase() + " " + url;
                //console.debug("checking "+testString);
                if (!angular.isObject($scope.currentUser) || !angular.isArray($scope.currentUser.urls)) return false;
                for (var i = 0; i < $scope.currentUser.urls.length; i++) {
                    var pattern = $scope.currentUser.urls[i];
                    if (testString.match(pattern)) return true;
                }
                return false;
            };

            var check = function (data) {
                var deferred = $q.defer();
                getCheckRequest(data).then(function (data) {
                    deferred.resolve(data ? data.email : undefined);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            };

            var invite = function (mail, type) {
                var deferred = $q.defer();
                var data ={};
                var link = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/#/start?invite=#HASH#";
                if (type === "selfInvite") {
                    data = mail;
                    data.link = link;
                    data.type = type;
                    getInviteRequest(data).then(function (response) {
                        deferred.resolve(response);
                    }, function (error) {
                        deferred.reject(error);
                    });
                } else if (type === "invite") {
                    data = {email: mail, type: type, mandant: "dgo-2", link: link};
                    getFriendInviteRequest(data).then(function (response) {
                        deferred.resolve(response);
                    }, function (error) {
                        deferred.reject(error);
                    });
                }
                return deferred.promise;
            };

            var register = function (data) {
                var deferred = $q.defer();
                getRegisterRequest(data).then(function (userdata) {
                    //automatisch einloggen
                    //$scope.currentUser = data;
                    deferred.resolve(userdata);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            };


            return {
                login: login,
                logout: logout,
                refreshLogin: refreshLogin,
                getCurrentUserId: getCurrentUserId,
                getCurrentMandantId: getCurrentMandantId,
                getCurrentMandantName: getCurrentMandantName,
                getCurrentUserName: getCurrentUserName,
                getCurrentUserEMail: getCurrentUserEMail,
                getCurrentPaket: getCurrentPaket,
                hasCurrentFeature: hasCurrentFeature,
                isCurrentRequestAllowed: isCurrentRequestAllowed,
                getCurrentUser: getCurrentUser,
                isLoggedIn: isLoggedIn,
                logoutSessionExpired: logoutSessionExpired,
                check: check,
                invite: invite,
                register: register
            };

        }
    ])
    ;
})
;