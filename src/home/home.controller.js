schemaRegistryUIApp.controller('HomeCtrl', function ($scope, $routeParams, $mdToast, $log, schemaRegistryFactory) {
  $mdToast.hide();
  schemaRegistryFactory.visibleCreateSubjectButton(true);
});