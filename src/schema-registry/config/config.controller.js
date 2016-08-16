angularAPP.controller('SchemaRegistryConfigCtrl', function ($scope, $http, $log, SchemaRegistryFactory) {

  $log.info("Starting schema-registry controller : config ");
  $scope.schemaRegistryURL = SCHEMA_REGISTRY;
  $scope.config = {};
  $scope.connectionFailure = false;

  //Get the top level config
  SchemaRegistryFactory.getGlobalConfig().then(
    function successCallback(response) {
      $scope.config = response;
    },
    function errorCallback(response) {
      $log.error("Failure with : " + JSON.stringify(response));
      $scope.connectionFailure = true;
    });
});
