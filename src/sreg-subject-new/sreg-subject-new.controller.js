schemaRegistryUIApp.controller('CreateNewSubjectCtrl', function ($scope, $route, $rootScope, $http, $log, $location, toastFactory) {
  $log.debug("CreateNewSubjectCtrl - initiating");

  $scope.noSubjectName = true;
  $rootScope.showCreateSubjectButton = true;
  $rootScope.newCreated = false;

  $scope.showSimpleToast = function (message) {
    toastFactory.showSimpleToast(message);
  };

  $scope.hideToast = function () {
    toastFactory.hide();
  };

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
    if (item != undefined && item.display != undefined) {
      $scope.text = item.display;
      updateCurl();
    }
  }

  /**
   * Build `states` list of key/value pairs
   */
  function loadAll() {
    $log.debug("Loading all subjects to auto-suggest subject names");
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
    $log.debug("Updating curl commands accordingly");
    var remoteSubject = "FILL_IN_SUBJECT";
    if (($scope.text != undefined) && $scope.text.length > 0) {
      remoteSubject = $scope.text;
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
          if (data.is_compatible) {
            $scope.showSimpleToast("Schema is compatible");
          } else {
            $scope.showSimpleToast("Schema is NOT compatible");
          }
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
          $rootScope.newCreated = true;
          $http.get(ENV.SCHEMA_REGISTRY + '/subjects/' + $scope.text + '/versions/latest')
            .success(function (data) {
              $log.info("Schema succesfully registered: " + JSON.stringify(data));
              $location.path('/subjects/' + data.subject + '/version/' + data.version);
            });
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
    $scope.editor.$blockScrolling = Infinity;
    updateCurl();
  };

  $scope.aceLoaded_ = function (_editor) {
    $scope.editor = _editor;
    $scope.editor.$blockScrolling = Infinity;
  };

  $scope.aceChanged = function (_editor) {
    $scope.editor = _editor;
    updateCurl();
  };

  $scope.newAvroString =
    angular.toJson(
      {
        "type": "record",
        "name": "evolution",
        "namespace": "com.landoop",
        "fields": [{"name": "name", "type": "string"}, {"name": "number1", "type": "int"}, {
          "name": "number2",
          "type": "float"
        }]
      }, true);

});