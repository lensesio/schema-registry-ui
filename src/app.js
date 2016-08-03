'use strict';

var schemaRegistryUIApp = angular.module('schemaRegistryUIApp', [
  'ui.ace',
  'angularSpinner',
  'angularUtils.directives.dirPagination',
  'ngRoute',
  'ngMaterial',
  'ngAnimate',
  'ngAria'
]);

schemaRegistryUIApp.controller('MenuCtrl', function ($scope) {
  $scope.apps = [];
  var thisApp = "Schema Registry";
  angular.forEach(ENV.APPS, function (app) {
    if (app.enabled && !(app.name == thisApp)) {
      $scope.apps.push(app);
    }
  });

  $scope.disableAppsMenu = $scope.apps.length <= 0;
});

schemaRegistryUIApp.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'src/home/home.html',
      controller: 'HomeCtrl'
    })
    .when('/create-subject', {
      templateUrl: 'src/sreg-subject-new/sreg-subject-new.html',
      controller: 'CreateNewSubjectCtrl as ctrl'
    })
    .when('/subject/:subject/version/:version', {
      templateUrl: 'src/sreg-subject-detail/sreg-subject-detail.html',
      controller: 'SubjectsCtrl'
    }).otherwise({
    redirectTo: '/'
  });
  // $locationProvider.html5Mode(true);
});


