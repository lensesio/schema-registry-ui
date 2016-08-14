angularAPP.controller('SchemaRegistryConfigCtrl', function ($scope, $http, $log, schemaRegistryFactory) {

  $log.info("Starting schema-registry controller : config ");
  $scope.schemaRegistryURL = ENV.SCHEMA_REGISTRY;
  $scope.config = {};
  $scope.connectionFailure = false;

  //Get the top level config
  schemaRegistryFactory.getGlobalConfig().then(
    function successCallback(response) {
      $scope.config = response.data;
    },
    function errorCallback(response) {
      $log.error("Failure with : " + JSON.stringify(response));
      $scope.connectionFailure = true;
    });
});
