define(["./module"], function (module) {
    "use strict";
    module.factory("$messageService", ["$rootScope","$compile","$timeout","$uibModal", function($rootScope,$compile,$timeout,$uibModal) {
    	
    	var messageBoxScope;
    	var initMessageBoxScope=function() {
    		if (!messageBoxScope) {
	    		var $scope=$rootScope.$new(false,null);
	        	var element=angular.element('<div class="global-alert alert" ng-class="{\'alert-success\': type==\'info\',\'alert-danger\': type==\'error\'}" ng-show="message" ng-click="clearMessage()">{{message}}</div>');
	        	angular.element(window.document.body).append(element);
	        	$compile(element)($scope);
	        	    	
	        	$scope.message=undefined;
	        	$scope.type=undefined;
	        	
	        	$scope.clearMessage=function() {
	        		$scope.message=undefined;
	        		$scope.type=undefined;
	        	};
	        	messageBoxScope=$scope;
    		}
    	}
    	
    	var showInfo=function(message) {
    		initMessageBoxScope();
    		messageBoxScope.message=message;
    		messageBoxScope.type="info";
    		$timeout(function() {
    			messageBoxScope.message=undefined;
    		},5000);
    	};
    	
    	var showWarning=function(title,message) {
    		return showOkDialog(title,'<div class="alert alert-warning">'+message+'</div>');	
    	};
    	
    	var showError=function(message) {
    		return showOkDialog("Es ist ein Fehler aufgetreten",'<div class="alert alert-danger">'+message+'</div>');	
    	};
    	
    	var showConfirmDialog=function(title,message) {
    		var $scope=$rootScope.$new(false,null);
    		
    		$scope.ok=function(reason) {
        		currentModal.close(reason);
        	};
        	$scope.cancel=function(reason) {
        		currentModal.dismiss(reason);
        	};
        	
    		var currentModal=$uibModal.open({
    			template: '<div class="modal-header"><h4 class="modal-title">'+title+'</h4></div><div class="modal-body">'+message+'</div><div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button><button class="btn btn-default" ng-click="cancel()">Abbrechen</button></div>',
    			backdrop: 'static',
    			scope: $scope
    		});
    		
    		
    		
    		return currentModal.result;
    	};
    	
    	var showOkDialog=function(title,message) {
    		var $scope=$rootScope.$new(false,null);
    		
    		$scope.ok=function(reason) {
        		currentModal.close(reason);
        	};
    		
    		var currentModal=$uibModal.open({
    			template: '<div class="modal-header"><h3 class="modal-title">'+title+'</h3></div><div class="modal-body">'+message+'</div><div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
    			backdrop: 'static',
    			scope: $scope,
    			size: "lg"
    		});
    		return currentModal.result;
    	};
    	
    	return {
    		showInfo: showInfo,
    		showWarning: showWarning,
    		showError: showError,
    		showConfirmDialog: showConfirmDialog,
    		showOkDialog: showOkDialog
    	};
    	
    	
    }]);
});