'use strict';

// Declare app level module 
angular.module('ngSocial', [
  'ngRoute',
  'ngSocial.facebook'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/facebook'});
}]);
