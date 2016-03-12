define(["./module"], function (module) {
    "use strict";
    module.directive("dgoDrivebyDetails", ["$urlService", "$constantsService", "$filter", "$restService", "$newsService", "$drivebysService", "$listenerService", "$mapService", "$sucheService", "$uibModal", "$rootScope",
        function ($urlService, $constantsService, $filter, $restService, $newsService, $drivebysService, $listenerService, $mapService, $sucheService, $uibModal, $rootScope) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-driveby-details.html",
                controller: function ($scope, $element, Lightbox, $sessionStorage) {
                    $scope.sortByKey = function(array, key) {
                        return array.sort(function(a, b) {
                            var x = a[key]; var y = b[key];
                            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                        });
                    };

                    $scope.$on('accept', function (event, args) {
                        $scope.images[args.index].accept = args.accept;
                    });

                    $scope.$on('acceptDblClick', function (event, args) {
                        $scope.images[args.index].accept = args.accept;
                        $scope.images[args.index].complaint = args.complaint;
                    });

                    $scope.$on('complaint', function (event, args) {
                        $scope.images[args.index].complaint = args.complaint;
                    });

                    $scope.$on('drivebyDetails', function (event, args) {
                        $scope.sendData = {};
                        $scope.sendData.street = args.data.street;
                        $scope.sendData.plz = args.data.plz;
                        $scope.sendData.city = args.data.city;
                        $scope.sendData.location = args.data.location;
                        $scope.sendData.projectName = args.data.projectName;
                        $scope.sendData.userName = args.data.userName;
                        $scope.sendData.dateCreated = args.data.dateCreated;

                        $scope.base64Images = [];
                        $scope.complaints = [];

                        $sessionStorage.base64Images = [];
                        $sessionStorage.complaints = [];


                        $scope.reset();

                        $scope.images = args.data.base64Images;

                        $scope.titlesImage = [
                             "Objektübersicht",
                             "Bauschild",
                             "Objekteingang",
                             "Rückseite",
                             "Objektumgebung 1",
                             "Objektumgebung 2"
                        ];

                        $scope.sortByKey($scope.images, 'index');

                        angular.forEach($scope.images, function(value, key, obj) {
                            obj[key].url = 'data:image/png;base64,' + obj[key].base64;
                            obj[key].thumbUrl = 'data:image/png;base64,' + obj[key].base64;
                            obj[key].caption = $scope.titlesImage[key];
                        });
                    });

                    $scope.driveByDetail = {
                        height: $scope.driveByNeueHeight,
                        paddingRight: 0
                    };

                    $scope.driveBysListStyleObj = {
                        overflow: 'auto',
                        height: $scope.driveBysListHeight,
                        position: 'relative'
                    };

                    $scope.max = 5;
                    $scope.isReadonly = true;

                    $scope.getStars = function(rating) {
                        // Get the value
                        var val = rating > 5 ? 5 :parseFloat(rating);

                        // Turn value into number/100
                        var size = val/5*100;

                        return size + '%';
                    };

                    $scope.getUserInfo = function(userName, open) {
                        if (open) {
                            $drivebysService.getUserInfo(userName).then(function (data) {
                                $scope.userInfo = data;
                                $scope.rate = data.averageRating;

                            }, function (error) {
                                $rootScope.driveBys = undefined;
                                if (error && error.exception == "PolygonNotInViewportException") {
                                    $rootScope.newsBemerkung = error.error;
                                } else {
                                    $rootScope.newsError = error;
                                }
                            });
                        }
                    };

                    $listenerService.addChangeListener("detailItem", "dgoDrivebyDetails", function (item) {
                        if (angular.isObject(item)) {
                            $scope.mapObjectList = [];
                            angular.forEach(item.objektImBauVorschau, function(data) {
                                $sucheService.loadItem(data.id).then(function (data) {

                                    $scope.mapObjectList.push(data);
                                });
                            });
                        }
                    });

                    $scope.highlightMarker = function (item, $event) {

                        $scope.sendData.mappedImmoObject = {
                            "objectType": item.angebotsart,
                            "objectId": item.id
                        };

                        angular.element(document.querySelectorAll('.ax_dynamic_panel')).removeClass('active');
                        angular.element(document.querySelector('#u722')).css('opacity', '1');
                        angular.element($event.currentTarget).toggleClass('active');
                        $mapService.removeDrivebyMarker();
                        $mapService.highlightItem(item);

                        $scope.street = item.adresse.strasse;
                        $scope.plz = item.adresse.plz;
                        $scope.city = item.adresse.ort;
                    };

                    $scope.reset = function () {
                        $scope.street = $scope.sendData.street;
                        $scope.plz = $scope.sendData.plz;
                        $scope.city = $scope.sendData.city;
                        angular.element(document.querySelector('#u722')).css('opacity', '0.4');
                        angular.element(document.querySelectorAll('.ax_dynamic_panel')).removeClass('active');
                        $mapService.unhighlightAllItems();
                        $mapService.createDrivebyMarker($scope.sendData.location);

                        //$listenerService.triggerChange("drivebyDetails", "dgoDrivebys", $scope.sendData.location);
                    };

                    // Fotos
                    $scope.openLightboxModal = function (index) {
                        Lightbox.openModal($scope.images, index);
                    };

                    $scope.accept = function($event, index) {
                        var event = $event.currentTarget,
                            accept = angular.element(event),
                            complaint = accept.next();

                        if (complaint.hasClass('active')) {
                            return;
                        }

                        var nextIndex = index + 1;

                        if (!accept.hasClass('active')) {
                            accept.toggleClass('active');
                            $scope.currentImg = $scope.images[index].thumbUrl.replace('data:image/png;base64,', '');
                            $sessionStorage.base64Images[index] = {};
                            $sessionStorage.base64Images[index].index = nextIndex;
                            $sessionStorage.base64Images[index].base64 = $scope.currentImg;

                            $scope.images[index].accept = true;

                        } else {
                            delete $sessionStorage.base64Images[index];
                            $scope.images[index].accept = false;
                            accept.toggleClass('active');
                        }

                        $rootScope.$broadcast('accept2', {
                            index: index,
                            accept:  $scope.images[index].accept
                        });
                    };

                    $scope.acceptDblClick = function($event, index) {
                        var event = $event.currentTarget,
                            accept = angular.element(event),
                            complaint = accept.next();

                        if (complaint.hasClass('active')) {
                            complaint.toggleClass('active');
                            accept.toggleClass('active');

                            $scope.images[index].complaint = false;
                            $scope.images[index].accept = true;

                            $rootScope.$broadcast('acceptDblClick2', {
                                index: index,
                                complaint:  $scope.images[index].complaint,
                                accept:  $scope.images[index].accept
                            });

                            delete $sessionStorage.complaints[index];
                        }
                    };

                    $scope.complaint = function($event, index) {
                        var event = $event.currentTarget,
                            complaint = angular.element(event),
                            accept = complaint.parent().children().eq(0);

                        $scope.currentImg = $scope.images[index].thumbUrl;
                        $scope.complaintText = angular.isObject($sessionStorage.complaints[index]) ? $sessionStorage.complaints[index].complaintText : '';

                        var currentModal = $uibModal.open({
                            templateUrl: 'templates/modal-complaint.html',
                            backdrop: true,
                            windowClass: 'modal-popup-complaint',
                            scope: $scope
                        });

                        $scope.save = function(complaintText) {
                            if (!complaint.hasClass('active')) {
                                complaint.toggleClass('active');
                                $scope.images[index].complaint = true;
                            }

                            if (accept.hasClass('active')) {
                                accept.toggleClass('active');
                                $scope.images[index].complaint = false;
                            }

                            $rootScope.$broadcast('complaint2', {
                                index: index,
                                complaint:  $scope.images[index].complaint
                            });

                            var nextIndex = index + 1;

                            $sessionStorage.complaints[index] = {};
                            $sessionStorage.complaints[index].complaintText = complaintText;
                            $sessionStorage.complaints[index].element = 'IMAGE' + nextIndex;


                            currentModal.dismiss();
                        };

                        $scope.cancel = function() {
                            currentModal.dismiss();
                        };

                        $scope.check = function(complaintText) {
                            $scope.disabled = complaintText == '';
                        }
                    };

                    $scope.storeEdited = function () {
                        $scope.sendData.base64Images = $sessionStorage.base64Images.filter(function(x) {
                           return x !== undefined &&  x !== null;
                        });

                        $scope.sendData.complaints = $sessionStorage.complaints.filter(function(x) {
                            return x !== undefined &&  x !== null;
                        });

                        console.log($scope.sendData.complaints);

                        $drivebysService.storeEdited($scope.sendData).then(function (data) {
                        }, function (error) {});
                    };
                }
            };
        }]);
});
