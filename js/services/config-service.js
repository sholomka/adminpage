define([ "./module" ], function(module) {
	"use strict";
	module.factory("$configService", [ function() {

		var sortOrderMap = {
			kauf : [ "firstSeenDay", "preisProQm", "baujahr", "wohnflaeche" ],
			kauf_default: {sortField: "firstSeenDay", order: "desc"},
			
			miete : [ "firstSeenDay", "preisProQm", "baujahr", "wohnflaeche" ],
			miete_default: {sortField: "firstSeenDay", order: "desc"},
			
			zvg : [ "firstSeenDay", "preis", "datumZvg" ],
			zvg_default: {sortField: "firstSeenDay", order: "desc"},
			
			objekteimbau : [ "wohneinheiten", "bauende" ],
			objekteimbau_default: {sortField: "bauende", order:"asc"}
		}
		return {
			sortOrderMap : sortOrderMap
		};

	} ]);
});