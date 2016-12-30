angularAPP.controller('SchemaRegistryConfigCtrl', function ($scope, $http, $log, SchemaRegistryFactory, env) {

  $log.info("Starting schema-registry controller : config ");
  $scope.config = {};
  $scope.connectionFailure = false;

  //Get the top level config
  $scope.$watch(function () {
    return env.getSelectedCluster().NAME;
  }, function (a) {
  $scope.schemaRegistryURL = env.SCHEMA_REGISTRY();
  SchemaRegistryFactory.getGlobalConfig().then(
    function success(config) {
      $scope.config = config;
    },
    function failure(response) {
      $log.error("Failure with : " + JSON.stringify(response));
      $scope.connectionFailure = true;
    });
  }, true);
});
