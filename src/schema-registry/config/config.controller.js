angularAPP.controller('SchemaRegistryConfigCtrl', function ($scope, $http, $log, $mdDialog, SchemaRegistryFactory, env) {

  $log.info("Starting schema-registry controller : config ");
  $scope.config = {};
  $scope.connectionFailure = false;
  $scope.showButton = false;
  $scope.globalConfigOpts = ["NONE", "FULL", "FORWARD", "BACKWARD"]

  //Get the top level config
  $scope.$watch(function () {
    return env.getSelectedCluster().NAME;
  }, function (a) {
  $scope.schemaRegistryURL = env.SCHEMA_REGISTRY();
  SchemaRegistryFactory.getGlobalConfig().then(
    function success(config) {
      $scope.config = config;
      $scope.connectionFailure = false;
      $scope.form = $scope.config.compatibilityLevel;

    },
    function failure(response) {
      $log.error("Failure with : " + JSON.stringify(response));
      $scope.connectionFailure = true;
    });
  }, true);

  $scope.updateGlobalConfig = function (config, event) {
        $mdDialog.show(dialog(event)).then(function() {
          SchemaRegistryFactory.putConfig(config).then(function (success) {
            $scope.form = $scope.config.compatibilityLevel = config;
             $scope.form = config;
          });
        });
      };

    function dialog(event) {
      var dialog = $mdDialog.confirm()
          .title('Are you sure you want to update the global compatibility level?')
          .textContent("This will affect all the current schemas with no defined compatibility level")
          .targetEvent(event)
          .ok('UPDATE')
          .cancel('CANCEL');
      return dialog;
    }
});
