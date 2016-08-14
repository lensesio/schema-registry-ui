angularAPP.factory('schemaRegistryFactory', function ($rootScope, $http, $location, $q, $log) {

  /**
   * Get subjects
   * @see http://docs.confluent.io/3.0.0/schema-registry/docs/api.html#get--subjects
   */
  function getSubjects() {

    var url = ENV.SCHEMA_REGISTRY + '/subjects/';
    $log.debug("  curl -X GET " + url);
    var start = new Date().getTime();

    var deferred = $q.defer();
    $http.get(url)
      .then(
        function successCallback(response) {
          allSubjectNames = response.data;
          $log.debug("  got " + allSubjectNames.length + " registered subjects in [ " + ((new Date().getTime()) - start) + " ] msec");
          deferred.resolve(allSubjectNames);
        },
        function errorCallback(response) {
          deferred.reject("Failure with : " + response)
        });

    return deferred.promise;
  }

  /**
   * Get subjects versions
   * @see http://docs.confluent.io/3.0.0/schema-registry/docs/api.html#get--subjects-(string- subject)-versions
   */
  function getSubjectsVersions(subjectName) {

    var url = ENV.SCHEMA_REGISTRY + '/subjects/' + subjectName + '/versions/';
    $log.debug("  curl -X GET " + url);
    var start = new Date().getTime();

    var deferred = $q.defer();
    $http.get(url).then(
      function successCallback(response) {
        var allVersions = response.data;
        $log.debug("  got versions " + JSON.stringify(allVersions) + " in [ " + (new Date().getTime() - start) + " ] msec");
        deferred.resolve(allVersions);
      },
      function errorCallback(response) {
        var msg = "Failure with : " + response + " " + JSON.stringify(response);
        $log.error(msg);
        deferred.reject(msg);
      });

    return deferred.promise;

  }

  /**
   * Get a specific version of the schema registered under this subject
   * @see http://docs.confluent.io/3.0.0/schema-registry/docs/api.html#get--subjects-(string- subject)-versions-(versionId- version)
   */
  function getSubjectAtVersion(subjectName, version) {

    var url = ENV.SCHEMA_REGISTRY + '/subjects/' + subjectName + '/versions/' + version;
    $log.debug("  curl -X GET " + url);

    var deferred = $q.defer();
    $http.get(url).then(
      function successCallback(response) {
        var subjectInformation = response.data;
        $log.debug("  got [ " + subjectName + " ]" + JSON.stringify(subjectInformation).length + " bytes");
        deferred.resolve(subjectInformation);
      },
      function errorCallback(response) {
        var msg = "Failure getting subject at version : " + response + " " + JSON.stringify(response);
        $log.error(msg);
        deferred.reject(msg);
      });

    return deferred.promise;

  }

  /**
   * Register a new schema under the specified subject. If successfully registered, this returns the unique identifier of this schema in the registry.
   * @see http://docs.confluent.io/3.0.0/schema-registry/docs/api.html#post--subjects-(string- subject)-versions
   */
  function postNewSubjectVersion(subjectName, newSchema) {

    var deferred = $q.defer();
    $log.debug("Posting new version of subject [" + subjectName + "]");

    var postSchemaRegistration = {
      method: 'POST',
      url: ENV.SCHEMA_REGISTRY + '/subjects/' + subjectName + "/versions",
      data: '{"schema":"' + newSchema.replace(/\n/g, " ").replace(/\s\s+/g, ' ').replace(/"/g, "\\\"") + '"}' + "'",
      dataType: 'json',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
    };

    $http(postSchemaRegistration)
      .success(function (data) {
        $log.info("Success in registering new schema " + JSON.stringify(data));
        var schemaId = data.id;
        deferred.resolve(schemaId);
      })
      .error(function (data, status) {
        $log.info("Error on schema registration : " + JSON.stringify(data));
        var errorMessage = data.message;
        $scope.showSimpleToastToTop(errorMessage);
        if (status >= 400) {
          $log.debug("Schema registrations is not allowed " + status + " " + data);
        } else {
          $log.debug("Schema registration failure: " + JSON.stringify(data));
        }
        $defered.reject("Something")
      });

    return deferred.promise;

  }

  /**
   * Check if a schema has already been registered under the specified subject. If so, this returns the schema string
   * along with its globally unique identifier, its version under this subject and the subject name.
   *
   * @see http://docs.confluent.io/3.0.0/schema-registry/docs/api.html#post--subjects-(string- subject)
   */
  function checkSchemaExists(subjectName, subjectInformation) {

    var deferred = $q.defer();
    $log.debug("Checking if schema exists under this subject [" + subjectName + "]");

    var postSchemaExists = {
      method: 'POST',
      url: ENV.SCHEMA_REGISTRY + '/subjects/' + subjectName,
      data: '{"schema":"' + subjectInformation.replace(/\n/g, " ").replace(/\s\s+/g, ' ').replace(/"/g, "\\\"") + '"}' + "'",
      dataType: 'json',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
    };

    $http(postSchemaExists)
      .success(function (data) {
        var response = {
          id: data.id,
          version: data.version
        };
        $log.info("Response : " + JSON.stringify(response));
        deferred.resolve(response);
      })
      .error(function (data, status) {
        $log.info("Error while checking if schema exists under a subject : " + JSON.stringify(data));
        var errorMessage = data.message;
        if (status == 407) {
          $log.debug("Subject not found or schema not found - 407 - " + status + " " + data);
        } else {
          $log.debug("Some other failure: " + JSON.stringify(data));
        }
        $defered.reject("Something")
      });

    return deferred.promise;

  }

  /**
   * Test input schema against a particular version of a subject’s schema for compatibility.
   * @see http://docs.confluent.io/3.0.0/schema-registry/docs/api.html#post--compatibility-subjects-(string- subject)-versions-(versionId- version)
   */
  function testSchemaCompatibility(subjectName, subjectInformation) {

    var deferred = $q.defer();
    $log.debug("Checking schema compatibility for [" + subjectName + "]");

    var postCompatibility = {
      method: 'POST',
      url: ENV.SCHEMA_REGISTRY + '/compatibility/subjects/' + subjectName + "/versions/latest",
      data: '{"schema":"' + subjectInformation.replace(/\n/g, " ").replace(/\s\s+/g, ' ').replace(/"/g, "\\\"") + '"}' + "'",
      dataType: 'json',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
    };

    $http(postCompatibility)
      .success(function (data) {
        $log.info("Success in testing schema compatibility " + JSON.stringify(data));
        deferred.resolve(data.is_compatible)
      })
      .error(function (data, status) {
        $log.info("Error on check compatibility : " + JSON.stringify(data));
        if (status >= 400) {
          $log.debug("Not allowed " + JSON.stringify(status) + " " + JSON.stringify(data));
          if (JSON.stringify(data).indexOf('40401') > -1) {
            $log.error("Subject not found - " + $scope.text);
          } else {
            $log.error(JSON.stringify(data));
          }
        } else {
          $log.debug("HTTP > 200 && < 400 (!) " + JSON.stringify(data));
        }
        deferred.reject(data);
      });

    return deferred.promise;

  }

  /**
   * Put global config (Test input schema against a particular version of a subject’s schema for compatibility.
   * @see http://docs.confluent.io/3.0.0/schema-registry/docs/api.html#put--config
   */
  function putConfig(compatibilityLevel) {

    var deferred = $q.defer();

    if (["NONE", "FULL", "FORWARD", "BACKWARD"].instanceOf(compatibilityLevel) != -1) {

      var postConfig = {
        method: 'POST',
        url: ENV.SCHEMA_REGISTRY + '/config',
        data: '{"compatibility":"' + compatibilityLevel + '"}' + "'",
        dataType: 'json',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
      };

      $http(postConfig)
        .success(function (data) {
          $log.info("Success in changing global schema-registry compatibility " + JSON.stringify(data));
          deferred.resolve(data.compatibility)
        })
        .error(function (data, status) {
          $log.info("Error on changing global compatibility : " + JSON.stringify(data));
          if (status == 422) {
            $log.warn("Invalid compatibility level " + JSON.stringify(status) + " " + JSON.stringify(data));
            if (JSON.stringify(data).indexOf('50001') > -1) {
              $log.error(" Error in the backend data store - " + $scope.text);
            } else if (JSON.stringify(data).indexOf('50003') > -1) {
              $log.error("Error while forwarding the request to the master: " + JSON.stringify(data));
            }
          } else {
            $log.debug("HTTP > 200 && < 400 (!) " + JSON.stringify(data));
          }
          deferred.reject(data);
        });

    } else {
      $log.warn("Compatibility level:" + compatibilityLevel + " is not supported");
      deferred.reject();
    }

    return deferred.promise;

  }

  /**
   * Get global compatibility-level config
   * @see http://docs.confluent.io/3.0.0/schema-registry/docs/api.html#get--config
   */
  function getGlobalConfig() {

    var deferred = $q.defer();

    $http.get(ENV.SCHEMA_REGISTRY + '/config')
      .success(function (data) {
        deferred.resolve(data)
      })
      .error(function (data, status) {
        deferred.reject("Get global config rejection : " + data + " " + status)
      });

    return deferred.promise;

  }

  /**
   * Update compatibility level for the specified subject
   * @see http://docs.confluent.io/3.0.0/schema-registry/docs/api.html#put--config-(string- subject)
   */
  function updateSubjectCompatibility(subjectName, newCompatibilityLevel) {

    var deferred = $q.defer();

    if (["NONE", "FULL", "FORWARD", "BACKWARD"].instanceOf(newCompatibilityLevel) != -1) {

      var postConfig = {
        method: 'POST',
        url: ENV.SCHEMA_REGISTRY + '/config/' + subjectName,
        data: '{"compatibility":"' + newCompatibilityLevel + '"}' + "'",
        dataType: 'json',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
      };

      $http(postConfig)
        .success(function (data) {
          $log.info("Success in changing subject [ " + subjectName + " ] compatibility " + JSON.stringify(data));
          deferred.resolve(data.compatibility)
        })
        .error(function (data, status) {
          $log.info("Error on changing compatibility : " + JSON.stringify(data));
          if (status == 422) {
            $log.warn("Invalid compatibility level " + JSON.stringify(status) + " " + JSON.stringify(data));
            if (JSON.stringify(data).indexOf('50001') > -1) {
              $log.error(" Error in the backend data store - " + $scope.text);
            } else if (JSON.stringify(data).indexOf('50003') > -1) {
              $log.error("Error while forwarding the request to the master: " + JSON.stringify(data));
            }
          } else {
            $log.debug("HTTP > 200 && < 400 (!) " + JSON.stringify(data));
          }
          deferred.reject(data);
        });

    } else {
      $log.warn("Compatibility level:" + compatibilityLevel + " is not supported");
      deferred.reject();
    }

    return deferred.promise;

  }

  var allSchemas = []; // An array holding all cached subjects
  /* Public API */
  return {

    getSubjects: function () {
      return getSubjects();
    },
    registerNewSchema: function (subjectName, subjectInformation) {
      return postNewSubjectVersion(subjectName, subjectInformation);
    },
    testSchemaCompatibility: function (subjectName, subjectInformation) {
      return testSchemaCompatibility(subjectName, subjectInformation);
    },
    getGlobalConfig: function () {
      return getGlobalConfig();
    },
    getSubjectsVersions: function (subjectName) {
      return getSubjectsVersions(subjectName);
    },
    getSubjectsWithMetadata: function (subjectName, subjectVersion) {

      var deferred = $q.defer();

      var foundInCache = false;
      angular.forEach(allSchemas, function (subject) {
        // $log.debug("Checking if " + subject.subjectName + "/" + subject.version + " == " + subjectName + "/" + subjectVersion);
        if (subject.subjectName == subjectName && subject.version == subjectVersion) {
          foundInCache = true;
          $log.debug("[ " + subjectName + "/" + subjectVersion + " ] found in cache " + JSON.stringify(subject).length + " bytes");
          deferred.resolve(subject);
        }
      });

      if (!foundInCache) {
        var start = new Date().getTime();
        getSubjectAtVersion(subjectName, subjectVersion).then(
          function successCallback(subjectInformation) {
            getSubjectsVersions(subjectName).then(
              function successCallback(allVersions) {
                var otherVersions = [];
                angular.forEach(allVersions, function (version) {
                  if (version != subjectVersion) {
                    otherVersions.push(version);
                  }
                });
                //cache it
                var subjectInformationWithMetadata = {
                  subjectName: subjectInformation.subject,
                  version: subjectInformation.version,
                  otherVersions: otherVersions, // Array
                  allVersions: allVersions,
                  id: subjectInformation.id,
                  schema: subjectInformation.schema,
                  Schema: JSON.parse(subjectInformation.schema)
                };
                $log.debug("  got " + subjectName + "/" + subjectVersion + "in [ " + (new Date().getTime() - start) + " ] msec");
                deferred.resolve(subjectInformationWithMetadata);
              },
              function errorCallback(response) {
                $log.error("Failed at getting subject's versions : " + response + " " + JSON.stringify(response));
              });
          },
          function errorCallback(response) {
            $log.error("Failure with : " + JSON.stringify(response));
          });
      }
      return deferred.promise;

    },
    fetchLatestSubjects: function () {
      allSchemas = [];
      var allSubjectNames = []; // All available subject names in the schema registry
      var deferred = $q.defer();
      setTimeout(function () {
        deferred.notify("Initially get all subjects (just latest versions)");

        // 1. Get all subject names
        getSubjects()
        // 2. Get full details of subject's final versions
          .then(
            function successCallback(allSubjectNames) {
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
                          //$log.debug("Pushing version " + version);
                        }
                      });

                      // Always cast from JSon to maintain a data contract
                      var cacheData = {
                        subjectName: result.data.subject,
                        version: result.data.version,
                        otherVersions: otherVersions, // Array
                        allVersions: allVersions,
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
                      allSchemas.push(cacheData);
                    },
                    function errorCallback(response) {
                      deferred.reject("Failure with : " + response);
                      $log.error("Failure with : " + response)
                    });

                });
              });
            });

      }, 1);
      $rootScope.showSpinner = false;
      deferred.resolve(allSchemas);

      return deferred.promise;
    }

//     if () {
//       $scope.showSimpleToastToTop("Schema is compatible");
//     } else {
//       $scope.showSimpleToastToTop("Schema is NOT compatible");
// }

  }
});