define(["./module"], function (module) {
    "use strict";
    module.factory("$listenerService", ["$sessionStorage","$configService", function($sessionStorage,$configService) {
    	/*
    	 * Ein Listener ist eine Funktion, die folgende Argumente übergeben bekommt (und auch nur falls, sich was geändert hat (oder forceEvent=true gesetzt wurde)):
    	 *  neuerWert
    	 *  alterWert
    	 *  source (derjenige, der das event getriggert hat)
    	 *  event (zur unterscheidung, falls mehrere listener auf das gleiche event hören)
    	 *  
    	 *  anschließend wird der Listener einmal mit dem aktuellen Wert getriggert
    	 *  
    	 *  Jeder Listener wird mit einem Key hinzugefügt, Listener mit demselben Key ersetzen einander, 
    	 *  Getriggerte Events werden nicht an die Listener weitergegeben, dere Key mit der Source übereinstimmt
    	 *  
    	 *  Alle Werte werden in der aktuellen Session gespeichert
    	 */
    	
    	
    	var getDefaultViewport=function() {
    		return getDefaultRegion().coords;
    	};
    	
    	var getDefaultRegion=function() {
			return {
				name: "Leipzig, Deutschland",
				coords: [[51.441415936255886,12.175624951269583],
				         [51.441415936255886,12.61164484873052],
				         [51.242178819504296,12.61164484873052],
				         [51.242178819504296,12.175624951269583]]
			};
    	};
    	
    	var defaultValues={
    		angebotsart: "kauf",
    		suchart: "suchoptionen",
    		suchoptionen: {},
    		referenzobjekt: {},
    		sortOrder: {sortField:"firstSeenDay",order:"desc"},
    		sortOrderForCluster: {sortField:"firstSeenDay",order:"desc"},
    		offset: 0,
    		offsetForCluster: 0,
    		items: undefined,
    		clusters: undefined,
    		favoriten: {},
    		viewport: getDefaultViewport(),
    		zoomlevel: undefined,
    		region: getDefaultRegion(),
    		areas: [],
    		detailItem: undefined,
    		detailItemCollection: undefined,
    		detailCluster: undefined,
    		suchprofil: {},
    		referenzprofil: {},
    		suchergebnisseTab: "objekte",
    		spezialgebiete: undefined,
            news: undefined,
    		uisettings: {
    			objectsCollapsed: false,
    			objectsFormCollapsed: false,
    			suchoptionenDetailsCollapsed: true,
    			referenzobjektDetailsCollapsed: true,
    			spezialgebieteControlCollapsed: false
    		}
    	};
    	
    	
    	var getDefaultValue=function(key) {
    		return defaultValues[key];
    	};
    	
    	var debug=false;
    	var storage=$sessionStorage.$default(defaultValues);
    	if (debug) console.log(storage);
    	
    	var availableChangeEvents={
    		angebotsart: true,		//Kauf, Miete, Objekte Im Bau, Zwangsversteigerungen
    		suchart: true,			//Suchoptionen oder Referenzobjekt; entscheidet, woher suchkriterien genommen werden
    		suchoptionen: true, 	//Suchoptionen
    		referenzobjekt: true,	//Referenzobjekt
    		sortOrder: true,		//Sortierung
    		sortOrderForCluster: true, //Sortierung in Cluster-Popup
    		offset: true,			//Offset für Paging
    		offsetForCluster: true, //Offset für Paging in Cluster-Popup
    		items: true,			//Suchergebnisse in Liste
    		clusters: true,			//Suchergebnisse auf Karte
    		favoriten: true,	    //Favoriten
    		viewport: true,			//Viewport = Aktuelle (gezoomte und verschobene) Map-Ansicht
    		zoomlevel: true,		//Aktuelles Zoomlevel der Map
    		region: true,			//Region = Eingegebenes Suchziel, Name + Koordinaten     	
    		areas: true,			//Areas = Gezeichnete Polygone
    		suchprofil: true,		//Suchprofil (metadaten)
    		referenzprofil: true,	//Referenzobjektprofil (metadaten)
    		suchergebnisseTab: true,//Tab Objekte/Marktdaten/SozioDaten
    		detailItem: true,		//Aktuelles Objekt in Detailansicht
    		detailItemCollection: true, //Liste von Objekt-IDs zum Durchschalten in Detailansicht
    		detailCluster: true,	//Aktueller Cluster in Clusteransicht
    		spezialgebiete: true,	//Ausgewählte spezialgebiete
            news: true,             //Nachrichten mit Koordinaten
    		uisettings: true,		//GUI-Einstellungen, was z.b. ausgeklappt ist
			drivebyDetails: true		//drivebyDetails
    	};
    	
    	var listeners={};
    	
    	var addSingleChangeListener=function(changeEvent,key,listener) {
    		if (!availableChangeEvents[changeEvent]) {
    			console.error("$listenerService.addSingleChangeListener: "+changeEvent+" for "+key+" is not an allowed event!");
    			return false;
    		}
    		if (!angular.isDefined(key)) {
    			console.error("$listenerService.addSingleChangeListener("+changeEvent+"): missing listener key!");
    			return false;
    		}
    		if (!angular.isFunction(listener)) {
    			console.error("$listenerService.addSingleChangeListener("+changeEvent+"): "+listener+" is not a function!");
    			return false;
    		}	
	    	var eventListeners=getListeners(changeEvent);
	    	if (debug) {
	    		console.debug("addSingleChangeListener("+changeEvent+") for "+key +(angular.isDefined(eventListeners[key]) ? " -> overwriting existing listener..." : ""));
    		}
	    	eventListeners[key]=listener;
	    	listeners[changeEvent]=eventListeners;
	    	listener(angular.copy(storage[changeEvent]),undefined,"initial",changeEvent);
	    	return true;
    	};
    	
    	var getListeners=function(changeEvent) {
    		var eventListeners=listeners[changeEvent];
    		if (!angular.isObject(eventListeners)) eventListeners={};
    		return eventListeners;
    	};
    	
    	var addChangeListener=function(changeEvents,key,listener) {
    		var splittedChangeEvents=changeEvents.split(" ");
    		for (var i=0;i<splittedChangeEvents.length;i++) {
    			addSingleChangeListener(splittedChangeEvents[i],key,listener);
    		}
    	};
    	
    	var triggerChangeStack=undefined; //falls innerhalb eines listeners weitere triggerChange() aufgerufen werden, müssen diese gesammelt am ende ausgeführt werden
    	var triggerChange=function(changeEvent,sourcekey,newValue,forceEvent) {
    		if (!availableChangeEvents[changeEvent]) {
    			console.error("$listenerService.triggerChange: "+changeEvent+" is not an allowed event!");
    			return;
    		}
    		
    		var oldValue=storage[changeEvent];
    		//ggf. eingabewert korrigieren
    		if (!angular.isDefined(oldValue)) {
    			oldValue=defaultValues[changeEvent];
    		}
    		
    		if (angular.equals(newValue,oldValue) && !forceEvent) return;
    		if (debug) {
	    		var valueString=JSON.stringify(newValue);
	    		if (valueString && valueString.length>200) valueString=valueString.substring(0,200)+"...";
	    		console.debug("triggerChange("+changeEvent+") from "+sourcekey+": "+valueString);
    		}
    		
    		if (angular.isDefined(newValue)) {
    			storage[changeEvent]=angular.copy(newValue);
    		} else {
    			delete storage[changeEvent];
    		}
    		
    		var firstIteration=false;
    		if (!angular.isArray(triggerChangeStack)) {
    			//first iteration
    			firstIteration=true;
    			triggerChangeStack=[];
    		}
    		
    		angular.forEach(getListeners(changeEvent),function(listener,key) {
    			if (!angular.equals(sourcekey,key)) {
    				var func=function() {
	    				listener(angular.copy(newValue),oldValue,sourcekey,changeEvent);
						if (debug) {
	    					var valueString=JSON.stringify(newValue);
	    		    		if (valueString && valueString.length>200) valueString=valueString.substring(0,200)+"...";
	    		    		console.debug("applying change to: "+key+": "+valueString);
	    				}
    				};
    				if (firstIteration) {
    					func();
    				} else {
    					triggerChangeStack.push(func);
    				}
    			}
    		});
    
    		if (firstIteration) {
    			while (triggerChangeStack.length>0) {
					triggerChangeStack.shift()();
				}
    			triggerChangeStack=undefined;
    		}
    	};
    	
    	var resetStorage=function() {
    		triggerChange("angebotsart","listenerService",angular.copy(defaultValues.angebotsart));
    		triggerChange("suchoptionen","listenerService",angular.copy(defaultValues.suchoptionen));
    		triggerChange("sortOrder","listenerService",angular.copy(defaultValues.sortOrder));
    		triggerChange("sortOrderForCluster","listenerService",angular.copy(defaultValues.sortOrderForCluster));
    		triggerChange("referenzobjekt","listenerService",angular.copy(defaultValues.referenzobjekt));
    		triggerChange("offset","listenerService",angular.copy(defaultValues.offset));
    		triggerChange("offsetForCluster","listenerService",angular.copy(defaultValues.offsetForCluster));
    		triggerChange("items","listenerService",angular.copy(defaultValues.items));
    		triggerChange("clusters","listenerService",angular.copy(defaultValues.clusters));
    		triggerChange("favoriten","listenerService",angular.copy(defaultValues.favoriten));
    		triggerChange("region","listenerService",angular.copy(defaultValues.region));
    		triggerChange("viewport","listenerService",angular.copy(defaultValues.viewport));
    		triggerChange("areas","listenerService",angular.copy(defaultValues.areas));
    		triggerChange("detailItem","listenerService",angular.copy(defaultValues.detailItem));
    		triggerChange("detailItemCollection","listenerService",angular.copy(defaultValues.detailItemCollection));
    		triggerChange("detailCluster","listenerService",angular.copy(defaultValues.detailCluster));
    		triggerChange("suchprofil","listenerService",angular.copy(defaultValues.suchprofil));
    	};
    	
    	var resetSuchprofil=function() {
//    		triggerChange("angebotsart","listenerService",angular.copy(defaultValues.angebotsart));
    		triggerChange("suchoptionen","listenerService",angular.copy(defaultValues.suchoptionen));
//    		triggerChange("region","listenerService",angular.copy(defaultValues.region));
//    		triggerChange("viewport","listenerService",angular.copy(defaultValues.viewport));
//    		triggerChange("areas","listenerService",angular.copy(defaultValues.areas));
    		triggerChange("suchprofil","listenerService",angular.copy(defaultValues.suchprofil));
       		triggerChange("sortOrder","listenerService",angular.copy(defaultValues.sortOrder));
    		triggerChange("sortOrderForCluster","listenerService",angular.copy(defaultValues.sortOrderForCluster));
  
    		var favoriten=angular.copy(storage.favoriten);
    		if (!angular.isObject(favoriten)) favoriten={};
    		delete favoriten["suchoptionen"];
    		triggerChange("favoriten","listenerService",favoriten);
    	};
    	
    	var resetReferenzprofil=function() {
//    		triggerChange("angebotsart","listenerService",angular.copy(defaultValues.angebotsart));
    		triggerChange("referenzobjekt","listenerService",angular.copy(defaultValues.referenzobjekt));
//    		triggerChange("region","listenerService",angular.copy(defaultValues.region));
//    		triggerChange("viewport","listenerService",angular.copy(defaultValues.viewport));
//    		triggerChange("areas","listenerService",angular.copy(defaultValues.areas));
    		triggerChange("referenzprofil","listenerService",angular.copy(defaultValues.referenzprofil));
    		var favoriten=angular.copy(storage.favoriten);
    		if (!angular.isObject(favoriten)) favoriten={};
    		delete favoriten["referenzobjekt"];
    		triggerChange("favoriten","listenerService",favoriten);
    	};
    	
    	var loadingCompleteStorage=false;
    	
    	var getCompleteStorage=function() {
    		return angular.copy(storage);
    	};
    	
    	var setCompleteStorage=function(newStorage) {
    		console.debug("----set complete storage----");
    		loadingCompleteStorage=true;
    		for (var key in availableChangeEvents) {
    			triggerChange(key,"completeStorage",angular.copy(newStorage[key]));
    		}
    		loadingCompleteStorage=false;
    	};
    	
    	var isLoadingCompleteStorage=function() {
    		return loadingCompleteStorage;
    	};
    	
    	return {
    		addChangeListener: addChangeListener,
    		triggerChange: triggerChange,
    		resetStorage: resetStorage,
    		resetSuchprofil: resetSuchprofil,
    		resetReferenzprofil: resetReferenzprofil,
    		getDefaultValue: getDefaultValue,
    		getCompleteStorage: getCompleteStorage,
    		setCompleteStorage: setCompleteStorage,
    		isLoadingCompleteStorage: isLoadingCompleteStorage
    	};
    	
    }]);
});