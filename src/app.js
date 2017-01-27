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
  'diff-match-patch',
  'angular-json-tree'

]);

angularAPP.controller('MenuCtrl', function ($scope, $log) {
});

angularAPP.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'src/schema-registry/home/home.html',
      controller: 'HomeCtrl'
    })
    .when('/cluster/:cluster', {
      templateUrl: 'src/schema-registry/home/home.html',
      controller: 'HomeCtrl'
    })
    .when('/cluster/:cluster/schema/new', {
      templateUrl: 'src/schema-registry/new/new.html',
      controller: 'NewSubjectCtrl as ctrl'
    })
    .when('/cluster/:cluster/schema/:subject/version/:version', {
      templateUrl: 'src/schema-registry/view/view.html',
      controller: 'SubjectsCtrl'
    }).otherwise({
    redirectTo: '/'
  });
  // $locationProvider.html5Mode(true);
});

angularAPP.controller('HeaderCtrl', function ($rootScope, $scope, $location, $log, SchemaRegistryFactory, env) {


  $scope.$on('$routeChangeSuccess', function() {
     $rootScope.clusters = env.getClusters();
     $scope.cluster = env.getSelectedCluster();
     $scope.color = $scope.cluster.COLOR;
  });

  $scope.updateEndPoint = function(cluster) {
    $rootScope.connectionFailure = false;
    $location.path("/cluster/"+cluster)
  }

  ////// expoprt all schemas ////
var curlPrefix = 'curl -vs --stderr - -XPOST -i -H "Content-Type: application/vnd.schemaregistry.v1+json" --data ';
$scope.downloadCurl ='';
$scope.showCache = function () {
  angular.forEach($rootScope.Cache, function (schema) {
    $scope.downloadCurl += "\n" + curlPrefix + "'" + '{"schema":"' + schema.schema + "}' " + env.SCHEMA_REGISTRY() + "/subjects/" + schema.subjectName + "/versions \n";
  });
  var curlsBlob = new Blob([ $scope.downloadCurl ], { type : 'text/plain' });
  $scope.curlsURL = (window.URL || window.webkitURL).createObjectURL( curlsBlob );
  $location.path($scope.curlsURL)
}

});

angularAPP.run(
    function loadRoute( env, $routeParams, $rootScope ) {
        $rootScope.$on('$routeChangeSuccess', function() {
          env.setSelectedCluster($routeParams.cluster);
       });
    }
)

angularAPP.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}]);

angularAPP.config(function ($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('blue')
    .warnPalette('grey');
});

angularAPP.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});
