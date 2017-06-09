var angular = require('angular');
var _ = require('underscore');
var angularAPP = angular.module('angularAPP');

var SubjectListCtrl = function ($scope, $rootScope, $log, $q, $mdMedia, $routeParams, filterFilter, SchemaRegistryFactory, env) {

   $scope.cluster = env.getSelectedCluster().NAME;
   $rootScope.selectedItem = $routeParams.subject;




   SchemaRegistryFactory.subjects().then(function(res){
         $scope.schemas = res.data
   })


/////////////////////////////////
  $scope.currentPage = 1;
  $scope.pageSize = 10;
  $scope.startIndex = 0;
  $scope.schemasOnPage;
  $scope.isFiltered = false;
  $scope.filteredArray = [];
  $scope.search = '';

  $scope.setStartIndex = function(f) {
    $scope.startIndex = f;
    if(!$scope.isFiltered) {
        createLookupArray(_.first(_.rest($scope.schemas, f), $scope.pageSize))
    } else {
        $scope.filteredArray = filterFilter($scope.schemas, $scope.search) //TODO it does this every time
        createLookupArray(_.first(_.rest($scope.filteredArray, f), $scope.pageSize));
    }
  }

  $scope.$watch('search', function() {
    $scope.isFiltered = !($scope.search.trim() == '')
    $scope.currentPage = 1
  });

   function createLookupArray(array) {
         $scope.schemasOnPageFull = null;
         var enhancedArray = _.map(array, function(i) { return getSubject(i, 'latest')})
         $q.all(enhancedArray).then(function(res) {
                $scope.schemasOnPageFull = res;
         });
   }

  var pageSize = (window.innerHeight - 355) / 48;
  Math.floor(pageSize) < 3 ? $scope.pageSize = 3 : $scope.pageSize = Math.floor(pageSize);
///////////////////////////////

  function getSubject(subject, version) {
          var subjectObj = {};

          SchemaRegistryFactory.subject(subject, version).then(function(res) {
              subjectObj.subjectInfo = res.data;
          })
          .then(SchemaRegistryFactory.subjectVersions(subject).then(function(res) {
              subjectObj.versions = res.data;
          }))
          .then(SchemaRegistryFactory.subjectConfig(subject).then(function(res) {
              subjectObj.config = res.data;
          }));

          return subjectObj;
      }

};

SubjectListCtrl.$inject = ['$scope', '$rootScope', '$log', '$q', '$mdMedia','$routeParams', 'filterFilter','SchemaRegistryFactory', 'env'];

angularAPP.controller('SubjectListCtrl', SubjectListCtrl);
