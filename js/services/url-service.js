define(["./module"], function (module) {
    "use strict";
    module.factory("$urlService", ["$location", function ($location) {

        var gotoStartPage = function (referer) {

        };

        return {
            gotoStartPage: gotoStartPage
        };

    }]).config(function ($routeProvider) {
        $routeProvider.when("/start", {
            templateUrl: "templates/page-start.html",
            controller: "dgoStartController"

        }).otherwise({
            redirectTo: "/start"
        });
    });
});