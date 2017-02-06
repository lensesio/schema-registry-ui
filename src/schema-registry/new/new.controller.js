angularAPP.controller('NewSubjectCtrl', function ($scope, $route, $rootScope, $http, $log, $q, $location, UtilsFactory, SchemaRegistryFactory, toastFactory, env, $filter) {
  $log.debug("NewSubjectCtrl - initiating");

  $scope.$on('$routeChangeSuccess', function() {
       $scope.cluster = env.getSelectedCluster().NAME;//$routeParams.cluster;
  })

  $scope.noSubjectName = true;
  $rootScope.listChanges = false;
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

  $scope.$watch(function () {
    return $scope.text;
  }, function (a) {
    $scope.allowCreateOrEvolution =false;
    updateCurl();
  }, true);

  $scope.$watch(function () {
    return $scope.newAvroString;
  }, function (a) {
    $scope.allowCreateOrEvolution =false;
    updateCurl();
  }, true);


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
   */
  $scope.allowCreateOrEvolution = false;
  var validTypes = ["null","double","string","record","int","float","long", "array", "boolean", "enum","map","fixed","bytes", "type"]
  var i =0;var j =0;var x =0;
  function testCompatibility(subject, newAvroString) {

   $scope.notValidType = false;

   var flattenObject = function(ob) {
          var toReturn = {};

          for (var i in ob) {
              if (!ob.hasOwnProperty(i)) continue;

              if ((typeof ob[i]) == 'object') {
                  var flatObject = flattenObject(ob[i]);
                  for (var x in flatObject) {
                      if (!flatObject.hasOwnProperty(x)) continue;
                      toReturn[i + '.' + x] = flatObject[x];
                  }

              } else {
                  toReturn[i] = ob[i];
              }
          }
          return toReturn;
      };

      var arr = [];
      for(var i in flattenObject(newAvroString))
      arr.push([i.split('.')[i.split('.').length-1], flattenObject(newAvroString)[i]]);

      var items = $filter('filter')(arr, 'type');

      angular.forEach(items , function (item) {
        if (validTypes.indexOf(item[1]) < 0) {
          $scope.notValidType = true;
          $scope.wrongType=item[1];
          console.log('not a valid type: ' + item[1]);
        }
      })


    newAvroString = JSON.stringify(newAvroString)

    var deferred = $q.defer();

    if ((subject == undefined) || subject.length == 0) {
      $scope.showSimpleToastToTop("Please fill in the subject name"); // (1.)
      $scope.aceBackgroundColor = "rgba(0, 128, 0, 0.04)";
      deferred.resolve("no-subject-name");
    } else {
      if ($scope.notValidType) {
        $scope.showSimpleToastToTop($scope.wrongType + " is not a valid type"); // (2.)
          $scope.aceBackgroundColor = "rgba(255, 255, 0, 0.10)";
        deferred.resolve("not-valid-type")
      } else if (!UtilsFactory.IsJsonString(newAvroString)) {
        $scope.showSimpleToastToTop("This schema is not valid"); // (2.)
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
          $log.info('Valid schema')
          deferred.resolve("new-schema")
        } else {
          SchemaRegistryFactory.testSchemaCompatibility($scope.text, $scope.newAvroString).then(
            function success(data) {
              $log.info("Success in testing schema compatibility " + data);
              // (4.)
                 $scope.allowCreateOrEvolution = false;
                 $scope.showSimpleToastToTop("Schema exists, please select a unique subject name");
                 $scope.aceBackgroundColor = "rgba(255, 255, 0, 0.10)";
                 deferred.resolve("non-compatible")
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
    if (JSON.stringify($scope.newAvroString)){
    var curlPrefix = 'curl -vs --stderr - -XPOST -i -H "Content-Type: application/vnd.schemaregistry.v1+json" --data ';
    $scope.curlCommand =
      "\n" +
      "// Register new schema\n" + curlPrefix +
      "'" + '{"schema":"' + JSON.stringify($scope.newAvroString).replace(/\n/g, " ").replace(/\s\s+/g, ' ').replace(/"/g, "\\\"") +
      '"}' + "' " + env.SCHEMA_REGISTRY() + "/subjects/" + remoteSubject + "/versions";
  }
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
        $scope.showSimpleToastToTop("Schema ID : " + id);
        $rootScope.listChanges = true; // trigger a cache re-load
        $location.path('/cluster/'+ $scope.cluster + '/schema/' + newSubject + '/version/latest');
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
          case "not-valid-type":
          case "failure":
          case "non-compatible":
            $log.debug("registerNewSchema - cannot do anything more with [ " + response + " ]");
            break;
          case 'new-schema':
            var schemaString = '';
            if(typeof $scope.newAvroString != 'string')
            schemaString = JSON.stringify($scope.newAvroString);
            else
            schemaString = $scope.newAvroString;
            registerNewSchemaPrivate(subject, schemaString).then(
              function success(newSchemaId) {
                $log.info("New subject id after posting => " + newSchemaId);
              },
              function failure(data) {
                $log.error("peiler2=>" + data);
                $scope.allowCreateOrEvolution = false;
                $scope.aceBackgroundColor = "rgba(255, 255, 0, 0.10)";
              });
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
                  $scope.allowCreateOrEvolution = false;
                  $scope.aceBackgroundColor = "rgba(255, 255, 0, 0.10)";
                });
              break;
            }
          default:
            $log.warn("Should never come here " + response);
        }
      },
      function failure(data) {
        if(data.error_code==500){
            $scope.aceBackgroundColor = "rgba(255, 255, 0, 0.10)";
            toastFactory.showSimpleToastToTop("Not a valid avro");
        }
        else {
          $log.error("Could not test compatibilitydasdas", data);
        }
      });

  };

  // $scope.createOrEvolve = "Create new schema";
  // $scope.allowCreateOrEvolution = true;
  // $scope.aceBackgroundColor = "rgba(0, 128, 0, 0.04)";


  //   $http(postSchemaRegistration)
  //   $http.get(env.SCHEMA_REGISTRY() + '/subjects/' + $scope.text + '/versions/latest')
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