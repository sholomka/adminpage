define(["./module"], function (module) {
    "use strict";
    module.directive("dgoDrivebyDetails", ["$urlService", "$constantsService", "$filter", "$restService", "$newsService", "$drivebysService", "$listenerService", "$mapService", "$sucheService", "$uibModal", "$rootScope", "$sce",
        function ($urlService, $constantsService, $filter, $restService, $newsService, $drivebysService, $listenerService, $mapService, $sucheService, $uibModal, $rootScope, $sce) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-driveby-details.html",
                controller: function ($scope, $element, Lightbox, $sessionStorage) {
                    $constantsService.getZustande().then(function(constants){
                        $scope.zustand = constants;
                    });

                    $constantsService.getObjektTypen().then(function(constants){
                        $scope.objekttyp = constants;
                    });

                    $constantsService.getStates().then(function(constants){
                        $scope.denkmalschutz = constants;
                    });

                    $constantsService.getBautenstande().then(function(constants){
                        $scope.bautenstand = constants;
                    });

                    $constantsService.getObjektStandard().then(function(constants){
                        $scope.objektStandardType = constants;
                    });

                    $constantsService.getObjektStandardUmg().then(function(constants){
                        $scope.umgebende = constants;
                    });

                    $constantsService.getLeerstandUmg().then(function(constants){
                        $scope.leerstand = constants;
                    });

                    $constantsService.getVerkehr().then(function(constants){
                        $scope.verkehrsanbindung = constants;
                    });

                    $constantsService.getVersorgung().then(function(constants){
                        $scope.versorgungseinrichtung = constants;
                    });

                    $constantsService.getErholung().then(function(constants){
                        $scope.erholungsmoglichkeiten = constants;
                    });


                    $scope.sortByKey = function(array, key) {
                        return array.sort(function(a, b) {
                            var x = a[key]; var y = b[key];
                            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                        });
                    };

                    $scope.$on('accept', function (event, args) {
                        if (args.isVideo) {
                            $scope.video[args.index].accept = args.accept;
                        } else {
                            $scope.images[args.index].accept = args.accept;
                        }
                    });

                    $scope.$on('acceptDblClick', function (event, args) {
                        if (args.isVideo) {
                            $scope.video[args.index].accept = args.accept;
                            $scope.video[args.index].complaint = args.complaint;

                        } else {
                            $scope.images[args.index].accept = args.accept;
                            $scope.images[args.index].complaint = args.complaint;
                        }
                    });

                    $scope.$on('complaint', function (event, args) {
                        if (args.isVideo) {
                            $scope.video[args.index].complaint = args.complaint;
                        } else {
                            $scope.images[args.index].complaint = args.complaint;
                        }
                    });

                    $scope.$on('drivebyDetails', function (event, args) {
                        $scope.sendData = args.data;

                        // $scope.sendData.base64Images = args.data.base64Images;
                        // $scope.sendData.street = args.data.street;
                        // $scope.sendData.plz = args.data.plz;
                        // $scope.sendData.city = args.data.city;
                        // $scope.sendData.location = args.data.location;
                        // $scope.sendData.projectName = args.data.projectName;
                        // $scope.sendData.userName = args.data.userName;
                        // $scope.sendData.dateCreated = args.data.dateCreated;

                        $scope.infoData = {};
                        $scope.infoData.projectType = args.data.projectType;
                        $scope.infoData.objectType = args.data.objectType;
                        $scope.infoData.protectedBuilding = args.data.protectedBuilding;
                        $scope.infoData.buildingProgress = args.data.buildingProgress;
                        $scope.infoData.objectStandard = args.data.objectStandard;
                        $scope.infoData.objectStandardEnv = args.data.objectStandardEnv;
                        $scope.infoData.vacancyEnv = args.data.vacancyEnv;
                        $scope.infoData.publicTransport = args.data.publicTransport;
                        $scope.infoData.nearbySupply = args.data.nearbySupply;
                        $scope.infoData.nearbyRecreation = args.data.nearbyRecreation;

                        $sessionStorage.base64Images = [];
                        $sessionStorage.videoComplaints = {};
                        $sessionStorage.datenComplaints = {};
                        $sessionStorage.complaints = [];

                        $scope.reset();

                        $scope.images = args.data.base64Images;
                        $scope.videoUrl = "data:video/mp4;base64," + args.data.base64Video;
                        $scope.base64Video = args.data.base64Video;


                        $scope.daten = {};

                        $scope.config = {
                            sources: [
                                {src: $sce.trustAsResourceUrl($scope.videoUrl), type: "video/mp4"},
                                {src: $sce.trustAsResourceUrl($scope.videoUrl), type: "video/webm"},
                                {src: $sce.trustAsResourceUrl($scope.videoUrl), type: "video/ogg"}
                               /* {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"), type: "video/webm"},
                                {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"), type: "video/ogg"}*/
                            ],
                            tracks: [
                                {
                                    src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                                    kind: "subtitles",
                                    srclang: "en",
                                    label: "English",
                                    default: ""
                                }
                            ],
                            theme: "bower_components/videogular-themes-default/videogular.css",
                            plugins: {
                                poster: "http://www.videogular.com/assets/images/videogular.png"
                            }
                        };

                        $scope.video = [
                            {
                                'type': 'video',
                                'config': $scope.config,
                                'thumbUrl': 'https://i.ytimg.com/vi/N7TkK2joi4I/1.jpg',
                                'base64Video': $scope.base64Video
                            }
                        ];

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

                    $scope.Lightbox = Lightbox;

                    $scope.accept = function($event, index, type) {
                        var event = $event.currentTarget,
                            accept = angular.element(event),
                            complaint = accept.next();

                        if (complaint.hasClass('active')) {
                            return;
                        }

                        var nextIndex = index + 1;

                        if (!accept.hasClass('active')) {
                            switch (type) {
                                case 'video':
                                    $sessionStorage.base64Video = $scope.base64Video;
                                    $scope.video[index].accept = true;
                                    break;

                                case 'daten':
                                    // $sessionStorage.daten = $scope.daten;

                                    $scope.daten.accept = true;

                                    break;

                                default:
                                    // $scope.currentImg = $scope.images[index].thumbUrl.replace('data:image/png;base64,', '');
                                    // $sessionStorage.base64Images[index] = {};
                                    // $sessionStorage.base64Images[index].index = nextIndex;
                                    // $sessionStorage.base64Images[index].base64 = $scope.currentImg;
                                    $scope.images[index].accept = true;
                            }
                        } else {
                            switch (type) {
                                case 'video':
                                    delete $sessionStorage.base64Video;
                                    $scope.video[index].accept = false;
                                    break;

                                case 'daten':
                                    delete $sessionStorage.daten;
                                    $scope.daten.accept = false;
                                    break;

                                default:
                                    delete $sessionStorage.base64Images[index];
                                    $scope.images[index].accept = false;
                            }
                        }

                        $rootScope.$broadcast('accept2', {
                            index: index,
                            accept:  $scope.images[index].accept
                        });
                    };

                    $scope.acceptDblClick = function($event, index, type) {
                        var event = $event.currentTarget,
                            accept = angular.element(event),
                            complaint = accept.next();

                        if (complaint.hasClass('active')) {

                            switch (type) {
                                case 'video':
                                    $scope.video[index].complaint = false;
                                    $scope.video[index].accept = true;

                                    delete $sessionStorage.videoComplaints;
                                    break;
                                case 'daten':
                                    $scope.daten.complaint = false;
                                    $scope.daten.accept = true;

                                    delete $sessionStorage.datenComplaints;
                                    break;

                                default:
                                    $scope.images[index].complaint = false;
                                    $scope.images[index].accept = true;

                                    delete $sessionStorage.complaints[index];
                            }

                            // if (type == 'video') {
                            //     $sessionStorage.base64Video = $scope.base64Video;
                            //     $scope.video[index].complaint = false;
                            //     $scope.video[index].accept = true;
                            //
                            //     delete $sessionStorage.videoComplaints;
                            // } else {
                            //     $scope.currentImg = $scope.images[index].thumbUrl.replace('data:image/png;base64,', '');
                            //
                            //     $sessionStorage.base64Images[index] = {};
                            //     $sessionStorage.base64Images[index].index = nextIndex;
                            //     $sessionStorage.base64Images[index].base64 = $scope.currentImg;
                            //
                            //     $scope.images[index].complaint = false;
                            //     $scope.images[index].accept = true;
                            //
                            //     delete $sessionStorage.complaints[index];
                            // }
                        }
                    };

                    $scope.complaint = function($event, index, type) {
                        $scope.check = function(complaintText) {
                            $scope.disabled = complaintText == '';
                        };

                        $scope.currentImg = $scope.images[index].thumbUrl;


                        switch (type) {
                            case 'video':
                                $scope.complaintText = angular.isObject($sessionStorage.videoComplaints) && !angular.equals({}, $sessionStorage.videoComplaints) ? $sessionStorage.videoComplaints.complaintText : '';
                                break;

                            case 'daten':
                                $scope.complaintText = angular.isObject($sessionStorage.datenComplaints) && !angular.equals({}, $sessionStorage.datenComplaints) ? $sessionStorage.datenComplaints.complaintText : '';
                                break;

                            default:
                                $scope.complaintText = angular.isObject($sessionStorage.complaints[index]) ? $sessionStorage.complaints[index].complaintText : '';
                        }
                        
                        /*if (type == 'video') {
                            $scope.complaintText = angular.isObject($sessionStorage.videoComplaints) && !angular.equals({}, $sessionStorage.videoComplaints) ? $sessionStorage.videoComplaints.complaintText : '';
                        } else {
                            $scope.complaintText = angular.isObject($sessionStorage.complaints[index]) ? $sessionStorage.complaints[index].complaintText : '';
                        }*/

                        $scope.check($scope.complaintText);
                        
                        
                        $scope.templateUrl = type == 'daten' ? 'templates/modal-daten-complaint.html' : 'templates/modal-complaint.html';

                        var currentModal = $uibModal.open({
                            templateUrl: $scope.templateUrl,
                            backdrop: true,
                            windowClass: 'modal-popup-complaint',
                            scope: $scope
                        });

                        $scope.save = function(complaintText) {
                            switch (type) {
                                case 'video':
                                    if (!$scope.video[index].complaint) {
                                        $scope.video[index].complaint = true;
                                    }

                                    if ($scope.video[index].accept) {
                                        $scope.video[index].complaint = true;
                                        $scope.video[index].accept = false;
                                    }
                                    break;

                                case 'daten':
                                    if (!$scope.daten.complaint) {
                                        $scope.daten.complaint = true;
                                    }

                                    if ($scope.daten.accept) {
                                        $scope.daten.complaint = true;
                                        $scope.daten.accept = false;
                                    }
                                    break;

                                default:
                                    if (!$scope.images[index].complaint) {
                                        $scope.images[index].complaint = true;
                                    }

                                    if ($scope.images[index].accept) {
                                        $scope.images[index].complaint = true;
                                        $scope.images[index].accept = false;
                                    }
                            }


                            /*if (type == 'video') {
                                if (!$scope.video[index].complaint) {
                                    $scope.video[index].complaint = true;
                                }

                                if ($scope.video[index].accept) {
                                    $scope.video[index].complaint = true;
                                    $scope.video[index].accept = false;
                                }
                            } else {
                                if (!$scope.images[index].complaint) {
                                    $scope.images[index].complaint = true;
                                }

                                if ($scope.images[index].accept) {
                                    $scope.images[index].complaint = true;
                                    $scope.images[index].accept = false;
                                }
                            }*/

                            $rootScope.$broadcast('complaint2', {
                                index: index,
                                complaint:  $scope.images[index].complaint
                            });

                            var nextIndex = index + 1;


                            switch (type) {
                                case 'video':
                                    $sessionStorage.videoComplaints = {};
                                    $sessionStorage.videoComplaints.complaintText = complaintText;
                                    $sessionStorage.videoComplaints.element = 'VIDEO';
                                    break;

                                case 'daten':
                                    $sessionStorage.datenComplaints = {};
                                    $sessionStorage.datenComplaints.complaintText = complaintText;
                                    $sessionStorage.datenComplaints.element = 'DATEN';
                                    break;

                                default:
                                    $sessionStorage.complaints[index] = {};
                                    $sessionStorage.complaints[index].complaintText = complaintText;
                                    $sessionStorage.complaints[index].element = 'IMAGE' + nextIndex;
                            }

                            // if (type == 'video') {
                            //     $sessionStorage.videoComplaints = {};
                            //     $sessionStorage.videoComplaints.complaintText = complaintText;
                            //     $sessionStorage.videoComplaints.element = 'VIDEO';
                            //
                            //     // delete  $sessionStorage.base64Video;
                            // } else {
                            //     $sessionStorage.complaints[index] = {};
                            //     $sessionStorage.complaints[index].complaintText = complaintText;
                            //     $sessionStorage.complaints[index].element = 'IMAGE' + nextIndex;
                            //
                            //     // delete $sessionStorage.base64Images[index];
                            // }

                            currentModal.dismiss();
                        };

                        $scope.cancel = function() {
                            currentModal.dismiss();
                        };
                    };


                    $scope.info = function() {
                        var currentModal = $uibModal.open({
                            templateUrl: 'templates/modal-info.html',
                            backdrop: true,
                            windowClass: 'modal-popup-info',
                            scope: $scope
                        });

                        $scope.save = function() {

                            $scope.infoData.projectType = $scope.sendData.projectType;
                            $scope.infoData.objectType = $scope.sendData.objectType;
                            $scope.infoData.protectedBuilding = $scope.sendData.protectedBuilding;
                            $scope.infoData.buildingProgress = $scope.sendData.buildingProgress;
                            $scope.infoData.objectStandard = $scope.sendData.objectStandard;
                            $scope.infoData.objectStandardEnv = $scope.sendData.objectStandardEnv;
                            $scope.infoData.vacancyEnv = $scope.sendData.vacancyEnv;
                            $scope.infoData.publicTransport = $scope.sendData.publicTransport;
                            $scope.infoData.nearbySupply = $scope.sendData.nearbySupply;
                            $scope.infoData.nearbyRecreation = $scope.sendData.nearbyRecreation;


                            $scope.daten.accept = true;

                            currentModal.dismiss();
                         
                        };

                        $scope.cancel = function() {
                            $scope.sendData.projectType = $scope.infoData.projectType;
                            $scope.sendData.objectType = $scope.infoData.objectType;
                            $scope.sendData.protectedBuilding = $scope.infoData.protectedBuilding;
                            $scope.sendData.buildingProgress = $scope.infoData.buildingProgress;
                            $scope.sendData.objectStandard = $scope.infoData.objectStandard;
                            $scope.sendData.objectStandardEnv = $scope.infoData.objectStandardEnv;
                            $scope.sendData.vacancyEnv = $scope.infoData.vacancyEnv;
                            $scope.sendData.publicTransport = $scope.infoData.publicTransport;
                            $scope.sendData.nearbySupply = $scope.infoData.nearbySupply;
                            $scope.sendData.nearbyRecreation = $scope.infoData.nearbyRecreation;

                            console.log($scope.sendData);

                            currentModal.dismiss();
                        };
                    };


                    $scope.storeEdited = function () {

                      /*  $scope.sendData.base64Images = $sessionStorage.base64Images.filter(function(x) {
                           return x !== undefined &&  x !== null;
                        });
*/
                        $scope.sendData.complaints = $sessionStorage.complaints.filter(function(x) {
                            return x !== undefined &&  x !== null;
                        });

                        $scope.sendData.base64Video = $sessionStorage.base64Video;

                        if(angular.isObject($sessionStorage.videoComplaints)) {
                            $scope.sendData.complaints.push($sessionStorage.videoComplaints)
                        }

                        if(angular.isObject($sessionStorage.datenComplaints)) {
                            $scope.sendData.complaints.push($sessionStorage.datenComplaints)
                        }

                        console.log($scope.sendData);

                        //console.log($scope.sendData.base64Video);
                        //console.log($scope.sendData);

                        $drivebysService.storeEdited($scope.sendData).then(function (data) {
                        }, function (error) {});
                    };
                }
            };
        }]);
});
