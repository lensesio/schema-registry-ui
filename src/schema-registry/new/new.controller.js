angularAPP.controller('NewSubjectCtrl', function ($scope, $route, $rootScope, $http, $log, $q, $location, UtilsFactory, SchemaRegistryFactory, toastFactory) {
  $log.debug("NewSubjectCtrl - initiating");

  $scope.noSubjectName = true;
  $rootScope.newCreated = false;
  toastFactory.hideToast();

  $scope.showSimpleToast = function (message) {
    toastFactory.showSimpleToast(message)
  };
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
    // $log.debug('subject name changed to ' + text);
    $scope.noSubjectName = ((text == undefined) || (text.length == 0));
    $scope.text = text;
    updateCurl();
  }

  function selectedItemChange(item) {
    // $log.debug('selected subject changed to ' + JSON.stringify(item));
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
    $http.get(SCHEMA_REGISTRY + '/subjects/')
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

  /**
   * Possibilities
   * 1. no-subject-name -> User has not filled-in the subjectName
   * 2. not-json        -> Schema is invalid Json
   * 3. new-schema      -> Schema is Json + subject does not exist
   * 4. compatible      -> Schema is Json + subject already exists - and it's compatible
   * 5. non-compatible  -> Schema is Json + subject already exists - and it's not compatible
   * 6. failure         -> Connection failure
   */
  $scope.allowCreateOrEvolution = false;
  function testCompatibility(subject, newAvroString) {
    var deferred = $q.defer();
    if ((subject == undefined) || subject.length == 0) {
      $scope.showSimpleToastToTop("Please fill in the subject name"); // (1.)
      $scope.aceBackgroundColor = "white";
      deferred.resolve("no-subject-name");
    } else {
      if (!UtilsFactory.IsJsonString(newAvroString)) {
        $scope.showSimpleToastToTop("This schema is not valid Json"); // (2.)
        $scope.aceBackgroundColor = "rgba(255, 255, 0, 0.10)";
        deferred.resolve("not-json")
      } else {
        var latestKnownSubject = SchemaRegistryFactory.getLatestSubjectFromCache(subject);
        if (latestKnownSubject == undefined) {
          // (3.)
          $scope.createOrEvolve = "Create new schema";
          $scope.showSimpleToast("This will be a new Subject");
          $scope.allowCreateOrEvolution = true;
          $scope.aceBackgroundColor = "rgba(0, 128, 0, 0.04)";
          deferred.resolve("new-schema")
        } else {
          SchemaRegistryFactory.testSchemaCompatibility($scope.text, $scope.newAvroString).then(
            function success(data) {
              $log.info("Success in testing schema compatibility " + data);
              // (4.)
              if (data == 'true') {
                $scope.createOrEvolve = "Evolve schema";
                $scope.allowCreateOrEvolution = true;
                $scope.aceBackgroundColor = "rgba(0, 128, 0, 0.04)";
                $scope.showSimpleToast("Schema seems compatible");
                deferred.resolve("compatible")
              } else if (data == 'false') {
                // (5.)
                $scope.allowCreateOrEvolution = false;
                $scope.showSimpleToastToTop("Schema is NOT compatible");
                $scope.aceBackgroundColor = "rgba(255, 255, 0, 0.10)";
                deferred.resolve("non-compatible")
              } else if (data == 'new') {
                $scope.createOrEvolve = "Create new schema";
                $scope.allowCreateOrEvolution = true;
                $scope.showSimpleToast("This will be a new Subject");
                $scope.aceBackgroundColor = "rgba(0, 128, 0, 0.04)";
                deferred.resolve("??")
              }
            },
            function failure(data) {
              $scope.showSimpleToastToTop("Failure with - " + data);
              deferred.resolve("failure");
            }
          );
        }
      }
    }

    return deferred.promise;
  }

  /**
   * Update curl to reflect  selected subject + schema
   */
  function updateCurl() {
    //$log.debug("Updating curl commands accordingly");
    var remoteSubject = "FILL_IN_SUBJECT";
    if (($scope.text != undefined) && $scope.text.length > 0) {
      remoteSubject = $scope.text;
    }

    var curlPrefix = 'curl -vs --stderr - -XPOST -i -H "Content-Type: application/vnd.schemaregistry.v1+json" --data ';
    $scope.curlCommand =
      "\n// Test compatibility\n" + curlPrefix +
      "'" + '{"schema":"' + $scope.newAvroString.replace(/\n/g, " ").replace(/\s\s+/g, ' ').replace(/"/g, "\\\"") +
      '"}' + "' " + SCHEMA_REGISTRY + "/compatibility/subjects/" + remoteSubject + "/versions/latest" +
      "\n\n" +
      "// Register new schema\n" + curlPrefix +
      "'" + '{"schema":"' + $scope.newAvroString.replace(/\n/g, " ").replace(/\s\s+/g, ' ').replace(/"/g, "\\\"") +
      '"}' + "' " + SCHEMA_REGISTRY + "/subjects/" + remoteSubject + "/versions";
  }

  /**
   * Private method to register-new-schema
   */
  function registerNewSchemaPrivate(newSubject, newAvro) {

    var deferred = $q.defer();

    SchemaRegistryFactory.registerNewSchema(newSubject, newAvro).then(
      function success(id) {
        $log.info("Success in registering new schema " + id);
        var schemaId = id;
        $scope.showSimpleToastToTop("New schema ID : " + id);
        $rootScope.newCreated = true; // trigger a cache re-load
        $location.path('/schema/' + newSubject + '/version/latest');
        deferred.resolve(schemaId);
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
        deferred.reject(errorMessage);
      });

    return deferred.promise;

  }

  $scope.testCompatibility = function () {
    return testCompatibility($scope.text, $scope.newAvroString);
  };

  /**
   * How to responde to register new schema clicks
   */
  $scope.registerNewSchema = function () {
    var subject = $scope.text;
    testCompatibility(subject, $scope.newAvroString).then(
      function success(response) {
        // no-subject-name | not-json | new-schema | compatible | non-compatible | failure
        switch (response) {
          case "no-subject-name":
          case "not-json":
          case "failure":
          case "non-compatible":
            $log.debug("registerNewSchema - cannot do anything more with [ " + response + " ]");
            break;
          case 'new-schema':
            alert("Selected Case Number is 1");
            break;
          case 'compatible':
            $log.info("Compatibility [compatible]");
            // TODO
            var latestKnownSubject = SchemaRegistryFactory.getLatestSubjectFromCache(subject);
            if (latestKnownSubject == undefined) {
              $log.error("This should never happen.")
            } else {
              $log.info("Existing schema id = " + latestKnownSubject.version);
              registerNewSchemaPrivate(subject, $scope.newAvroString).then(
                function success(newSchemaId) {
                  $log.info("New subject id after posting => " + newSchemaId);
                  if (latestKnownSubject.version == newSchemaId) {
                    toastFactory.showSimpleToastToTop("The schema you posted was same to the existing one")
                  }
                },
                function failure(data) {
                  $log.error("peiler=>" + data);
                });
              break;
            }
          default:
            $log.warn("Should never come here " + response);
        }
      },
      function failure(data) {
        $log.error("Could not test schema compatibility")
      });

  };

  // $scope.createOrEvolve = "Create new schema";
  // $scope.allowCreateOrEvolution = true;
  // $scope.aceBackgroundColor = "rgba(0, 128, 0, 0.04)";


  //   $http(postSchemaRegistration)
  //   $http.get(SCHEMA_REGISTRY + '/subjects/' + $scope.text + '/versions/latest')
  //     .success(function (data) {
  //       $log.info("Schema succesfully registered: " + JSON.stringify(data));
  //       $location.path('/subjects/' + data.subject + '/version/' + data.version);
  //     });
  // }

  // When the 'Ace' of the schema/new is loaded
  $scope.newSchemaAceLoaded = function (_editor) {
    $scope.editor = _editor;
    $scope.editor.$blockScrolling = Infinity;
    $scope.aceSchemaSession = _editor.getSession(); // we can get data on changes now
    var lines = $scope.newAvroString.split("\n").length;
    // TODO : getScalaFiles($scope.aceString);
    // Add one extra line for each command > 110 characters
    angular.forEach($scope.newAvroString.split("\n"), function (line) {
      lines = lines + Math.floor(line.length / 110);
    });
    if (lines <= 1) {
      lines = 10;
    }
    _editor.setOptions({
      minLines: lines + 1,
      maxLines: lines + 1,
      highlightActiveLine: false
    });
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