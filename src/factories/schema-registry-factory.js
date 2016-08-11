angularAPP.factory('schemaRegistryFactory', function ($rootScope, $http, $location, $q, $log) {

    var subjectCACHE = []; // An array holding all cached subjects
    /* Public API */
    return {

      getSubject: function (subjectName, subjectVersion) {
        var deferred = $q.defer();

        var foundInCache = false;
        setTimeout(function () {
          angular.forEach(subjectCACHE, function (subject) {
            //$log.debug("Checking if " + subject.subjectName + "/" + subject.version + " == " + subjectName + "/" + subjectVersion);
            if (subject.subjectName == subjectName && subject.version == subjectVersion) {
              foundInCache = true;
              $log.debug("Subject found in cache : " + JSON.stringify(subject));
              deferred.resolve(subject);
            }
          });

          if (!foundInCache) {
            var fetchUrl = ENV.SCHEMA_REGISTRY + '/subjects/' + subjectName + '/versions/' + subjectVersion;
            $log.debug("  curl -X GET " + fetchUrl);
            $http.get(fetchUrl)
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
                        allVersions: allVersions,
                        id: detailsResponse.data.id,
                        schema: detailsResponse.data.schema,
                        Schema: JSON.parse(detailsResponse.data.schema)
                      };
                      //and set it to selectedSchema
                      deferred.resolve(cacheData);
                    },
                    function errorCallback(response) {
                      $log.error("Failure with : " + response + " " + JSON.stringify(response));
                      return $response;
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
        subjectCACHE = [];
        var allSubjectNames = []; // All available subject names in the schema registry
        var deferred = $q.defer();
        setTimeout(function () {
          deferred.notify("Initially get all subjects (just latest versions)");

          // 1. Get all subject names
          $http.get(ENV.SCHEMA_REGISTRY + '/subjects/')
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
                        subjectCACHE.push(cacheData);
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
        deferred.resolve(subjectCACHE);

        return deferred.promise;
      }
    }
  }
);