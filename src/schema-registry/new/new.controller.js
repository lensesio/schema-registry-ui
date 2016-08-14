angularAPP.controller('CreateNewSubjectCtrl', function ($scope, $route, $rootScope, $http, $log, $location, schemaRegistryFactory, toastFactory) {
  $log.debug("CreateNewSubjectCtrl - initiating");

  $scope.noSubjectName = true;
  $rootScope.newCreated = false;

  $scope.showSimpleToastToTop = function (message) {
    toastFactory.showSimpleToastToTop(message);
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
      $scope.showSimpleToastToTop("Please fill in the subject name");
    } else {
      //$scope.showSimpleToastToTop("Testing schema compatibility");
      schemaRegistryFactory.testSchemaCompatibility($scope.text, $scope.newAvroString).then(
        function success(data) {
          // $log.info("Success in testing schema compatibility " + JSON.stringify(data));
          if (data == true) {
            $scope.showSimpleToastToTop("Schema is compatible");
          } else {
            $scope.showSimpleToastToTop("Schema is NOT compatible");
          }
        },
        function failure(data) {
          $scope.showSimpleToastToTop("Failure with - " + data);
        }
      );
    }
  };

  $scope.registerNewSchema = function () {
    if (($scope.text == undefined) || $scope.text.length == 0) {
      $scope.showSimpleToastToTop("Please fill in the subject name");
    } else {
      var subject = $scope.text;
      schemaRegistryFactory.registerNewSchema(subject, $scope.newAvroString).then(
        function success(data) {
          $log.info("Success in registering new schema " + JSON.stringify(data));
          var schemaId = data.id;
          $scope.showSimpleToastToTop("Schema returned " + schemaId);
          $rootScope.newCreated = true;
        },
        function error(data, status) {
          $log.info("Error on schema registration : " + JSON.stringify(data));
          var errorMessage = data.message;
          $scope.showSimpleToastToTop(errorMessage);
          if (status >= 400) {
            $log.debug("Schema registrations is not allowed " + status + " " + data);
          } else {
            $log.debug("Schema registration failure: " + JSON.stringify(data));
          }
        });

      //   $http(postSchemaRegistration)
      //   $http.get(ENV.SCHEMA_REGISTRY + '/subjects/' + $scope.text + '/versions/latest')
      //     .success(function (data) {
      //       $log.info("Schema succesfully registered: " + JSON.stringify(data));
      //       $location.path('/subjects/' + data.subject + '/version/' + data.version);
      //     });
      // }
    }
  };

  // When the 'Ace' of the schema/new is loaded
  $scope.newSchemaAceLoaded = function (_editor) {
    $scope.editor = _editor;
    $scope.editor.$blockScrolling = Infinity;
    updateCurl();
  };

  // When the 'Ace' of the schema/new is CHANGED (!)
  $scope.newSchemaAceChanged = function (_editor) {
    $scope.editor = _editor;
    updateCurl();
  };

  // When the 'Ace' of the curl command is loaded
  $scope.curlCommandAceLoaded = function (_editor) {
    $scope.editor = _editor;
    $scope.editor.$blockScrolling = Infinity;
  };


  $scope.newAvroString =
    angular.toJson(
      {
        "type": "record",
        "name": "evolution",
        "doc": "This is a sample Avro schema to get you started. Please edit",
        "namespace": "com.landoop",
        "fields": [{"name": "name", "type": "string"}, {"name": "number1", "type": "int"}, {
          "name": "number2",
          "type": "float"
        }]
      }, true);

});