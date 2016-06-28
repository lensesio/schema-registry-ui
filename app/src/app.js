'use strict';

var schemaRegistryUIApp = angular.module('schemaRegistryUIApp', [
  'ui.ace',
  'angularSpinner',
  'angularUtils.directives.dirPagination',
  'ngRoute',
  'ngclipboard'
]).factory('schemaRegistryFactory', function ($rootScope, $http, $location, $q, $log) {

    var allSubjectNames = []; // All available subject names in the schema registry
    var subjectCACHE = []; // An array holding all cached subjects

    /* Public API */
    return {

      getSubject: function (subjectName, subjectVersion) {
        $log.info("Get Subject called for " + subjectName + " / " + subjectVersion);
        var deferred = $q.defer();

        var foundInCache = false;
        setTimeout(function () {
          angular.forEach(subjectCACHE, function (subject) {
            $log.debug("Checking if " + subject.subjectName + "/" + subject.version + " == " + subjectName + "/" + subjectVersion);
            if (subject.subjectName == subjectName && subject.version == subjectVersion) {
              console.log("Subject found in cache");
              foundInCache = true;
              console.log(JSON.stringify(subject));
              deferred.resolve(subject);
            }
          });

          if (!foundInCache) {
            $log.info("Need to fetch subject data");
            $http.get(ENV.BASE_URL + '/subjects/' + subjectName + '/versions/' + subjectVersion)
              .then(
                function successCallback(detailsResponse) {
                  var otherVersions = [];
                  // Collect available versions
                  $http.get(ENV.BASE_URL + '/subjects/' + subjectName + '/versions/').then(
                    function successCallback(response) {
                      var allVersions = response.data;
                      angular.forEach(allVersions, function (version) {
                        if (version != subjectVersion) {
                          otherVersions.push(version);
                        }
                      });

                      //cache it
                      var cacheData = {
                        subjectName: detailsResponse.data.subject,
                        version: detailsResponse.data.version,
                        otherVersions: otherVersions, // Array
                        id: detailsResponse.data.id,
                        schema: detailsResponse.data.schema,
                        Schema: JSON.parse(detailsResponse.data.schema)
                      };
                      //and set it to selectedSchema
                      deferred.resolve(cacheData);
                    },
                    function errorCallback(response) {
                      console.log("FAIL " + response)
                    });
                },
                function errorCallback(response) {
                  $log.error("Failure with : " + JSON.stringify(response))
                });
          }
        }, 10);
        return deferred.promise;

      },
      fetchLatestSubjects: function () {
        var deferred = $q.defer();
        setTimeout(function () {
          deferred.notify("Initially get all subjects (just latest versions)");

          // 1. Get all subject names
          $http.get(ENV.BASE_URL + '/subjects/')
            .then(
              function successCallback(response) {
                allSubjectNames = response.data;
              },
              function errorCallback(response) {
                $log.error("Failure with : " + response)
              })

            // 2. Get full details of subject's final versions
            .then(
              function successCallback() {
                var urlCalls = [];
                angular.forEach(allSubjectNames, function (subject) {
                  urlCalls.push($http.get(ENV.BASE_URL + '/subjects/' + subject + '/versions/latest'));
                });
                $q.all(urlCalls).then(function (results) {
                  angular.forEach(results, function (result) {
                    // result.data contains:
                    //   version   - latest version
                    //   id        - latest schema id
                    //   schema    - escaped JSON schema i.e. {\"type\":\"record\",\"name\":\"User\",\"fields\":[{\"name\":\"name\",\"type\":\"string\"}]}

                    // Collect available versions
                    $http.get(ENV.BASE_URL + '/subjects/' + result.data.subject + '/versions/').then(
                      function successCallback(response) {
                        var allVersions = response.data;
                        var otherVersions = [];
                        angular.forEach(allVersions, function (version) {
                          if (version != result.data.version) {
                            otherVersions.push(version);
                            $log.debug("Pushing version " + version);
                          }
                        });

                        // Always cast from JSon to maintain a data contract
                        var cacheData = {
                          subjectName: result.data.subject,
                          version: result.data.version,
                          otherVersions: otherVersions, // Array
                          id: result.data.id,
                          schema: result.data.schema,
                          Schema: JSON.parse(result.data.schema)
                          // Schema object is a javascript object
                          //   type    - i.e. "record"
                          //   name    - i.e. "User"
                          //   doc     - i.e. "Avro documentation"
                          //   fields
                          //      name
                          //      type
                          //      default
                          //      doc
                          //schemaText: angular.toJson(result.data.schemaObj, true)
                        };
                        subjectCACHE.push(cacheData);
                      },
                      function errorCallback(response) {
                        deferred.reject("Failure with : " + response);
                        $log.error("Failure with : " + response)
                      });

                  });
                  $rootScope.showSpinner = false;
                  console.info("Completed $ = " + subjectCACHE);
                  deferred.resolve(subjectCACHE);
                });
              });

        }, 10);

        return deferred.promise;
      }
    }
  }
);

schemaRegistryUIApp.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'partials/about.html'
    })
    .when('/about', {
      templateUrl: 'partials/about.html'
    })
    .when('/examples', {
      templateUrl: 'partials/examples.html',
      controller: 'HeaderCtrl'
    })
    .when('/subject/:subject/version/:version', {
      templateUrl: 'partials/subject.html',
      controller: 'ViewCtrl'
    }).otherwise({
    redirectTo: '/'
  });
  // $locationProvider.html5Mode(true);
});

schemaRegistryUIApp.controller('AboutCtrl', function ($scope, $routeParams, $log) {
  $log.info("AboutCtrl - initializing");

});

schemaRegistryUIApp.controller('ViewCtrl', function ($scope, $routeParams, $log, schemaRegistryFactory) {
  $log.info("ViewCtrl - initializing for subject " + $routeParams.subject + "/" + $routeParams.version);

  $scope.multipleVersionsOn = false;

  var promise = schemaRegistryFactory.getSubject($routeParams.subject, $routeParams.version);
  promise.then(function (selectedSubject) {
    $log.info('Success fetching ' + $routeParams.subject + '/' + $routeParams.version); //+ JSON.stringify(selectedSubject));
    $scope.subjectObject = selectedSubject;
    $scope.aceString = angular.toJson(selectedSubject.Schema, true);
    $scope.multipleVersionsOn = $scope.subjectObject.otherVersions.length > 0;
  }, function (reason) {
    $log.error('Failed: ' + reason);
  }, function (update) {
    $log.info('Got notification: ' + update);
  });
});

schemaRegistryUIApp.controller('MainCtrl', function ($scope, $routeParams, $log, schemaRegistryFactory) {
  console.info("MainCtrl - starting - building CACHE");

  console.info("routeParams keyword =" + $routeParams.keyword);
  // $routeScope.search = $routeParams.keyword;

  var promise = schemaRegistryFactory.fetchLatestSubjects();
  promise.then(function (cachedData) {
    $log.info('Success at fetching ' + cachedData.length + ' subjects');// ' + JSON.stringify(cachedData));
    $scope.subjectCACHE = cachedData;
  }, function (reason) {
    $log.error('Failed: ' + reason);
  }, function (update) {
    $log.info('Got notification: ' + update);
  });
});

schemaRegistryUIApp.controller('HeaderCtrl', function ($scope, $http, $log) {
  $scope.schemaRegistryURL = ENV.BASE_URL;
  $scope.config = {};
  $scope.connectionFailure = false;
  //Get the top level config
  $http.get(ENV.BASE_URL + '/config/').then(
    function successCallback(response) {
      $scope.config = response.data;
    },
    function errorCallback(response) {
      $log.error("Failure with : " + JSON.stringify(response));
      $scope.connectionFailure = true;
    });
});

schemaRegistryUIApp.controller('SubjectsCtrl', function ($rootScope, $scope) {

  $rootScope.showSpinner = true;
  $scope.compare = true;
  $scope.tableViewOn = false;
  $scope.editor;

  $scope.aceLoaded = function(_editor) {
    $scope.editor = _editor;
  };

  $scope.changeView = function () {
    $scope.tableViewOn = !$scope.tableViewOn;
    // Refresh the ace-ui editor to fix a glitch
    $scope.editor.resize();
    $scope.editor.renderer.updateFull();
  }

}); //end of controller
