define(["./module"], function (module) {
    "use strict";
    module.directive("dgoBestehendeDriveby", ["$urlService", "$constantsService", "$filter", "$restService", "$newsService",
        function ($urlService, $constantsService, $filter, $restService, $newsService) {
            return {
                restrict: "E",
                replace: true,
                scope: true,
                templateUrl: "templates/dgo-bestehende-driveby.html",
                controller: function ($scope, $attrs) {
                    $scope.getComputedCSSPropertyValue = function(element, CSSProperty) {
                        return (typeof getComputedStyle == "undefined" ? element.currentStyle : getComputedStyle(element, null))[CSSProperty];
                    };

                    $scope.classNamesDrivebys = $attrs.className == 'neue' ?
                        ["driveBys", "col-sm-4", "left-5", "column-30", "top-1", "panel", "panel-default"] :
                        ["col-sm-4", "column-30", "left-5", "top-1", "panel", "panel-default"];

                    $scope.classNamesDeatails = ["driveby-bestehende-detail", "col-sm-4", "column-35", "col-sm-offset-4", "top-1", "panel panel-default"];

                    $scope.constantHeight = 25;
                    $scope.constantDriveBysListHeight = 45;
                    $scope.tabs = document.querySelector(".tabs");
                    $scope.navTabs = document.querySelector(".nav-tabs");
                    $scope.modalHeader = document.querySelector(".modal-header");
                    $scope.tabsHeight =  parseInt($scope.getComputedCSSPropertyValue($scope.tabs, 'marginTop').replace('px', ''));
                    $scope.navTabsHeight = $scope.navTabs.offsetHeight;
                    $scope.modalHeaderHeight = parseInt($scope.getComputedCSSPropertyValue($scope.modalHeader, 'minHeight').replace('px', ''));
                    $scope.modalHeaderPaddingTop = parseInt($scope.getComputedCSSPropertyValue($scope.modalHeader, 'paddingTop').replace('px', ''));
                    $scope.modalHeaderPaddingBottom = parseInt($scope.getComputedCSSPropertyValue($scope.modalHeader, 'paddingBottom').replace('px', ''));
                    $scope.driveByNeueHeight = document.documentElement.clientHeight - $scope.tabsHeight - $scope.navTabsHeight - $scope.constantHeight  + 'px';
                    $scope.driveBysListHeight = parseInt($scope.driveByNeueHeight.replace('px', '')) - $scope.modalHeaderHeight - $scope.modalHeaderPaddingTop  - $scope.modalHeaderPaddingBottom - $scope.constantDriveBysListHeight  + 'px';
                }
            };

        }]);
});