define(["./module"], function (module) {
    "use strict";
    module.directive("dgoNav", ["$urlService",
                                function ($urlService) {
	    return {
	    	restrict: "E",
	    	replace: true,
	    	scope: false,
	    	transclude: true,
	    	templateUrl: "templates/dgo-nav.html",
	    	controller: function ($scope, $element) {
				$scope.showTabs = function(type) {
					var elements = $element.find("div");

					elements.removeClass("btn-active");

					for (var i = 0; i < elements.length; i++) {
						if (elements.eq(i).hasClass('navbar-news') && type == 'news') {
							elements.eq(i).addClass("btn-active");
						} else if(elements.eq(i).hasClass('navbar-drive-by-daten') && type == 'driveBy') {
							elements.eq(i).addClass("btn-active");
						} else if(elements.eq(i).hasClass('navbar-oib') && type == 'oib') {
                            elements.eq(i).addClass("btn-active");
                        }
					}

					$scope.tabs[0].show = (type == 'news');
					$scope.tabs[1].show = (type == 'news');
					$scope.tabs[2].show = (type == 'driveBy');
					$scope.tabs[3].show = (type == 'driveBy');
                    $scope.tabs[4].show = (type == 'oib');

				}
	    	}
	    };
    	
    }]);
});