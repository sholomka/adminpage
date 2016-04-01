define(["./module"], function (module) {
    "use strict";
    module.directive("dgoDrivebyDetails", ["$urlService", "$constantsService", "$filter", "$restService", "$newsService", "$drivebysService", "$listenerService", "$mapService", "$sucheService", "$uibModal", "$rootScope", "$sce",
        function ($urlService, $constantsService, $filter, $restService, $newsService, $drivebysService, $listenerService, $mapService, $sucheService, $uibModal, $rootScope, $sce) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-driveby-details.html",
                controller: function ($scope, $element, Lightbox, $sessionStorage, $anchorScroll) {
                    $constantsService.getZustande().then(function(constants){
                        $scope.zustand = constants;
                    });

                    $constantsService.getObjektTypen().then(function(constants){
                        $scope.objekttyp = constants;
                    });

                    $constantsService.getStates().then(function(constants){
                        $scope.denkmalschutz = $scope.states = constants;
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
                        $scope.sendData = {};
                        $scope.showForm = true;
                        $scope.unbekannt = false;

                        var progresses = $scope.bautenstand,
                            countProgresses = Object.keys(progresses).length;
                        
                        var statusWidth = Math.floor(100 / (countProgresses + 1));
                        $scope.driveByStatusWidth = statusWidth + "%";
                        $scope.driveByStatusTotalWidth = (statusWidth * (countProgresses)) + "%";
                        $scope.driveByMap = {};


                        angular.forEach(args.data, function(value, key, obj) {
                            if (key == 'base64Images') {
                                $scope.sendData.base64Images = [];

                                angular.forEach(args.data.base64Images, function(value, key, obj) {
                                    $scope.sendData.base64Images[key] = {};
                                    $scope.sendData.base64Images[key].base64 = obj[key].base64;
                                    $scope.sendData.base64Images[key].index = obj[key].index;
                                    $scope.sendData.base64Images[key].uri = obj[key].uri;
                                });
                            } else {
                                $scope.sendData[key] = value;

                                if (key == 'buildingProgress') {
                                    if (!angular.isArray($scope.driveByMap[value])) {
                                        $scope.driveByMap[value] = [];
                                    }
                                    $scope.driveByMap[value].unshift($scope.sendData);
                                }
                            }
                        });

                        var j = 0;
                        for(var i in progresses) {

                            if (progresses[i] == $scope.sendData.buildingProgress) {
                                $scope.driveByStatus = progresses[i];
                                $scope.driveByStatusIndex = j;
                                var blockWidth = 100 / (countProgresses);
                                $scope.driveByStatusBarWidth = (blockWidth * ($scope.driveByStatusIndex)).toFixed(2) + "%";
                                break;
                            }

                            j++;
                        }

                        $scope.driveBy = $scope.sendData;
                        $scope.selectedDriveBy = $scope.sendData;
                        $scope.drivebyLoading = false;

                        
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
                        $scope.daten = {
                            accept: false,
                            complaint: false
                        };

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
                                'base64Video': $scope.base64Video,
                                'accept': false,
                                'complaint': false
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

                        $scope.myInterval = 5000;
                        $scope.noWrapSlides = false;
                        $scope.active = 0;
                        var slides = $scope.slides = [];

                        angular.forEach($scope.images, function(value, key, obj) {
                            obj[key].url = 'data:image/png;base64,' + obj[key].base64;
                            obj[key].thumbUrl = 'data:image/png;base64,' + obj[key].base64;
                            obj[key].caption = $scope.titlesImage[key];
                            obj[key].accept = false;
                            obj[key].complaint = false;

                            slides.push({
                                image: 'data:image/png;base64,' + obj[key].base64,
                                text: $scope.titlesImage[key],
                                id: key
                            });
                        });

                        $scope.max = 5;
                        $scope.isReadonly = false;
                        $scope.driveByRate = 0;
                        
                        $scope.rateText = [
                            "Bitte bewerten Sie diesen Upload!",
                            "Der Upload war unzureichend",
                            "Der Upload hatte gravierende Mängel",
                            "Der Upload hatte leichte Mängel",
                            "Der Upload war weitgehend in Ordnung",
                            "Der Upload war beanstandungsfrei"
                        ];
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

                        
                        $drivebysService.getMapped(item.id).then(function (data) {

                            if (data.length > 0) {

                                var progresses = [];

                                angular.forEach($scope.bautenstand, function(value, key, obj) {
                                    progresses.push({
                                        key: value,
                                        name: key
                                    });
                                });

                                


                                var statusWidth = Math.floor(100 / (progresses.length + 1));
                                $scope.driveByStatusWidth = statusWidth + "%";
                                $scope.driveByStatusTotalWidth = (statusWidth * (progresses.length)) + "%";
                                $scope.driveByMap = {};

                                for (var i = 0; i < data.length; i++) {
                                    if (!angular.isArray($scope.driveByMap[data[i].buildingProgress])) {
                                        $scope.driveByMap[data[i].buildingProgress] = [];
                                    }
                                    $scope.driveByMap[data[i].buildingProgress].unshift(data[i]); //sortierung umkehren
                                }




                                for (var i = 0; i < progresses.length; i++) {
                                    if (progresses[i].key == data[0].buildingProgress) {
                                        $scope.driveByStatus = progresses[i].key;
                                        $scope.driveByStatusIndex = i;
                                        var blockWidth = 100 / (progresses.length);
                                        $scope.driveByStatusBarWidth = (blockWidth * ($scope.driveByStatusIndex)).toFixed(2) + "%";
                                        break;
                                    }
                                }

                                $scope.driveBy = data;
                                $scope.selectedDriveBy = $scope.driveBy[0];


                                var slides = $scope.slides = [];

                                console.log( $scope.selectedDriveBy);


                                angular.forEach($scope.selectedDriveBy.images, function(value, key, obj) {
                                    slides.push({
                                        image: obj[key].uri,
                                        id: key
                                    });
                                });




                                $scope.drivebyLoading = false;

                            }  else {
                                $scope.drivebyLoading = false;
                            }
                            
                        }, function (error) { });
                    };


                    $scope.calcOffsets = function (status, statusIndex) {
                        if (statusIndex == $scope.driveByStatusIndex) {
                            var driveBys = $scope.driveByMap[status];
                            if (driveBys && driveBys.length > 0) {
                                $scope.driveByStatusOffset = ((driveBys.length - 1) / driveBys.length * 100) + "%";
                            }
                        }
                    };

                    $scope.getDriveByOffset = function (status, index) {
                        var driveBys = $scope.driveByMap[status];
                        return (index / driveBys.length * 100) + "%";
                    };

                    $scope.setSelectedDriveBy = function (driveBy) {
                        $scope.selectedDriveBy = driveBy;

                        var slides = $scope.slides = [];

                        angular.forEach($scope.selectedDriveBy.images, function(value, key, obj) {
                            slides.push({
                                image: obj[key].uri,
                                id: key
                            });
                        });

                        $scope.config.sources[0].src = $scope.selectedDriveBy.videoUri

                        // $scope.videoUrl = $scope.selectedDriveBy.videoUri;
                        
                    };


                    $scope.reset = function () {
                        $scope.street = $scope.sendData.street;
                        $scope.plz = $scope.sendData.plz;
                        $scope.city = $scope.sendData.city;
                        angular.element(document.querySelector('#u722')).css('opacity', '0.4');
                        angular.element(document.querySelectorAll('.ax_dynamic_panel')).removeClass('active');
                        $mapService.unhighlightAllItems();
                        $mapService.createDrivebyMarker($scope.sendData.location);
                        $scope.sendData.mappedImmoObject = null;

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

                    $scope.getRate = function(driveByRate) {
                        $scope.driveByRate = driveByRate;
                    };

                    $scope.showError = function() {
                        var index = [];
                        $scope.error = false;

                        angular.forEach($scope.images, function(value, key, obj) {
                                if (!(value.accept || value.complaint)) {
                                    index.push('image_' + value.index);
                                    obj[key].error = true;
                                    $scope.error = true;
                                } else {
                                    obj[key].error = false;
                                }

                            if (value.complaint)
                                $scope.sendData.state = $scope.states.Abgelehnt;
                        });

                        angular.forEach($scope.video, function(value, key, obj) {
                            if (!(value.accept || value.complaint)) {
                                index.push('video');
                                obj[key].error = true;
                                $scope.error = true;
                            } else {
                                obj[key].error = false;
                            }

                            if (value.complaint)
                                $scope.sendData.state = $scope.states.Abgelehnt;
                        });

                        if (!($scope.daten.accept || $scope.daten.complaint)) {
                            index.push('daten');
                            $scope.daten.error = true;
                            $scope.error = true;
                        } else {
                            $scope.daten.error = false;
                        }

                        if ($scope.daten.complaint)
                            $scope.sendData.state = $scope.states.Abgelehnt;

                        if (index.length > 0)
                            $anchorScroll(index[0]);
                    };

                    $scope.unbekanntChange = function(unbekannt) {
                        $scope.unbekannt = unbekannt;
                    };

                    $scope.storeEdited = function () {
                        $scope.showError();

                        if (!$scope.error) {
                            if(!angular.equals($sessionStorage.complaints, [])) {
                                $scope.sendData.complaints = $sessionStorage.complaints.filter(function(x) {
                                    return x !== undefined &&  x !== null;
                                });
                            } else {
                                $scope.sendData.complaints = [];
                            }

                            if(angular.isObject($sessionStorage.videoComplaints) && !angular.equals($sessionStorage.videoComplaints, {})) {
                                $scope.sendData.complaints.push($sessionStorage.videoComplaints)
                            }

                            if(angular.isObject($sessionStorage.datenComplaints) && !angular.equals($sessionStorage.datenComplaints, {})) {
                                $scope.sendData.complaints.push($sessionStorage.datenComplaints)
                            }

                            if(angular.equals($scope.sendData.complaints, [])) {
                                $scope.sendData.complaints = null;
                            }

                            $scope.sendData.rating = $scope.driveByRate;

                            if ($scope.sendData.state != $scope.states.Abgelehnt) {
                                if ($scope.unbekannt)
                                    $scope.sendData.state =  $scope.states.Unbekannt;
                                else
                                    $scope.sendData.state = $scope.states.Abgeschlossen;
                            }

                            console.log($scope.sendData);

                            $drivebysService.storeEdited($scope.sendData).then(function () {
                                $scope.sendData = {};
                                $scope.showForm = false;

                                $rootScope.$broadcast('updateDriveBy');
                            }, function (error) {});
                        }
                    };

                    $scope.driveByCancel = function() {
                        $scope.sendData = {};
                        $scope.showForm = false;
                    }
                }
            };
        }]);
});
