define(["./module"], function (module) {
    "use strict";
    module.directive("dgoDrivebyDetails", ["$urlService", "$constantsService", "$filter", "$restService", "$newsService", "$drivebysService", "$listenerService", "$mapService", "$sucheService", "$uibModal",
        function ($urlService, $constantsService, $filter, $restService, $newsService, $drivebysService, $listenerService, $mapService, $sucheService, $uibModal) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-driveby-details.html",
                controller: function ($scope, $element, Lightbox) {
                    $scope.sortByKey = function(array, key) {
                        return array.sort(function(a, b) {
                            var x = a[key]; var y = b[key];
                            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                        });
                    };

                    $scope.$on('drivebyDetails', function (event, args) {
                        $scope.sendData = args.data;
                        $scope.reset();

                        $scope.images = $scope.sendData.base64Images;


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
                                    console.log(data);

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
                            complaint = angular.element(event);


                        if (!complaint.hasClass('active')) {

                           console.log('1');

                            complaint.toggleClass('active');



                            $scope.currentImg = $scope.images[index].thumbUrl.replace('data:image/png;base64,', '');
                            $scope.sendData.base64Images[index].index = ++index;
                            $scope.sendData.base64Images[index].base64 = $scope.currentImg;
                        } else {

                            console.log('2');

                            delete $scope.sendData.base64Images[index];

                            complaint.toggleClass('active');
                        }


                        console.log($scope.sendData.base64Images);





                        /* "complaints": [
                         { "element": "IMAGE1", "complaintText": "das ist unscharf", "date": "01.10.2015" },
                         { "element": "IMAGE2", "complaintText": "das ist verwackelt", "date": "01.10.2015" },
                         { "element": "IMAGE3", "complaintText": "Daten sind nicht vollständig", "date": "01.10.2015" }
                         ]*/



                    };

                    $scope.complaint = function($event, index) {
                        var event = $event.currentTarget,
                            complaint = angular.element(event);

                        var clear = function() {
                            $scope.sendData.complaintText = '';
                            $scope.disabled = true;
                        };

                        clear();

                        if (complaint.hasClass('active')) {
                           complaint.toggleClass('active');

                           clear();
                           return;
                        }

                        $scope.currentImg = $scope.images[index].thumbUrl;

                        var currentModal = $uibModal.open({
                            templateUrl: 'templates/modal-complaint.html',
                            backdrop: true,
                            windowClass: 'modal-popup-complaint',
                            scope: $scope
                        });

                        $scope.save = function() {
                            complaint.toggleClass('active');
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
                        $drivebysService.storeEdited($scope.sendData).then(function (data) {
                        }, function (error) {});
                    };
                }
            };
        }]);
});
