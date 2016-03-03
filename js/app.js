define(["angular", "angular-sanitize",  "angular-animate", "angular-touch", "locale-de",
    "ui-bootstrap", "ngStorage", "duScroll", "./services/index", "./controllers/index",
    "./directives/index", "bootstrapLightbox"], function (angular) {
    "use strict";

    var app = angular.module("app", ["ngSanitize", "ngAnimate", "ngTouch", "ngRoute", "ngStorage",
        "duScroll", "ui.bootstrap", "app.services", "app.controllers",
        "app.directives", "bootstrapLightbox"]);

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