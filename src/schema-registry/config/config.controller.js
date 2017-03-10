angularAPP.controller('SchemaRegistryConfigCtrl', function ($scope, $http, $log, $mdDialog, SchemaRegistryFactory, env) {

  $log.info("Starting schema-registry controller : config ");
  $scope.config = {};
  $scope.connectionFailure = false;
  $scope.showButton = false;
  //Get the top level config
  $scope.$watch(function () {
    return env.getSelectedCluster().NAME;
  }, function (a) {
  $scope.schemaRegistryURL = env.SCHEMA_REGISTRY();

  $scope.globalConfigOpts = ["NONE", "FULL", "FORWARD", "BACKWARD"];

  if(env.allowTransitiveCompatibilities()) {
     $scope.globalConfigOpts.push("FULL_TRANSITIVE","FORWARD_TRANSITIVE","BACKWARD_TRANSITIVE");
  }

  SchemaRegistryFactory.getGlobalConfig().then(
    function success(config) {
    $scope.allowChanges = env.allowGlobalConfigChanges();
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

  var backwardText = '<b>Backward compatibility (default)</b>:<br /> A new schema is backward compatible if it can be used to read the data written in all previous schemas. <br />Backward compatibility is useful for loading data into systems like Hadoop since one can always query data of all versions using the latest schema.'
  var forwardText = '<b>Forward compatibility</b>:<br /> A new schema is forward compatible if all previous schemas can read data written in this schema. <br />Forward compatibility is useful for consumer applications that can only deal with data in a particular version that may not always be the latest version.'
  var fullText = "<b>Full compatibility</b>: A new schema is fully compatible if it's both backward and forward compatible."
  var noneText = "<b>No compatibility</b>: A new schema can be any schema as long as it's a valid Avro."
  var backward_transitive = "<b>Backward transitive</b>: Only available for schema registry 3.1.0 and above.<br />New schema is backward and forward compatible with all previously registered schemas."
  var forward_transitive = "<b>Forward transitive</b>: Only available for schema registry 3.1.0 and above.<br />All previously registered schemas can read data produced by the new schema."
  var full_transitive = "<b>Full transitive</b>: Only available for schema registry 3.1.0 and above.<br />New schema can read data produced by all previously registered schemas."
  var text = '';
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
    case "BACKWARD":
    text = backward_transitive
      break;
    case "FORWARD":
    text = forward_transitive
      break;
    case "FULL":
    text = full_transitive
      break;
    default:
      text = ''
  }
    var dialog = $mdDialog.confirm()
        .title('Warning. You are about to change the \'Global Compatibility Level\'.')
        .htmlContent('<b>This will affect the default behaviour and all subjects/schemas that do not have a compatibility level explicitly defined.</b> <br /><br />'+ text)
        .targetEvent(event)
        .ok('UPDATE')
        .cancel('CANCEL');
    return dialog;
    }

});
