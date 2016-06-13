define(["./module", "googlemaps"], function (module) {
    "use strict";
    module.factory("$mapService", ["$rootScope", "$timeout", "$filter", "$compile", "$window", "$messageService", "$listenerService", "$sucheService", "$spezialgebieteService", "$http", "$drivebysService", "$sessionStorage",
        function ($scope, $timeout, $filter, $compile, $window, $messageService, $listenerService, $sucheService, $spezialgebieteService, $http, $drivebysService, $sessionStorage) {
            var maps = {},
                initialBounds,
                viewportChangeTimer,
                markerMap = {}, //map mit itemId=>marker
                boundaryMap = {},
                currentSpezialgebiete,
                currentSpezialgebieteTimer,
                gebieteTypenMap = {}, //map mit gebietstyp=> map von shapeId->shape
                currentSuchart,
                currentReferenzobjekt,
                currentAngebotsart,
                referenzObjektMarker,
                popupTimer,
                popup2Timer,
                keepExistingMarkers,
                zoomListenerIsDisabled,
                newsMap = {}, //map mit newsId->marker
                control,
                spezialgebieteWMSListener = {},
                infowindow,

                objektMarker;

            // ein viewport besteht immer aus 4 koordinaten: linksoben, rechtsoben, rechtsunten, linksunten
            var coordsToBounds = function (coords) {
                var sw = new google.maps.LatLng(coords[3][0], coords[3][1]);
                var ne = new google.maps.LatLng(coords[1][0], coords[1][1]);
                return new google.maps.LatLngBounds(sw, ne);
            };

            var boundsToCoords = function (bounds) {
                var sw = bounds.getSouthWest();
                var ne = bounds.getNorthEast();

                return [[ne.lat(), sw.lng()],
                    [ne.lat(), ne.lng()],
                    [sw.lat(), ne.lng()],
                    [sw.lat(), sw.lng()]];
            };

            var disableZoomListener = function (val) {
                zoomListenerIsDisabled = val;
            };
            //TODO - temporary deactivated
//    	var showPlacesControl = function(){
//				$scope.showPlaces = function(placeType){
//					if($scope.placesMap[placeType]!=undefined){
//						 $scope.placesMap[placeType].forEach(function(entry){
//						 	entry.setMap(null)
//						 });
//						delete $scope.placesMap[placeType];
//						return;
//					}
//					$scope.placesMap[placeType]={};
//					var service = new google.maps.places.PlacesService(map);
//					  service.nearbySearch({
//					    bounds: map.getBounds(),
//					    types: [placeType]
//					  }, callback);
//					  
//					function callback(results, status) {
//						if (status === google.maps.places.PlacesServiceStatus.OK) {
//							$scope.placesMap[placeType]=[];
//							for (var i = 0; i < results.length; i++) {
//								$scope.placesMap[placeType].push(createMarker(results[i],placeType));
//							}
//						}
//					}
//
//					function createMarker(place,placeType) {
//						
//						var placeLoc = place.geometry.location;
//						var labelcontent = '';
//						if(placeType=='grocery_or_supermarket'){
//							labelcontent = '<i class=\"fa fa-shopping-cart\"></i>';
//						}else if(placeType=='school'){
//							labelcontent = '<i class=\"fa fa-graduation-cap\"></i>';
//						}
//						var marker = new MarkerWithLabel({
//							map: map,
//							position: placeLoc,
//							icon: ' ',
//							labelContent: labelcontent,
//							labelAnchor: new google.maps.LatLng(placeLoc.lat(),placeLoc.lng()),
//							labelClass: 'map-marker-places-label'
//						});
//						google.maps.event.addListener(marker, 'mouseover', function() {
//							infowindow.setContent(place.name);
//							infowindow.open(map, this);
//						});
//						google.maps.event.addListener(marker, 'mouseout', function() {
//							infowindow.close();
//						});
//						return marker;
//					}
//				}
//			
//		    	var placs = [];
//				placs.push('<div class="map-control-gebiete map-control-gebiete-open">');
//				//TODO - Better width for this control pannel
//				placs.push('<div class="map-control-head" style="width:192px">Interessante Orte</div>');
//				placs.push('<div><a href="javascript:;" ng-click="showPlaces(\'grocery_or_supermarket\')"><i class="fa fa-fw {{placesMap[\'grocery_or_supermarket\'] ? \'fa-check-square\' : \'fa-square-o\'}}"></i> Einkaufsmöglichkeiten</div>');
//				placs.push('<div><a href="javascript:;" ng-click="showPlaces(\'school\')"><i class="fa fa-fw {{placesMap[\'school\'] ? \'fa-check-square\' : \'fa-square-o\'}}"></i> Schulen</div>');
//				if(placs.length>0){
//					placs.push('</div>')
//				}
//				var placesControl=angular.element(placs.join(""));
//				$compile(placesControl)($scope);
//				map.controls[google.maps.ControlPosition.RIGHT_TOP].push(placesControl[0]);
//			}

            var map = undefined;

            var createMap = function (mapRootElement, mapType, mapId) {
                console.log(1);


                $scope.placesMap = {};
                if (angular.isUndefined(mapRootElement)) {
                    $messageService.showError("kein Map-Root-Element definiert!");
                    return;
                }

                //temporary deactivated
//			showPlacesControl();
//			infowindow = new google.maps.InfoWindow();

                //unterscheiden je nach mapType, welche Funktionalitäten enthalten sollen

               
                if (mapType == "suche") {
                    map = new google.maps.Map(mapRootElement, {
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        streetViewControl: false,
                        mapTypeControlOptions: {
                            position: google.maps.ControlPosition.TOP
                        }
                    });

                    //unsere eigenen listener registrieren (aber erst, nachdem die map sich selbst intialisiert hat)
                    google.maps.event.addListenerOnce(map, 'idle', function () {

                        //wenn man die map verschiebt, wird der viewport aktualisiert
                        google.maps.event.addListener(map, "dragend", function () {
                            keepExistingMarkers = true;
                            updateViewport(map);
                            loadSpezialgebieteWithTimeout(map);

                            //TODO- lade places neu
//	            		var places = $scope.placesMap;
//	            		angular.forEach(places, function(value, key){
//	            			places[key].forEach(function(value){
//						 		value.setMap(null)
//						 	});
//							delete $scope.placesMap[key];
//							$scope.showPlaces(key);
//	            		});

                        });

                        //zoom änderung mitteilen
                        google.maps.event.addListener(map, "zoom_changed", function () {

                            if (zoomListenerIsDisabled) return;

                            //alle markierungen entfernen (werden eh neu geladen, nach dem zoom)
                            for (var key in markerMap) {
                                markerMap[key].setMap(null);
                            }
                            markerMap = {};

                            for (var key in boundaryMap) {
                                boundaryMap[key].setMap(null);
                            }
                            boundaryMap = {};
                            keepExistingMarkers = false;

                            //wir warten bis der zoom fertig ist
                            google.maps.event.addListenerOnce(map, "idle", function () {
                                updateViewport(map);
                                loadSpezialgebieteWithTimeout(map);
                                $listenerService.triggerChange("zoomlevel", "mapService", map.getZoom());
                            });
                            // TODO - lade places neu
//	            		var places = $scope.placesMap;
//	            		angular.forEach(places, function(value, key){
//	            			if(places[key]!=undefined){
//		            			places[key].forEach(function(value){
//							 		value.setMap(null)
//							 	});
//								delete $scope.placesMap[key];	
//								$scope.showPlaces(key);
//	            			}
//	            		});
                        });

                        //kartenausschnitt entsprechend anpassen, wenn viewport sich extern ändert (z.b. durch laden)
                        $listenerService.addChangeListener("viewport", "mapService", function (viewport) {
                            keepExistingMarkers = false;
                            if (angular.isArray(viewport) && viewport.length == 4) {
                                map.fitBounds(coordsToBounds(viewport));
                                map.setZoom(map.getZoom() + 1);
                            }
                        });

                        //zoomlevel entsprechend anpassen, wenn viewport sich extern ändert (z.b. durch laden)
                        $listenerService.addChangeListener("zoomlevel", "mapService", function (zoomlevel, alt, source) {
                            keepExistingMarkers = false;
                            if (zoomlevel >= 0)
                                map.setZoom(zoomlevel);
                        });

                        //markierungen anpassen, wenn sich suchergebnis ändert
                        $listenerService.addChangeListener("clusters", "mapService", function (clusters) {
                            if (keepExistingMarkers) {
                                //eine map anlegen, die uns später mitteilt, welche marken nicht mehr da sind und gelöscht werden sollen
                                var removeMap = {};
                                for (var key in markerMap) {
                                    removeMap[key] = 1;
                                }
                                var removeBoundaryMap = {};
                                for (var key in boundaryMap) {
                                    removeBoundaryMap[key] = 1;
                                }
                            } else {
                                //oder alle marken entfernen
                                for (var key in markerMap) {
                                    markerMap[key].setMap(null);
                                }
                                markerMap = {};
                                for (var key in boundaryMap) {
                                    boundaryMap[key].setMap(null);
                                }
                                boundaryMap = {};
                            }

                            angular.forEach(clusters, function (cluster) {
                                if (angular.isUndefined(cluster.location) || !angular.isNumber(cluster.location.lat) || !angular.isNumber(cluster.location.lon)) return;

                                if (cluster.type == "punkt") {
                                    //prüfen, ob schon vorhanden
                                    if (keepExistingMarkers && angular.isObject(markerMap[cluster.objektId])) {
                                        delete removeMap[cluster.objektId];
                                        return;
                                    }

                                    var color = getMarkerColor(currentAngebotsart);
                                    var label = cluster.preis > 1000000 ? $filter("number")(Math.round(cluster.preis / 100000) / 10) + "M€" : (cluster.preis > 1000 ? ($filter("number")(Math.round(cluster.preis / 100) / 10) + "T€") : (Math.round(cluster.preis) + "€"));

                                    var marker;
                                    if (cluster.preis > 0) {
                                        marker = new google.maps.Marker({
                                            position: new google.maps.LatLng(cluster.location.lat, cluster.location.lon),
                                            map: map,
                                            icon: createPinMarkerIcon(label, color, cluster.offline),
                                            zIndex: 1,
                                            dgoIsGroup: false,
                                            dgoIsOffline: cluster.offline,
                                            dgoLabel: label,
                                            dgoColor: color
                                        });
                                    } else {
                                        marker = new google.maps.Marker({
                                            position: new google.maps.LatLng(cluster.location.lat, cluster.location.lon),
                                            map: map,
                                            icon: createPinMarkerIcon(undefined, color, cluster.offline),
                                            zIndex: 1,
                                            dgoIsGroup: false,
                                            dgoIsOffline: cluster.offline,
                                            dgoLabel: undefined,
                                            dgoColor: color
                                        });
                                    }

                                    google.maps.event.addListener(marker, 'mouseover', function () {
                                        if (angular.isDefined(popupTimer)) {
                                            $timeout.cancel(popupTimer);
                                        }
                                        popupTimer = $timeout(function () {
                                            showInfo(map, cluster.angebotsart, cluster.objektId);
                                        }, 500);
                                    });
                                    google.maps.event.addListener(marker, 'mouseout', function () {
                                        if (angular.isDefined(popupTimer)) {
                                            $timeout.cancel(popupTimer);
                                        }
                                        popupTimer = $timeout(function () {
                                            hideInfo();
                                        }, 200);
                                    });
                                    google.maps.event.addListener(marker, 'click', function () {
                                        $sucheService.loadItem(cluster.angebotsart, cluster.objektId).then(function (data) {
                                            $listenerService.triggerChange("detailItemCollection", "mapService", [{
                                                id: data.id,
                                                angebotsart: data.angebotsart
                                            }]);
                                            $listenerService.triggerChange("detailItem", "mapService", data);
                                        });
                                    });

                                    markerMap[cluster.objektId] = marker;

                                } else if (cluster.type == "hauswolke") {
                                    //prüfen, ob schon vorhanden
                                    if (keepExistingMarkers && angular.isObject(markerMap[cluster.wolkenId])) {
                                        delete removeMap[cluster.wolkenId];
                                        delete removeBoundaryMap[cluster.wolkenId];
                                        return;
                                    }
                                    var color = getMarkerColor(currentAngebotsart);
                                    var markerWidth = getMarkerWidth(cluster.documents);
                                    //boundaries der Cluster
                                    var rectangle = new google.maps.Rectangle({
                                        strokeColor: '#000000',
                                        strokeOpacity: 0.9,
                                        strokeWeight: 0.3,
                                        fillOpacity: 0.0,
                                        editable: false,
                                        clickable: false,
                                        map: map,
                                        bounds: getBounds(cluster.location.geohash)
                                    });

                                    //Cluster marker
                                    var marker = new google.maps.Marker({
                                        position: new google.maps.LatLng(cluster.location.lat, cluster.location.lon),
                                        map: map,
                                        icon: createWolkeMarkerIcon(markerWidth, cluster.documents, color),
                                        zIndex: 1,
                                        dgoIsGroup: true,
                                        dgoWidth: markerWidth,
                                        dgoLabel: cluster.documents,
                                        dgoColor: color,
                                    });
                                    //wolkeninfo-popup
                                    google.maps.event.addListener(marker, 'click', function () {
                                        showWolkeInfo(cluster);
                                    });

                                    markerMap[cluster.wolkenId] = marker;
                                    boundaryMap[cluster.wolkenId] = rectangle;
                                }//end cluster.type==hauswolke
                            });//end foreach cluster

                            //die nicht mehr vorhandene marken und boundaries entfernen
                            if (keepExistingMarkers) {
                                for (var key in removeBoundaryMap) {
                                    boundaryMap[key].setMap(null);
                                    delete boundaryMap[key];
                                }
                                removeBoundaryMap = null;

                                for (var key in removeMap) {
                                    markerMap[key].setMap(null);
                                    delete markerMap[key];
                                }
                                removeMap = null;

                            }
                            keepExistingMarkers = false;
                        });

                        $listenerService.addChangeListener("suchart", "mapService", function (suchart) {
                            keepExistingMarkers = false;
                            currentSuchart = suchart;
                            updateReferenzobjektMarker(map);
                        });

                        $listenerService.addChangeListener("referenzobjekt", "mapService", function (referenzobjekt) {
                            keepExistingMarkers = false;
                            currentReferenzobjekt = referenzobjekt;
                            updateReferenzobjektMarker(map);
                        });

                        $listenerService.addChangeListener("spezialgebiete", "mapServiceControl", function (spezialgebiete) {
                            $scope.spezialgebieteMap = {};
                            if (angular.isArray(spezialgebiete)) {
                                for (var i = 0; i < spezialgebiete.length; i++) {
                                    $scope.spezialgebieteMap[spezialgebiete[i]] = true;
                                }
                            }
                        });

                        $listenerService.addChangeListener("uisettings", "mapServiceControl", function (uisettings) {
                            $scope.uisettings = uisettings;
                        });

                        $scope.toggleSpezialgebieteControlCollapsed = function () {
                            $scope.uisettings.spezialgebieteControlCollapsed = !$scope.uisettings.spezialgebieteControlCollapsed;
                            $listenerService.triggerChange("uisettings", "mapServiceControl", $scope.uisettings);
                            $timeout(function () {
                                recalculateControlMaxHeights(map);
                            }, 100);
                        };

                        $scope.toggleLegendeControlCollapsed = function () {
                            $scope.uisettings.legendeControlCollapsed = !$scope.uisettings.legendeControlCollapsed;
                            $listenerService.triggerChange("uisettings", "mapServiceControl", $scope.uisettings);
                            $timeout(function () {
                                recalculateControlMaxHeights(map);
                            }, 100);
                        };

                        $spezialgebieteService.getTypen().then(function (typen) {

                            //container für spezialgebiete und legenden controls
                            var content = [];
                            content.push('<div class="map-control-container">');


                            //spezialgebiete-control
                            content.push('<div id="map-control-gebiete" class="map-control map-control-gebiete {{!uisettings.spezialgebieteControlCollapsed ? \'map-control-open\' : \'\'}}">');
                            content.push('<div class="map-control-head" ng-click="toggleSpezialgebieteControlCollapsed()">Sonderkarten <i class="pull-right fa fa-fw {{uisettings.spezialgebieteControlCollapsed ? \'fa-caret-down\' : \'fa-caret-up\'}}"></i></div>');
                            content.push('<div class="map-control-content" ng-style="{\'max-height\':gebieteMaxHeight+\'px\'}">');
                            content.push('<div class="map-control-gebiet" ng-repeat="option in gebietstypen">');
                            content.push('<div>');
                            content.push('<a href="javascript:;" class="pull-right" ng-hide="spezialgebieteCounts[option.key]" ng-click="sonderkartenwunsch(option.namePlural)" tooltip-placement="left" uib-tooltip="{{!spezialgebieteCounts[option.key] ? \'Diese Sonderkarte steht demnächst zur Verfügung. Klicken Sie hier wenn Sie diese Karte wünschen.\' : \'\'}}">');
                            content.push('<i class="fa fa-fw fa-pencil-square-o"></i>');
                            content.push('</a>');
                            content.push('<a href="javascript:;" ng-class="{\'disabled\':!spezialgebieteCounts[option.key]}" ng-click="!spezialgebieteCounts[option.key] || toggleSpezialgebiet(option.key)" tooltip-placement="left" uib-tooltip="{{!spezialgebieteCounts[option.key] ? \'Diese Sonderkarte steht im aktuellen Kartenausschnitt nicht zur Verfügung\' : \'\'}}">');
                            content.push('<i class="fa fa-fw {{spezialgebieteMap[option.key] && spezialgebieteCounts[option.key] ? \'fa-check-square\' : \'fa-square-o\'}}"></i> ');
                            content.push('<span style="color:{{option.color}}">{{option.namePlural}}</span>');
                            content.push('</a>');
                            content.push('</div>');
                            content.push('</div>');
                            content.push('</div>');
                            content.push('</div>');

                            var control = angular.element(content.join(""));

                            $scope.gebietstypen = typen;

                            $scope.toggleSpezialgebiet = function (key) {
                                $scope.spezialgebieteMap[key] = !$scope.spezialgebieteMap[key];
                                var spezialgebiete = [];
                                for (var key in $scope.spezialgebieteMap) {
                                    if ($scope.spezialgebieteMap[key]) {
                                        spezialgebiete.push(key);
                                    }
                                }

                                if (spezialgebiete.length == 0) spezialgebiete = undefined;
                                $listenerService.triggerChange("spezialgebiete", "mapServiceControl", spezialgebiete);
                            };
                            var geocoder = new google.maps.Geocoder;
                            $scope.sonderkartenwunsch = function (sonderkarte) {
                                var address = undefined;
                                geocoder.geocode({'location': map.getCenter()}, function (results, status) {
                                    if (status === google.maps.GeocoderStatus.OK) {
                                        if (results[1]) {
                                            address = results[1];
                                            $spezialgebieteService.sonderkartenwunsch(sonderkarte, address);
                                        }
                                    }
                                });
                            };

                            //legenden-control
                            content.push('<div ng-show="legenden.length>0 && !legendeNotVisible" id="map-control-legende" class="map-control map-control-legende {{!uisettings.legendeControlCollapsed ? \'map-control-open\' : \'\'}}">');
                            content.push('<div class="map-control-head" ng-click="toggleLegendeControlCollapsed()">Legenden <i class="pull-right fa fa-fw {{uisettings.legendeControlCollapsed ? \'fa-caret-down\' : \'fa-caret-up\'}}"></i></div>');
                            content.push('<div class="map-control-content" ng-style="{\'max-height\':legendeMaxHeight+\'px\'}">');
                            content.push('<div class="map-control-legend" ng-repeat="legende in legenden" ng-class="{\'collapsed\':collapsed}">');
                            content.push('<div class="btn btn-default btn-xs btn-grey" ng-click="collapsed=!collapsed">{{legende.key}} <i class="pull-right fa fa-fw fa-caret-down" ng-show="collapsed"></i><i class="pull-right fa fa-fw fa-caret-up" ng-show="!collapsed"></i></div>');
                            content.push('<div class="bordered" ng-hide="collapsed"><img ng-src="{{legende.value}}" class="img-responsive"></img></div>');
                            content.push('</div>');
                            content.push('</div>');
                            content.push('</div>');
                            content.push('</div>');

                            content.push('</div>');
                            var control = angular.element(content.join(""));

                            $compile(control)($scope);
                            map.controls[google.maps.ControlPosition.TOP_RIGHT].push(control[0]);

                            $timeout(function () {
                                google.maps.event.addListener(map, "resize", function () {
                                    recalculateControlMaxHeights(map);
                                });
                                recalculateControlMaxHeights(map);
                            }, 100);


                            //quellen-control
                            var content = [];
                            content.push('<div class="quellinfo" ng-show="quellen.length>0">');
                            content.push('<div ng-repeat="quelle in quellen">');
                            content.push('Quelle {{quelle.typname}}: <a href="{{quelle.url}}" target="_blank">{{quelle.qname}}</a><br/>');
                            content.push('</div>');
                            content.push('</div>');
                            var control = angular.element(content.join(""));

                            $compile(control)($scope);
                            map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(control[0]);
                        });
                    });

                    $listenerService.addChangeListener("spezialgebiete", "mapService", function (spezialgebiete) {
                        currentSpezialgebiete = spezialgebiete;
                        console.log(currentSpezialgebiete);
                        loadSpezialgebieteImmediately(map);
                    });

                    $listenerService.addChangeListener("news", "mapService", function (newse) {
                        updateNewsMarker(map, newse);
                    });

                    google.maps.event.addListenerOnce(map, 'idle', function () {
                        var func = function () {
                            repaintMap(map);
                            angular.element($window).one('resize', func);
                        };
                        func();
                    });

                } else if (mapType == "start") {
                    map = new google.maps.Map(mapRootElement, {
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        streetViewControl: false,
                        mapTypeControl: false,
                        zoomControl: false,
                    });

                    //unsere eigenen listener registrieren (aber erst, nachdem die map sich selbst intialisiert hat)
                    google.maps.event.addListenerOnce(map, 'idle', function () {

                        //kartenausschnitt entsprechend anpassen, wenn viewport sich extern ändert (z.b. durch laden)
                        $listenerService.addChangeListener("viewport", "mapService", function (viewport) {
                            keepExistingMarkers = false;
                            if (angular.isArray(viewport) && viewport.length == 4) {
                                map.fitBounds(coordsToBounds(viewport));
                                map.setZoom(map.getZoom() + 1);
                            }
                        });
                    });
                } else if (mapType == "object") {
                    map = new google.maps.Map(mapRootElement, {
                        mapTypeId: google.maps.MapTypeId.SATELLITE,
                        zoom: 15
                    });

                    //unsere eigenen listener registrieren (aber erst, nachdem die map sich selbst intialisiert hat)
                    google.maps.event.addListenerOnce(map, 'idle', function () {
                        console.log(1);

                        google.maps.event.addListener(map, "zoom_changed", function () {
                            console.log(2);
                            if (zoomListenerIsDisabled) return;

                            //alle markierungen entfernen (werden eh neu geladen, nach dem zoom)
                            for (var key in markerMap) {
                                markerMap[key].setMap(null);
                            }
                            markerMap = {};

                            for (var key in boundaryMap) {
                                boundaryMap[key].setMap(null);
                            }
                            boundaryMap = {};
                            keepExistingMarkers = false;

                            //wir warten bis der zoom fertig ist
                            google.maps.event.addListenerOnce(map, "idle", function () {
                                console.log(3);
                                // $listenerService.triggerChange("viewport", "mapService", boundsToCoords(map.getBounds()));
                                updateViewport(map);

                                // $drivebysService.retriggerMap($sessionStorage.driveById, boundsToCoords(map.getBounds()));

                                // loadSpezialgebieteWithTimeout(map);
                                // $listenerService.triggerChange("zoomlevel", "mapService", map.getZoom());
                            });
                        });

                        //wenn man die map verschiebt, wird der viewport aktualisiert
                        google.maps.event.addListener(map, "dragend", function () {
                            console.log(4);
                            keepExistingMarkers = true;

                            // $drivebysService.retriggerMap($sessionStorage.driveById, boundsToCoords(map.getBounds()));
                            updateViewport(map);
                            // loadSpezialgebieteWithTimeout(map);
                        });

                        /*$listenerService.addChangeListener("viewport", "mapService", function (viewport) {
                            keepExistingMarkers = false;
                            if (angular.isArray(viewport) && viewport.length == 4) {
                                map.fitBounds(coordsToBounds(viewport));
                                map.setZoom(map.getZoom() + 1);
                            }
                        });


                        //zoomlevel entsprechend anpassen, wenn viewport sich extern ändert (z.b. durch laden)
                        $listenerService.addChangeListener("zoomlevel", "mapService", function (zoomlevel, alt, source) {
                            keepExistingMarkers = false;
                            if (zoomlevel >= 0)
                                map.setZoom(zoomlevel);
                        });
*/

                        $listenerService.addChangeListener("drivebyDetailsneue", "mapService", function (driveby) {
                            updateDrivebyMarker(map, driveby);
                        });

                        //kartenausschnitt entsprechend anpassen, wenn object sich geändert ändert
                        $listenerService.addChangeListener("detailItemneue", "mapService", function (item) {
                            console.log("detailItemneue");
                            console.log(item);
                            if (angular.isObject(item)) {

                                item = item.objektImBauVorschau;



                                angular.forEach(item, function (items) {
                                    var icon, title, zoomlevel;
                                    var color = getMarkerColor(items.angebotsart);
                                    icon = createPinMarkerIcon(undefined, color, false);
                                    title = "Position: PLZ-genau";


                                    /*if (item.geoAccuracy == "PlzOrt" || item.geoAccuracy == "Ortsteil" || item.geoAccuracy == "Stadtteil" || item.geoAccuracy == "Stadtbezirk" ||
                                     item.adresse.genauigkeit == "PlzOrt" || item.adresse.genauigkeit == "Ortsteil" || item.adresse.genauigkeit == "Stadtteil" ||
                                     item.adresse.genauigkeit == "Stadtbezirk") {
                                     icon = createWolkeMarkerIcon(24, undefined, color);
                                     title = "Position: PLZ-genau";
                                     zoomlevel = 15;
                                     } else if (item.geoAccuracy == "Strasse" || item.adresse.genauigkeit == "Strasse") {
                                     icon = createWolkeMarkerIcon(24, undefined, color);
                                     title = "Position: straßengenau";
                                     zoomlevel = 17;
                                     } else if (item.geoAccuracy == "Hausnummer" || item.adresse.genauigkeit == "Hausnummer") {
                                     icon = createPinMarkerIcon(undefined, color, false);
                                     title = undefined;
                                     zoomlevel = 18;
                                     }*/

                                    if (icon) {
                                        var latlon = new google.maps.LatLng(items.location.lat, items.location.lon);

                                        //google.maps.event.trigger(map, 'resize');
                                        //map.setCenter(center);
                                        //map.setZoom(zoomlevel);

                                        var objektMarker = new google.maps.Marker({
                                            position: latlon,
                                            map: map,
                                            icon: icon,
                                            title: title,
                                            zIndex: 1,
                                            dgoIsGroup: false,
                                            dgoIsOffline: false,
                                            dgoLabel: undefined,
                                            dgoColor: color
                                        });


                                        markerMap[items.location.geohash] = objektMarker;

                                    } else {
                                        if (angular.isObject(objektMarker)) {
                                            objektMarker.setMap(null);
                                        }
                                    }
                                });

                                disableZoomListener(false);
                            } else {
                                if (angular.isObject(objektMarker)) {
                                    objektMarker.setMap(null);
                                }
                            }
                        });
                    });
                }

                if (angular.isDefined(map)) {
                    map.mapId = mapId;
                    maps[mapId] = map;

                    //cleanup after destroying
                    angular.element(mapRootElement).on("$destroy", function () {
                        //TODO: clear marker and listeners
                        google.maps.event.clearInstanceListeners(map);
                        delete maps[mapId];
                    });
                }
            };


/*
            var detailsItem = function(driveby) {
                updateDrivebyMarker(map, driveby);
            };
*/

            /*var detailItem = function(item) {


                console.log(driveby);
                console.log('map'  + map );

                if (angular.isObject(item)) {

                    item = item.objektImBauVorschau;
                    
                    angular.forEach(item, function (items) {
                        var icon, title, zoomlevel;
                        var color = getMarkerColor(items.angebotsart);
                        icon = createPinMarkerIcon(undefined, color, false);
                        title = "Position: PLZ-genau";
                        
                        if (icon) {
                            var latlon = new google.maps.LatLng(items.location.lat, items.location.lon);
                            
                            var objektMarker = new google.maps.Marker({
                                position: latlon,
                                map: map,
                                icon: icon,
                                title: title,
                                zIndex: 1,
                                dgoIsGroup: false,
                                dgoIsOffline: false,
                                dgoLabel: undefined,
                                dgoColor: color
                            });


                            markerMap[items.location.geohash] = objektMarker;

                        } else {
                            if (angular.isObject(objektMarker)) {
                                objektMarker.setMap(null);
                            }
                        }
                    });

                    disableZoomListener(false);
                } else {
                    if (angular.isObject(objektMarker)) {
                        objektMarker.setMap(null);
                    }
                }
            };*/


            $listenerService.addChangeListener("angebotsart", "mapService", function (angebotsart) {
                keepExistingMarkers = false;
                currentAngebotsart = angebotsart;
            });

            $listenerService.addChangeListener("suchoptionen region areas", "mapService", function () {
                keepExistingMarkers = false;
            });

            var findMarker = function (item) {
                if (angular.isUndefined(item)) return null;

                //suche nach direktem marker für dieses icon
                //var itemId = item.id;
                var itemId = item.location.geohash;

                if (angular.isUndefined(itemId)) return null;
                var marker = markerMap[itemId];
                if (angular.isDefined(marker)) return marker;

                //ansonsten den dazugehörigen cluster suchen
                if (angular.isUndefined(item.location)) return null;
                var geohash = item.location.geohash;
                if (angular.isUndefined(geohash)) return null;
                for (var i = geohash.length; i > 1; i--) {
                    var clusterId = geohash.substring(0, i);
                    var marker = markerMap[clusterId];
                    if (angular.isDefined(marker)) return marker;
                }
            };

            var highlightItem = function (item) {
                console.log('highlightItem');

                unhighlightAllItems();

                var marker = findMarker(item);
                if (marker == null) return;
                var icon = marker.getIcon();
                if (marker.dgoIsGroup) {
                    icon = createWolkeMarkerIcon(marker.dgoWidth, marker.dgoLabel, "#66a11f");
                } else {
                    icon = createPinMarkerIcon(marker.dgoLabel, "#66a11f", marker.dgoIsOffline);
                }
                marker.setIcon(icon);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);

                map.setCenter(marker.getPosition());


            };

            var unhighlightAllItems = function() {
                console.log('unhighlightAllItems');
                console.log(markerMap);
                angular.forEach(markerMap, function(marker) {
                    var icon = marker.getIcon();
                    if (marker.dgoIsGroup) {
                        icon = createWolkeMarkerIcon(marker.dgoWidth, marker.dgoLabel, marker.dgoColor);
                    } else {
                        icon = createPinMarkerIcon(marker.dgoLabel, marker.dgoColor, marker.dgoIsOffline);
                    }

                    marker.setIcon(icon);
                    marker.setAnimation(null);
                    marker.setZIndex(1);

                });
            };

            var unhighlightItem = function (item) {
                var marker = findMarker(item);
                if (marker == null) return;
                var icon = marker.getIcon();
                if (marker.dgoIsGroup) {
                    icon = createWolkeMarkerIcon(marker.dgoWidth, marker.dgoLabel, marker.dgoColor);
                } else {
                    icon = createPinMarkerIcon(marker.dgoLabel, marker.dgoColor, marker.dgoIsOffline);
                }
                marker.setIcon(icon);
                marker.setAnimation(null);
                marker.setZIndex(1);
            };

            var info = new google.maps.InfoWindow({disableAutoPan: true});
            var gebietInfo = new google.maps.InfoWindow({disableAutoPan: false});
            var newsInfo = new google.maps.InfoWindow({disableAutoPan: false});

            var showNewsInfo = function (map, news, ev) {
                var marker = newsMap[news.newsId];
                if (angular.isDefined(marker)) {
                    marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                    $scope.n = news;
                    var content = [];
                    content.push("<div class=\"news-item\">");
                    content.push("<h4>{{n.title}}</h4>");
                    content.push("<p class=\"news-text\">{{n.teaser}}</p>");
                    content.push("<p class=\"news-text\">{{n.text}}</p>");
                    content.push("<div class=\"data-n-link\"><a href=\"{{n.externalLink}}\" class=\"pull-right\" ng-show=\"n.externalLink\" target=\"_blank\">");
                    content.push("<i class=\"fa fa-fw fa-chevron-circle-right\"></i> mehr dazu hier</a>{{n.createDate | date:'dd.MM.yyyy'}}</div>");
                    content.push("<div class=\"tags\"><span class=\"text-small\" ng-repeat=\"keyword in n.keywords\"><i class=\"fa fa-fw fa-tag text-lightgrey\"></i>{{keyword}}</span></div>");
                    content.push("</div>");

                    var control = angular.element(content.join(""));
                    $compile(control)($scope);
                    $timeout(function () {
                        newsInfo.setContent(control[0]);
                        newsInfo.open(map, marker);
                    }, 100);
                }
            };

            var showInfo = function (map, angebotsart, itemId) {
                var marker = markerMap[itemId];
                if (angular.isDefined(marker)) {
                    marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                    $sucheService.loadItem(angebotsart, itemId).then(function (data) {
                        var content = [];
                        var adresse = [];
                        if (data.adresse.plz && data.adresse.ort) adresse.push(data.adresse.plz + " " + data.adresse.ort);
                        if (data.adresse.strasse) adresse.push(data.adresse.strasse + (data.adresse.hausnummer ? " " + data.adresse.hausnummer : ""));
                        content.push('<b>' + adresse.join("<br />") + '</b>');
                        if (data.objekttyp)    content.push('<div>' + $scope.constants.map.objekttyp[data.objekttyp] + '</div>');
                        if (data.preisProQm > 0)    content.push('<div>' + $filter("number")(data.preisProQm, currentAngebotsart == "miete" ? 2 : 0) + '&nbsp;€/m²</div>');
                        if (data.preis > 0 && currentAngebotsart == "zvg")    content.push('<div>' + $filter("number")(data.preis, 0) + '&nbsp;€</div>');
                        if (data.wohnflaeche > 0) content.push('<div>' + $filter("number")(data.wohnflaeche, 0) + ' m²</div>');
                        if (data.zimmer > 0)        content.push('<div>' + $filter("number")(data.zimmer) + ' Zimmer</div>');
                        if (data.wohneinheiten > 0) {
                            content.push('<div>' + $filter("number")(data.wohneinheiten) + ' Wohneinheit' + (data.wohneinheiten > 1 ? "en" : "") + '</div>');
                        }
                        if (data.minWohnflaecheProWE > 0 || data.maxWohnflaecheProWE > 0) {
                            content.push('<div>' + (data.minWohnflaecheProWE != null ? $filter("unit")($filter("number")(data.minWohnflaecheProWE), " - ") : "") + $filter("unit")($filter("number")(data.maxWohnflaecheProWE), "m²") + '</div>');
                        }
                        if (data.bauende > 0) {
                            content.push('<div>' + $filter("date")(data.bauende, "yyyy") + '</div>');
                        }
                        info.setContent(content.join(""));
                        info.open(map, marker);
                    });
                }
            };

            var hideInfo = function () {
                if (angular.isDefined(popupTimer)) {
                    $timeout.cancel(popupTimer);
                }
                info.close();
            };

            var showWolkeInfo = function (cluster) {
                var wolkenId = cluster.wolkenId;
                var marker = markerMap[wolkenId];
                if (angular.isDefined(marker)) {
                    $listenerService.triggerChange("detailCluster", "mapService", cluster);
                }
            };

            var findGebieteOnLocation = function (latLng) {
                var gebietIds = [];
                angular.forEach(gebieteTypenMap, function (gebiete) {
                    angular.forEach(gebiete, function (shape) {
                        if (shape.getMap() != null && google.maps.geometry.poly.containsLocation(latLng, shape)) {
                            gebietIds.push(shape.gebietId);
                        }
                    });
                });
                return gebietIds;
            };

            var showGebietInfo = function (map, ev) {
                var bounds = angular.copy(map.getBounds());
                var gebietIds = findGebieteOnLocation(ev.latLng);
                $spezialgebieteService.getGebieteForIds(gebietIds).then(function (gebiete) {
                    $spezialgebieteService.getTypenMap().then(function (typenMap) {
                        var content = [];
                        angular.forEach(gebiete, function (gebiet) {
                            var gebietsTyp = typenMap[gebiet.typ];
                            if (content.length > 0) content.push('<div>&#160;</div>');
                            content.push('<div style="border-left: 3px solid ' + gebietsTyp.color + '; padding-left: 5px">');
                            content.push('<div style="color:' + gebietsTyp.color + '"><b>' + gebietsTyp.name + '</b></div>');
                            content.push('<div><b>' + gebiet.name + '</b></div>');
                            content.push('<div>' + gebiet.description + '</div>');
                            //sortieren
                            var attrKeys = [];
                            for (var key in gebiet.attribute) {
                                attrKeys[gebiet.attribute[key].position] = key;
                            }
                            //ausgeben
                            for (var key in attrKeys) {
                                var attr = gebiet.attribute[attrKeys[key]];
                                var value = attr.tblname;
                                var linktext = attr.text;
                                if (attr.typ == "date") value = (value != null) ? $filter("date")(new Date(value)) : "";
                                else if (attr.typ == "link") value = (value != null && value.length > 4 && linktext != null && linktext.length > 0) ? '<a href="' + value + '" target="_blank">' + linktext + '</a>' : "";
                                if (value != null && angular.isDefined(value) && value.length > 0) content.push('<div>' + attr.dsplName + ': ' + value + '</div>');
                            }
                            content.push('</div>');
                        });
                        gebietInfo.setContent(content.join(""));
                        gebietInfo.setPosition(ev.latLng);
                        gebietInfo.open(map);

                        google.maps.event.addListenerOnce(map, 'idle', function () {
                            if (!angular.equals(map.getBounds(), bounds)) {
                                google.maps.event.trigger(map, 'dragend');
                            }
                        });
                    });
                });
            };

            var updateReferenzobjektMarker = function (map) {
                var showMarker = currentSuchart == "referenzobjekt" && angular.isObject(currentReferenzobjekt) && angular.isArray(currentReferenzobjekt.location);

                if (showMarker) {
                    var position = new google.maps.LatLng(currentReferenzobjekt.location[0], currentReferenzobjekt.location[1]);
                    if (angular.isObject(referenzObjektMarker)) {
                        referenzObjektMarker.setMap(map);
                        var positionChanged = position.lat() != referenzObjektMarker.getPosition().lat() || position.lng() != referenzObjektMarker.getPosition().lng();
                        if (positionChanged) {
                            referenzObjektMarker.setPosition(position);
                            map.setCenter(referenzObjektMarker.getPosition());
                            google.maps.event.trigger(map, 'dragend');
                        }
                    } else {
                        referenzObjektMarker = new google.maps.Marker({
                            position: position,
                            map: map,
                            icon: createPinMarkerIcon(undefined, "#407780", false, 1.5),
                            clickable: false,
                        });
                        map.setCenter(referenzObjektMarker.getPosition());
                        google.maps.event.trigger(map, 'dragend');
                    }
                } else {
                    if (angular.isObject(referenzObjektMarker)) {
                        referenzObjektMarker.setMap(null);
                    }
                }
            };

            var removeDrivebyMarker = function() {
                angular.forEach(newsMap, function (objektMarker) {
                    objektMarker.setMap(null);
                });
            };

            var resetDrivebyMarker = function(driveby) {
                var drivebyLatlon = new google.maps.LatLng(driveby.lon, driveby.lat);

                if (angular.isObject(map)) {
                    map.setCenter(drivebyLatlon);
                    updateViewport(map);
                }
            };

            var updateDrivebyMarker = function(map, driveby) {
                removeDrivebyMarker();
                var color =  "green";
                var drivebyLatlon = new google.maps.LatLng(driveby.lon, driveby.lat);

                if (angular.isObject(map)) {

                    console.log("updateDrivebyMarker");

                    map.setZoom(12);
                    map.setCenter(drivebyLatlon);

                    var objektMarker = new google.maps.Marker({
                        position: drivebyLatlon,
                        map: map,
                        icon: createPinMarkerIcon(undefined, color, false),
                        title: "Position: PLZ-genau",
                        zIndex: 1,
                        dgoIsGroup: false,
                        dgoIsOffline: false,
                        dgoLabel: undefined,
                        dgoColor: "green"
                    });

                    newsMap[driveby.geohash] = objektMarker;
                }
            };

            var updateNewsMarker = function (map, newse) {
                //alle marken entfernen
                angular.forEach(newsMap, function (newsMarker) {
                    newsMarker.setMap(null);
                });
                angular.forEach(newse, function (news) {
                    if (angular.isObject(news.location)) {
                        var newsMarker = new MarkerWithLabel({
                            position: new google.maps.LatLng(news.location.lat, news.location.lon),
                            map: map,
//						icon: createPinMarkerIcon(undefined,"green",false),
                            icon: ' ',
                            labelContent: '<i class=\"fa fa-newspaper-o\"></i>',
                            labelAnchor: new google.maps.LatLng(news.location.lat, news.location.lon),
                            labelClass: 'map-marker-news-label',
                            clickable: true
                        });
                        newsMap[news.newsId] = newsMarker;
                        google.maps.event.addListener(newsMarker, 'click', function (ev) {
                            showNewsInfo(map, news, ev);
                        });
                    }
                });
            };

            var getMap = function (mapId) {
                return maps[mapId];
            };

            var updateViewport = function (map) {
                keepExistingMarkers = true;
                $drivebysService.retriggerMap('neue', boundsToCoords(map.getBounds()));
                // $listenerService.triggerChange("viewport", "mapService", boundsToCoords(map.getBounds()));
            };

            var loadSpezialgebieteImmediately = function (map) {
                loadSpezialgebiete(map);
            };
            var loadSpezialgebieteWithTimeout = function (map) {
                currentSpezialgebieteTimer = $timeout(function () {
                    loadSpezialgebiete(map);
                }, 500);
            };

            var findLayerIndex = function (map, typ) {
                var arr = map.overlayMapTypes.getArray();
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].typ == typ) return i;
                }
                return -1;
            };

            $scope.toggleLegendenControlCollapsedControlCollapsed = function () {
                $scope.uisettings.legendenControlCollapsedControlCollapsed = !$scope.uisettings.legendenControlCollapsedControlCollapsed;
                $listenerService.triggerChange("uisettings", "mapServiceControl", $scope.uisettings);
            };

            var loadSpezialgebiete = function (map) {
                if (!maps[map.mapId]) return; //map is not visible anymore

                if (angular.isDefined(currentSpezialgebieteTimer)) {
                    $timeout.cancel(currentSpezialgebieteTimer);
                }
                $spezialgebieteService.getTypenMap().then(function (typenMap) {
                    $spezialgebieteService.getGebieteForViewport().then(function (spezialgebieteData) {
                        $scope.spezialgebieteCounts = angular.isObject(spezialgebieteData) ? spezialgebieteData.counts : {};
                        for (var typ in gebieteTypenMap) {
                            angular.forEach(gebieteTypenMap[typ], function (shape) {
                                shape.setMap(null);
                            });
                            delete gebieteTypenMap[typ];

                        }
                        for (var typ in typenMap) {
                            var visible = angular.isArray(currentSpezialgebiete) && currentSpezialgebiete.indexOf(typ) > -1;
                            if (!visible || !spezialgebieteData.counts[typ]) {
                                var index = findLayerIndex(map, typ);
                                if (index >= 0) {
                                    if (typ === "bodenrichtwert") {
                                        google.maps.event.removeListener(spezialgebieteWMSListener.bodenrichtwert);
                                    }
                                    map.overlayMapTypes.removeAt(index);
                                }
                            }
                        }

                        if (angular.isObject(spezialgebieteData)) {
                            var legendenMap = {},
                                quellenMap = {};

                            angular.forEach(spezialgebieteData.layers, function (layerData, typ, q) {
                                //layerkarte
                                if (findLayerIndex(map, typ) < 0) {
                                    var layer = new google.maps.ImageMapType({
                                        getTileUrl: function (coord, zoom) {
                                            var tilesPerGlobe = 1 << zoom;
                                            var x = coord.x % tilesPerGlobe;
                                            if (x < 0) {
                                                x = tilesPerGlobe + x;
                                            }
                                            // Wrap y (latitude) in a like manner if you want to enable vertical infinite scroll
                                            return layerData.proxyPath + "/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
                                        },
                                        tileSize: new google.maps.Size(256, 256),
                                        name: "Tiles",
                                        isPng: true,
                                        opacity: 0.5,
                                        maxZoom: 18
                                    });
                                    layer.typ = typ;
                                    map.overlayMapTypes.push(layer);

                                    if (typ === "bodenrichtwert") {
                                        var infowindow = new google.maps.InfoWindow({
                                            content: ''
                                        });
                                        var overlay = new google.maps.OverlayView();
                                        overlay.draw = function () {
                                        };

                                        overlay.setMap(map);
                                        spezialgebieteWMSListener.bodenrichtwert = map.addListener('click', function (e) {
                                            var width = 5;
                                            var height = 5;
                                            var x = 0;
                                            var y = 0;
                                            var sw = overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(e.pixel.x, e.pixel.y + height), true);
                                            var ne = overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(e.pixel.x + width, e.pixel.y), true);

                                            var bounds = new google.maps.LatLngBounds(sw, ne); //Southwest, NorthEast
                                            bounds = bounds.toUrlValue();
                                            var url =
                                                'https://mp.geomap.immo/service?layers=brw&query_layers=brw&styles=&service=WMS&format=image/png&request=GetFeatureInfo&version=1.3.0&crs=EPSG:4326&info_format=text/plain';
                                            url = url + '&bbox=' + bounds + '&i=' + x + '&j=' + y + '&width=' + width + '&height=' + height;
                                            infowindow.setContent('');
                                            $scope.dm = {};
                                            $http({
                                                method: 'GET',
                                                url: url
                                            }).then(function successCallback(response) {
                                                var brw = response.data;
                                                var split = brw.split("\n");
                                                $scope.dm = split;

                                                var content = '<bodenrichtwerte></bodenrichtwerte>';
                                                var control = angular.element(content);
                                                $compile(control)($scope);
                                                $timeout(function () {
                                                    infowindow.setPosition(e.latLng);
                                                    infowindow.setContent(control[0]);
                                                    infowindow.open(map);
                                                }, 100);

                                            }, function errorCallback(response) {
                                            });
                                        });
                                    }
                                }
                                //Quellen
                                var quellen = [];
                                angular.forEach(layerData.quelle, function (value, key) {
                                    quellen.push({
                                        qname: key,
                                        url: value,
                                        typ: typ
                                    });
                                });
                                if (quellen.length > 0) {
                                    quellenMap[typ] = quellen;
                                }

                                //Legenden
                                var legenden = [];
                                angular.forEach(layerData.legends, function (value, key) {
                                    if (value) {
                                        legenden.push({key: key, value: value});
                                    }
                                });
                                if (legenden.length > 0) {
                                    legendenMap[typ] = legenden;
                                }
                            });

                            angular.forEach(spezialgebieteData.gebiete, function (gebietData, typ) {
                                //polygonkarte
                                var gebieteMap = gebieteTypenMap[typ];
                                if (!gebieteMap) {
                                    gebieteMap = {};
                                    gebieteTypenMap[typ] = gebieteMap;
                                }
                                var color = typenMap[typ].color;

                                if (angular.isArray(gebietData.gebiete)) {
                                    angular.forEach(gebietData.gebiete, function (gebiet) {
                                        if (!angular.isObject(shape)) {
                                            var polygons = gebiet.c;
                                            var decodedPolys = [];
                                            var shapeId = index + "-" + gebiet.id;
                                            var shape = gebieteMap[shapeId];
                                            angular.forEach(polygons, function (polygon, index) {
                                                decodedPolys.push(google.maps.geometry.encoding.decodePath(polygon));
                                            });
                                            shape = new google.maps.Polygon({
                                                paths: decodedPolys,
                                                fillColor: color,
                                                fillOpacity: 0.3,
                                                strokeColor: color,
                                                strokeWeight: 1,
                                                zIndex: 1,
                                                clickable: true
                                            });
                                            shape.gebietId = gebiet.id;
                                            google.maps.event.addListener(shape, 'click', function (ev) {
                                                showGebietInfo(map, ev);
                                            });
                                            gebieteMap[shapeId] = shape;
                                            var visible = angular.isArray(currentSpezialgebiete) && currentSpezialgebiete.indexOf(typ) > -1;
                                            gebieteMap[shapeId].setMap(visible ? map : null);
                                        }
                                    });
                                }

                                //Quellen
                                var quellen = [];
                                angular.forEach(gebietData.quelle, function (value, key) {
                                    quellen.push({
                                        qname: key,
                                        url: value,
                                        typ: typ
                                    });
                                });
                                if (quellen.length > 0) {
                                    quellenMap[typ] = quellen;
                                }
                            });

                            //nun quellen und legenden in der korrekten reihenfolge anzeigen
                            $scope.legenden = [];
                            $scope.quellen = [];

                            for (var typ in typenMap) {
                                var visible = angular.isArray(currentSpezialgebiete) && currentSpezialgebiete.indexOf(typ) > -1;
                                if (visible) {
                                    angular.forEach(legendenMap[typ], function (legende) {
                                        $scope.legenden.push(legende);
                                    });
                                    angular.forEach(quellenMap[typ], function (quelle) {
                                        quelle.typname = typenMap[typ].name;
                                        $scope.quellen.push(quelle);
                                    });
                                }
                            }

                        }
                    });
                });
            };


            var repaintMap = function (map, keepCenter) {
                var center = map.getCenter();
                $timeout(function () {
                    google.maps.event.trigger(map, 'resize');
                    if (keepCenter) {
                        map.setCenter(center);
                    }
                    updateViewport(map);
                }, 100);
            };

            var getMarkerWidth = function (label) {
                return Math.max(26, label ? ("" + label).length * 10 : 0);
            };

            var getMarkerColor = function (angebotsart) {
                if (angebotsart == "miete") {
                    return "#5781fc";
                } else if (angebotsart == "kauf") {
                    return "#fc6355";
                } else if (angebotsart == "objekteimbau") {
                    return "#ff9c00";
                } else if (angebotsart == "zvg") {
                    return "#951b81";
                }
            }

            var iconCache = {}; //cached die fertige canvas-url

            function createWolkeMarkerIcon(width, label, color) {
                var iconId = "wolke-" + width + "-" + color + "-" + label;
                if (!iconCache[iconId]) {
                    var realWidth = width - 2;

                    var canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = width;

                    var centerX = width / 2;
                    var centerY = width / 2;
                    var radius = realWidth / 2;

                    var context = canvas.getContext("2d");
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.fillStyle = color;
                    context.strokeStyle = "rgba(0,0,0,1)";
                    context.beginPath();
                    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                    context.fill();
                    context.stroke();

                    if (label) {
                        var context = canvas.getContext("2d");
                        context.fillStyle = "rgba(0,0,0,1)";
                        context.font = "bold 12px sans-serif";
                        context.textAlign = "center";
                        context.textBaseline = "middle";
                        context.fillText(label, centerX, centerY);
                    }
                    iconCache[iconId] = {
                        url: canvas.toDataURL(),
                        size: new google.maps.Size(canvas.width, canvas.height),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(Math.round(canvas.width / 2), Math.round(canvas.height / 2))
                    };
                }
                return iconCache[iconId];
            }

            function createPinMarkerIcon(label, color, offline, scale) {
                if (!scale) scale = 1;
                var iconId = "pin-" + color + "-" + offline + "-" + scale + "-" + label;
                if (!iconCache[iconId]) {
                    var width = Math.round(24 * scale);
                    var height = Math.round(32 * scale);
                    var canvas = document.createElement("canvas");
                    canvas.width = label ? width + 36 : width;
                    canvas.height = label ? height + 18 : height;

                    var pinLeft = Math.round((canvas.width - width) / 2 + width / 2);

                    var context = canvas.getContext("2d");
                    context.globalAlpha = offline ? 0.5 : 1;
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.fillStyle = color;
                    context.strokeStyle = "rgba(0,0,0,1)";
                    context.beginPath();
                    context.arc(pinLeft + 2, (width / 2), (width / 2) - 2, 0.3, Math.PI - 0.3, true);
                    context.lineTo(pinLeft + 2, height);
                    context.closePath();
                    context.fill();
                    context.stroke();

                    if (label) {
                        var labelWidth = Math.min(54, (("" + label).length * 7) + 6);
                        var labelHeight = 16;
                        var labelOffset = 33;
                        context.fillStyle = "rgba(255,255,255,0.9)";
                        context.fillRect(Math.round(canvas.width - labelWidth) / 2, labelOffset, labelWidth, labelHeight);
                        context.strokeStyle = "rgba(0,0,0,0.5)";
                        context.strokeRect(Math.round((canvas.width - labelWidth) / 2) + 0.5, labelOffset - 0.5, labelWidth, labelHeight);
                        context.font = "bold 12px sans-serif";
                        context.fillStyle = "#000000";
                        context.textAlign = "center";
                        context.textBaseline = "middle";
                        context.fillText(label, Math.round(((canvas.width - labelWidth) / 2) + (labelWidth / 2)), Math.floor(labelOffset + (labelHeight / 2)));
                    }
                    iconCache[iconId] = {
                        url: canvas.toDataURL(),
                        size: new google.maps.Size(canvas.width, canvas.height),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(Math.round(canvas.width / 2), height)
                    };
                }
                return iconCache[iconId];
            }

            var recalculateControlMaxHeights = function (map) {
                var gebieteControl = document.getElementById("map-control-gebiete");
                //map-höhe - sonderkarte - legendenheader (32) - margins (3*10) - plusminuscontrol (79)
                //var gebieteControlHeight=
                var legendeMaxHeight = map.getDiv().offsetHeight - gebieteControl.offsetHeight - 32 - 30 - 79;


                if (legendeMaxHeight < 0) {
                    $scope.legendeMaxHeight = 0;
                    $scope.legendeNotVisible = true;
                } else {
                    $scope.legendeMaxHeight = legendeMaxHeight;
                    $scope.legendeNotVisible = false;
                }

            }


            /**
             * Returns SW/NE latitude/longitude bounds of specified geohash.
             *
             * @param   {string} geohash - Cell that bounds are required of.
             * @returns {{sw: {lat: number, lon: number}, ne: {lat: number, lon: number}}}
             * @throws  Invalid geohash.
             */
            var getBounds = function (geohash) {
                if (geohash.length == 0) throw new Error('Invalid geohash');
                var base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
                geohash = geohash.toLowerCase();
                //Schneide die letzten z ab (sind nur platzhalter)
                geohash = geohash.replace(/[z]{2,}/, '');
                //gehe eine genauigkeit hoeher fuer die boundaries
                geohash = geohash.substr(0, geohash.length - 1);

                var evenBit = true;
                var latMin = -90, latMax = 90;
                var lonMin = -180, lonMax = 180;
                var lastBase = -1;
                for (var i = 0; i < geohash.length; i++) {
                    var chr = geohash.charAt(i);
                    var idx = base32.indexOf(chr);
                    if (idx == -1) throw new Error('Invalid geohash');

                    for (var n = 4; n >= 0; n--) {
                        var bitN = idx >> n & 1;
                        if (evenBit) {
                            // longitude
                            var lonMid = (lonMin + lonMax) / 2;
                            if (bitN == 1) {
                                lonMin = lonMid;
                            } else {
                                lonMax = lonMid;
                            }
                        } else {
                            // latitude
                            var latMid = (latMin + latMax) / 2;
                            if (bitN == 1) {
                                latMin = latMid;
                            } else {
                                latMax = latMid;
                            }
                        }
                        evenBit = !evenBit;
                    }
                    lastBase = chr;
                }
//    	    {
//    	        sw: { lat: latMin, lon: lonMin },
//    	        ne: { lat: latMax, lon: lonMax }
//    	    };
                var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(latMin, lonMin), new google.maps.LatLng(latMax, lonMax));

                return bounds;
            };

            return {
                coordsToBounds: coordsToBounds,
                boundsToCoords: boundsToCoords,
                createMap: createMap,
                getMap: getMap,
                repaintMap: repaintMap,
                highlightItem: highlightItem,
                unhighlightItem: unhighlightItem,
                disableZoomListener: disableZoomListener,
                unhighlightAllItems: unhighlightAllItems,
                removeDrivebyMarker: removeDrivebyMarker,
                resetDrivebyMarker: resetDrivebyMarker
            };

        }]);
});

