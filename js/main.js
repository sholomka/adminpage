require.config({
	paths: {
		"domReady": 			"../lib/require/domReady",
		"async": 				"../lib/require/async",
		"angular": 				"../lib/angular/angular.min",
		"angular-route": 		"../lib/angular/angular-route.min",
		"angular-sanitize":		"../lib/angular/angular-sanitize.min",
		"angular-animate":		"../lib/angular/angular-animate.min",
		"angular-touch":		"../lib/angular/angular-touch.min",
		"ui-bootstrap": 		"../lib/angular-bootstrap/ui-bootstrap-tpls-1.0.0.min",
		"locale-de": 			"../lib/angular/angular-locale_de-de",
		"ngStorage":			"../lib/ngstorage/ngStorage.min",
		"duScroll":				"../lib/angular-scroll/angular-scroll.min",
		"bootstrapLightbox": "../lib/angular-bootstrap-lightbox/angular-bootstrap-lightbox.min",
		"videogular": "../lib/videogular/videogular",
		//"googlemaps-marker": 	"../lib/google-maps-utility/markerwithlabel.min"
	},
	map: {
		"*": {
			"googlemaps": "async!https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places,drawing,geometry&client=gme-evermindgmbh"
		}
	},
	shim: {
		"angular": {
			exports: "angular"
		},
		"locale-de": {
			deps: ["angular"]
		},
		"angular-route": {
			deps: ["angular"]
		},
		"angular-sanitize": {
			deps: ["angular"]
		},
		"angular-animate": {
			deps: ["angular"]
		},
		"angular-touch": {
			deps: ["angular"]
		},
		"ui-bootstrap": {
			deps: ["angular"]
		},
		"bootstrapLightbox": {
			deps: ["angular","ui-bootstrap"]
		},
		"ngStorage": {
			deps: ["angular"]
		},
		"duScroll": {
			deps: ["angular"]
		},
		"videogular": {
			deps: ["angular"]
		}
		/*"googlemaps-marker": {
			deps: ["googlemaps"]
		}*/
	}
});

require(["bootstrap"],undefined,function(error) {
	var errorCode=error.requireType;
	if (error.requireModules && error.requireModules.length>0) errorCode+=": "+error.requireModules.join(',');
	document.getElementById("main").innerHTML='<div class="alert alert-danger">Es ist ein Fehler beim Laden der Anwendung aufgetreten. Bitte versuchen Sie es später erneut!!!!!!!<br/><span class="small text-black">[Fehlercode: '+errorCode+']</span></div>';
});