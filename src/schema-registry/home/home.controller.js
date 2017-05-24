var angular = require('angular');
var angularAPP = angular.module('angularAPP');

var HomeCtrl = function ($log, SchemaRegistryFactory, toastFactory, $scope, env) {
  $log.info("Starting schema-registry controller - home");
  toastFactory.hideToast();

  $scope.$watch(function () {
    return env.getSelectedCluster().NAME;
  }, function () {
    $scope.cluster = env.getSelectedCluster().NAME;
  }, true);
};

HomeCtrl.$inject = ['$log', 'SchemaRegistryFactory', 'toastFactory', '$scope', 'env'];

angularAPP.controller('HomeCtrl', HomeCtrl);