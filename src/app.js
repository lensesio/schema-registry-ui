'use strict';

/**
 * Pulling in css libs
 */
require('font-awesome/css/font-awesome.min.css');
require('angular-material/angular-material.min.css');
require('angular-material-data-table/dist/md-data-table.min.css');
require('angular-json-tree/dist/angular-json-tree.css');
require('./assets/css/styles.css');
/**
 * Requiring in libs here for the time being
 * Going forward the require/import should be done in the class that needs it
 */
require('expose-loader?diff_match_patch!diff-match-patch');
window.DIFF_INSERT = require('exports-loader?DIFF_INSERT!diff-match-patch/index');
window.DIFF_DELETE = require('exports-loader?DIFF_DELETE!diff-match-patch/index');
window.DIFF_EQUAL = require('exports-loader?DIFF_EQUAL!diff-match-patch/index');

require('ace-builds/src-min-noconflict/ace');
require('jszip');
require('jszip/vendor/FileSaver');
require('jszip-utils');
require('spin.js');

require('angular');
require('angular-utils-pagination/dirPagination');
require('angular-ui-ace');
require('angular-spinner');
require('angular-route');
require('angular-sanitize');
require('angular-material');
require('angular-animate');
require('angular-aria');
require('angular-material-data-table');
require('angular-diff-match-patch');
require('angular-json-tree');

require('../env');

var angularAPP = angular.module('angularAPP', [
  'ui.ace',
  'angularSpinner',
  'angularUtils.directives.dirPagination',
  'ngRoute',
  'ngMaterial',
  'ngAnimate',
  'ngAria',
  'md.data.table',
  'diff-match-patch',
  'angular-json-tree',
  'ngSanitize'

]);

/**
 * 
 */
require('./schema-registry');
require('./factories');
/**
 * Templates
 */
var homeTemplate = require('./schema-registry/home/home.html');
var newTemplate = require('./schema-registry/new/new.html');
var exportTemplate = require('./schema-registry/export/export.html');
var viewTemplate = require('./schema-registry/view/view.html');
var configTemplate = require('./schema-registry/config/config.html');
var listTemplate = require('./schema-registry/list/list.html');
var dirPaginationControlsTemplate = require('./schema-registry/pagination/dirPaginationControlsTemplate.html');


// angularAPP.controller('MenuCtrl', function ($scope, $log) {
// });

var HeaderCtrl = function ($rootScope, $scope, $location, $log, SchemaRegistryFactory, env) {

  $scope.$on('$routeChangeSuccess', function () {
    $rootScope.clusters = env.getClusters();
    $scope.cluster = env.getSelectedCluster();
    $scope.color = $scope.cluster.COLOR;
  });

  $scope.updateEndPoint = function (cluster) {
    $rootScope.connectionFailure = false;
    $location.path("/cluster/" + cluster)
  }
};

HeaderCtrl.$inject = ['$rootScope', '$scope', '$location', '$log', 'SchemaRegistryFactory', 'env'];

angularAPP.controller('HeaderCtrl', HeaderCtrl);

/* Custom directives */

angularAPP.directive('validJson', function () {
  return {
    require: 'ngModel',
    priority: 1000,
    link: function (scope, elem, attrs, ngModel) {

      // view to model
      ngModel.$parsers.unshift(function (value) {
        var valid = true,
          obj;
        try {
          obj = JSON.parse(value);
        } catch (ex) {
          valid = false;
        }
        ngModel.$setValidity('validJson', valid);
        return valid ? obj : undefined;
      });

      // model to view
      ngModel.$formatters.push(function (value) {
        return value;//JSON.stringify(value, null, '\t');
      });
    }
  };
});


angularAPP.filter('reverse', function () {
  return function (items) {
    return items.slice().reverse();
  };
});

angularAPP.config(['$compileProvider', '$mdThemingProvider', '$routeProvider',
  function ($compileProvider, $mdThemingProvider, $routeProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);

    $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('blue')
    .warnPalette('grey');

    $routeProvider
    .when('/', {
      template: homeTemplate,
      controller: 'HomeCtrl'
    })
    .when('/cluster/:cluster', {
      template: homeTemplate,
      controller: 'HomeCtrl'
    })
    .when('/cluster/:cluster/schema/new', {
      template: newTemplate,
      controller: 'NewSubjectCtrl as ctrl'
    })
    .when('/cluster/:cluster/export', {
      template: exportTemplate,
      controller: 'ExportSchemasCtrl'
    })
    .when('/cluster/:cluster/schema/:subject/version/:version', {
      template: viewTemplate,
      controller: 'SubjectsCtrl'
    }).otherwise({
      redirectTo: '/'
    });
  }
  // $locationProvider.html5Mode(true);
  ]);


angularAPP.run(['env', '$routeParams', '$rootScope', '$templateCache',
  function loadRoute(env, $routeParams, $rootScope, $templateCache) {
    $rootScope.$on('$routeChangeSuccess', function () {
      env.setSelectedCluster($routeParams.cluster);
    });

    $templateCache.put('config.html', configTemplate);
    $templateCache.put('list.html', listTemplate);
    $templateCache.put('angularUtils.directives.dirPagination.template', dirPaginationControlsTemplate);
  }
])

