'use strict';

var angularAPP = angular.module('angularAPP', [
  'ui.ace',
  'angularSpinner',
  'angularUtils.directives.dirPagination',
  'ngRoute',
  'ngMaterial',
  'ngAnimate',
  'ngAria',
  'md.data.table',
  'diff-match-patch'
]);

angularAPP.controller('MenuCtrl', function ($scope, $log) {
  $scope.apps = [];
  angular.forEach(ENV.APPS, function (app) {
    if (app.urlTopics != undefined && app.urlTopics != "") {
      app.url = app.urlTopics;
    } else if (app.urlConnect != undefined && app.urlConnect != "") {
      app.url = app.urlConnect;
    } else if (app.urlAlerts != undefined && app.urlAlerts != "") {
      app.url = app.urlAlerts;
    } else if (app.urlManager != undefined && app.urlManager != "") {
      app.url = app.urlManager;
    } else if (app.urlMonitoring != undefined && app.urlMonitoring != "") {
      app.url = app.urlMonitoring;
    }
    if (app.url != undefined) {
      $scope.apps.push(app);
      $log.debug("Menu app enabled -> " + app.name);
    }
  });
  $scope.disableAppsMenu = $scope.apps.length <= 0;
});

angularAPP.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'src/home/home.html',
      controller: 'HomeCtrl'
    })
    .when('/schema/new', {
      templateUrl: 'src/schema-registry/new/new.html',
      controller: 'CreateNewSubjectCtrl as ctrl'
    })
    .when('/schema/:subject/version/:version', {
      templateUrl: 'src/schema-registry/view/view.html',
      controller: 'SubjectsCtrl'
    }).otherwise({
    redirectTo: '/'
  });
  // $locationProvider.html5Mode(true);
});

angularAPP.config(function ($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('blue')
    .warnPalette('grey');
});

