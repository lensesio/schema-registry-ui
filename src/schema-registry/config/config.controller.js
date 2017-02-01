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

        $mdDialog.show(dialog(config, event)).then(function() {
          SchemaRegistryFactory.putConfig(config).then(function (success) {
            $scope.form = $scope.config.compatibilityLevel = config;
             $scope.form = config;
          });
        });
      };

  var backwardText = 'Backward compatibility (default): A new schema is backward compatible if it can be used to read the data written in all previous schemas. Backward compatibility is useful for loading data into systems like Hadoop since one can always query data of all versions using the latest schema.'
  var forwardText = 'Forward compatibility: A new schema is forward compatible if all previous schemas can read data written in this schema. Forward compatibility is useful for consumer applications that can only deal with data in a particular version that may not always be the latest version.'
  var fullText = "Full compatibility: A new schema is fully compatible if it's both backward and forward compatible."
  var noneText = "No compatibility: A new schema can be any schema as long as it's a valid Avro."

  function dialog(config, event) {

  switch (config) {
    case "BACKWARD":
    text= backwardText;
      break;
    case "FORWARD":
    text = forwardText;
      break;
    case "FULL":
    text= fullText
      break;
    case "NONE":
    text = noneText
      break;
    default:
      text = ''
  }
    var dialog = $mdDialog.confirm()
        .title('Are you sure you want to update the global compatibility level to '+ config +' ?')
        .textContent(text)
        .targetEvent(event)
        .ok('UPDATE')
        .cancel('CANCEL');
    return dialog;
  }

});
