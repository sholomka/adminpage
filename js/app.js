define(["angular", "angular-sanitize",  "angular-animate", "angular-touch", "locale-de",
    "ui-bootstrap", "ngStorage", "duScroll", "./services/index", "./controllers/index",
    "./directives/index", "angular-carousel", "bootstrapLightbox", "videogular"], function (angular) {
    "use strict";

    var app = angular.module("app", ["ngSanitize", "ngAnimate", "ngTouch", "ngRoute", "ngStorage",
        "duScroll", "ui.bootstrap", "app.services", "app.controllers",
        "app.directives", "angular-carousel", "bootstrapLightbox", "com.2fdevs.videogular"]);

    app.controller('LightboxCtrl', function ($scope, $window, $sessionStorage, $uibModal, $rootScope) {

        $scope.disabled = true;

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
                index = $scope.Lightbox.index;

            if (complaint.hasClass('active')) {
                return;
            }

            if (!accept.hasClass('active')) {
                $scope.Lightbox.image.accept = true;

                if (isVideo) {
                    $sessionStorage.base64Video = $scope.Lightbox.image.base64Video;

                    $sessionStorage.formchanges.push('videoaccept'+index);
                } else {
                    $sessionStorage.base64Images[index] = {};
                    $sessionStorage.base64Images[index].index = $scope.Lightbox.image.index;
                    $sessionStorage.base64Images[index].base64 = $scope.Lightbox.image.base64;

                    $sessionStorage.formchanges.push('imagesaccept'+index);
                }
            } else {
                $scope.Lightbox.image.accept = false;

                if (isVideo) {
                    delete $sessionStorage.base64Video;
                    $scope.undoForm('videoaccept'+index);
                }  else {
                    delete $sessionStorage.base64Images[index];
                    $scope.undoForm('imagesaccept'+index);
                }
            }

            $rootScope.$broadcast('accept', {
                index: index,
                accept:  $scope.Lightbox.image.accept,
                isVideo: isVideo
            });

        };

        $scope.complaint = function($event, isVideo) {
            $scope.check = function(complaintText) {
                $scope.disabled = complaintText == '';
            };

            var index = $scope.Lightbox.index;
            $scope.currentImg =   $scope.Lightbox.image.thumbUrl;

            if (isVideo) {
                $scope.complaintText = angular.isObject($sessionStorage.videoComplaints) && !angular.equals({}, $sessionStorage.videoComplaints) ? $sessionStorage.videoComplaints.complaintText : '';
            } else {
                $scope.complaintText = angular.isObject($sessionStorage.complaints[index]) ? $sessionStorage.complaints[index].complaintText : '';
            }

            $scope.check($scope.complaintText);

            var currentModal = $uibModal.open({
                templateUrl: 'templates/modal-complaint.html',
                backdrop: true,
                windowClass: 'modal-popup-complaint',
                scope: $scope
            });

            $scope.save = function(complaintText) {
                if (!$scope.Lightbox.image.complaint) {
                    $scope.Lightbox.image.complaint = true;
                }

                if ($scope.Lightbox.image.accept) {
                    $scope.Lightbox.image.complaint = true;
                    $scope.Lightbox.image.accept = false;
                }

                if (isVideo) {
                    $sessionStorage.videoComplaints = {};
                    $sessionStorage.videoComplaints.complaintText = complaintText;
                    $sessionStorage.videoComplaints.element = 'VIDEO';

                    delete  $sessionStorage.base64Video;
                } else {
                    $sessionStorage.complaints[index] = {};
                    $sessionStorage.complaints[index].complaintText = complaintText;
                    $sessionStorage.complaints[index].element = 'IMAGE' + $scope.Lightbox.image.index;

                    delete $sessionStorage.base64Images[index];
                }

                $rootScope.$broadcast('complaint', {
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
            var index = $scope.Lightbox.index;

            if ($scope.Lightbox.image.complaint) {
                if (isVideo) {
                    delete $sessionStorage.videoComplaints;
                    $sessionStorage.base64Video = $scope.Lightbox.image.base64Video;
                } else {
                    delete $sessionStorage.complaints[index];

                    $sessionStorage.base64Images[index] = {};
                    $sessionStorage.base64Images[index].index = $scope.Lightbox.image.index;
                    $sessionStorage.base64Images[index].base64 = $scope.Lightbox.image.base64;
                }


                $scope.Lightbox.image.complaint = false;
                $scope.Lightbox.image.accept = true;

                $rootScope.$broadcast('acceptDblClick', {
                    index: index,
                    complaint:  $scope.Lightbox.image.complaint,
                    accept:  $scope.Lightbox.image.accept,
                    isVideo: isVideo
                });

                $scope.disabled = true;
            }
        };

        $scope.undoForm = function(key) {
            for (var i in $sessionStorage.formchanges) {
                if ($sessionStorage.formchanges[i] == key)
                    delete $sessionStorage.formchanges[i];
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

    return app;
});