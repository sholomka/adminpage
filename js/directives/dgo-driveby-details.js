define(["./module"], function (module) {
    "use strict";
    module.directive("dgoDrivebyDetails", ["$urlService", "$constantsService", "$filter", "$restService", "$newsService", "$drivebysService", "$listenerService", "$mapService", "$sucheService", "$uibModal", "$rootScope", "$sce",
        function ($urlService, $constantsService, $filter, $restService, $newsService, $drivebysService, $listenerService, $mapService, $sucheService, $uibModal, $rootScope, $sce) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-driveby-details.html",
                controller: function ($scope, $attrs, Lightbox, $sessionStorage, $anchorScroll, $timeout) {
                    $constantsService.getZustande().then(function(constants){
                        $scope.zustand = constants;
                        $scope.zustandFront = {};
                        for (var key in constants) {
                            $scope.zustandFront[constants[key]] = key;
                        }
                    });

                    $constantsService.getObjektTypen().then(function(constants){
                        $scope.objekttyp = constants;
                        $scope.objekttypFront = {};
                        for (var key in constants) {
                            $scope.objekttypFront[constants[key]] = key;
                        }
                    });

                    $constantsService.getStates().then(function(constants){
                        $scope.states = constants;
                        $scope.denkmalschutz = {"Unbekannt": null, "Ja": true, "Nein": false};
                        $scope.denkmalschutzFront = {};
                        for (var key in $scope.denkmalschutz) {
                            $scope.denkmalschutzFront[$scope.denkmalschutz[key]] = key;
                        }
                    });

                    $constantsService.getBautenstande().then(function(constants){
                        $scope.bautenstand = constants;
                        $scope.bautenstandFront = {};
                        for (var key in constants) {
                            $scope.bautenstandFront[constants[key]] = key;
                        }
                    });

                    $constantsService.getObjektStandard().then(function(constants){
                        $scope.objektStandardType = constants;
                        $scope.objektStandardTypeFront = {};
                        for (var key in constants) {
                            $scope.objektStandardTypeFront[constants[key]] = key;
                        }
                    });

                    $constantsService.getObjektStandardUmg().then(function(constants){
                        $scope.umgebende = constants;
                        $scope.umgebendeFront = {};
                        for (var key in constants) {
                            $scope.umgebendeFront[constants[key]] = key;
                        }
                    });

                    $constantsService.getLeerstandUmg().then(function(constants){
                        $scope.leerstand = constants;
                        $scope.leerstandFront = {};
                        for (var key in constants) {
                            $scope.leerstandFront[constants[key]] = key;
                        }
                    });

                    $constantsService.getVerkehr().then(function(constants){
                        $scope.verkehrsanbindung = constants;
                        $scope.verkehrsanbindungFront = {};
                        for (var key in constants) {
                            $scope.verkehrsanbindungFront[constants[key]] = key;
                        }
                    });

                    $constantsService.getVersorgung().then(function(constants){
                        $scope.versorgungseinrichtung = constants;
                        $scope.versorgungseinrichtungFront = {};
                        for (var key in constants) {
                            $scope.versorgungseinrichtungFront[constants[key]] = key;
                        }
                    });

                    $constantsService.getErholung().then(function(constants){
                        $scope.erholungsmoglichkeiten = constants;
                        $scope.erholungsmoglichkeitenFront = {};
                        for (var key in constants) {
                            $scope.erholungsmoglichkeitenFront[constants[key]] = key;
                        }
                    });
                    
                    $scope.sortByKey = function(array, key) {
                        return array.sort(function(a, b) {
                            var x = a[key]; var y = b[key];
                            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                        });
                    };

                    $scope.$on('pinclick', function (event, args) {
                        $sucheService.loadItem(args.items.id).then(function (data) {
                            $scope.highlightMarker(false, data);
                        });
                    });

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

                    $scope.loadItems = function(args) {
                        $scope.sendData = {};
                        $scope.uploadingObject = {};
                        $scope.uploadingObject.unbekannt = false;

                        $scope.uploadingObject.videoweitere = false;
                        $scope.uploadingObject.videodatei = false;
                        $scope.uploadingObject.videoverwackelt = false;
                        $scope.uploadingObject.videounscharf = false;
                        $scope.uploadingObject.videofalsches = false;
                        $scope.uploadingObject.videogeringe = false;

                        $scope.uploadingObject.datenzustand = false;
                        $scope.uploadingObject.datenobjekttyp = false;
                        $scope.uploadingObject.datendenkmalschutz = false;
                        $scope.uploadingObject.datenbautenstand = false;
                        $scope.uploadingObject.datenobjektStandard = false;
                        $scope.uploadingObject.datenumgebende = false;
                        $scope.uploadingObject.datenleerstand = false;
                        $scope.uploadingObject.datenverkehrsanbindung = false;
                        $scope.uploadingObject.datenversorgungseinrichtung = false;
                        $scope.uploadingObject.datenerholungsmoglichkeiten = false;

                        $scope.showForm = true;
                        $scope.max = 5;
                        $scope.isReadonly = false;
                        $scope.uploadingObject.driveByRate = 0;
                        $scope.myInterval = 5000;
                        $scope.noWrapSlides = false;
                        $scope.active = 0;
                        $scope.mapped = {};
                        $scope.driveByRate = {};
                        $scope.rateTextStyle = {};

                        var progresses = $scope.bautenstand,
                            countProgresses = Object.keys(progresses).length;

                        var statusWidth = Math.floor(100 / (countProgresses + 1));
                        $scope.driveByStatusWidth = statusWidth + "%";
                        $scope.driveByStatusTotalWidth = (statusWidth * (countProgresses)) + "%";
                        $scope.driveByMap = {};
                        $scope.driveByMapSpeichern = {};
                        $scope.showDrivebyContainer = true;

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
                        
                        $scope.drivebyLoading = false;
                        $scope.drivebyLoadingSpeichern = false;

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
                        $sessionStorage.base64Video = [];
                        $sessionStorage.videoComplaints = {};
                        $sessionStorage.videoComplaintsText = {};
                        $sessionStorage.datenComplaints = {};
                        $sessionStorage.complaints = [];
                        $sessionStorage.complaintsText = [];
                        $sessionStorage.formchanges = [];
                        $sessionStorage.highlightItem = '';

                        $scope.selectedDriveBySpeichern = {};
                        $scope.selectedDriveBySpeichern.transactionHash = $scope.sendData.transactionHash;
                        $scope.datenData = $scope.sendData;





                        $scope.reset();
                        $scope.images = [];
                        $scope.images = args.data.base64Images;
                        $scope.videoUrl = "data:video/mp4;base64," + args.data.base64Video;
                        $scope.videoUrlSpeichern = "data:video/mp4;base64," + args.data.base64Video;
                        $scope.showVideo = true;
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

                        var slides = $scope.slides = [];

                        angular.forEach($scope.images, function(value, key, obj) {
                            obj[key].url = 'data:image/png;base64,' + obj[key].base64;
                            obj[key].thumbUrl = 'data:image/png;base64,' + obj[key].base64;
                            obj[key].caption = $scope.titlesImage[obj[key].index-1];
                            obj[key].accept = false;
                            obj[key].complaint = false;

                            obj[key].weitere = false;
                            obj[key].datei = false;
                            obj[key].verwackelt = false;
                            obj[key].unscharf = false;
                            obj[key].falsches = false;
                            obj[key].geringe = false;

                            slides.push({
                                image: 'data:image/png;base64,' + obj[key].base64,
                                text: $scope.titlesImage[obj[key].index-1],
                                id: key
                            });
                        });

                        $scope.rateText = [
                            "Bitte bewerten Sie diesen Upload!",
                            "Der Upload war unzureichend",
                            "Der Upload hatte gravierende Mängel",
                            "Der Upload hatte leichte Mängel",
                            "Der Upload war weitgehend in Ordnung",
                            "Der Upload war beanstandungsfrei"
                        ];

                        $scope.preloader = false;
                        $scope.showForm = true;

                    };

                    $scope.preloader = false;

                    $scope.$on('preloaderneue', function (event, args) {
                        if (angular.isDefined(currentItemsTimer)) {
                            $timeout.cancel(currentItemsTimer);
                        }
                        $scope.preloader = args.data;
                        $scope.showForm = false;
                    });

                    var currentItemsTimer;

                    $scope.$on('drivebyDetailsneue', function (event, args) {
                        currentItemsTimer = $timeout(function () {
                            $scope.loadItems(args);
                        }, 500);
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

                    $listenerService.addChangeListener("detailItemneue", "dgoDrivebyDetails", function (item) {
                        if (angular.isObject(item)) {
                            $scope.mapObjectList = [];
                            $mapService.unhighlightAllItems();

                            angular.forEach(item.objektImBauVorschau, function(data, key, obj) {
                                $sucheService.loadItem(encodeURIComponent(data.id)).then(function (data) {
                                    $scope.mapObjectList.push(data);
                                });
                            });

                            $timeout(function () {
                                if ($sessionStorage.highlightItem != '' && angular.isObject($scope.sendData)) {
                                    $sucheService.loadItem(encodeURIComponent($sessionStorage.highlightItemID)).then(function (data) {
                                        $scope.highlightMarker(false, data);
                                    });
                                }
                            }, 500);
                        }
                    });

                    $scope.highlightMarker = function (isCenter, item, $event) {
                        $sessionStorage.formchanges.push('highlightMarker');
                        $sessionStorage.highlightItem = 'data' + item.id.split('.')[0];
                        $sessionStorage.highlightItemID = item.id;

                        $scope.sendData.mappedImmoObject = {
                            "objectType": item.angebotsart,
                            "objectId": item.id
                        };
                        
                        angular.element(document.querySelectorAll('.driveby-detail .ax_dynamic_panel')).removeClass('active');
                        angular.element(document.querySelector('.driveby-detail #u722')).css('opacity', '1');

                        if ($event) {
                            angular.element($event.currentTarget).toggleClass('active');
                        } else {
                            $timeout(function () {
                                angular.element(document.querySelector('.driveby-detail #'+$sessionStorage.highlightItem)).addClass('active');
                            }, 500);
                        }
                        
                        // $mapService.removeDrivebyMarker();
                        
                        $mapService.highlightItem(item, isCenter);

                        $scope.street = item.adresse.strasse;
                        $scope.plz = item.adresse.plz;
                        $scope.city = item.adresse.ort;
                        
                        $drivebysService.getMapped(item.id).then(function (data) {
                            $scope.getMapped(data);
                            $scope.getMappedSpeichern(data);
                        }, function (error) { });
                    };


                    $scope.getMapped = function(data) {
                        if (data.length > 0) {
                            $scope.drivebyLoading = true;
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
                            $scope.selectedDriveBy = data[0];

                            var slides = $scope.slides = [];

                            angular.forEach($scope.driveBy[0].images, function(value, key, obj) {
                                slides.push({
                                    image: obj[key].uri,
                                    text: $scope.titlesImage[obj[key].index-1],
                                    id: key
                                });
                            });
                        }  else {
                            $scope.drivebyLoading = false;
                        }
                    };

                    $scope.createProgressBar = function(buildingProgress) {
                        var progresses = [];
                        angular.forEach($scope.bautenstand, function(value, key, obj) {
                            progresses.push({
                                key: value,
                                name: key
                            });
                        });

                        var statusWidth = Math.floor(100 / (progresses.length + 1));
                        $scope.driveByStatusWidthSpeichern = statusWidth + "%";
                        $scope.driveByStatusTotalWidthSpeichern= (statusWidth * (progresses.length)) + "%";


                        for (var j = 0; j < progresses.length; j++) {
                            if (progresses[j].key == buildingProgress) {
                                $scope.driveByStatusSpeichern = progresses[j].key;
                                $scope.driveByStatusIndexSpeichern = j;
                                var blockWidth = 100 / (progresses.length);
                                $scope.driveByStatusBarWidthSpeichern= (blockWidth * ($scope.driveByStatusIndexSpeichern)).toFixed(2) + "%";
                                break;
                            }
                        }
                    };

                    $scope.getLastProgress = function() {
                        for (var i in $scope.bautenstand) {
                            var key = $scope.bautenstand[i];

                            for (var j in $scope.driveByMapSpeichern[key]) {
                                var buildingProgress = $scope.driveByMapSpeichern[key][j].buildingProgress;
                            }
                        }

                        return buildingProgress;
                    };

                    $scope.refreshProgressBar = function(selectedData) {
                        if ($scope.driveByMapSpeichern.hasOwnProperty('START') && $scope.driveByMapSpeichern.START[0].buildingProgress !== null) {
                            $scope.driveByMapSpeichern[$scope.driveByMapSpeichern.START[0].buildingProgress] = [];
                            $scope.driveByMapSpeichern[$scope.driveByMapSpeichern.START[0].buildingProgress].unshift(selectedData);

                            delete $scope.driveByMapSpeichern['START'];
                        }

                        for (var bautenstand in $scope.bautenstand) {
                            var key = $scope.bautenstand[bautenstand];

                            if (typeof $scope.driveByMapSpeichern[key] !== 'undefined' && $scope.driveByMapSpeichern[key].length > 0) {
                                for (var driveByMap in $scope.driveByMapSpeichern[key]) {
                                    var data = $scope.driveByMapSpeichern[key][driveByMap];
                                    var buildingProgress = data.buildingProgress;

                                    if (selectedData.transactionHash === data.transactionHash) {

                                        if (!angular.isArray($scope.driveByMapSpeichern[data.buildingProgress])) {
                                            $scope.driveByMapSpeichern[data.buildingProgress] = [];
                                        }

                                        if (key !== buildingProgress) {
                                            $scope.driveByMapSpeichern[data.buildingProgress].unshift(data);
                                            $scope.driveByMapSpeichern[key].splice(driveByMap, 1);
                                        }
                                    }
                                }
                            }
                        }

                        var lastProgress = $scope.getLastProgress();
                        $scope.createProgressBar(lastProgress);
                    };

                    $scope.getMappedSpeichern = function(data) {
                        $scope.drivebyLoadingSpeichern = true;

                        if (data.length > 0) {
                            var progresses = [];
                            angular.forEach($scope.bautenstand, function(value, key, obj) {
                                progresses.push({
                                    key: value,
                                    name: key
                                });
                            });

                            var statusWidth = Math.floor(100 / (progresses.length + 1));
                            $scope.driveByStatusWidthSpeichern = statusWidth + "%";
                            $scope.driveByStatusTotalWidthSpeichern = (statusWidth * (progresses.length)) + "%";
                            $scope.driveByMapSpeichern = {};

                            for (var i = 0; i < data.length; i++) {
                                if (!angular.isArray($scope.driveByMapSpeichern[data[i].buildingProgress])) {
                                    $scope.driveByMapSpeichern[data[i].buildingProgress] = [];
                                }
                                $scope.driveByMapSpeichern[data[i].buildingProgress].unshift(data[i]); //sortierung umkehren
                            }

                            if ($scope.sendData.buildingProgress !== null) {
                                $scope.driveByMapSpeichern[$scope.sendData.buildingProgress] = [];
                                $scope.driveByMapSpeichern[$scope.sendData.buildingProgress].unshift($scope.sendData);
                            } else {
                                $scope.driveByMapSpeichern['START'] = [];
                                $scope.driveByMapSpeichern['START'].unshift($scope.sendData);
                            }

                            for (var bautenstand in $scope.bautenstand) {
                                var key = $scope.bautenstand[bautenstand];

                                for (var driveByMap in $scope.driveByMapSpeichern[key]) {
                                    var buildingProgress = $scope.driveByMapSpeichern[key][driveByMap].buildingProgress;
                                }
                            }

                            for (var j = 0; j < progresses.length; j++) {
                                if (progresses[j].key == buildingProgress) {
                                    $scope.driveByStatusSpeichern = progresses[j].key;
                                    $scope.driveByStatusIndexSpeichern = j;
                                    var blockWidth = 100 / (progresses.length);
                                    $scope.driveByStatusBarWidthSpeichern = (blockWidth * ($scope.driveByStatusIndexSpeichern)).toFixed(2) + "%";
                                    break;
                                }
                            }

                            $scope.driveBySpeichern = data;
                            var slides = $scope.slidesSpeichern = [];

                            angular.forEach($scope.images, function(value, key, obj) {
                                if (obj[key].accept) {
                                    slides.push({
                                        image: 'data:image/png;base64,' + obj[key].base64,
                                        text: $scope.titlesImage[obj[key].index-1],
                                        id: key
                                    });
                                }
                            });
                        }  else {
                            $scope.driveByMapSpeichern = {};

                            if ($scope.sendData.buildingProgress !== null) {
                                $scope.driveByMapSpeichern[$scope.sendData.buildingProgress] = [];
                                $scope.driveByMapSpeichern[$scope.sendData.buildingProgress].unshift($scope.sendData);
                            } else {
                                $scope.driveByMapSpeichern['START'] = [];
                                $scope.driveByMapSpeichern['START'].unshift($scope.sendData);
                            }
                        }
                    };

                    $scope.calcOffsets = function (status, statusIndex) {
                        if (statusIndex == $scope.driveByStatusIndex) {
                            var driveBys = $scope.driveByMap[status];
                            if (driveBys && driveBys.length > 0) {
                                $scope.driveByStatusOffset = ((driveBys.length - 1) / driveBys.length * 100) + "%";
                            }
                        }
                    };

                    $scope.calcOffsetsSpeichern = function (status, statusIndex) {
                        if (statusIndex == $scope.driveByStatusIndex) {
                            var driveBys = $scope.driveByMapSpeichern[status];
                            if (driveBys && driveBys.length > 0) {
                                $scope.driveByStatusOffsetSpeichern = ((driveBys.length - 1) / driveBys.length * 100) + "%";
                            }
                        }
                    };

                    $scope.getDriveByOffset = function (status, index) {
                        var driveBys = $scope.driveByMap[status];
                        return (index / driveBys.length * 100) + "%";
                    };

                    $scope.getDriveByOffsetSpeichern = function (status, index) {
                        var driveBys = $scope.driveByMapSpeichern[status];
                        return (index / driveBys.length * 100) + "%";
                    };

                    $scope.setSelectedDriveBy = function (driveBy) {
                        $scope.selectedDriveBy = driveBy;
                        var slides = $scope.slides = [];

                        $scope.sortByKey($scope.selectedDriveBy.images, 'index');
                        angular.forEach($scope.selectedDriveBy.images, function(value, key, obj) {
                            slides.push({
                                image: obj[key].uri,
                                text: $scope.titlesImage[obj[key].index-1],
                                id: key
                            });
                        });

                        $scope.videoUrl = null;

                        if ($scope.selectedDriveBy.videoUri) {
                            $scope.videoUrl = $scope.selectedDriveBy.videoUri;

                            $scope.config = {
                                sources: [
                                    {src: $sce.trustAsResourceUrl($scope.videoUrl), type: "video/mp4"},
                                    {src: $sce.trustAsResourceUrl($scope.videoUrl), type: "video/webm"},
                                    {src: $sce.trustAsResourceUrl($scope.videoUrl), type: "video/ogg"}
                                ]
                            };
                        }
                    };

                    $scope.setSelectedDriveBySpeichern = function (driveBy) {
                        $scope.selectedDriveBySpeichern = driveBy;
                        var slides = $scope.slidesSpeichern = [];

                        if ($scope.selectedDriveBySpeichern.base64Images) {
                            angular.forEach($scope.images, function(value, key, obj) {
                                if (obj[key].accept) {
                                    slides.push({
                                        image: 'data:image/png;base64,' + obj[key].base64,
                                        text: $scope.titlesImage[obj[key].index-1],
                                        id: key
                                    });
                                }
                            });
                        } else {
                            angular.forEach($scope.selectedDriveBySpeichern.images, function(value, key, obj) {
                                slides.push({
                                    image: obj[key].uri,
                                    text: $scope.titlesImage[obj[key].index-1],
                                    id: key
                                });
                            });
                        }

                        if ($scope.selectedDriveBySpeichern.base64Video) {

                            var videoUrlSpeichern = $scope.videoUrlSpeichern;

                            if ($scope.video[0].accept == false) {
                                videoUrlSpeichern = null;
                                $scope.showVideo = false;
                            } else {
                                $scope.showVideo = true;
                            }

                            $scope.configSpeichern = {
                                sources: [
                                    {src: $sce.trustAsResourceUrl(videoUrlSpeichern), type: "video/mp4"},
                                    {src: $sce.trustAsResourceUrl(videoUrlSpeichern), type: "video/webm"},
                                    {src: $sce.trustAsResourceUrl(videoUrlSpeichern), type: "video/ogg"}
                                ]
                            };
                        } else {
                            var videoUrlSpeichern = null;

                            
                            if ($scope.selectedDriveBySpeichern.videoUri) {
                                videoUrlSpeichern = $scope.selectedDriveBySpeichern.videoUri;
                                $scope.showVideo = true;
                            } else {
                                $scope.showVideo = false;
                            }

                            $scope.configSpeichern = {
                                sources: [
                                    {src: $sce.trustAsResourceUrl(videoUrlSpeichern), type: "video/mp4"},
                                    {src: $sce.trustAsResourceUrl(videoUrlSpeichern), type: "video/webm"},
                                    {src: $sce.trustAsResourceUrl(videoUrlSpeichern), type: "video/ogg"}
                                ]
                            };
                        }

                        if ($scope.selectedDriveBySpeichern.transactionHash == $scope.sendData.transactionHash) {
                            if ($scope.daten.accept) {
                                $scope.selectedDriveBySpeichern = driveBy;
                            } else {
                                $scope.selectedDriveBySpeichern = {};
                                $scope.selectedDriveBySpeichern.transactionHash = driveBy.transactionHash;
                            }
                        }
                    };

                    $scope.reset = function () {
                        $scope.street = $scope.sendData.street;
                        $scope.plz = $scope.sendData.plz;
                        $scope.city = $scope.sendData.city;
                        angular.element(document.querySelector('.driveby-detail #u722')).css('opacity', '0.4');
                        angular.element(document.querySelectorAll('.driveby-detail .ax_dynamic_panel')).removeClass('active');
                        $mapService.unhighlightAllItems();
                        $mapService.resetDrivebyMarker($scope.sendData.location);
                        $scope.sendData.mappedImmoObject = null;
                        $sessionStorage.highlightItem = '';

                        $scope.undoForm('highlightMarker');
                        $scope.slidesSpeichern = [];

                        //$listenerService.triggerChange("drivebyDetails", "dgoDrivebys", $scope.sendData.location);
                    };

                    $scope.undoForm = function(key) {
                        for (var i in $sessionStorage.formchanges) {
                            if ($sessionStorage.formchanges[i] == key)
                                delete $sessionStorage.formchanges[i];
                        }
                    };

                    $scope.Lightbox = Lightbox;

                    $scope.accept = function($event, index, type) {
                        var event = $event.currentTarget,
                            accept = angular.element(event),
                            complaint = accept.next();

                        if (complaint.hasClass('active')) {
                            return;
                        }

                        switch (type) {
                            case 'video':
                                if (!accept.hasClass('active')) {
                                    // $sessionStorage.base64Video = $scope.base64Video;
                                    $scope.video[index].accept = true;
                                    $sessionStorage.formchanges.push('videoaccept'+index);
                                } else {
                                    // delete $sessionStorage.base64Video;
                                    $scope.video[index].accept = false;
                                    $scope.undoForm('videoaccept'+index);
                                }

                                if ($scope.selectedDriveBySpeichern.transactionHash == $scope.sendData.transactionHash) {
                                    var videoUrlSpeichern = $scope.videoUrlSpeichern;

                                    if ($scope.video[index].accept == false) {
                                        videoUrlSpeichern = null;
                                        $scope.showVideo = false;
                                    } else  {
                                        $scope.showVideo = true;
                                    }

                                    $scope.configSpeichern = {
                                        sources: [
                                            {src: $sce.trustAsResourceUrl(videoUrlSpeichern), type: "video/mp4"},
                                            {src: $sce.trustAsResourceUrl(videoUrlSpeichern), type: "video/webm"},
                                            {src: $sce.trustAsResourceUrl(videoUrlSpeichern), type: "video/ogg"}
                                        ]
                                    };
                                }
                                break;
                            case 'daten':
                                if (!accept.hasClass('active')) {
                                    $sessionStorage.formchanges.push('datenaccept');
                                    $scope.daten.accept = true;
                                } else {
                                    delete $sessionStorage.daten;
                                    $scope.daten.accept = false;
                                    $scope.undoForm('datenaccept');
                                }

                                if ($scope.selectedDriveBySpeichern.transactionHash == $scope.sendData.transactionHash && $scope.daten.accept) {
                                    $scope.selectedDriveBySpeichern = $scope.datenData;
                                    $scope.progressBar = true;
                                    $scope.refreshProgressBar($scope.selectedDriveBySpeichern);
                                } else {
                                    $scope.selectedDriveBySpeichern = {};
                                    $scope.selectedDriveBySpeichern.transactionHash = $scope.sendData.transactionHash;
                                    $scope.progressBar = false;
                                }

                                break;

                            default:
                                if (!accept.hasClass('active')) {
                                    $sessionStorage.formchanges.push('imagesaccept'+index);
                                    $scope.images[index].accept = true;
                                } else {
                                    delete $sessionStorage.base64Images[index];
                                    $scope.images[index].accept = false;
                                    $scope.undoForm('imagesaccept'+index);
                                }

                                if ($scope.selectedDriveBySpeichern.transactionHash == $scope.sendData.transactionHash) {
                                    var slides = $scope.slidesSpeichern = [];

                                    angular.forEach($scope.images, function(value, key, obj) {
                                        if (obj[key].accept) {
                                            slides.push({
                                                image: 'data:image/png;base64,' + obj[key].base64,
                                                text: $scope.titlesImage[obj[key].index-1],
                                                id: key
                                            });
                                        }
                                    });
                                }

                                $rootScope.$broadcast('accept2', {
                                    index: index,
                                    accept:  $scope.images[index].accept
                                });
                        }
                    };

                    $scope.acceptDblClick = function($event, index, type) {
                        var event = $event.currentTarget || document.querySelector('#daten .accept'),
                            accept = angular.element(event),
                            complaint = accept.next();

                        if (complaint.hasClass('active')) {
                            switch (type) {
                                case 'video':
                                    $scope.video[index].complaint = false;
                                    $scope.video[index].accept = true;

                                    delete $sessionStorage.videoComplaints;
                                    delete $sessionStorage.videoComplaintsText;

                                    $sessionStorage.formchanges.push('videoaccept'+index);
                                    $scope.undoForm('videocomplaints'+index);
                                    break;
                                case 'daten':
                                    $scope.daten.complaint = false;
                                    $scope.daten.accept = true;

                                    delete $sessionStorage.datenComplaints;

                                    $sessionStorage.formchanges.push('datenaccept');
                                    $scope.undoForm('datencomplaints');

                                    $scope.selectedDriveBySpeichern = $scope.datenData;
                                    $scope.progressBar = true;
                                    $scope.refreshProgressBar($scope.selectedDriveBySpeichern);

                                    break;

                                default:
                                    $scope.images[index].complaint = false;
                                    $scope.images[index].accept = true;

                                    delete $sessionStorage.complaints[index];
                                    delete $sessionStorage.complaintsText[index];

                                    $sessionStorage.formchanges.push('imagesaccept'+index);
                                    $scope.undoForm('imagecomplaints'+index);
                            }
                        }
                    };

                    $scope.complaint = function($event, index, type) {
                        var image = $scope.images[index];
                        $scope.complaintIndex = index;

                        $scope.check = function(complaintText) {
                            var checkboxSelected = !( image.datei ||
                                                        image.verwackelt ||
                                                        image.unscharf ||
                                                        image.falsches ||
                                                        image.geringe ||
                                                        image.weitere);

                            $scope.disabled = checkboxSelected || complaintText == '' &&  image.weitere;
                        };

                        $scope.videoCheck = function(complaintText) {
                            var checkboxSelected = !($scope.uploadingObject.videodatei ||
                                                     $scope.uploadingObject.videoverwackelt ||
                                                     $scope.uploadingObject.videounscharf ||
                                                     $scope.uploadingObject.videofalsches ||
                                                     $scope.uploadingObject.videogeringe ||
                                                     $scope.uploadingObject.videoweitere
                                                     );

                            $scope.videoDisabled = checkboxSelected || complaintText == '' && $scope.uploadingObject.videoweitere;
                        };

                        $scope.datenCheck = function(complaintText) {
                            var checkboxSelected = !($scope.uploadingObject.datenzustand ||
                                                     $scope.uploadingObject.datenobjekttyp ||
                                                     $scope.uploadingObject.datendenkmalschutz ||
                                                     $scope.uploadingObject.datenbautenstand ||
                                                     $scope.uploadingObject.datenobjektStandard ||
                                                     $scope.uploadingObject.datenumgebende ||
                                                     $scope.uploadingObject.datenleerstand ||
                                                     $scope.uploadingObject.datenverkehrsanbindung ||
                                                     $scope.uploadingObject.datenversorgungseinrichtung ||
                                                     $scope.uploadingObject.datenerholungsmoglichkeiten
                                                    );

                            $scope.datenDisabled = checkboxSelected;
                        };

                        switch (type) {
                            case 'video':
                                $scope.complaintText = angular.isObject($sessionStorage.videoComplaintsText) && !angular.equals({}, $sessionStorage.videoComplaintsText) ? $sessionStorage.videoComplaintsText.complaintText : '';
                                $scope.templateUrl = 'templates/modal-video-complaint.html';
                                $scope.videoCheck($scope.complaintText);
                                break;

                            case 'daten':
                                $scope.complaintText = angular.isObject($sessionStorage.datenComplaintsText) && !angular.equals({}, $sessionStorage.datenComplaintsText) ? $sessionStorage.datenComplaintsText.complaintText : '';
                                $scope.templateUrl = 'templates/modal-daten-complaint.html';
                                $scope.datenCheck($scope.complaintText);
                                break;

                            default:
                                $scope.currentImg = $scope.images[index].thumbUrl;
                                $scope.complaintText = angular.isObject($sessionStorage.complaintsText[index]) ? $sessionStorage.complaintsText[index].complaintText : '';
                                $scope.templateUrl = 'templates/modal-complaint.html';
                                $scope.check($scope.complaintText);
                        }

                        var currentModal = $uibModal.open({
                            templateUrl: $scope.templateUrl,
                            backdrop: true,
                            windowClass: 'modal-popup-complaint',
                            scope: $scope
                        });

                        $scope.setComplaintText = function() {
                            var selected = angular.element(document.querySelectorAll('.ax_checkbox :checked'));
                            var checkBoxLabel = [];

                            switch (type) {
                                case 'daten':
                                    angular.forEach(selected, function(value, key, obj) {
                                        checkBoxLabel.push(obj[key].dataset.send)
                                    });

                                    break;

                                default:
                                    var arr = selected.next().children();

                                    angular.forEach(arr, function(value, key, obj) {
                                        checkBoxLabel.push(obj[key].innerText)
                                    });
                            }

                            return checkBoxLabel.join(', ').trim();
                        };

                        $scope.save = function(complaintText) {
                            var nextIndex = index + 1;

                            switch (type) {
                                case 'video':
                                    if (!$scope.video[index].complaint) {
                                        $scope.video[index].complaint = true;
                                    }

                                    if ($scope.video[index].accept) {
                                        $scope.video[index].complaint = true;
                                        $scope.video[index].accept = false;
                                    }

                                    $sessionStorage.videoComplaints = {};
                                    $sessionStorage.videoComplaints.complaintText = $scope.setComplaintText(type);

                                    if ($scope.uploadingObject.videoweitere) {
                                        $sessionStorage.videoComplaints.complaintText += ': ' + complaintText;
                                    }

                                    $sessionStorage.videoComplaintsText = {};
                                    $sessionStorage.videoComplaintsText.complaintText = complaintText;

                                    $sessionStorage.videoComplaints.element = 'VIDEO';

                                    $sessionStorage.formchanges.push('videocomplaints'+index);
                                    break;

                                case 'daten':
                                    if (!$scope.daten.complaint) {
                                        $scope.daten.complaint = true;
                                    }

                                    if ($scope.daten.accept) {
                                        $scope.daten.complaint = true;
                                        $scope.daten.accept = false;
                                    }
                                    $sessionStorage.datenComplaints = {};
                                    $sessionStorage.datenComplaints.complaintText = $scope.setComplaintText(type);

                                    if (complaintText !== '') {
                                        $sessionStorage.datenComplaints.complaintText += ', textbox: ' + complaintText;
                                    }

                                    $sessionStorage.datenComplaintsText = {};
                                    $sessionStorage.datenComplaintsText.complaintText = complaintText;
                                    $sessionStorage.datenComplaints.element = 'DATA';

                                    $sessionStorage.formchanges.push('datencomplaints');
                                    break;

                                default:
                                    if (!$scope.images[index].complaint) {
                                        $scope.images[index].complaint = true;
                                    }

                                    if ($scope.images[index].accept) {
                                        $scope.images[index].complaint = true;
                                        $scope.images[index].accept = false;
                                    }

                                    $sessionStorage.complaints[index] = {};
                                    $sessionStorage.complaints[index].complaintText = $scope.setComplaintText(type);

                                    if (image.weitere) {
                                        $sessionStorage.complaints[index].complaintText += ': ' + complaintText;
                                    }

                                    $sessionStorage.complaintsText[index] = {};
                                    $sessionStorage.complaintsText[index].complaintText = complaintText;

                                    $sessionStorage.complaints[index].element = 'IMAGE' + nextIndex;

                                    $sessionStorage.formchanges.push('imagecomplaints'+index);

                                    $rootScope.$broadcast('complaint2', {
                                        index: index,
                                        complaint:  $scope.images[index].complaint
                                    });
                            }

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

                            // $scope.daten.accept = true;

                            $timeout(function() {
                                var accept = angular.element(document.querySelector('#daten .accept'));
                                if ($scope.daten.complaint) {
                                    accept.triggerHandler('dblclick');
                                } else {
                                    accept.triggerHandler('click');
                                }
                            }, 0);

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

                            currentModal.dismiss();
                        };
                    };

                    $scope.getRate = function() {
                        if ($scope.uploadingObject.driveByRate > 0) {
                            $sessionStorage.formchanges.push('driveByRate');
                            $scope.driveByRate.error = false;
                            $scope.rateTextStyle.color = 'black';
                        } else {
                            $scope.undoForm('driveByRate');
                        }
                    };

                    $scope.showError = function() {
                        var index = [];
                        $scope.error = false;

                        if ($scope.sendData.mappedImmoObject == null) {
                            index.push('mappedImmoObject');
                            $scope.error = true;
                            $scope.mapped.error = true;
                        } else {
                            $scope.mapped.error = false;
                        }

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


                        if ($scope.base64Video !== null) {
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
                        }

                        if (!($scope.daten.accept || $scope.daten.complaint)) {
                            index.push('daten');
                            $scope.daten.error = true;
                            $scope.error = true;
                        } else {
                            $scope.daten.error = false;
                        }

                        if ($scope.uploadingObject.driveByRate == 0) {
                            index.push('driveByRate');
                            $scope.error = true;
                            $scope.driveByRate.error = true;

                            $scope.rateTextStyle = {color: $scope.driveByRate.error ? 'red' : 'black'};

                        } else {
                            $scope.driveByRate.error = false;
                        }

                        if ($scope.daten.complaint)
                            $scope.sendData.state = $scope.states.Abgelehnt;
                        
                        if (index.length > 0)
                            $anchorScroll(index[0]);
                    };

                    $scope.unbekanntChange = function() {
                        if ($scope.uploadingObject.unbekannt) {
                            $sessionStorage.formchanges.push('unbekannt');
                        } else {
                            $scope.undoForm('unbekannt');
                        }
                    };

                    $scope.storeEdited = function () {
                        $scope.sendData.state = $scope.states.Abgeschlossen;
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

                            $scope.sendData.rating = $scope.uploadingObject.driveByRate;
                            
                            if ($scope.uploadingObject.unbekannt)
                                $scope.sendData.state =  $scope.states.Unbekannt;

                            $scope.preloader = true;
                            $scope.showForm = false;
                            
                            $drivebysService.storeEdited($scope.sendData, 'neue').then(function () {
                                $scope.sendData = {};
                                $sessionStorage.formchanges = [];
                                $rootScope.$broadcast('updateDriveBy');
                                $rootScope.$broadcast('updateBestehendeList');
                                $rootScope.$broadcast('updateBestehendeListCount');

                            }, function (error) {});
                        }
                    };

                    $scope.driveByCancel = function() {
                        $scope.sendData = {};
                        $scope.showForm = false;
                    };

                    $scope.delete = function() {
                        var currentModal = $uibModal.open({
                            templateUrl: 'templates/modal-delete.html',
                            backdrop: true,
                            windowClass: 'modal-popup-delete',
                            scope: $scope
                        });

                        $scope.yes = function() {
                            $drivebysService.deleteDriveBy($scope.sendData.transactionHash, 'neue').then(function () {
                                currentModal.dismiss();
                                $scope.sendData = {};
                                $scope.showForm = false;
                                $sessionStorage.formchanges = [];

                                $rootScope.$broadcast('updateDriveBy');
                                $rootScope.$broadcast('updateBestehendeList');
                                $rootScope.$broadcast('updateBestehendeListCount');
                            }, function (error) {});
                        };

                        $scope.no = function() {
                            currentModal.dismiss();
                        };
                    }
                }
            };
        }]);
});
