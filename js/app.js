define(["angular", "angular-sanitize",  "angular-animate", "angular-touch", "locale-de",
    "ui-bootstrap", "ngStorage", "duScroll", "./services/index", "./controllers/index",
    "./directives/index"], function (angular) {
    "use strict";

    var app = angular.module("app", ["ngSanitize", "ngAnimate", "ngTouch", "ngRoute", "ngStorage",
        "duScroll", "ui.bootstrap", "app.services", "app.controllers",
        "app.directives"]);

    return app;
});