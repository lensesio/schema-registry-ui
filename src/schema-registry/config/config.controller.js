angularAPP.controller('SchemaRegistryConfigCtrl', function ($scope, $http, $log, SchemaRegistryFactory, env) {

  $log.info("Starting schema-registry controller : config ");
  $scope.schemaRegistryURL = env.SCHEMA_REGISTRY();
  $scope.config = {};
  $scope.connectionFailure = false;

  //Get the top level config
  SchemaRegistryFactory.getGlobalConfig().then(
    function success(config) {
      $scope.config = config;
    },
    function failure(response) {
      $log.error("Failure with : " + JSON.stringify(response));
      $scope.connectionFailure = true;
    });
});
