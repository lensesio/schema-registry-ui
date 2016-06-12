'use strict';

var kafkaSRApp = angular.module('kafkaSRApp', [, 'ui.ace', 'angularSpinner', 'angularUtils.directives.dirPagination']);

kafkaSRApp.controller('SchemaCtrl', function($scope, $http, $q, $filter) {

    $scope.showSpinner = true;
    $scope.compare = true;
    $scope.tableViewOn = true;
    $scope.config = {};
    $scope.allSubjects = [];
    $scope.allSubjectsDetails = [];

    //Get the top level config
    $http.get(ENV.BASE_URL + 'config/').then(
        function successCallback(response) { $scope.config = response.data; },
        function errorCallback(response) { console.log("FAIL "+ response) });

    //Get schema data
    $http.get(ENV.BASE_URL + 'subjects/')
      .then( //1. Get the subjects
        function successCallback(response) { $scope.allSubjects = response.data; },
        function errorCallback(response) { console.log("FAIL "+ response) })
      .then( //2. Get the all subjects final versions
        function successCallback() {
          var urlCalls = [];
          angular.forEach($scope.allSubjects, function(subject) {
            urlCalls.push($http.get(ENV.BASE_URL + 'subjects/' + subject + '/versions/latest'));
          });
          $q.all(urlCalls).then(function(results) {
            angular.forEach(results, function(result) {
              //3. Add some extra values to help the UI
              result.data.schemaObj = JSON.parse(result.data.schema);
              result.data.schema = angular.toJson(result.data.schemaObj, true);
              result.data.latestVersion = result.data.version;
              result.data.selectedVersion = result.data.version;
              result.data.selectedId = result.data.id;

              $http.get(ENV.BASE_URL + 'subjects/' + result.data.subject + '/versions/').then(
                function successCallback(response) {
                  result.data.allVersions = response.data;
                  var a = [];
                  angular.forEach(result.data.allVersions, function(version) {
                    if(version != result.data.version) {
                        a.push({version: version});
                    }
                  });
                  result.data.prevVersions = a;
                },
                function errorCallback(response) { console.log("FAIL "+ response) });

              $scope.allSubjectsDetails.push(result.data);
            });
            $scope.showSpinner = false;
          });
      });

    //Show slected subject schema details
    $scope.showSubjectDetails = function(subjectItem, selectedVersion) {
      if(selectedVersion == subjectItem.latestVersion) {
          subjectItem.selectedSchema = subjectItem.schema;
          subjectItem.selectedSchemaObj = subjectItem.schemaObj;
      } else {
        var selectedVersionFromPrev = $filter('filter')(subjectItem.prevVersions, {version:selectedVersion})[0];
        if (selectedVersionFromPrev.schema == undefined) {
          $http.get(ENV.BASE_URL + 'subjects/' + subjectItem.subject + '/versions/' + selectedVersion)
               .then(
                 function successCallback(response) {
                   //cache it
                   selectedVersionFromPrev.schemaObj = JSON.parse(response.data.schema);
                   selectedVersionFromPrev.schema = angular.toJson(selectedVersionFromPrev.schemaObj, true);
                   selectedVersionFromPrev.id = response.data.id
                   //and set it to selectedSchema
                   subjectItem.selectedSchema = selectedVersionFromPrev.schema;
                   subjectItem.selectedSchemaObj = selectedVersionFromPrev.schemaObj;
                   subjectItem.selectedId = selectedVersionFromPrev.id;
                 },
                 function errorCallback(response) { console.log("FAIL "+ response) });
        } else {
          subjectItem.selectedSchema = selectedVersionFromPrev.schema;
          subjectItem.selectedSchemaObj = selectedVersionFromPrev.schemaObj;
          subjectItem.selectedId = selectedVersionFromPrev.id;
        }
      }

      subjectItem.selectedVersion = selectedVersion;
      $scope.selectedSubject = subjectItem;
    }

    $scope.changeView = function(item) {
      $scope.tableViewOn = !$scope.tableViewOn;
    }

    $scope.conditionsForComparison = function() {
      return
      (($scope.selectedSubject.selectedVersion != $scope.selectedSubject.latestVersion) &&
       !$scope.tableViewOn && $scope.compare );
    }

}); //end of controller
