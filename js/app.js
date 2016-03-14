define(["angular", "angular-sanitize",  "angular-animate", "angular-touch", "locale-de",
    "ui-bootstrap", "ngStorage", "duScroll", "./services/index", "./controllers/index",
    "./directives/index", "bootstrapLightbox", "videogular"], function (angular) {
    "use strict";

    var app = angular.module("app", ["ngSanitize", "ngAnimate", "ngTouch", "ngRoute", "ngStorage",
        "duScroll", "ui.bootstrap", "app.services", "app.controllers",
        "app.directives", "bootstrapLightbox", "com.2fdevs.videogular"]);

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

        $scope.accept = function($event) {
            var event = $event.currentTarget,
                accept = angular.element(event),
                complaint = accept.next(),
                index = $scope.Lightbox.index;

            if (complaint.hasClass('active')) {
                return;
            }

            if (!accept.hasClass('active')) {
                accept.toggleClass('active');
                $scope.Lightbox.image.accept = true;

                $sessionStorage.base64Images[index] = {};
                $sessionStorage.base64Images[index].index = $scope.Lightbox.image.index;
                $sessionStorage.base64Images[index].base64 = $scope.Lightbox.image.base64;
            } else {
                delete $sessionStorage.base64Images[index];
                $scope.Lightbox.image.accept = false;
                accept.toggleClass('active');
            }

            $rootScope.$broadcast('accept', {
                index: index,
                accept:  $scope.Lightbox.image.accept
            });
        };

        $scope.complaint = function($event) {
            var event = $event.currentTarget,
                complaint = angular.element(event),
                accept = complaint.parent().children().eq(0),
                index = $scope.Lightbox.index;

            var clear = function() {
                $scope.sendData.complaintText = '';
                $scope.disabled = true;
            };


            console.log($sessionStorage.complaints);




            $scope.currentImg =   $scope.Lightbox.image.thumbUrl;
            $scope.complaintText = angular.isObject($sessionStorage.complaints[index]) ? $sessionStorage.complaints[index].complaintText : '';

            var currentModal = $uibModal.open({
                templateUrl: 'templates/modal-complaint.html',
                backdrop: true,
                windowClass: 'modal-popup-complaint',
                scope: $scope
            });

            $scope.save = function(complaintText) {
                if (!complaint.hasClass('active')) {


                    console.log(complaint);

                    complaint.toggleClass('active');
                    $scope.Lightbox.image.complaint = true;

                    $scope.Lightbox.image.accept = false;

                }

                if (accept.hasClass('active')) {
                    accept.toggleClass('active');

                    $scope.Lightbox.image.complaint = false;

                    $scope.Lightbox.image.accept = false;

                    console.log(accept);
                }


                $sessionStorage.complaints[index] = {};
                $sessionStorage.complaints[index].complaintText = complaintText;
                $sessionStorage.complaints[index].element = 'IMAGE' + $scope.Lightbox.image.index;


                $rootScope.$broadcast('complaint', {
                    index: index,
                    complaint:  $scope.Lightbox.image.complaint
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

        $scope.acceptDblClick = function($event) {
            var event = $event.currentTarget,
                accept = angular.element(event),
                complaint = accept.next(),
                index = $scope.Lightbox.index;

            if (complaint.hasClass('active')) {
                complaint.toggleClass('active');
                accept.toggleClass('active');

                $scope.Lightbox.image.complaint = false;
                $scope.Lightbox.image.accept = true;

                $rootScope.$broadcast('acceptDblClick', {
                    index: index,
                    complaint:  $scope.Lightbox.image.complaint,
                    accept:  $scope.Lightbox.image.accept
                });

                delete $sessionStorage.complaints[index];
                $scope.disabled = true;

                console.log($sessionStorage.complaints);

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