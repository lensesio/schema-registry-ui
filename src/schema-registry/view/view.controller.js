var angular = require('angular');
var angularAPP = angular.module('angularAPP');
var ace = require('brace');
require('brace/mode/json');
require('brace/mode/batchfile');
require('brace/theme/chrome');
require('brace/worker/json');
require.context("brace/ext/", false);
//var Range = ace.acequire('ace/range').Range;
var _ = require('underscore');


var SubjectsCtrl = function ($rootScope, $scope, $route, $routeParams, $log, $location, $q, $mdDialog, SchemaRegistryFactory, UtilsFactory, toastFactory, Avro4ScalaFactory, env) {

    handleRouteParams();

    $scope.hideEdit = false;
    $scope.aceReady = true; //tODO
    $scope.arraySchema = true; //tODO

    $scope.subject = {};
    if($scope.subjectName) {
        $scope.subject = getSubject($scope.subjectName, $scope.subjectVersion);
    }

    $scope.isAvroAceEditable = false;
    $scope.aceBackgroundColor = "white";

//TODO Important!
//    $scope.arraySchema = typeof $scope.subject.subjectInfo.schema[0] !== 'undefined' ? true : false;
//    $scope.tableWidth = 100 / $scope.subject.subjectInfo.schema.length;

    $scope.cancelEditor = function () {
        $scope.selectedIndex = 0;
        $log.info("Canceling editor");
        $scope.maxHeight = $scope.maxHeight + 64;
        $scope.form.json.$error.validJson = false;
        $scope.aceBackgroundColor = "white";
        toastFactory.hideToast();
        $log.info("Setting " + $scope.aceStringOriginal);
        $scope.isAvroAceEditable = false;
        $scope.isAvroUpdatedAndCompatible = false;
        $scope.aceString = $scope.aceStringOriginal;
        $scope.aceSchemaSession.setValue($scope.aceString);

      };

    $scope.toggleEditor = function () {
        $scope.isAvroAceEditable = !$scope.isAvroAceEditable;
        if ($scope.isAvroAceEditable) {
          $scope.maxHeight = $scope.maxHeight - 64;
          toastFactory.showLongToast("You can now edit the schema");
          $scope.aceBackgroundColor = "rgba(0, 128, 0, 0.04)";
        } else {
          $scope.aceBackgroundColor = "white";
          toastFactory.hideToast();
        }
    };

    $scope.otherTabSelected = function () {
        $scope.hideEdit = true;
    };

    $scope.testAvroCompatibility = function () { return ''}
    $scope.evolveAvroSchema = function () {return ''};

    $scope.getPreviousFromHistory = function(currentVersion) {
        if (currentVersion > 1) {
          var a = _.where($scope.subject.history, { version : currentVersion - 1});
          console.log("AAA", a)
          return JSON.parse(a);
        }
    }

    $scope.getCurrentFromHistory = function(currentVersion) {
        return JSON.parse(_.where($scope.subject.history, { version : currentVersion}));
    }

    function handleRouteParams() {
       $scope.subjectName = $routeParams.subject;
       $scope.cluster = $routeParams.cluster;//env.getSelectedCluster().NAME;
       if($routeParams.version) {
          $scope.subjectVersion = $routeParams.version;
       } else {
          $scope.subjectVersion = 'latest';
       }

       //tODO
       $rootScope.selectedItem = $routeParams.subject;

    }

    function getSubject(subject, version) {
          var subjectObj = {};
          var versions = [];

          SchemaRegistryFactory.subject(subject, version).then(function(res) {
              subjectObj.subjectInfo = res.data;
              subjectObj.jsonSchema = JSON.parse(res.data.schema);
          })
          .then(SchemaRegistryFactory.subjectVersions(subject).then(function(res) {
              subjectObj.versions = res.data;
              var historyArray = _.map(res.data, function(v) { return getSchema(subject, v) })
              $q.all(historyArray).then(function(values) {
                    console.log("values", values);
                    subjectObj.history =
                                _.map(values, function(v) {
                                    if(v.version > 1) {
                                        var previous = _.findWhere(values, { version : (v.version - 1) });
//                                        var previous = JSON.parse(p.schema);
//                                        console.log("p",p, previous, v.version - 1);
                                        return  { version : v.version, id : v.id, schema : JSON.parse(v.schema), previous: JSON.parse(previous.schema)} ;
                                    } else
                                        return  { version : v.version, id : v.id, schema : JSON.parse(v.schema), previous: ''} ;
                                  })

//                    subjectObj.history = values;

              });
          }))
          .then(SchemaRegistryFactory.subjectConfig(subject).then(function(res) {
              subjectObj.config = res.data;
          }))

          return subjectObj;
      }

    function getSchema(subject, version) {
        return SchemaRegistryFactory.subject(subject, version).then(function(res) {
                 return { version : version, schema : res.data.schema, id : res.data.id};
        })
    }
};

SubjectsCtrl.$inject = ['$rootScope', '$scope', '$route', '$routeParams', '$log', '$location', '$q','$mdDialog', 'SchemaRegistryFactory', 'UtilsFactory', 'toastFactory', 'Avro4ScalaFactory', 'env']

angularAPP.controller('SubjectsCtrl', SubjectsCtrl); //end of controller

// Useful for browsing through different versions of a schema
angularAPP.directive('clickLink', ['$location', function ($location) {
  return {
    link: function (scope, element, attrs) {
      element.on('click', function () {
        scope.$apply(function () {
          $location.path(attrs.clickLink);
        });
      });
    }
  }

}]);
