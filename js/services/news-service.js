define(["./module"], function (module) {
    "use strict";
    module.factory("$newsService", ["$q","$rootScope", "$restService","$listenerService", "$constantsService", "$sucheService", "$suchprofilService",
                                     function($q,$rootScope,$restService,$listenerService,$constantsService, $sucheService, $suchprofilService) {

		var sucheNews=function(data){
			var deferred=$q.defer();
			$restService.sucheEditNews(data).run().then(function(data){
				deferred.resolve(data);
				},function(error) {
				deferred.reject(error);
				//    			$messageService.showError("Fehler beim Laden der Nachrichten!");
			});
			return deferred.promise
		};

		 var searchTodayNews=function(data){
			 var deferred=$q.defer();
			 $restService.searchTodayNews(data).run().then(function(data){
				 deferred.resolve(data);
			 },function(error) {
				 deferred.reject(error);
			 });
			 return deferred.promise
		 };

		 var kannNewsLoeschen = function(){
			 return true;
			 //return $restService.deleteNews().isAllowed();
		 };

		 var loescheNews = function(nId){
			 var deferred=$q.defer();
			 $restService.deleteNews(nId).run().then(function(data){
				 //$messageService.showInfo("News erfolgreich geloescht!");
				 deferred.resolve(data);
			 },function(){
				 //$messageService.showError("Fehler beim Löschen der Nachrichten!");
				 deferred.reject();
			 });
			 return deferred.promise
		 };

		return {
			sucheNews: sucheNews,
			kannNewsLoeschen: kannNewsLoeschen,
			loescheNews: loescheNews,
			searchTodayNews:searchTodayNews
		}
    }]);
});