'use strict';

var schemaRegistryUIApp = angular.module('schemaRegistryUIApp', [
  'ui.ace',
  'angularSpinner',
  'angularUtils.directives.dirPagination',
  'ngRoute',
  'ngMaterial',
  'ngAnimate',
  'ngAria'
]).factory('schemaRegistryFactory', function ($rootScope, $http, $location, $q, $log) {

    var subjectCACHE = []; // An array holding all cached subjects
    $rootScope.showCreateSubjectButton = true;
    /* Public API */
    return {

      visibleCreateSubjectButton: function(value) {
        $rootScope.showCreateSubjectButton = value;
      },
      getSubject: function (subjectName, subjectVersion) {
        $log.info("Get Subject called for " + subjectName + " / " + subjectVersion);
        var deferred = $q.defer();

        var foundInCache = false;
        setTimeout(function () {
          angular.forEach(subjectCACHE, function (subject) {
            $log.debug("Checking if " + subject.subjectName + "/" + subject.version + " == " + subjectName + "/" + subjectVersion);
            if (subject.subjectName == subjectName && subject.version == subjectVersion) {
              foundInCache = true;
              $log.debug("Subject found in cache : " + JSON.stringify(subject));
              deferred.resolve(subject);
            }
          });

          if (!foundInCache) {
            $log.info("Need to fetch subject data");
            $http.get(ENV.SCHEMA_REGISTRY + '/subjects/' + subjectName + '/versions/' + subjectVersion)
              .then(
                function successCallback(detailsResponse) {
                  var otherVersions = [];
                  // Collect available versions
                  $http.get(ENV.SCHEMA_REGISTRY + '/subjects/' + subjectName + '/versions/').then(
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
                      $log.error("Failure with : " + response + " " + JSON.stringify(response));
                    });
                },
                function errorCallback(response) {
                  $log.error("Failure with : " + JSON.stringify(response));
                });
          }
        }, 10);
        return deferred.promise;

      },
      fetchLatestSubjects: function () {
        var allSubjectNames = []; // All available subject names in the schema registry
        var deferred = $q.defer();
        setTimeout(function () {
          deferred.notify("Initially get all subjects (just latest versions)");

          // 1. Get all subject names
          $http.get(ENV.SCHEMA_REGISTRY + '/subjects/')
            .then(
              function successCallback(response) {
                allSubjectNames = response.data;
                $rootScope.allSubjectNames = allSubjectNames;
              },
              function errorCallback(response) {
                $log.error("Failure with : " + response)
              })

            // 2. Get full details of subject's final versions
            .then(
              function successCallback() {
                var urlCalls = [];
                angular.forEach(allSubjectNames, function (subject) {
                  urlCalls.push($http.get(ENV.SCHEMA_REGISTRY + '/subjects/' + subject + '/versions/latest'));
                });
                $q.all(urlCalls).then(function (results) {
                  angular.forEach(results, function (result) {
                    // result.data contains:
                    //   version   - latest version
                    //   id        - latest schema id
                    //   schema    - escaped JSON schema i.e. {\"type\":\"record\",\"name\":\"User\",\"fields\":[{\"name\":\"name\",\"type\":\"string\"}]}

                    // Collect available versions
                    $http.get(ENV.SCHEMA_REGISTRY + '/subjects/' + result.data.subject + '/versions/').then(
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
                  $log.debug("Completed $ = " + subjectCACHE);
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
      templateUrl: 'partials/about.html',
      controller: 'AboutCtrl'
    })
    .when('/about', {
      templateUrl: 'partials/about.html',
      controller: 'AboutCtrl'
    })
    .when('/create-subject', {
      templateUrl: 'partials/create-subject.html',
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

schemaRegistryUIApp.controller('AboutCtrl', function ($scope, $routeParams, $mdToast, $log, schemaRegistryFactory) {
  $log.info("AboutCtrl - initializing");
  $mdToast.hide();
  schemaRegistryFactory.visibleCreateSubjectButton(true);
});

schemaRegistryUIApp.controller('ViewCtrl', function ($scope, $routeParams, $log, $mdToast, schemaRegistryFactory) {

  $log.info("ViewCtrl - initializing for subject " + $routeParams.subject + "/" + $routeParams.version);
  $mdToast.hide();
  schemaRegistryFactory.visibleCreateSubjectButton(true);
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

schemaRegistryUIApp.controller('MainCtrl', function ($scope, $routeParams, $log, $templateCache, $mdToast, schemaRegistryFactory) {

  $log.debug("MainCtrl - starting - cleaning page cache - building subject CACHE");
  $templateCache.remove('partials/about.html');
  $templateCache.remove('partials/create-subject.html');
  $templateCache.remove('partials/subject.html');
  $mdToast.hide();
  schemaRegistryFactory.visibleCreateSubjectButton(true);

  var promise = schemaRegistryFactory.fetchLatestSubjects();
  promise.then(function (cachedData) {
    $log.info('Success at fetching ' + cachedData.length + ' subjects');// ' + JSON.stringify(cachedData));
    $scope.subjectCACHE = cachedData;
  }, function (reason) {
    $log.error('Failed: ' + reason);
  }, function (update) {
    $log.debug('Got notification: ' + update);
  });
});

schemaRegistryUIApp.controller('HeaderCtrl', function ($scope, $rootScope, $http, $log, $mdToast) {
  $log.debug("HeaderCtrl initiating");
  $scope.schemaRegistryURL = ENV.SCHEMA_REGISTRY;
  $scope.config = {};
  $scope.connectionFailure = false;
  $scope.noSubjectName = true;
  $rootScope.showCreateSubjectButton = false;

  /************** Toast *************/
  var last = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };

  $scope.toastPosition = angular.extend({}, last);

  $scope.getToastPosition = function () {
    sanitizePosition();

    return Object.keys($scope.toastPosition)
      .filter(function (pos) {
        return $scope.toastPosition[pos];
      })
      .join(' ');
  };

  function sanitizePosition() {
    var current = $scope.toastPosition;

    if (current.bottom && last.top) current.top = false;
    if (current.top && last.bottom) current.bottom = false;
    if (current.right && last.left) current.left = false;
    if (current.left && last.right) current.right = false;

    last = angular.extend({}, current);
  }

  $scope.showSimpleToast = function (message) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position($scope.getToastPosition())
        .hideDelay(20000)
    );
  };

  $scope.hideToast = function () {
    $mdToast.hide();
  };
  /******************/

  var self = this;

  self.simulateQuery = false;
  self.isDisabled = false;

  // list of `state` value/display objects
  self.states = loadAll();
  self.querySearch = querySearch;
  self.selectedItemChange = selectedItemChange;
  self.searchTextChange = searchTextChange;

  // ******************************
  // Internal methods
  // ******************************

  /**
   * Search ... use $timeout to simulate remote dataservice call.
   */
  function querySearch(query) {
    var results = query ? self.states.filter(createFilterFor(query)) : self.states,
      deferred;
    if (self.simulateQuery) {
      deferred = $q.defer();
      $timeout(function () {
        deferred.resolve(results);
      }, 10);
      return deferred.promise;
    } else {
      return results;
    }
  }

  function searchTextChange(text) {
    $log.debug('subject name changed to ' + text);
    $scope.noSubjectName = ((text == undefined) || (text.length == 0));
    $scope.text = text;
    updateCurl();
  }

  function selectedItemChange(item) {
    $log.debug('selected subject changed to ' + JSON.stringify(item));
    $scope.text = item.value;
    updateCurl();
  }

  /**
   * Build `states` list of key/value pairs
   */
  function loadAll() {
    // 1. Get all subject names
    $http.get(ENV.SCHEMA_REGISTRY + '/subjects/')
      .then(
        function successCallback(response) {
          var mainData = [];
          response.data.map(function (name) {
            var a = {
              value: name.toLowerCase(),
              display: name
            };
            mainData.push(a);
          });
          self.states = mainData;
        },
        function errorCallback(response) {
          $log.error("Failure with : " + response)
        });
  }

  /**
   * Create filter function for a query string
   */
  function createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query);
    return function filterFn(state) {
      return (state.value.indexOf(lowercaseQuery) === 0);
    };
  }

  function updateCurl() {
    $log.info("Updating curl commands accordingly");
    if (($scope.text == undefined) || $scope.text.length == 0) {
      var remoteSubject = "FILL_IN_SUBJECT";
    } else {
      var remoteSubject = $scope.text;
    }

    var curlPrefix = 'curl -vs --stderr - -XPOST -i -H "Content-Type: application/vnd.schemaregistry.v1+json" --data ';
    $scope.curlCommand =
      "\n// Test compatibility\n" + curlPrefix +
      "'" + '{"schema":"' + $scope.newAvroString.replace(/\n/g, " ").replace(/\s\s+/g, ' ').replace(/"/g, "\\\"") +
      '"}' + "' " + ENV.SCHEMA_REGISTRY + "/compatibility/subjects/" + remoteSubject + "/versions/latest" +
      "\n\n" +
      "// Register new schema\n" + curlPrefix +
      "'" + '{"schema":"' + $scope.newAvroString.replace(/\n/g, " ").replace(/\s\s+/g, ' ').replace(/"/g, "\\\"") +
      '"}' + "' " + ENV.SCHEMA_REGISTRY + "/subjects/" + remoteSubject + "/versions";
  }

  $scope.testCompatibility = function () {
    if (($scope.text == undefined) || $scope.text.length == 0) {
      $scope.showSimpleToast("Please fill in the subject name");
    } else {
      //$scope.showSimpleToast("Testing schema compatibility");
      var remoteSubject = $scope.text;

      var postCompatibility = {
        method: 'POST',
        url: ENV.SCHEMA_REGISTRY + '/compatibility/subjects/' + remoteSubject + "/versions/latest",
        data: '{"schema":"' + $scope.newAvroString.replace(/\n/g, " ").replace(/\s\s+/g, ' ').replace(/"/g, "\\\"") + '"}' + "'",
        dataType: 'json',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
      };

      $http(postCompatibility)
        .success(function (data) {
          $log.info("Success in testing schema compatibility " + JSON.stringify(data));
          $scope.showSimpleToast("Schema is compatible");
        })
        .error(function (data, status) {
          $log.info("Error on check compatibility : " + JSON.stringify(data));
          if (status >= 400) {
            $log.debug("Not allowed " + JSON.stringify(status) + " " + JSON.stringify(data));
            if (JSON.stringify(data).indexOf('40401') > -1) {
              $scope.showSimpleToast("Subject not found - " + $scope.text);
            } else {
              $scope.showSimpleToast(JSON.stringify(data));
            }
          } else {
            $log.debug("HTTP > 200 && < 400 (!) " + JSON.stringify(data));
          }
        });
    }
  };

  $scope.registerNewSchema = function () {
    if (($scope.text == undefined) || $scope.text.length == 0) {
      // Do nothing - UI will request user to fill it in
      $scope.showSimpleToast("Please fill in the subject name");
    } else {
      //$scope.showSimpleToast("Registering new schema");

      var remoteSubject = $scope.text;

      var postSchemaRegistration = {
        method: 'POST',
        url: ENV.SCHEMA_REGISTRY + '/subjects/' + remoteSubject + "/versions",
        data: '{"schema":"' + $scope.newAvroString.replace(/\n/g, " ").replace(/\s\s+/g, ' ').replace(/"/g, "\\\"") + '"}' + "'",
        dataType: 'json',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
      };

      $http(postSchemaRegistration)
        .success(function (data) {
          $log.info("Success in registering new schema " + JSON.stringify(data));
          var schemaId = data.id;
          $scope.showSimpleToast("Schema returned " + schemaId);
        })
        .error(function (data, status) {
          $log.info("Error on schema registration : " + JSON.stringify(data));
          var errorMessage = data.message;
          $scope.showSimpleToast(errorMessage);
          if (status >= 400) {
            $log.debug("Schema registrations is not allowed " + status + " " + data);
          } else {
            $log.debug("Schema registration failure: " + JSON.stringify(data));
          }
        });
    }
  };

  $scope.aceLoaded = function (_editor) {
    $scope.editor = _editor;
    updateCurl();
  };

  $scope.aceChanged = function (_editor) {
    updateCurl();
  };

  $scope.newAvroString = angular.toJson(
    {
      "type": "record",
      "name": "evolution",
      "namespace": "com.landoop",
      "fields": [{"name": "name", "type": "string"}, {"name": "number1", "type": "int"}, {
        "name": "number2",
        "type": "float"
      }]
    }, true);

  //Get the top level config
  $http.get(ENV.SCHEMA_REGISTRY + '/config/').then(
    function successCallback(response) {
      $scope.config = response.data;
    },
    function errorCallback(response) {
      $log.error("Failure with : " + JSON.stringify(response));
      $scope.connectionFailure = true;
    });
});

schemaRegistryUIApp.controller('SubjectsCtrl', function ($rootScope, $scope, $mdToast) {

  $rootScope.showSpinner = true;
  $scope.compare = true;
  $scope.tableViewOn = false;
  $scope.editor;
  $rootScope.showCreateSubjectButton = false;
  $mdToast.hide();

  $scope.aceLoaded = function (_editor) {
    $scope.editor = _editor;
  };

  $scope.changeView = function () {
    $scope.tableViewOn = !$scope.tableViewOn;
    // Refresh the ace-ui editor to fix a glitch
    $scope.editor.resize();
    $scope.editor.renderer.updateFull();
  }

}); //end of controller
