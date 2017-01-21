define(["angular", "angular-sanitize",  "angular-animate", "angular-touch", "locale-de",
    "ui-bootstrap", "ngStorage", "duScroll", "./services/index", "./controllers/index",
    "./directives/index", "angular-carousel", "bootstrapLightbox", "videogular"], function (angular) {
    "use strict";

    var app = angular.module("app", ["ngSanitize", "ngAnimate", "ngTouch", "ngRoute", "ngStorage",
        "duScroll", "ui.bootstrap", "app.services", "app.controllers",
        "app.directives", "angular-carousel", "bootstrapLightbox", "com.2fdevs.videogular"]);

    app.controller('LightboxCtrl', function ($scope, $window, $sessionStorage, $uibModal, $rootScope) {

        $scope.disabled = true;

        $scope.uploadingObject = {};
        $scope.uploadingObject.weitere = false;

        $scope.$on('accept2', function (event, args) {
            $scope.Lightbox.image.accept = args.accept;
        });

        $scope.$on('acceptDblClick2', function (event, args) {
            $scope.Lightbox.image.complaint = args.complaint;
            $scope.Lightbox.image.accept = args.accept;
        });

        $scope.$on('complaint2', function (event, args) {
            $scope.Lightbox.image.complaint = args.complaint;
        });

        $scope.accept = function($event, isVideo) {
            var event = $event.currentTarget,
                accept = angular.element(event),
                complaint = accept.next(),
                index = $scope.Lightbox.index,
                tab = $scope.Lightbox.image.tab,
                storageImgName = 'base64Images',
                storageVideoName = 'base64Video',
                storageFormchangesName = 'formchanges',
                broadcastName = 'accept';

            if (complaint.hasClass('active')) {
                return;
            }

            if (tab == 'bestehende') {
                storageImgName += tab;
                storageVideoName += tab;
                storageFormchangesName += tab;
                broadcastName += tab;
            }

            if (!accept.hasClass('active')) {
                $scope.Lightbox.image.accept = true;

                if (isVideo) {
                    $sessionStorage[storageVideoName] = $scope.Lightbox.image.base64Video;
                    $sessionStorage[storageFormchangesName].push('videoaccept'+index);
                } else {
                    $sessionStorage[storageImgName][index] = {};
                    $sessionStorage[storageImgName][index].index = $scope.Lightbox.image.index;
                    $sessionStorage[storageImgName][index].base64 = $scope.Lightbox.image.base64;

                    $sessionStorage[storageFormchangesName].push('imagesaccept'+index);
                }
            } else {
                $scope.Lightbox.image.accept = false;

                if (isVideo) {
                    delete $sessionStorage[storageVideoName];
                    $scope.undoForm('videoaccept'+index, storageFormchangesName);
                }  else {
                    delete $sessionStorage[storageImgName][index];
                    $scope.undoForm('imagesaccept'+index, storageFormchangesName);
                }
            }

            $rootScope.$broadcast(broadcastName, {
                index: index,
                accept:  $scope.Lightbox.image.accept,
                isVideo: isVideo
            });
        };

        $scope.complaint = function($event, isVideo) {
            $scope.check = function(complaintText) {
                $scope.disabled = complaintText == '' && $scope.uploadingObject.weitere;
            };

            var index = $scope.Lightbox.index,
                tab = $scope.Lightbox.image.tab,
                storageImgName = 'base64Images',
                storageVideoName = 'base64Video',
                storageVideoComplaints = 'videoComplaints',
                storageVideoComplaintsText = 'videoComplaintsText',
                storageComplaints = 'complaints',
                storageComplaintsText = 'complaintsText',
                broadcastName = 'complaint';
            
            if (tab == 'bestehende') {
                storageImgName += tab;
                storageVideoName += tab;
                storageVideoComplaints += tab;
                storageVideoComplaintsText += tab;
                storageComplaints += tab;
                storageComplaintsText += tab;
                broadcastName += tab;
            }
            
            $scope.currentImg = $scope.Lightbox.image.thumbUrl;

            if (isVideo) {
                $scope.complaintText = angular.isObject($sessionStorage[storageVideoComplaintsText]) && !angular.equals({}, $sessionStorage[storageVideoComplaintsText]) ?  $sessionStorage[storageVideoComplaintsText].complaintText : '';
            } else {
                $scope.complaintText = angular.isObject($sessionStorage[storageComplaintsText][index]) ? $sessionStorage[storageComplaintsText][index].complaintText : '';
            }

            $scope.check($scope.complaintText);

            var currentModal = $uibModal.open({
                templateUrl: 'templates/modal-complaint.html',
                backdrop: true,
                windowClass: 'modal-popup-complaint',
                scope: $scope
            });

            $scope.save = function(complaintText) {
                var arr = angular.element(document.querySelectorAll('.ax_checkbox :checked')).next().children();

                var checkBoxLabel = [];
                angular.forEach(arr, function(value, key, obj) {
                    checkBoxLabel.push(obj[key].innerText)
                });
                var checkBoxLabelValue = ' ' + checkBoxLabel.join(' ');


                if (!$scope.Lightbox.image.complaint) {
                    $scope.Lightbox.image.complaint = true;
                }

                if ($scope.Lightbox.image.accept) {
                    $scope.Lightbox.image.complaint = true;
                    $scope.Lightbox.image.accept = false;
                }

                if (isVideo) {
                    $sessionStorage[storageVideoComplaints] = {};
                    $sessionStorage[storageVideoComplaints].complaintText = (complaintText + checkBoxLabelValue).trim();
                    $sessionStorage[storageVideoComplaints].element = 'VIDEO';

                    $sessionStorage[storageVideoComplaintsText] = {};
                    $sessionStorage[storageVideoComplaintsText].complaintText = complaintText;

                    delete $sessionStorage[storageVideoName];
                } else {
                    $sessionStorage[storageComplaints][index] = {};
                    $sessionStorage[storageComplaints][index].complaintText = (complaintText + checkBoxLabelValue).trim();
                    $sessionStorage[storageComplaints][index].element = 'IMAGE' + $scope.Lightbox.image.index;

                    $sessionStorage[storageComplaintsText][index] = {};
                    $sessionStorage[storageComplaintsText][index].complaintText = complaintText;

                    delete $sessionStorage[storageImgName][index];
                }


                console.log($sessionStorage[storageVideoComplaints]);

                $rootScope.$broadcast(broadcastName, {
                    index: index,
                    complaint:  $scope.Lightbox.image.complaint,
                    isVideo: isVideo
                });

                currentModal.dismiss();
            };

            $scope.cancel = function() {
                currentModal.dismiss();
            };

            $scope.check = function(complaintText) {
                $scope.disabled = complaintText == '';
            }
        };

        $scope.acceptDblClick = function($event, isVideo) {
            var index = $scope.Lightbox.index,
                tab = $scope.Lightbox.image.tab,
                storageImgName = 'base64Images',
                storageVideoName = 'base64Video',
                storageVideoComplaints = 'videoComplaints',
                storageVideoComplaintsText = 'videoComplaintsText',
                storageComplaintsText = 'complaintsText',
                storageComplaints = 'complaints',
                broadcastName = 'acceptDblClick';

            if (tab == 'bestehende') {
                storageImgName += tab;
                storageVideoName += tab;
                storageVideoComplaints += tab;
                storageComplaints += tab;
                storageVideoComplaintsText += tab;
                storageComplaintsText += tab;
                broadcastName += tab;
            }

            if ($scope.Lightbox.image.complaint) {
                if (isVideo) {
                    delete $sessionStorage[storageVideoComplaints];
                    delete $sessionStorage[storageVideoComplaintsText];
                    $sessionStorage[storageVideoName] = $scope.Lightbox.image.base64Video;
                } else {
                    delete $sessionStorage[storageComplaints][index];
                    delete $sessionStorage[storageComplaintsText][index];

                    $sessionStorage[storageImgName][index] = {};
                    $sessionStorage[storageImgName][index].index = $scope.Lightbox.image.index;
                    $sessionStorage[storageImgName][index].base64 = $scope.Lightbox.image.base64;
                }
                
                $scope.Lightbox.image.complaint = false;
                $scope.Lightbox.image.accept = true;

                $rootScope.$broadcast(broadcastName, {
                    index: index,
                    complaint:  $scope.Lightbox.image.complaint,
                    accept:  $scope.Lightbox.image.accept,
                    isVideo: isVideo
                });

                $scope.disabled = true;
            }
        };

        $scope.undoForm = function(key, storageFormchangesName) {
            for (var i in $sessionStorage[storageFormchangesName]) {
                if ($sessionStorage[storageFormchangesName][i] == key)
                    delete $sessionStorage[storageFormchangesName][i];
            }
        };
    });

    app.config(["LightboxProvider", function(LightboxProvider) {
        // set a custom template
        LightboxProvider.templateUrl = 'templates/modal-lightbox.html';

        // increase the maximum display height of the image
        LightboxProvider.calculateImageDimensionLimits = function (dimensions) {
            return {
                'maxWidth': dimensions.windowWidth >= 768 ? // default
                dimensions.windowWidth - 92 :
                dimensions.windowWidth - 52,
                'maxHeight': 1600                           // custom
            };
        };

        // the modal height calculation has to be changed since our custom template is
        // taller than the default template
        LightboxProvider.calculateModalDimensions = function (dimensions) {
            var width = Math.max(400, dimensions.imageDisplayWidth + 32);

            if (width >= dimensions.windowWidth - 20 || dimensions.windowWidth < 768) {
                width = 'auto';
            }

            return {
                'width': width,                             // default
                'height': 'auto'                            // custom
            };
        };
    }]);

    app.filter('unique', function() {

        return function (arr, field) {
            var o = {}, i, l = arr.length, r = [];
            for(i=0; i<l;i+=1) {
                o[arr[i][field]] = arr[i];
            }
            for(i in o) {
                r.push(o[i]);
            }
            return r;
        };
    });

    return app;
});